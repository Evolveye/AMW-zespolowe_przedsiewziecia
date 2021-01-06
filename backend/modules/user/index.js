import Module from "../baseModule.js";
import * as CONSTS from "../../src/constants/serverConsts.js";
import { stringifyObjValues } from "../../src/utils.js";
import {
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  TOKEN_EXPIRE_TIME_IN_MINUTES,
  ANSWERS,
} from './consts.js';
import emailsManager from "./mails.js";

import e, { request } from "express";


/** @typedef {import('express').Express} Express */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/** @typedef {import('../../src/dbManager').default} DatabaseManager */

/**
 * @typedef {object} User
 * @property {string} login
 * @property {string} name
 * @property {string} surname
 * @property {string} email
 * @property {string} password
 * @property {bool} activated
 */



// TODO: how to route  into ->  index.html inside adam's public dir.
export default class UserModule extends Module {
  #tokens = [];

  /**
   * @param {Logger} logger
   * @param {DatabaseManager} dbManager
   */
  constructor(logger, dbManager) {
    super(logger, dbManager);

    setInterval(() => {
      this.logger( "DELETE EXPIRED TOKEN MECHANISM." );
      this.#tokens = this.#tokens.filter(this.filterExpireTokens);
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  filterExpireTokens = (obj) =>
    Date.now() - obj.lastActivity < TOKEN_EXPIRE_TIME_IN_MINUTES;

  /**
   * @param {Express} app
   */
  configure(app) {
    //TODO: Tworzenie kont z pominięciem wysyłania maila aktywacyjnego
    //TODO: Rename with prefix ws or http
    //TODO: Check if token already is assigned when user is logging in.


    app.use(this.tokenRefreshMiddleware);

    app.get("/test", this.test)
    app.get("/api/me", this.whoAmIMiddleware); // 1 metoda dla ws i HTTP czy osobne ???
    app.get("/activate/:id", this.acctivateAccountMiddleware);
    app.get("/users", this.getAllUsers); // TODO: production Remove.
    app.get("/api/logout", this.logoutMiddleware);


    app.post("/api/register", this.registerMiddleware);
    app.post("/api/login", this.loginMiddleware); //
    app.post("/api/password/remind", this.passwordRemindMiddleware);
    app.post("/api/password/reset", this.passwordResetMiddleware); // update passw in db


  }


  passwordResetMiddleware = async (req, res, next) => {
    const resetObj = req.body;

    if (resetObj.password1 != resetObj.password2) {
      res.status(403).send(ANSWERS.PASSWORDS_NOT_SAME);
    }

    if (!UserModule.isPasswordCorrect(resetObj.password1))
      return res.status(400).send("Password not passed polices.");


    const userEmail = emailsManager.isActiveResetEmail(resetObj.code);
    if (userEmail) {
      const userObj = this.dbManager.updateObject(
        `users`,
        { email: userEmail },
        { $set: { password: resetObj.password1 } }
      )

      res.status(200).send(ANSWERS.PASSWD_CHANGE_SUCCESS);
    }
    else {
      res.status(400).send(ANSWERS.EMAIL_RESET_EXPIRED)
    }
  }

  passwordRemindMiddleware = async (req, res, next) => {

    const accountEmail = req.body.email;
    const user = await this.dbManager.findObject(`users`, { email: accountEmail })
    if (user) {
      //TODO: Production Uncoment.
      emailsManager.sendResetPasswordEmail(accountEmail);
      res.status(200).send(ANSWERS.PASSWD_REMIND_SUCCES)

    } else {
      res.status(400).send(ANSWERS.PASSWD_REMIND_WRONG_EMAIL);
    }
  }


  /**
   *
   * @param {import("socket.io").Socket} socket
   */
  socketConfigurator = (socket) => {
    socket.on('api.me', (token) => {
      // find user....

    })
    this.logger(socket.id);
  }


  logoutMiddleware = (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);

    if (authenticationToken) {
      if (this.tokenExist(authenticationToken)) {
        this.#tokens = this.#tokens.filter((tokenData) => tokenData.token != authenticationToken);
        res.status(200).send(ANSWERS.LOGOUT_SUCCESS);
      }
      else {
        res.status(400).send(ANSWERS.TOKEN_NOT_EXIST);
      }
    } else {
      res.status(400).send(ANSWERS.TOKEN_NOT_PROVIDED);
    }
  }

  tokenExist(token) {
    return this.#tokens.some(tokenObj => tokenObj.token == token)
  }


  tokenRefreshMiddleware = (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);

    if (this.tokenExist(authenticationToken)) { // found a authentication header.
      const obj = this.#tokens.find(
        (tokenData) => tokenData.token == authenticationToken
      );

      obj.lastActivity = Date.now();
    }

    // NOT found a authentication header.
    next();
  }

  /**
   *
   * @param {Request} request
   * @returns {token|false}
   */
  getTokenFromRequest = (request) => {
    const authentication = request.header("Authentication");

    if (authentication)
      return authentication.match(/Bearer (.*)/)[1]
    else
      false
  }

