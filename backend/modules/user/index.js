import Module from "../baseModule.js";
import * as CONSTS from "./consts.js";
import emailsManager from "./mails.js";
// import EmailManager from "../../src/emailManager.js";
import { json } from "body-parser";
// ZDEFINIOWAC USERA ORAZ  OPIS JEGO POL

/** @typedef {import('express').Express} Express */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/** @typedef {import('../src/dbManager').default} DatabaseManager */

/**
 * @typedef {object} User
 * @property {string} login
 * @property {string} name
 * @property {string} surname
 * @property {string} email
 * @property {string} password
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
    ]);

    setInterval(() => {
      console.log("Token DELETE MACHANISM");
      console.log(this.#tokens)
      this.#tokens = this.#tokens.filter(
        ({ lastActivity }) =>
          lastActivity < Date.now() - CONSTS.TOKEN_EXPIRE_TIME_IN_MINUTES * CONSTS.ONE_MINUTE
      );

      console.log(this.#tokens);
    }, CONSTS.REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  /**
   * @param {Express} app
   */
  configure(app) {
    // TODO: Refresh'ing token time.

    app.post("/register", this.registerMiddleware);
    app.post("/login", this.loginMiddleware); //
    app.get("/api/me", this.whoAmIMiddleware);
    app.get("/activate/:id", this.acctivateAccountMiddleware);
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  acctivateAccountMiddleware(req, res, next) {
    const accLogin = req.params.id;

    if(emailsManager.CanAcctivateAccount(accLogin))
    {
      console.log("ACCTIVATE: ", req.path);
      res.status(200)
        .send(`<h1> ACCOUNT ${req.params.id} ACTIVATED PROPERLY. </h1>`);
    }
    else
    {
      res.status(200)
      .send(`<h1> ACCOUNT ${req.params.id} CAN NOT BE ACTIVATED, TIME EXPIRE </h1>`);
    }
  }

  /**
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
    };

    this.dbManager.insertObject(`users`, user);
    emailsManager.sendAcctivationEmail(user.name, user.email, user.login);

    res.status(201).send(user);
  };

  toString = () => "UserModule"
}
