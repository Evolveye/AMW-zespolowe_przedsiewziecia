/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */
import { ANSWERS } from "../consts.js"
import { stringifyObjValues } from "../../../src/utils.js "
import User from "../model.js"
import { PASSWORD_RESTRICTIONS, NAMES_RESTRICTIONS, REGISTER_RESTRICTION } from "../consts.js"
import { validateWord, sameWords } from '../../../src/utils.js'
import { DEBUG } from "./../../../consts.js"

/** path /login
 *  @param {MiddlewareParameters} param0
 */
export async function loginMiddleware({ collectionName,refreshToken, dbManager, logger, req, res, next }) {

    const { login, password } = stringifyObjValues(req.body)

    if (!login || !password) { //TODO why and, should be ||
        return res.status(400).json( ANSWERS.USER_NOT_EXIST )
    }


    logger(`REQUEST LOG-IN CREDENTIALS\n${JSON.stringify({ user: { login, password } })}`)

    /**@type {User} userObj */
    const userObj = await dbManager.findObject(collectionName, { login, password })



    if (!userObj) return res.status(401).json( ANSWERS.USER_NOT_EXIST )
    if (!userObj.activated) res.status(401).json( ANSWERS.ACCOUNT_NOT_ACTIVATED )

    const query = {
            userId:userObj.id
    }

    const activeUserSession = await dbManager.findObject('usersSessions', query)

    if (activeUserSession) {
        logger("WELCOME AGAIN:" + JSON.stringify({ user: { "name": userObj.name, "surname": userObj.surname } }))
        await refreshToken(activeUserSession.token)
        return res.status(200).json({ token: activeUserSession.token })
    }

    const token = Math.random().toString()
    logger("LOGGED IN => " + JSON.stringify({ token }))

    const activeSession = { //TODO: refactor, not user but an user._id
        lastActivity: Date.now(),
        userId: userObj.id,
        token,
    }

    await dbManager.insertObject('usersSessions', activeSession)

    res.json({ token })
}


/** path /api/logout
 *  @param {MiddlewareParameters} param0
 */
export async function logoutMiddleware({ deleteSessionByToken, tokenExist, getTokenFromRequest, req, res }) {
    await deleteSessionByToken(req.token)
    return res.status(200).json(ANSWERS.LOGOUT_SUCCESS)
}



/** path /api/register
 *  @param {MiddlewareParameters} param0
 */
export async function registerMiddleware({ saveUserInDb, emailsManager, logger, req, res }) {
    logger(`REQUEST REGISTER ${JSON.stringify(req.body)}`)

    const { name, surname, email, password1, password2 } = stringifyObjValues(req.body)

    if(!sameWords(password1,password2))
        res.status(200).json(ANSWERS.PASSWD_NOT_SAME)

    /**@type {User} */
    const user = new User(name, surname, email, { password:password1 })

    if (!DEBUG) {
        let mess = user.validEmail()
        if(mess) return res.status(400).json(mess)

        mess = user.validNames()
        if(mess)return res.status(400).json(mess)

        mess = user.validPasswords()
        if(mess) return res.status(400).json(mess)
    }

    await saveUserInDb(user)

    emailsManager.sendAcctivationEmail(user.name, user.email, user.login)

    delete user.password

    res.json({ user })
}




/** path /api/create/user
 *  @param {MiddlewareParameters} param0
 * */
export async function createUserMiddleware({ saveUserInDb, req, res }) {
    const { name, surname, email } = req.body

    if (!(name && surname && email)) return res.status(400).json(ANSWERS.CREATE_CREDENTIAL_NOT_PROVIDED)

    if (!DEBUG) {
        if (!isEmailCorrect(email))
            return res.status(400).json(ANSWERS.EMAIL_NOT_CORRECT)

        if (!(validateWord(name, NAMES_RESTRICTIONS) && validateWord(surname, NAMES_RESTRICTIONS)))
            return res.status(400).json(ANSWERS.REGISTER_NAMES_POLICES_ERR)
    }


    const newUser = new User(name, surname, email, { activated: true })

    await saveUserInDb(newUser)

    delete newUser.password
    return res.status(200).json({ user: newUser })
}



/** Accepted path /api/activate/:code
 * @param {MiddlewareParameters} param0
 */
export async function acctivateAccountMiddleware({ collectionName,logger, dbManager, emailsManager, req, res }) {
    const accLogin = req.params.code
   // console.log({ LOGIN: accLogin })

    if (!emailsManager.isActiveActivationEmail(accLogin)) res.status(200).json(ANSWERS.EMAIL_ACTIVATE_EXPIRED)

    /** @type {User} */
    const targetUser = await dbManager.findObject(collectionName,
        { login: accLogin }
    )

    if (targetUser.activated === true) return res.status(200).json(ANSWERS.ACCOUNT_ALREADY_ACTIVATED)

    await dbManager.updateObject(collectionName,
        { login: targetUser.login, },
        { $set: { activated: true } }
    )

    logger(`ACTIVATE USER: ${targetUser.name} ${targetUser.surname}`)
    return res.status(200).json( ANSWERS.ACCOUNT_ACTIVATION_SUCCESS)
}

