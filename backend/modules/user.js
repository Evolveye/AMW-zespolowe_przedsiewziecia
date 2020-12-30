import Module from "./module.js";
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

const userManager = [];

// zarejestrowani -> DB
// zalogowani -> ?
const userLoggedin = [];

export default class UserModule extends Module {
  static EXPIRE_TIME_IN_MINUTES = 1;
  static ERRORS = {

  }

  #tokens = [{ token: `qwertyuio`, lastActivity: 12345, user: {} }];

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
      this.#tokens = this.#tokens.filter(
        ({ lastActivity }) =>
          lastActivity <
          Date.now() - 1000 * 60 * UserModule.EXPIRE_TIME_IN_MINUTES
      );
    }, 1000 * 60 * 1);
  }

  /**
   * @param {Express} app
   */
  configure(app) {
    // TODO: Refresh'ing token time.

    app.post("/register", this.registerMiddleware);
    app.post("/login", this.loginMiddleware); //

    app.get("/api/me", this.whoAmIMiddleware);
    // app.post('/api/authenticate',this.apiAuthneticateMiddleware)
    // registered
    // activatedAccount
  }

  apiAuthneticateMiddleware(req, res, next) {
    res.send("token: xyz");
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  whoAmIMiddleware = (req, res, next) => {
    const authentication = req.header("Authentication");
    const token = authentication.match(/Bearer (.*)/)[1];
    const tokenData = this.#tokens.find((tokenData) => tokenData.token == token);

    if (tokenData) {
      const { user } = tokenData

      delete user.password

      res.send(JSON.stringify( { user } ));
    }
    else {}
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
    console.log( { user } )
    const userobj = this.dbManager.findObject(
      `users`,
       /**@param {User} param0 */
      ({ login, password }) => login == user.login && password == user.password
    );

    console.log( { userobj } )
    if (userobj) {
      // TODO: ??? SEND TOKEN, associate token to user, and save in db??
      const token = Math.random().toString();

      this.#tokens.push({
        lastActivity: Date.now(),
        user: userobj,
        token,
      });

      res.send(JSON.stringify({ token }));
    } else {
      res.status(400).send("Cannot find user with our credentials");
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
      res.status(400).send("Passwords doesn't match.");

    const user = {
      login: Math.random().toString(),
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: req.body.password1, // length validation?
    };

    this.dbManager.insertObject(`users`, user);

    res.status(201).send(user);
  };

  display() {
    // console.log(this.#login + " " + this.#password);
  }
}
