/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */

import { ANSWERS } from "../consts.js";

  /** @param {MiddlewareParameters} param0 */
  export async function passwordResetMiddleware ({emailsManager,isPasswordCorrect,passwordsSame, dbManager, req, res, next}) {
    const resetObj = req.body;

    if (!passwordsSame(resetObj.password1, resetObj.password2)) {
      res.status(403).json({ error: ANSWERS.PASSWORDS_NOT_SAME });
    }

    if (!isPasswordCorrect(resetObj.password1))
      return res.status(400).json({ error: "Password not passed polices." });


    if (!resetObj.code)
      return res.status(400).json({ error: "Reset password, can not found uniqueId in request body." });

    const emailObj = emailsManager.isActiveResetEmail(resetObj.code);
    if (emailObj) {
      const userObj = await dbManager.updateObject(
        `users`,
        { email: emailObj },
        { $set: { password: resetObj.password1 } }
      )

      res.status(200).json({ SUCCESS: ANSWERS.PASSWD_CHANGE_SUCCESS });
    }
    else {
      res.status(400).json({ error: ANSWERS.EMAIL_RESET_EXPIRED })
    }
  }



  /** @param {MiddlewareParameters} param0 */
export async function passwordRemindMiddleware  ({emailsManager,dbManager, req, res, next})  {

    const accountEmail = req.body.email;
    const user = await dbManager.findObject(`users`, { email: accountEmail })
    if (user) {
      //TODO: Production Uncoment.
      emailsManager.sendResetPasswordEmail(accountEmail);
      res.status(200).json({ SUCCESS: ANSWERS.PASSWD_REMIND_SUCCES })

    } else {
      res.status(400).json({ error: ANSWERS.PASSWD_REMIND_WRONG_EMAIL });
    }
  }


