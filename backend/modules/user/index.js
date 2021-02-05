import Module from "../module.js";
import emailsManager from "./mails.js";
import User from "./model.js";
import {
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  TOKEN_EXPIRE_TIME_IN_MINUTES,
  ANSWERS,
} from "./consts.js";

import { DEBUG } from "./../../consts.js";

import * as generalMiddlewares from "./middlewares/general.js";
import * as loggedUserMiddlewares from "./middlewares/users.js";
import * as passwordMiddlewares from "./middlewares/password.js";

const midds = {
  ...generalMiddlewares,
  ...loggedUserMiddlewares,
  ...passwordMiddlewares,
};

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
 * @typedef {object} MiddlewareParameters
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 * @property {UserModule} mod
 */

export default class UserModule extends Module {
  subcollections = {
    sessions: `sessions`,
  };

  constructor(...params) {
    super(...params);

    setInterval(async () => {
      this.logger("DELETE EXPIRED TOKEN MECHANISM.");

      await this.dbManager.deleteObjectsInCollection(
        this.subcollections.sessions,
        {
          lastActivity: {
            $lt: Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES,
          },
        }
      );

      await this.dbManager.deleteObjectsInCollection(this.basecollectionName, {
        lastActivity: {
          // wszystko co nie spelnia warunku zostaje usuniete
          $lt: Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES /* to ms */,
        },
      });
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  getApi = () =>
    new Map([
      [
        `/register`,
        {
          post: this.runMid(midds.registerMiddleware),
        },
      ],

      [
        `/create/user`,
        {
          post: this.runMid(midds.createUserMiddleware),
        },
      ],

      [
        `/login`,
        {
          post: this.runMid(midds.loginMiddleware),
        },
      ],

      [
        `/logout`,
        {
          post: this.auth(this.runMid(midds.logoutMiddleware)),
        },
      ],

      [
        `/activate/:code`,
        {
          get: this.runMid(midds.acctivateAccountMiddleware),
        },
      ],

      [
        `/users/me`,
        {
          get: this.auth(this.runMid(midds.httpAmIMiddleware)),
          put: this.auth(this.runMid(midds.updateUserSettings)),
        },
      ],

      [
        `/users`,
        {
          get: this.auth(this.runMid(midds.getAllUser)),
        },
      ],

      [
        `/password/remind`,
        {
          post: this.runMid(midds.passwordRemindMiddleware),
        },
      ],

      [
        `/password/reset`,
        {
          post: this.runMid(midds.passwordResetMiddleware),
        },
      ],
    ]);

  /**
   * @param {(req:Request res:Response next:NextFunction) => void} cb
   * @return {(req:Request res:Response next:NextFunction) => void|Response }
   */
  auth = (cb) => async (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);
    // const var2= authenticationToken.search(`.`)

    if (!authenticationToken || authenticationToken == `null`)
      return res.status(400).json(ANSWERS.TOKEN_NOT_PROVIDED);

    const tokenExists = await this.tokenExist(authenticationToken);
    if (!tokenExists) return res.status(400).json(ANSWERS.TOKEN_NOT_EXIST);

    req.token = authenticationToken;
    req.user = await this.getUserByToken(authenticationToken);

    cb(req, res, next);
  };

  /** @param {Express} app */
  configure(app) {
    // const utils = new MiddlewareUtils(this)
    //TODO: Rename with prefix ws or http

    app.get("/test", this.test);

    app.post("/api/login", (req, res, next) =>
      loginMiddleware({ req, res, next, ...this })
    );
    app.post("/api/register", (req, res, next) =>
      registerMiddleware({ req, res, next, ...this })
    );
    app.post("/api/password/remind", (req, res, next) =>
      passwordRemindMiddleware({ req, res, next, ...this })
    );
    app.post("/api/password/reset", (req, res, next) =>
      passwordResetMiddleware({ req, res, next, ...this })
    ); // update passw in db
    app.get("/api/activate/:code", (req, res, next) =>
      acctivateAccountMiddleware({ req, res, next, ...this })
    );

    app.use(this.authorizeMiddleware);
    app.use(this.tokenRefreshMiddleware);

    app.post("/api/logout", (req, res, next) =>
      logoutMiddleware({ req, res, next, ...this })
    );

    //users.js
    app.get("/api/users/me", (req, res, next) =>
      httpAmIMiddleware({ req, res, next, ...this })
    );
    app.get("/api/users", (req, res, next) =>
      getAllUsers({ req, res, next, ...this })
    );
    app.put("/api/users/me", (req, res, next) =>
      updateUserSettings({ req, res, next, ...this })
    );
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  authorizeMiddleware = async (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);
    //const var2= authenticationToken.search(`.`)

    if (!authenticationToken || authenticationToken == `null`)
      return res.status(400).json(ANSWERS.TOKEN_NOT_PROVIDED);

    const tokenExists = await this.tokenExist(authenticationToken);
    if (!tokenExists) return res.status(400).json(ANSWERS.TOKEN_NOT_EXIST);

    req.token = authenticationToken;
    req.user = await this.getUserByToken(authenticationToken);

    next();
  };

  /** @param {User} user new user to save. */
  saveUserInDb = async (user) => {
    await this.dbManager.insertObject(this.basecollectionName, user);
    // await this.dbManager.insertObject(`users`, user)
  };

  /** @param {WS} socket */
  socketConfigurator = (socket) => {
    socket.userScope = { token: `` };

    socket.on("authenticate", (token) => {
      this.refreshToken(token);
      // this.logger({ AuthToken: token })
      const session = this.getSessionByToken(token);

      socket.userScope.token = token;
    });

    socket.on("api.get.users.me", (data) =>
      this.authorizedSocket(socket, async (token) => {
        const user = await this.getUserByToken(token);
        // console.log({user})

        delete user.password;

        this.logWs(JSON.stringify({ name: user.name, surname: user.surname }));
        socket.emit("api.get.users.me", user);
        //console.log("MARK #", user)
      })
    );
  };

  /**
   * @param {WS} socket
   * @param {(token:string) => void} cb
   */
  async authorizedSocket(socket, cb) {
    const { token } = socket.userScope;

    const tokenExist = await this.tokenExist(token);

    if (DEBUG || tokenExist) cb(token);
    // TODO po co debug tutaj ?
    else socket.emit(`not authenticated`);
  }

  /** @param {string} token */
  deleteSessionByToken = (token) => {
    // console.log({ UserLogout: token })
    return this.dbManager.deleteObject(this.subcollections.sessions, {
      token: token,
    });
    //this.dbManager.deleteObject('usersSessions', { token: token })
  };

  /** @param {string} token */
  tokenExist = (token) => {
    return this.dbManager.findObject(this.subcollections.sessions, {
      token: token,
    });
    //  t= this.dbManager.findObject('usersSessions', { token: token })
  };

  /** @param {string} token */
  refreshToken = (token) => {
    return this.dbManager.updateObject(
      this.subcollections.sessions,
      { token: token },
      { $set: { lastActivity: Date.now() } }
    );
    // this.dbManager.updateObject('usersSessions', { token: token }, { $set: { lastActivity: Date.now() } })
  };

  /**
   * @param {Request} request
   * @returns {string|null}
   */
  getTokenFromRequest = (request) => {
    const authentication = request.header("Authentication");
    return authentication ? authentication.match(/Bearer (.*)/)[1] : null;
  };

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  test = async (req, res, next) => {
    console.log(`TEST ROUTE`);

    return res.status(200).json({
      ActiveSessions: await this.dbManager.getCollection(
        this.subcollections.sessions
      ),
      AcctivationEmailsCollection: emailsManager.getAllAcctivationEmails(),
      ResetEmailCollection: emailsManager.getAllResetEmails(),
    });
  };

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  tokenRefreshMiddleware = async (req, res, next) => {
    const authenticationToken = this.getTokenFromRequest(req);
    if (authenticationToken)
      if (await this.tokenExist(authenticationToken)) {
        // found a authentication header.
        await this.refreshToken(authenticationToken);
      }

    // NOT found a authentication header.
    next();
  };

  /** @param {string} token */
  handleWhoAmI = async (token) => {
    // console.log({ token })
    const user = await this.getUserByToken(token); // get user associated token.
    delete user.password;
    return user;
  };

  userExist = (userId) => {
    let exist = this.dbManager.objectExist(this.basecollectionName, {
      id: { $eq: userId },
    });
    // exist = this.dbManager.objectExist(`users`, { id: { $eq: userId } })
    return exist;
  };

  /** @param {string} token */
  getSessionByToken = async (token) => {
    let session = await this.dbManager.findObject(
      this.subcollections.sessions,
      { token: token }
    );
    // session = await this.dbManager.findObject('usersSessions', { token: token })
    return session;
  };

  getUserByUserData = (name, surname, email) =>
    this.dbManager.findOne(this.basecollectionName, {
      $and: [
        { name: { $eq: name } },
        { surname: { $eq: surname } },
        { email: { $eq: email } },
      ],
    });
  // this.dbManager.aggregate(this.basecollectionName, {
  //   pipeline: [
  //     {
  //       $match: { $and:[
  //         { name: { $eq: name } },
  //         { surname: { $eq: surname } },
  //         { email: { $eq: email } },
  //       ]},

  //     }
  //   ],
  // }).toArray();

  getUserById = async (user_id) => {
    let userObj = await this.dbManager.findObject(this.basecollectionName, {
      id: user_id,
    });
    //  userObj = await this.dbManager.findObject('users', { id: user_id })
    return userObj;
  };

  /** @param {string} token */
  getUserByToken = async (token) => {
    // TODO: Refactor, first call to usersSesstions
    // next take user id. find user by id and return.

    const sessionObj = await this.getSessionByToken(token);
    if (!sessionObj) return false;

    const userObj = this.getUserById(sessionObj.userId);
    return userObj;
  };

  /**
   *
   * @param {object} param0 an field required to create new user.
   * @param {object} [mailContent] title=text and body=htmt
   * @param {string} mailContent.titleText title = text
   * @param {string} mailContent.bodyHtml  body = html
   * @throws {object} an {code:number,error:string} or User object injected.
   */
  async createUser(
    { name, surname, email, ...restOfUser },
    mailContent = null
  ) {
    // name, surname, email, {  password = null, login = null, activated = false, avatar = null } = {}
    // BUG: wyslac login i hasło userowi
    if (!(name && surname && email)) return false;

    const user = new User(name, surname, email, restOfUser);
    let notValid = null;

    if (!DEBUG) {
      // TODO: Start Point.
      if ((notValid = user.validEmail()) !== undefined)
        // jesli zwrocilo objekt Answer.error
        return notValid;

      if ((notValid = user.validPasswords()) !== undefined) return notValid;

      if ((notValid = user.validNames()) !== undefined) return notValid;
    }
    await this.dbManager.insertObject(this.basecollectionName, user);

    mailContent.bodyHtml += `</br> Dane do zalogowania ==> Login: ${user.login}  Hasło: ${user.password}`;

    if (mailContent)
      emailsManager.sendEmail({
        title: mailContent.titleText,
        body: mailContent.bodyHtml,
        email: user.email,
      });

    return user;
  }

  /**@returns {string}  Name of class */
  toString = () => this.constructor.toString();

  /**@returns {string}  Name of class */
  static toString = () => "UserModule";
}
