/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { ANSWERS } from "../consts.js"
import User from "../model.js"


/** path /api/users
 *  @param {MiddlewareParameters} param0 */
export async function getAllUsers({ mod, res }) {
  return res.status( 200 ).json( await mod.dbManager.getCollection( `users` ) )
}


export async function httpSetLoginAfterReg({ mod, req, res }) {
  const code = req.body.code
  const login = req.body.login

  if (!code || !login) {
    return res.status( 400 ).json( ANSWERS.ACCTIVATE_DATA_MISS )
  }

  if (!(await mod.findAndDeleteRegObj( code )))
    return res.status( 400 ).json( ANSWERS.ACCTIVATION_PROCCESS_EXPIRED )

  if (await mod.getUserByLogin( login ))
    return res.status( 400 ).json( ANSWERS.LOGIN_ALREADY_IN_USE )


  await mod.acctivateAndChangeUserLogin( login, code )


  return res.status( 200 ).json( ANSWERS.LOGIN_HAS_BEEN_CHANGED )
}


/** path /api/users/me  --> POST
 *  @param {MiddlewareParameters} param0 */
export async function updateUserSettings({ mod, req, res }) { // TODO : Start point
  const activeToken = req.token

  console.log({ user_update_body:req.body })

  if (!activeToken) return res.status( 400 ).json( ANSWERS.TOKEN_NOT_EXIST )

  const {
    login,
    name,
    surname,
    email,
    avatar,
    password,
    password1,
    password2,
  } = req.body



  const makeUpdate = {}

  if (password1 && password2 && password) {
    console.log({ oldPassw:req.user.password, newPassw:password1 })

    if (req.user.password != password)
      return res.status( 400 ).json( ANSWERS.UPDATE_PASSWORD_OLD_DIFF )

    if (password1 !== password2)
      return res.status( 400 ).json( ANSWERS.PASSWD_NOT_SAME )

    const error = User.validPassword( password1, req.user.name, req.user.surname )
    if (error) return res.status( 400 ).json( error )

    makeUpdate.password = password1
  }

  if (avatar) makeUpdate.avatar = avatar
  if (login) {
    if (await mod.getUserByLogin( login ))
      return res.status( 400 ).json( ANSWERS.LOGIN_ALREADY_IN_USE )

    makeUpdate.login = login
  }
  if (name) {
    const error = surname
      ? User.validName( name, surname )
      : User.validName( name, req.user.surname )

    if (!error) makeUpdate.name = name
    else return res.status( 400 ).json( error )
  }
  if (surname) {
    const error = name
      ? User.validName( name, surname )
      : User.validName( req.user.name, surname )

    if (!error) makeUpdate.surname = surname
    else return res.status( 400 ).json( error )
  }
  if (email) {
    const error = User.validEmail( email )

    if (!error) makeUpdate.email = email
    else return res.status( 400 ).json( error )
  }

  console.log({ UpdateUserSettings:makeUpdate })
  if (Object.keys( makeUpdate ).length <= 0)
    return res.status( 400 ).json( ANSWERS.UPDATE_USER_NO_CHANGES )

  if (req.user) {
    await mod.dbManager.updateObject( mod.basecollectionName, req.user, { $set:makeUpdate } )
  }

  delete makeUpdate.password
  console.log({ returndata:{ user:makeUpdate, ...ANSWERS.SUCCESS_EDIT } })
  return res.json({ user:makeUpdate, ...ANSWERS.SUCCESS_EDIT })
}


/** path /api/users/me  --> GET
 *  @param {MiddlewareParameters} param0
 * */
export async function httpAmIMiddleware({ mod, req, res }) {
  const answer = await mod.handleWhoAmI( req.token )
  return res.json({ user: answer })
}
