/** @typedef {import("../index.js").MiddlewareParameters} MiddlewareParameters */
import { ANSWERS } from "../consts.js";
import { stringifyObjValues } from "../../../src/utils.js ";
import User from "../model.js"

/** Accepted path /login
 * @param {MiddlewareParameters} param0
 */
export async function loginMiddleware({ refreshToken, dbManager, logger, req, res, next }) {

    const { login, password } = stringifyObjValues(req.body)

    if (!(login && password)) {
        console.error(`ERROR`, { login, password })

        return res.status(400).json({ error: ANSWERS.USER_NOT_EXIST });
    }

    logger(`REQUEST LOG-IN CREDENTIALS\n${JSON.stringify({ user: { login, password } })}`);

    /**@type {User} userObj */
    const userObj = await dbManager.findObject(`users`, { login, password });

    if (!userObj) return res.status(401).json({ error: ANSWERS.USER_NOT_EXIST });
    if (!userObj.activated) res.status(401).json({ error: ANSWERS.ACCOUNT_NOT_ACTIVATED });

    const query = {
        'user.login': userObj.login,
        'user.password': userObj.password,
        'user.email': userObj.email,
    }

    const activeUserSession = await dbManager.findObject('usersSessions', query);

    if (activeUserSession) {
        logger("WELCOME AGAIN:" + JSON.stringify({ user: { "name": userObj.name, "surname": userObj.surname } }))
        await refreshToken(activeUserSession.token);
        return res.status(200).json({ token: activeUserSession.token });
    }

    const token = Math.random().toString();
    logger("LOGGED IN => " + JSON.stringify({ token }))

    const activeSession = {
        lastActivity: Date.now(),
        user: userObj,
        token,
    }

    await dbManager.insertObject('usersSessions', activeSession)

    res.json({ token });
};




/** @param {MiddlewareParameters} param0 */
export async function logoutMiddleware({ deleteSessionByToken, tokenExist, getTokenFromRequest, req, res }) {

    const authenticationToken = getTokenFromRequest(req);

    if (!authenticationToken) return res.status(400).json({ error: ANSWERS.TOKEN_NOT_PROVIDED })

    if (!await tokenExist(authenticationToken))
        return res.status(400).json({ error: ANSWERS.TOKEN_NOT_EXIST })

    await deleteSessionByToken(authenticationToken);
    return res.status(200).json({ SUCCESS: ANSWERS.LOGOUT_SUCCESS });
}



/**
 * path /register
 * @param {MiddlewareParameters} param0
 */
export async function registerMiddleware({ saveUserInDb, emailsManager, isNameCorrect, isEmailCorrect, isPasswordCorrect, passwordsSame, logger, req, res }) {
    // TODO: remove login to some token.
    logger(`REQUEST REGISTER ${JSON.stringify(req.body)}`);
    // rejestracji konta należy podać imię, nazwisko, email, hasło i powtórnie hasło.

    const { name, surname, email, password1, password2 } = stringifyObjValues(req.body)

    if (!passwordsSame(password1, password2))
        return res.status(400).json({ error: ANSWERS.PASSWORDS_NOT_SAME });

    /**@type {User} */
    const user = new User(name, surname, email, { password: password1 });

    if (!isPasswordCorrect(req.body.password1))
        return res.status(400).json({ error: "Password not passed polices." });

    if (!isEmailCorrect(user.email))
        return res.status(400).json({ error: "Wrong email." });

    if (!isNameCorrect(user.name) && isNameCorrect(user.surname))
        return res.status(400).json({ error: "Provided name or surname not match length requirements (min=2 max=32)" });

    await saveUserInDb(user);


    emailsManager.sendAcctivationEmail(user.name, user.email, user.login);

    delete user.password

    res.json({ user });
}




/** @param {MiddlewareParameters} param0 */
export async function createUserMiddleware({ saveUserInDb, isNameCorrect, isEmailCorrect, req, res }) {
    const { name, surname, email } = req.body;
    if (!(name && surname && email)) return res.status(400).json({ error: "Name surname or email was empty." });

    if (!isEmailCorrect(email))
        return res.status(400).json({ error: "Wrong email." });

    if (!isNameCorrect(name) || !isNameCorrect(surname))
        return res.status(400).json({ error: "Provided name or surname not match length requirements (min=2 max=32)" });


    const newUser = new User(name, surname, email, { activated: true })

    await saveUserInDb(newUser);

    delete newUser.password
    return res.status(200).json({ user: newUser });
}



/** Accepted path /acctivate/:id
 * @param {MiddlewareParameters} param0
 */
export async function acctivateAccountMiddleware({ logger, dbManager, emailsManager, req, res }) {
    const accLogin = req.params.code;
    console.log({ LOGIN: accLogin });

    if (!emailsManager.isActiveActivationEmail(accLogin)) res.status(200).json({ ERROR: ANSWERS.EMAIL_ACTIVATE_EXPIRED });

    /** @type {User} */
    const targetUser = await dbManager.findObject(  `users`,
        { login: accLogin }
    );

    if (targetUser.activated === true) return res.status(200).json({ ERROR: ANSWERS.ACCOUNT_ALREADY_ACTIVATED });

    await dbManager.updateObject(`users`,
        { login: targetUser.login, },
        { $set: { activated: true } }
    );

    logger(`ACTIVATE USER: ${targetUser.name} ${targetUser.surname}`);
    return  res.status(200).json({ SUCCESS: ANSWERS.ACCOUNT_ACTIVATION_SUCCESS });
}

