/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { DEBUG } from "../../../consts.js"
import { ANSWERS, PASSWORD_RESTRICTIONS } from "../consts.js"
import { sameWords, validateWord } from "./../../../src/utils.js"
import { ResetConfirmObj } from "../model.js"
import emailManager from "./../mails.js"



/** path /api/password/reset
 *  @param {MiddlewareParameters} param0 */
export async function passwordResetMiddleware({ mod, req, res }) {
  const { password1, password2, code } = req.body
  console.log({ query:req.query, body:req.body, params:req.params })

  if (!code)
    return res.status( 400 ).json( ANSWERS.PASSWD_RESET_NO_CODE_PROVIDED )

  if (!password1 || !password2)
    return res.status( 400 ).json( ANSWERS.PASSWORD_RESET_NEW_PASSW_NOT_SAME )

  if (!sameWords( password1, password2 ))
    return res.status( 403 ).json( ANSWERS.PASSWD_NOT_SAME )

  if (!validateWord( password1, PASSWORD_RESTRICTIONS ))
    return res.status( 400 ).json( ANSWERS.PASSWD_POLICES_ERR )




  console.log({ test:1 })
  const reset_obj = (await mod.findAndDeleteResetObject( code )).value
  if (!reset_obj) return res.status( 400 ).json({ error: ANSWERS.EMAIL_RESET_EXPIRED })

  console.log({ reset_obj })
  await mod.dbManager.updateObject( mod.basecollectionName,
    { id: reset_obj.user.id },
    { $set: { password: password1 } },
  )

  return res.status( 200 ).json( ANSWERS.PASSWD_CHANGE_SUCCESS )
}



/** path /api/password/remind
 *  @param {MiddlewareParameters} param0 */
export async function passwordRemindMiddleware({ mod, req, res, next }) {
  const accountEmail = req.body.email
  if (!accountEmail) return res.status( 400 ).json( ANSWERS.PASSWD_RESET_NO_EMAIL_PROVIDED )

  let user = await mod.getUserByEmail( accountEmail )

  if (!user) return res.status( 400 ).json( ANSWERS.PASSWD_REMIND_WRONG_EMAIL )


  const code = `${Date.now()}t${Math.random().toString().slice( 2 )}r`
  const reset_obj = new ResetConfirmObj(user, code)

  console.log( reset_obj )
  console.log( 0 )
  await mod.saveResetObject( reset_obj )
  console.log( 1 )
  emailManager.sendResetPasswordEmail( req,  accountEmail, code )
  console.log( 2 )
  return res.status( 200 ).json({ success: ANSWERS.PASSWD_REMIND_SUCCES })
}


export async function httpResetAccountLogin({ mod, req, res }) {
  const code = req.query.initCode

}
