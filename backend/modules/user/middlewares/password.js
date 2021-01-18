/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { DEBUG } from "../../../consts.js"
import { ANSWERS, PASSWORD_RESTRICTIONS } from "../consts.js"
import { sameWords, validateWord } from "./../../../src/utils.js"


/** path /api/password/reset
 *  @param {MiddlewareParameters} param0 */
export async function passwordResetMiddleware({ collectionName, emailsManager, dbManager, req, res }) {
  const resetObj = req.body // TODO refactor into user obj


  if (!sameWords(resetObj.password1, resetObj.password2))
    return res.status(403).json({ error: ANSWERS.PASSWD_NOT_SAME })

  if (!DEBUG)
    if (!validateWord(resetObj.password1, PASSWORD_RESTRICTIONS))
      return res.status(400).json({ error: ANSWERS.PASSWD_POLICES_ERR })

  if (!resetObj.code)
    return res.status(400).json({ error: ANSWERS.PASSWD_RESET_NO_CODE_PROVIDED })

  const emailObj = emailsManager.isActiveResetEmail(resetObj.code)

  if (!emailObj) return res.status(400).json({ error: ANSWERS.EMAIL_RESET_EXPIRED })


  await dbManager.updateObject(collectionName,
    { email: emailObj },
    { $set: { password: resetObj.password1 } }
  )

  return res.status(200).json({ SUCCESS: ANSWERS.PASSWD_CHANGE_SUCCESS })

}



/** path /api/password/remind
 *  @param {MiddlewareParameters} param0 */
export async function passwordRemindMiddleware({collectionName, emailsManager, dbManager, req, res, next }) {

  const accountEmail = req.body.email
  if (!accountEmail) return res.status(400).json(ANSWERS.PASSWD_RESET_NO_EMAIL_PROVIDED)

  const user = await dbManager.findObject(collectionName, { email: accountEmail })
  if (!user) return res.status(400).json(ANSWERS.PASSWD_REMIND_WRONG_EMAIL)


  //TODO: Production Uncoment.
  emailsManager.sendResetPasswordEmail(accountEmail)
  return res.status(200).json({ SUCCESS: ANSWERS.PASSWD_REMIND_SUCCES })
}


