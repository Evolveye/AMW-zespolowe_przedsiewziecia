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
    // resetowanie hasla.

    app.use(this.tokenRefreshMiddleware);

    app.get("/test", this.test)
    app.get("/api/me", this.whoAmIMiddleware); // 1 metoda dla ws i HTTP czy osobne ???
    app.get("/activate/:id", this.acctivateAccountMiddleware);
    app.get("/users", this.getAllUsers); // TODO: production Remove.
    app.get("/api/logout", this.logoutMiddleware);


    app.post("/api/register", this.registerMiddleware);
    app.post("/api/login", this.loginMiddleware); //
    app.post("/api/password/remind",this.passwordRemindMiddleware); 
    app.post("/api/password/reset", this.passwordResetMiddleware); // update passw in db
    

  }


  passwordResetMiddleware = async (req,res,next)=>{
     const resetObj  = req.body;

    if(resetObj.password1!=resetObj.password2)
    {
      res.status(403).send(CONSTS.ERRORS.PASSWORDS_NOT_SAME);
    }

    const userEmail = emailsManager.isActiveResetEmail(resetObj.code);
    if(userEmail)
    {
      //TODO: make db update.
      res.status(200).send("Your password has been changed sucessfuly.");
      const userObj= this.dbManager.updateObject(
        `users`,
        { email:userEmail},
        { $set: { password: resetObj.password1 } }
      )

    }
    else
    {
      res.status(400).send("Reset email  time expired ")
    }
  }

  passwordRemindMiddleware = async (req,res,next)=>{

    const email = req.body.email;
    const user = await this.dbManager.findObject(`users`,(obj)=>obj.email == email)
    if(user)
    {
      //TODO: Production Uncoment.
      emailsManager.sendResetPasswordEmail(email);
      res.status(200).send("Reset Password email has been sended. Check your E-mail ")
  
    }else{
      res.status(400).send("cannot find user with that email");
    }
   


    // if (emailsManager.isActiveResetEmail(uniqueId)) {
    //   /** @type {User} */
    //   const targetUser = await this.dbManager.findObject(
    //     `users`,
    //     /**@param {User} obj */
    //     (obj) => obj.email == uniqueId
    //   );

    //   console.log(targetUser);
    
    // }
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


    if (emailsManager.isActiveActivationEmail(accLogin)) {
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

      res.json( user);
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
    
    if(userObj)// jest w bazie
    {
      if (userObj.activated) { // aktywowany
        var token = Math.random().toString();
        this.#tokens.push({
          lastActivity: Date.now(),
          user: userObj,
          token,
        });
  
        res.json(token); // or send and json stringify.
      } else {
        res.status(401).send(`Your account is not activated.`);
      }
    }else
    {
      res.status(401).send(`User with not exist. Please register first.`);
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
      avatar:`/media/image/avatarDefault.jpg`,
    };

    await this.dbManager.insertObject(`users`, user);
    console.log("MARK --> ", await this.dbManager.getCollection(`users`));
    console.log(" <-- MARK");

    // this.dbManager.getCollection(`users`);
    // this.#db.collection(`users`).find().toArray().then(console.log);
    emailsManager.sendAcctivationEmail(user.name, user.email, user.login);

    res.json(user);
  };

  toString = () => "UserModule";
}
