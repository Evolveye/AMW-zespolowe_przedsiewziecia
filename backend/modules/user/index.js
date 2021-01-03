

import Module from "../baseModule.js";
import * as CONSTS from "../../src/constants/serverConstants.js";
import emailsManager from "./mails.js";

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

export default class UserModule extends Module {
  #tokens = [];

  /**
   * @param {DatabaseManager} dbManager
   */
  constructor(dbManager) {
    super(dbManager);

    this.dbManager.createCollection(`users`, [
      `login`,
      `name`,
      `surname`,
      "password",
      "email",
      "activated",
    ]);

    setInterval(() => {
      //console.log("DELETE EXPIRED TOKEN MECHANISM.");
      this.#tokens = this.#tokens.filter(this.FilterExpireTokens);
    }, CONSTS.REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  FilterExpireTokens = (obj) =>
    Date.now() - obj.lastActivity < CONSTS.TOKEN_EXPIRE_TIME_IN_MINUTES;

  /**
   * @param {Express} app
   */
  configure(app) {
    // TODO: Refresh'ing token time.

    app.post("/register", this.registerMiddleware);
    app.post("/login", this.loginMiddleware); //
    app.get("/api/me", this.whoAmIMiddleware);
    app.get("/activate/:id", this.acctivateAccountMiddleware);
    app.get("/users", this.getAllUsers);
    //TODO: logout.
    //TODO: Tworzenie kont z pominięciem wysyłania maila aktywacyjnego 
  }

  /**
   * Accepted path /users
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getAllUsers = (req, res, next) => {
    res.status(200).json(this.dbManager.getCollection(`users`))
  }

  /**
   * Accepted path /acctivate/:id
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  acctivateAccountMiddleware = (req, res, next) => {
    const accLogin = req.params.id;

    if (emailsManager.isEmailActive(accLogin)) {
      /** @type {User} */
      const targetUser = this.dbManager.findObject(
        `users`,
        /**@param {User} obj */
        (obj) => obj.login == accLogin
      );

      if (!targetUser.activated) {
        //  not activated
        targetUser.activated = true;
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
    console.log("REQUEST WhoIAm HEADER", { authentication });
    const token = authentication.match(/Bearer (.*)/)[1];
    const tokenData = this.#tokens.find(
      (tokenData) => tokenData.token == token
    );

    if (tokenData) {
      const { user } = tokenData;
      console.log("REQUEST WhoIAm", { user });
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
  loginMiddleware = (req, res, next) => {
    // W celu zalogowania się na stronie musi podać login i hasło.
    const user = {
      login: req.body.login,
      password: req.body.password,
    };
    console.log(`REQUEST LOG-IN CREDENTIALS`, { user });

    const userObj = this.dbManager.findObject(
      `users`,
      /**@param {User} param0 */
      ({ login, password }) => login == user.login && password == user.password
    );
    console.log(`REQUEST LOG-IN USER`, { userobj: userObj });

    if (userObj) {
      const token = Math.random().toString();

      this.#tokens.push({
        lastActivity: Date.now(),
        user: userObj,
        token,
      });

      res.send(JSON.stringify({ token }));
    } else {
      res.status(401).send(CONSTS.ERRORS.NOT_EXIST);
    }
  };

  /**
   * path /register
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  registerMiddleware = (req, res, next) => {
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

    this.dbManager.insertObject(`users`, user);
    emailsManager.sendAcctivationEmail(user.name, user.email, user.login);

    res.status(201).send(user);
  };

  toString = () => "UserModule";
}
