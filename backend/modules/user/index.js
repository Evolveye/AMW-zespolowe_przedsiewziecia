import Module from "../module.js";
import emailsManager from "./mails.js";
import User from './model.js'
import {
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  TOKEN_EXPIRE_TIME_IN_MINUTES,
  ANSWERS,
} from './consts.js'

import { DEBUG } from "./../../consts.js"

import {
  loginMiddleware,
  logoutMiddleware,
  registerMiddleware,
  createUserMiddleware,
  acctivateAccountMiddleware,
} from "./middlewares/general.js"

import {
  getAllUsers,
  httpAmIMiddleware,
  updateUserSettings,
} from "./middlewares/users.js"

import {
  passwordResetMiddleware,
  passwordRemindMiddleware,
} from "./middlewares/password.js"



/**
 * @typedef {object} RequestAddition
 * @property {string} token
 * @property {User} user
 */

/** @typedef {Request & RequestAddition} UserRequest */

/** @typedef {import('express').Express} Express */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/** @typedef {import('../../src/dbManager').default} DatabaseManager */
/** @typedef {import('../../src/ws').WS} WS */


/**
 * @typedef {object} Session
 * @property {number} lastActivity
 * @property {User} user
 * @property {string} token
 */

/**
 * @typedef {object} ExpressMiddlewareParams
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 */

/** @typedef {ExpressMiddlewareParams & MiddlewareUtils} MiddlewareParameters */

class MiddlewareUtils {
  /** @param {UserModule} userModule */
  constructor(userModule) {
    this.dbManager = userModule.dbManager

    this.saveUserInDb = userModule.saveUserInDb
    this.handleWhoAmI = userModule.handleWhoAmI

    this.getSessionByToken = userModule.getSessionByToken
    this.getUserByToken = userModule.getUserByToken
    this.deleteSessionByToken = userModule.deleteSessionByToken
    this.tokenExist = userModule.tokenExist
    this.refreshToken = userModule.refreshToken
    this.getTokenFromRequest = userModule.getTokenFromRequest

    this.passwordsSame = userModule.passwordsSame
    this.isNameCorrect = UserModule.isNameCorrect
    this.isPasswordCorrect = UserModule.isPasswordCorrect
    this.isEmailCorrect = UserModule.isEmailCorrect

    this.emailsManager = emailsManager //CORRECT ?
    this.logger = userModule.logger
    this.collectionName = userModule.collectionName

  }
}

