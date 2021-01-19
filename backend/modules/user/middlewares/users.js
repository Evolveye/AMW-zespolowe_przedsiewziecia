/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { ANSWERS } from "../consts.js"


/** path /api/users
 *  @param {MiddlewareParameters} param0 */
export async function getAllUsers({ dbManager, req, res, next }) {
  return res.status(200).json(await dbManager.getCollection('users'))
}

/** path /api/users/me  --> POST
 *  @param {MiddlewareParameters} param0 */
export async function updateUserSettings({ dbManager, getUserByToken, passwordsSame, getTokenFromRequest, req, res, next }) {//TODO : Start point
  const activeToken = req.token

  if (!activeToken) return res.status(501).json({ "not implemented": req.body })
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



  const { login, name, surname, email, avatar, password, newPassword1, newPassword2 }
    = req.body

  // pass1 == pass2 and != password
  // db overrride session


  user = req.body
  user = { name: `Adam`, surname: `Adam`, age: null, email: `` } // req.body
  notNullEntries = Object.entries(user).filter(([_, v]) => v)
  notNullUser = Object.fromEntries(notNullEntries)
  // console.log(notNullUser)


  // makeUpdate = {}
  // //jak obsluzyc sam password?
  // {name:"nowy",...}
  const user = User()

  if (passwordsSame(newPassword1, newPassword2))
    makeUpdate.password = newPassword1


  if (login) makeUpdate.login = login
  if (name) makeUpdate.name = name
  if (surname) makeUpdate.surname = surname
  if (email) makeUpdate.email = email
  if (avatar) makeUpdate.avatar = avatar
  if (login) makeUpdate.login = login


  // dowiedz sie kto to wysłał.
  // make updat on db.,


  // const findQuery = {}
  userToUpdate = getUserByToken(activeToken)
  if (userToUpdate) // znaleziono usera do update
  {
    await dbManager.updateObject('users', userToUpdate, makeUpdate)
  }

  res.status(400).json(ANSWERS.TOKEN_NOT_EXIST)
}


/** path /api/users/me  --> GET
 *  @param {MiddlewareParameters} param0
 * */
export async function httpAmIMiddleware({ tokenExist, handleWhoAmI, getTokenFromRequest, req, res }) {
  const answer = await handleWhoAmI(req.token)
  res.json({ user: answer })
}