  test = (req, res, next) => {
    res.status(200).json(this.#tokens);
  }

  /**
   * Accepted path /users
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getAllUsers = async (req, res, next) => {
    res.status(200).json(await this.dbManager.getCollection(`users`))
  }

  /**
   * Accepted path /acctivate/:id
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  acctivateAccountMiddleware = async (req, res, next) => {
    const accLogin = req.params.id;


    if (emailsManager.isActiveActivationEmail(accLogin)) {

      /** @type {User} */
      const targetUser = await this.dbManager.findObject(
        `users`,
        /**@param {User} obj */
        { login: accLogin }
      );

      if (!targetUser.activated) {//  not activated

        await this.dbManager.updateObject(
          `users`,
          { login: targetUser.login, },
          { $set: { activated: true } }
        );
        this.logger(`ACTIVATE USER: ${targetUser.name} ${targetUser.surname}`);

        res.status(200).send(ANSWERS.ACCOUNT_ACTIVATION_SUCCESS);
      }
      else {// already activated
        res.status(200).send(ANSWERS.ACCOUNT_ALREADY_ACTIVATED);
      }
    } else { // email exired
      res.status(200).send(ANSWERS.EMAIL_ACTIVATE_EXPIRED);
    }
  }

  /**
   * Accepted path /api/me
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  whoAmIMiddleware = (req, res, next) => {
    // TODO: Handle bad  request
    const authentication = this.getTokenFromRequest(req);

    if (authentication) { // has token and token exist in memeory db
      if (this.tokenExist(authentication)) {
        const user = this.findUserByToken(authentication); // get user associated token.
        delete user.password;

        res.json(user);
      } else {
        res.status(401).send(ANSWERS.TOKEN_NOT_EXIST)
      }
    } else { // token not provided
      res.status(401).send(ANSWERS.TOKEN_NOT_PROVIDED);
    }
  };


  findUserByToken = (token) => this.#tokens.find((tokenObj) => tokenObj.token == token).user;


  /**
   * Accepted path /login
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  loginMiddleware = async (req, res, next) => {
    // W celu zalogowania się na stronie musi podać login i hasło.

    const { login, password } = stringifyObjValues( req.body )

    if (!login || !password) {
      console.error( `ERROR`, { login, password } )

      return res.status(400)
        .json( { error:ANSWERS.USER_NOT_EXIST} );
    }

    this.logger(`REQUEST LOG-IN CREDENTIALS\n${JSON.stringify( { user:{login,password} } )}` );

    /**@type {User} userObj */
    const userObj = await this.dbManager.findObject(`users`, { login, password });

    if (userObj) { // jest w bazie
      if (userObj.activated) { // aktywowany
        var token = Math.random().toString();

        this.#tokens.push({
          lastActivity: Date.now(),
          user: userObj,
          token,
        });
        res.json(token); // or send and json stringify.

      } else {
        res.status(401).send(ANSWERS.ACCOUNT_NOT_ACTIVATED);
      }
    } else {
      res.status(401).send(ANSWERS.USER_NOT_EXIST);
    }

  };

  /**
   * path /register
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  registerMiddleware = async (req, res, next) => {
    this.logger(`REQUEST REGISTER ${JSON.stringify( req.body )}`);
    // rejestracji konta należy podać imię, nazwisko, email, hasło i powtórnie hasło.

    const { name, surname, email, password1, password2 } = stringifyObjValues( req.body )

    if (password1 != password2)
      return res.status(400).send( ANSWERS.PASSWORDS_NOT_SAME );

    const user = {
      login: Math.random().toString(),
      name,
      surname,
      email,
      password: password1,
      activated: false,
      avatar: `/media/image/avatarDefault.jpg`,
    };


    if (!UserModule.isPasswordCorrect(req.body.password1))
      return res.status(400).send("Password not passed polices.");

    if (!UserModule.isEmailCorrect(user.email))
      return res.status(400).send("Wrong email.");

    if (!UserModule.isNameCorrect(user.name) && UserModule.isNameCorrect(user.surname))
      return res.status(400).send("Provided name or surname not match length requirements (min=2 max=32)");


    await this.dbManager.insertObject(`users`, user);

    emailsManager.sendAcctivationEmail(user.name, user.email, user.login);

    delete user.password

    res.json(user);
  };

  /**
   * @param {string} argument
   * @param {number} [minLen]
   * @param {number} [maxLen]
   */
  static isNameCorrect = (argument, minLen = 2, maxLen = 32) => argument.length >= minLen && argument.length <= maxLen

  /** @param {string} email */
  static isEmailCorrect = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  /** @param {string} password */
  static isPasswordCorrect(password) {
    const options = {
      minLenght: 5,
      maxLenght: 10,
      bannedChars: `{}|":<>?`,
      requireSpecialChar: true,
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

    return minLen && maxLen && notBannedChars && specialChars && notBannedWord
  }

  toString = () => this.constructor.toString()
  static toString = () => "UserModule"
}
