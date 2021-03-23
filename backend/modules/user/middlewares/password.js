/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { DEBUG } from "../../../consts.js"
import { ANSWERS, PASSWORD_RESTRICTIONS } from "../consts.js"
import { sameWords, validateWord } from "./../../../src/utils.js"


/** path /api/password/reset
 *  @param {MiddlewareParameters} param0 */
export async function passwordResetMiddleware({ mod, req, res }) {
  const resetObj = req.body

  if (!sameWords(resetObj.password1, resetObj.password2))
    return res.status(403).json({ error: ANSWERS.PASSWD_NOT_SAME })

  if (!DEBUG)
    if (!validateWord(resetObj.password1, PASSWORD_RESTRICTIONS))
      return res.status(400).json({ error: ANSWERS.PASSWD_POLICES_ERR })

  if (!resetObj.code)
    return res.status(400).json({ error: ANSWERS.PASSWD_RESET_NO_CODE_PROVIDED })

  const emailObj = mod.emailsManager.isActiveResetEmail(resetObj.code)

  if (!emailObj) return res.status(400).json({ error: ANSWERS.EMAIL_RESET_EXPIRED })


  await mod.dbManager.updateObject(mod.basecollectionName,
    { email: emailObj },
    { $set: { password: resetObj.password1 } }
  )

  // await dbManager.updateObject(`users`,
  //   { email: emailObj },
  //   { $set: { password: resetObj.password1 } }
  // )

  return res.status(200).json({ SUCCESS: ANSWERS.PASSWD_CHANGE_SUCCESS })

}



/** path /api/password/remind
 *  @param {MiddlewareParameters} param0 */
export async function passwordRemindMiddleware({mod, req, res, next }) {
  const accountEmail = req.body.email
  if (!accountEmail) return res.status(400).json(ANSWERS.PASSWD_RESET_NO_EMAIL_PROVIDED)


  let user = await mod.dbManager.findObject(mod.basecollectionName, { email: accountEmail })
  // user = await mod.dbManager.findObject(`users`, { email: accountEmail })
  if (!user) return res.status(400).json(ANSWERS.PASSWD_REMIND_WRONG_EMAIL)


  //TODO: Production Uncoment.
  mod.emailsManager.sendResetPasswordEmail(accountEmail)
  return res.status(200).json({ SUCCESS: ANSWERS.PASSWD_REMIND_SUCCES })
}


