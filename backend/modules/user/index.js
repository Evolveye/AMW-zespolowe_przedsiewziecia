import Module from "../baseModule.js";
import * as CONSTS from "../../src/constants/serverConsts.js";
import {
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  TOKEN_EXPIRE_TIME_IN_MINUTES
} from './consts.js';
import emailsManager from "./mails.js";
import { ERRORS } from "../../src/constants/dbConsts.js";
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
   * @param {DatabaseManager} dbManager
   */
  constructor(dbManager) {
    super(dbManager);

    // this.dbManager.createCollection(`users`, [
    //   `login`,
    //   `name`,
    //   `surname`,
    //   "password",
    //   "email",
    //   "activated",
    // ]);

    // this.#tokens.push({
    //   lastActivity: Date.now(),
    //   user: {
    //     "login": 0.03335528500414586,
    //     "name": "Zenek",
    //     "surname": "Wkiszek",
    //     "email": "notarealEmail@op.com",
    //     "password": "zzz1234a22doprs22",
    //     "activated": true
    //   },
    //   token:'12345'
    // });

    //console.log("tokens", this.#tokens);

    setInterval(() => {
      console.log("DELETE EXPIRED TOKEN MECHANISM.");
      this.#tokens = this.#tokens.filter(this.FilterExpireTokens);
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  FilterExpireTokens = (obj) =>
    Date.now() - obj.lastActivity < TOKEN_EXPIRE_TIME_IN_MINUTES;

  /**
   * @param {Express} app
   */
  configure(app) {
    //TODO: logout.
    //TODO: Tworzenie kont z pominięciem wysyłania maila aktywacyjnego
    //TODO: Rename with prefix ws or http
    //TODO: Check if token already is assigned when user is logging in.
    //TODO: dodac forget password

    app.use(this.tokenRefreshMiddleware);
    app.get("/test", this.test)
    app.post("/register", this.registerMiddleware);
    app.post("/login", this.loginMiddleware); //
    app.get("/api/me", this.whoAmIMiddleware); // 1 metoda dla ws i HTTP czy osobne ???
    app.get("/activate/:id", this.acctivateAccountMiddleware);
    app.get("/users", this.getAllUsers); // TODO: production Remove.
    app.get("/logout", this.logoutMiddleware);

  }

  /**
   *
   * @param {import("socket.io").Socket} socket
   */
  socketConfigurator = (socket) => {
    socket.on('api.me', (token) => {
      // find user....

    })
    console.log(socket.id);
  }


  logoutMiddleware = (req, res, next) => {
    const authenticationToken = this.isAuthentication(req);
    if (authenticationToken) {
      //const token = authentication.match(/Bearer (.*)/)[1];

      this.#tokens = this.#tokens.filter((tokenData) => tokenData.token != authenticationToken);
      res.status(200).send("You has been logged out.");
    }
  }

  tokenRefreshMiddleware = (req, res, next) => {
    const authenticationToken = this.isAuthentication(req);
    if (authenticationToken) { // found a authentication header.

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
  isAuthentication = (request) => {
    const authentication = request.header("Authentication");

    if (authentication)
      return authentication.match(/Bearer (.*)/)[1]
    else
      return false;
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


    if (emailsManager.isEmailActive(accLogin)) {
      /** @type {User} */
      const targetUser = await this.dbManager.findObject(
        `users`,
        /**@param {User} obj */
        (obj) => obj.login == accLogin
      );

      console.log(targetUser);
      if (!targetUser.activated) {
        //  not activated

        await this.dbManager.updateObject(`users`,
          {
            login: targetUser.login,
          }
          , { $set: { activated: true } });

        //targetUser.activated = true;
        console.log("ACCTIVATE: ", req.path);
        res.status(200)
          .send(`<h1> ACCOUNT ${req.params.id} ACTIVATED PROPERLY. </h1>`);
      } // already activated
      else {
        console.log("Account already activated: ", req.path);
        res.status(200)
          .send(
            `<h2 style="color=red"> ACCOUNT ${req.params.id} HAS BEEN ALREADY ACTIVATED. </h2>`
          );
      }
    } else {
      res.status(200)
        .send(
          `<h2 style="color=red"> ACCOUNT ${req.params.id} CAN NOT BE ACTIVATED,</h2> <br/> Email time has expired.`
        );
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
    const authentication = req.header("Authentication");
    // console.log("REQUEST WhoIAm HEADER", { authentication });

    /**
     * @type {string}
     */
    const token = authentication.match(/Bearer (.*)/)[1];
    //console.log('token ->', token);

    const tokenData = this.#tokens.find(
      (tokenData) => tokenData.token == token
    );

    if (tokenData) {
      const { user } = tokenData;
      // console.log("REQUEST WhoIAm", { user });
      delete user.password;

      res.send(JSON.stringify({ user }));
    } else {
      res.status(401).send(CONSTS.ERRORS.CANNOT_IDENTYFY_USER);
    }
  };

  /**
   * Accepted path /login
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  loginMiddleware = async (req, res, next) => {
    // W celu zalogowania się na stronie musi podać login i hasło.
    const user = {
      login: req.body.login.toString(),
      password: req.body.password,
    };
    console.log(`REQUEST LOG-IN CREDENTIALS`, { user });
    /**@type {User} userObj */
    const userObj = await this.dbManager.findObject(
      `users`,
      /**@param {User} potentialUser */
      (potentialUser) => user.login == potentialUser.login && potentialUser.password == user.password
    );
    // console.log(`User ->>>>>>>`, { userObj })
    if (userObj.activated) {
      var token = Math.random().toString();
      this.#tokens.push({
        lastActivity: Date.now(),
        user: userObj,
        token,
      });

      res.json({ token }); // or send and json stringify.
    } else {
      res.status(401).send(ERRORS.NOT_EXIST);
    }
  };

  /**
   * path /register
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  registerMiddleware = async (req, res, next) => {
    console.log(`REQUEST REGISTER`, req.body);
    // rejestracji konta należy podać imię, nazwisko, email, hasło i powtórnie hasło.

    if (req.body.password1 != req.body.password2)
      res.status(400).send(CONSTS.ERRORS.PASSWORDS_NOT_SAME);

    //TODO: NAME/SURNAME ALREADY EXIST.

    const user = {
      login: Math.random().toString(),
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: req.body.password1, // length validation?
      activated: false,
    };

    await this.dbManager.insertObject(`users`, user);
    console.log("MARK --> ", await this.dbManager.getCollection(`users`));
    console.log(" <-- MARK");

    // this.dbManager.getCollection(`users`);
    // this.#db.collection(`users`).find().toArray().then(console.log);
    emailsManager.sendAcctivationEmail(user.name, user.email, user.login);

    res.status(201).send(user);
  };

  toString = () => "UserModule";
}