export default class UserModule extends Module {
  constructor(...params) {
    super(`users`, ...params);

    const myCollections = [`${this.collectionName}Sessions`]

    new Promise(async res => {
      myCollections.forEach(async collectionName => {
        if (!(await this.dbManager.collectionExist(collectionName)))
          await this.dbManager.createCollection(collectionName)
      })

      res()
    })

    setInterval(async () => {
      this.logger("DELETE EXPIRED TOKEN MECHANISM.");

      await this.dbManager.deleteObjectsInCollection('usersSessions', {
        lastActivity: {// wszystko co nie spelnia warunku zostaje usuniete
          "$lt": Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES /* to ms */
        }
      })
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  /** @param {Express} app */
  configure(app) {
    const utils = new MiddlewareUtils(this)
    //TODO: Rename with prefix ws or http


    app.get("/test", this.test)

    app.post("/api/login", (req, res, next) => loginMiddleware({ req, res, next, ...utils }));
    app.post("/api/register", (req, res, next) => registerMiddleware({ req, res, next, ...utils }));
    app.post("/api/password/remind", (req, res, next) => passwordRemindMiddleware({ req, res, next, ...utils }));
    app.post("/api/password/reset", (req, res, next) => passwordResetMiddleware({ req, res, next, ...utils })); // update passw in db
    app.get("/api/activate/:code", (req, res, next) => acctivateAccountMiddleware({ req, res, next, ...utils }))

    app.use(this.authorizeMiddleware)
    app.use(this.tokenRefreshMiddleware);

    app.post("/api/logout", (req, res, next) => logoutMiddleware({ req, res, next, ...utils }));


    //users.js
    app.get("/api/users/me", (req, res, next) => httpAmIMiddleware({ req, res, next, ...utils }));
    app.get("/api/users", (req, res, next) => getAllUsers({ req, res, next, ...utils })); // TODO: AUTH ONLY restiction.  tutaj wywalam nawet password
    app.put("/api/users/me", (req, res, next) => updateUserSettings({ req, res, next, ...utils }))

  }

  authorizeMiddleware = async (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);

    if (!authenticationToken) return res.status(400).json(ANSWERS.TOKEN_NOT_PROVIDED)

    if (!await this.tokenExist(authenticationToken))
      return res.status(400).json(ANSWERS.TOKEN_NOT_EXIST)

    req.token = authenticationToken
    req.user = await this.getUserByToken(authenticationToken)
    next()
  }


  /** @param {User} user new user to save. */
  saveUserInDb = async (user) => await this.dbManager.insertObject(this.collectionName, user)


  /** @param {WS} socket */
  socketConfigurator = (socket) => {
    socket.userScope = { token: `` }

    socket.on('authenticate', (token) => {
      this.refreshToken(token);
      // this.logger({ AuthToken: token });
      const session = this.getSessionByToken(token);

      socket.userScope.token = token
    })

    socket.on('api.get.users.me', data => this.authorizedSocket(socket, async (token) => {

      const user = await this.getUserByToken(token);
      // console.log({user});

      delete user.password;

      this.logWs(JSON.stringify({ name: user.name, surname: user.surname }));
      socket.emit('api.get.users.me', user);
      //console.log("MARK #", user)
    }))
  }


  /**
   * @param {WS} socket
   * @param {(token:string) => void} cb
   */
  async authorizedSocket(socket, cb) {
    const { token } = socket.userScope;

    //console.log("TOKEN 1234 -> ", token);
    const tokenExist = await this.tokenExist(token);
    //console.log("EXIST Token 4567 =>", tokenExist);
    // console.log(`[WS] Authorization ${token}
    // Token exists ${JSON.stringify(tokenExist)} `)

    if (DEBUG || tokenExist) cb(token)  // TODO po co debug tutaj ?
    else socket.emit(`not authenticated`)
  }


  /** @param {string} token */
  deleteSessionByToken = token => {
    // console.log({ UserLogout: token })
    this.dbManager.deleteObject('usersSessions', { token: token });
  }


  /** @param {string} token */
  tokenExist = token => this.dbManager.findObject('usersSessions', { token: token })


  /** @param {string} token */
  refreshToken = (token) => {
    this.dbManager.updateObject('usersSessions', { token: token }, { $set: { lastActivity: Date.now() } })
  }


  /**
   * @param {Request} request
   * @returns {string|null}
   */
  getTokenFromRequest = (request) => {
    const authentication = request.header("Authentication");
    return authentication ? authentication.match(/Bearer (.*)/)[1] : null
  }


  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  test = async (req, res, next) => {


   return res.status(200).json(
      {
        ActiveSessions: await this.dbManager.getCollection('usersSessions'),
        AcctivationEmailsCollection: emailsManager.getAllAcctivationEmails(),
        ResetEmailCollection: emailsManager.getAllResetEmails(),
      }
    );
  }


  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  tokenRefreshMiddleware = async (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);
    if (authenticationToken)
      if (await this.tokenExist(authenticationToken)) { // found a authentication header.
        await this.refreshToken(authenticationToken)
      }

    // NOT found a authentication header.
    next();
  }


  /** @param {string} token */
  handleWhoAmI = async token => {
    // console.log({ token })
    const user = await this.getUserByToken(token); // get user associated token.
    delete user.password;
    return user;
  }

  userExist = (userId) => this.dbManager.objectExist(this.collectionName,{id:{ $eq: userId}})


  /** @param {string} token */
  getSessionByToken = async (token) => {
    return await this.dbManager.findObject('usersSessions', { token: token });
  }


  getUserById = async (user_id) => await this.dbManager.findObject('users', { id: user_id })


  /** @param {string} token */
  getUserByToken = async (token) => {
    // TODO: Refactor, first call to usersSesstions
    // next take user id. find user by id and return.

    const sessionObj = await this.getSessionByToken(token)
    const userObj = this.getUserById(sessionObj.userId)
    return userObj
  }


  //TODO: emails
  /**
   *
   * @param {object} param0 an field required to create new user.
   * @param {object} [mailContent] title=text and body=htmt
   * @param {string} mailContent.titleText title = text
   * @param {string} mailContent.bodyHtml  body = html
   * @throws {object} an {code:number,error:string} or User object injected.
   */
  async createUser({ name, surname, email, ...restOfUser }, mailContent = null) {
    // name, surname, email, {  password = null, login = null, activated = false, avatar = null } = {}

    const user = new User(name, surname, email, restOfUser)
    let notValid = null

    if (!DEBUG) { // TODO: Start Point.
      if ((notValid = user.validEmail()) !== undefined) // jesli zwrocilo objekt Answer.error
        return notValid

      if ((notValid = user.validPasswords()) !== undefined)
        return notValid

      if ((notValid = user.validNames()) !== undefined)
        return notValid
    }
    await this.dbManager.insertObject(this.collectionName, user)

    if (mailContent)
      emailsManager.sendEmail({
        title: mailContent.titleText,
        body: mailContent.bodyHtml,
        email: user.email
      })

    return user
  }



  /**@returns {string}  Name of class */
  toString = () => this.constructor.toString()

  /**@returns {string}  Name of class */
  static toString = () => "UserModule"
}
