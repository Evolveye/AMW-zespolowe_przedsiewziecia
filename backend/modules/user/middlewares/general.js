/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */
import { ANSWERS } from "../consts.js"
import { stringifyObjValues } from "../../../src/utils.js "
import User from "../model.js"
import { PASSWORD_RESTRICTIONS, NAMES_RESTRICTIONS, REGISTER_RESTRICTION } from "../consts.js"
import { validateWord, sameWords, isEveryChar } from '../../../src/utils.js'
import { DEBUG } from "./../../../consts.js"
import emailManager from "./../mails.js"

/** path /login
 *  @param {MiddlewareParameters} param0
 */
export async function loginMiddleware({ mod, req, res, next }) {
    const { login, password } = stringifyObjValues(req.body)

    if (!(login && password)) {
        return res.status(400).json(ANSWERS.USER_NOT_EXIST)
    }


    mod.logger(`REQUEST LOG-IN CREDENTIALS\n${JSON.stringify({ user: { login, password } })}`)

    /**@type {User} userObj */
    // console.log({ "basecollectionName ": basecollectionName, "subcollection ": subcollections })

    let userObj = await mod.dbManager.findOne(mod.basecollectionName, { login: { $eq: login }, password: { $eq: password } })

    // userObj = await dbManager.findOne(`users`, { login: { $eq: login }, password: { $eq: password } })


    if (!userObj) return res.status(401).json(ANSWERS.USER_NOT_EXIST)
    if (!userObj.activated) return res.status(401).json(ANSWERS.ACCOUNT_NOT_ACTIVATED)

    const query = {
        userId: userObj.id
    }

    //console.log(mod.subcollections)
    let activeUserSession = await mod.dbManager.findObject(
        mod.subcollections.sessions,
        query)

    //activeUserSession = await mod.dbManager.findObject('usersSessions', query)

    if (activeUserSession) {
        mod.logger("WELCOME AGAIN:" + JSON.stringify({ user: { "name": userObj.name, "surname": userObj.surname } }))
        await mod.refreshToken(activeUserSession.token)
        return res.status(200).json({ token: activeUserSession.token })
    }

    const token = Math.random().toString()
    mod.logger("LOGGED IN => " + JSON.stringify({ token }))

    const activeSession = { //TODO: refactor, not user but an user._id
        lastActivity: Date.now(),
        userId: userObj.id,
        token,
    }

    await mod.dbManager.insertObject(
        mod.subcollections.sessions,
        activeSession)

    //  await mod.dbManager.insertObject(subcollections.sessions, activeSession)

    return res.json({ token })
}


/** path /api/logout
 *  @param {MiddlewareParameters} param0
 */
export async function logoutMiddleware({ mod, req, res }) {
    await mod.deleteSessionByToken(req.token)
    return res.status(200).json(ANSWERS.LOGOUT_SUCCESS)
}



/** path /api/register
 *  @param {MiddlewareParameters} param0
 */
export async function registerMiddleware({ mod, req, res }) {
    mod.logger(`REQUEST REGISTER ${JSON.stringify(req.body)}`)

    const { name, surname, email, password1, password2 } = stringifyObjValues(req.body)

    if (!(name && surname && email && password1 && password2))
        return res.status(400).json(ANSWERS.REGISTER_CREDENTIAL_NOT_PROVIDED)

    if(!isEveryChar(name) || !isEveryChar(surname))
    return res.status(400).json(ANSWERS.NAMES_NOT_CHARS_ONLY)

    if (!sameWords(password1, password2))
        return res.status(200).json(ANSWERS.PASSWD_NOT_SAME)

    /**@type {User} */
    const user = new User(name, surname, email, { password: password1 })

    if (!DEBUG) {
        let mess = user.validEmail()
        if (mess) return res.status(400).json(mess)

        mess = user.validNames()
        if (mess) return res.status(400).json(mess)

        mess = user.validPasswords()
        if (mess) return res.status(400).json(mess)
    }

    const userByEmail =await mod.getUserByEmail(email)

    if (userByEmail)
        return res.status(400).json(ANSWERS.REGISTER_EMAIL_IN_USE)

    await mod.saveUserInDb(user)
    emailManager.sendAcctivationEmail(user)

    delete user.password

    return res.json({ user })
}




/** path /api/create/user
 *  @param {MiddlewareParameters} param0
 * */
export async function createUserMiddleware({ req, res }) {
    const { name, surname, email } = req.body


    if ([name, surname].some(str => str.includes(' ')))
        return res.status(400).json(ANSWERS.CREATE_USER_NAMES_WITH_SPACE)


    if (!(name && surname && email)) return res.status(400).json(ANSWERS.CREATE_CREDENTIAL_NOT_PROVIDED)

    if (!DEBUG) {
        if (!isEmailCorrect(email))
            return res.status(400).json(ANSWERS.EMAIL_NOT_CORRECT)

        if (!(validateWord(name, NAMES_RESTRICTIONS) && validateWord(surname, NAMES_RESTRICTIONS)))
            return res.status(400).json(ANSWERS.REGISTER_NAMES_POLICES_ERR)
    }


    const newUser = new User(name, surname, email, { activated: true })

    await mod.saveUserInDb(newUser)

    delete newUser.password
    return res.status(200).json({ user: newUser })
}



/** Accepted path /api/activate/:code
 * @param {MiddlewareParameters} param0
 */
export async function acctivateAccountMiddleware({ mod, req, res }) {
    const accId = req.params.code
    // console.log({ LOGIN: accLogin })
    // TODO:REFACTOR -> Login jest zbyt słaby do aktywacji konta.

    if (!emailManager.isActiveActivationEmail(accId)) return res.status(200).json(ANSWERS.EMAIL_ACTIVATE_EXPIRED)

    /** @type {User} */
    let targetUser = await mod.dbManager.findObject(mod.basecollectionName,
        { id: accId }
    )

    // targetUser = await mod.dbManager.findObject(mod.basecollectionName,
    //     { login: accLogin }
    // )

    if (targetUser.activated === true) return res.status(200).json(ANSWERS.ACCOUNT_ALREADY_ACTIVATED)

    await mod.dbManager.updateObject(mod.basecollectionName,
        { login: targetUser.login, },
        { $set: { activated: true } }
    )


    mod.logger(`ACTIVATE USER: ${targetUser.name} ${targetUser.surname}`)
    return res.status(200).json(ANSWERS.ACCOUNT_ACTIVATION_SUCCESS)
}

