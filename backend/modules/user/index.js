import { json } from "express";

import Module from "../baseModule.js";
import * as CONSTS from "../../src/constants/serverConsts.js";
import { stringifyObjValues } from "../../src/utils.js";
import emailsManager from "./mails.js";
import User from './model.js'
import {
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  TOKEN_EXPIRE_TIME_IN_MINUTES,
  ANSWERS,
  DEBUG,
} from './consts.js';

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


// TODO: kody errorów.

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
 * @property {Request} req
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

  }
}


// TODO: how to route  into ->  index.html inside adam's public dir.
export default class UserModule extends Module {
  /** @type {Session[]} */
  // #sessions = [];

  /**
   * @param {Logger} logger
   * @param {DatabaseManager} dbManager
   */
  constructor(logger, dbManager) {
    super(logger, dbManager);

    setInterval(async () => {
      this.logger("DELETE EXPIRED TOKEN MECHANISM.");

      //this.#sessions = this.#sessions.filter(this.filterExpireTokens);

      await this.dbManager.deleteObjectsInCollection('usersSessions',
        {
          lastActivity:
          {// wszystko co nie spelnia warunku zostaje usuniete
            "$lt":
              Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES /* to ms */
          }
        }
      )

    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  // filterExpireTokens = async (obj) => {
  //   Date.now() - obj.lastActivity < TOKEN_EXPIRE_TIME_IN_MINUTES;
  // }



  /**
   * @param {Express} app
   */
  configure(app) {
    const db = this.dbManager
    const utils = new MiddlewareUtils(this)
    //TODO: Rename with prefix ws or http

    app.use(this.tokenRefreshMiddleware);

    app.get("/test", this.test)

    // general.js
    //jako p będą 3wart req/res/next,do fukncji aktyw, przekazujemy db + 3 wczesniej wym params
    app.get("/api/activate/:code", (req, res, next) => acctivateAccountMiddleware({ req, res, next, ...utils }))
    app.post("/api/logout", (req, res, next) => logoutMiddleware({ req, res, next, ...utils }));
    app.post("/api/login", (req, res, next) => loginMiddleware({ req, res, next, ...utils }));
    app.post("/api/register", (req, res, next) => registerMiddleware({ req, res, next, ...utils }));
    app.post("/api/create/user", (req, res, next) => createUserMiddleware({ req, res, next, ...utils })); // TODO: remove to platformModel. tworzenie użytkowników do platformy


    //users.js
    app.get("/api/users/me", (req, res, next) => httpAmIMiddleware({ req, res, next, ...utils }));
    app.get("/api/users", (req, res, next) => getAllUsers({ req, res, next, ...utils })); // TODO: AUTH ONLY restiction.  tutaj wywalam nawet password
    app.put("/api/users/me", (req, res, next) => updateUserSettings({ req, res, next, ...utils }))


    app.post("/api/password/remind", (req, res, next) => passwordRemindMiddleware({ req, res, next, ...utils }));
    app.post("/api/password/reset", (req, res, next) => passwordResetMiddleware({ req, res, next, ...utils })); // update passw in db

  }

  passwordsSame = (password1, password2) => password1 === password2;

  /** @param {User} user new user to save. */
  saveUserInDb = async (user) => await this.dbManager.insertObject(`users`, user)


  /** @param {WS} socket */
  socketConfigurator = (socket) => {
    socket.userScope = { token: `` }

    console.log(`nowy socket`, socket.id)
    socket.on(`disconnect`, () => console.log(`socket wyszedł`, socket.id))

    socket.on('authenticate', (token) => {

      this.refreshToken(token);
      console.log({ AuthToken: token });
      const session = this.getSessionByToken(token);

      socket.userScope.token = token
    })

    socket.on('api.get.users.me', data => this.authorizedSocket(socket, async (token) => {
      const user = await this.getUserByToken(token);

      delete user.password;

      console.log("[WS] api.get.users.me --> " + JSON.stringify(user));
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

    if (DEBUG || tokenExist) cb(token)
    else socket.emit(`not authenticated`)
  }


  deleteSessionByToken = token => {
    console.log({ UserLogout: token })
    this.dbManager.deleteObject('usersSessions', { token: token });
  }

  tokenExist = token => this.dbManager.findObject('usersSessions', { token: token })



  refreshToken = (token) => {
    this.dbManager.updateObject('usersSessions', { token: token }, { $set: { lastActivity: Date.now() } })
  }

  /**
   * @param {Request} request
   * @returns {string|false}
   */
  getTokenFromRequest = (request) => {
    const authentication = request.header("Authentication");
    return authentication ? authentication.match(/Bearer (.*)/)[1] : null
  }

  test = async (req, res, next) => {
    res.json({ AcctivationEmailsCollection: emailsManager.getAllAcctivationEmails() });
  }

  /**
   *
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  tokenRefreshMiddleware = async (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);

    if (await this.tokenExist(authenticationToken)) { // found a authentication header.
      await this.refreshToken(authenticationToken)
    }

    // NOT found a authentication header.
    next();
  }

  handleWhoAmI = async token => {
    console.log({ token })
    const user = await this.getUserByToken(token); // get user associated token.
    delete user.password;
    return user;
  }

  getSessionByToken = async (token) => {
    return await this.dbManager.findObject('usersSessions', { token: token });
  }

  getUserByToken = async (token) => {
    const dataObj = await this.getSessionByToken(token)
    return dataObj.user
  }


  /**
   * @param {string} argument
   * @param {number} [minLen]
   * @param {number} [maxLen]
   */
  static isNameCorrect = (argument, minLen = 2, maxLen = 32) => argument.length >= minLen && argument.length <= maxLen


  /** @param {string} email */
  static isEmailCorrect = (email) => {
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return true
  }


  /** @param {string} password */
  static isPasswordCorrect(password) {
    const options = {
      minLenght: 5,
      maxLenght: 10,
      bannedChars: `{}|":<>?`,
      requireSpecialChar: false,
      specialChars: `!@#$%^*&()_+`,
      bannedWords: [``, `admin`, `ja`],
    }

    const arr = {
      minLen: password.length >= options.minLenght,
      maxLen: password.length <= options.maxLenght,
      notBannedChars: !password.split('').some((char) => options.bannedChars.includes(char)),
      specialChars: options.requireSpecialChar ? options.specialChars.split('').some(char => password.includes(char)) : true,
      notBannedWord: options.bannedWords.every((word) => word != password)
    }

    const minLen = password.length >= options.minLenght
    const maxLen = password.length <= options.maxLenght
    const notBannedChars = !password.split('').some((char) => options.bannedChars.includes(char))
    const specialChars = options.requireSpecialChar ? options.specialChars.split('').some(char => password.includes(char)) : true
    const notBannedWord = options.bannedWords.every((word) => word != password)

    //return minLen && maxLen && notBannedChars && specialChars && notBannedWord

    return true
  }

  toString = () => this.constructor.toString()
  static toString = () => "UserModule"
}
