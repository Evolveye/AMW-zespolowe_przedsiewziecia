/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { ANSWERS } from "../consts.js"
import User from "../model.js"


/** path /api/users
 *  @param {MiddlewareParameters} param0 */
export async function getAllUsers({ mod, res }) {
  return res.status(200).json(await mod.dbManager.getCollection('users'))
}

/** path /api/users/me  --> POST
 *  @param {MiddlewareParameters} param0 */
export async function updateUserSettings({ mod, req, res }) {//TODO : Start point
  const activeToken = req.token

  if (!activeToken) return res.status(400).json(ANSWERS.TOKEN_NOT_EXIST)
  // "login?": "string",
  // "name?": "string",
  // "surname?": "string",
  // "email?": "string",
  // "avatar?": "string",
  // "password?": "string",
  // "newPassword1?": "string",
  // "newPassword2?": "string",
  // cała paczka razem. {password,newPassword1,newPassword2}
  // login emai imie nazwisko

  // TODO: REFACTOR

  const {
    login,
    name:reqName,
    surname:reqSurname,
    email,
    avatar,
    password1:newPassword1,
    password2:newPassword2
  } = req.body

  const name    = reqName     || req.user.name
  const surname = reqSurname  || req.user.surname

  const makeUpdate = {}

  if (newPassword1 || newPassword2) {
    if (newPassword1 !== newPassword2) {
      return res.status(400).json({ code:-100, error:`Passwords are not the same` })
    }

    const error = User.validPassword(newPassword1, name, surname)
    if (error) return res.status(400).json(error)

    makeUpdate.password = newPassword1
  }

  if (avatar) makeUpdate.avatar = avatar
  if (login) makeUpdate.login = login
  if (name) {
    const error = User.validName(name,surname)

    if (!error) makeUpdate.name = name
    else return res.status(400).json(error)
  }
  if (surname) {
    const error = User.validName(name,surname)

    if (!error) makeUpdate.surname = surname
    else return res.status(400).json(error)
  }
  if (email) {
    const error = User.validEmail(email)

    if (!error) makeUpdate.email = email
    else return res.status(400).json(error)
  }

  if (req.user) {
    await mod.dbManager.updateObject(mod.basecollectionName, req.user, { $set:makeUpdate })
    // await mod.dbManager.updateObject(mod.basecollectionName, req.user, makeUpdate)
  }

  delete makeUpdate.password
  return res.json({ user:makeUpdate })
}


/** path /api/users/me  --> GET
 *  @param {MiddlewareParameters} param0
 * */
export async function httpAmIMiddleware({ mod, req, res }) {
  const answer = await mod.handleWhoAmI(req.token)
  res.json({ user: answer })
}
