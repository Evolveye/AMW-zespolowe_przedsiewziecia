import Module from "../module.js"
import emailsManager from "./mails.js"
import User from "./model.js"
import {
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  TOKEN_EXPIRE_TIME_IN_MINUTES,
  ANSWERS,
} from "./consts.js"

import { DEBUG } from "./../../consts.js"

import * as generalMiddlewares from "./middlewares/general.js"
import * as loggedUserMiddlewares from "./middlewares/users.js"
import * as passwordMiddlewares from "./middlewares/password.js"

const midds = {
  ...generalMiddlewares,
  ...loggedUserMiddlewares,
  ...passwordMiddlewares,
}

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
    registration_confirm:`register.confirm`,
    reset_confirm:`reset.confirm`,
  };

  constructor( ...params ) {
    super( ...params )

    setInterval( async() => {
      this.logger( `DELETE EXPIRED TOKEN MECHANISM.` )

      await this.dbManager.deleteObjectsInCollection(
        this.subcollections.sessions,
        {
          lastActivity: {
            $lt: Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES,
          },
        },
      )
      await this.dbManager.deleteObjectsInCollection(
        this.subcollections.registration_confirm,
        {
          created: {
            $lt: Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES,
          },
        },
      )
      await this.dbManager.deleteObjectsInCollection(
        this.subcollections.reset_confirm,
        {
          created: {
            $lt: Date.now() - TOKEN_EXPIRE_TIME_IN_MINUTES,
          },
        },
      )
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES )
  }

  getApi = () => ({
    "register": {
      post: this.runMid( midds.registerMiddleware ),
    },

    /* TODO: czynnościami są metody, nie adres. Adres tworzą rzeczowniki
     * To powinno zostać rpzeniesione do "users" */
    "create": {
      "user": {
        post: this.runMid( midds.createUserMiddleware ),
      },
    },

    "login": {
      post: this.runMid( midds.loginMiddleware ),
    },

    "logout": {
      post: this.auth( this.runMid( midds.logoutMiddleware ) ),
    },

    "activate": { // JUMP
      post: this.runMid( midds.httpSetLoginAfterReg ),
    },

    "users": {
      get: this.auth( this.runMid( midds.getAllUser ) ),

      "me": {
        get: this.auth( this.runMid( midds.httpAmIMiddleware ) ),
        put: this.auth( this.runMid( midds.updateUserSettings ) ),
      },
    },

    "password": {
      "remind": {
        post: this.runMid( midds.passwordRemindMiddleware ),
      },

      "reset": {
        post: this.runMid( midds.passwordResetMiddleware ),
      },
    },
  })
  /*
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
  */

  /**
   * @param {(req:Request res:Response next:NextFunction) => void} cb
   * @return {(req:Request res:Response next:NextFunction) => void|Response }
   */
  auth = cb => async(req, res, next) => {
    const authenticationToken = this.getTokenFromRequest( req )
    // const var2= authenticationToken.search(`.`)

    if (!authenticationToken || authenticationToken == `null`)
      return res.status( 400 ).json( ANSWERS.TOKEN_NOT_PROVIDED )

    const tokenExists = await this.tokenExist( authenticationToken )
    if (!tokenExists) return res.status( 400 ).json( ANSWERS.TOKEN_NOT_EXIST )

    req.token = authenticationToken
    const maybeUser = await this.getUserByToken( authenticationToken )



    // const { login, password, ...user } = maybeUser
    req.user = maybeUser

    cb( req, res, next )
  };

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  authorizeMiddleware = async(req, res, next) => {
    const authenticationToken = this.getTokenFromRequest( req )
    // const var2= authenticationToken.search(`.`)

    if (!authenticationToken || authenticationToken == `null`)
      return res.status( 400 ).json( ANSWERS.TOKEN_NOT_PROVIDED )

    const tokenExists = await this.tokenExist( authenticationToken )
    if (!tokenExists) return res.status( 400 ).json( ANSWERS.TOKEN_NOT_EXIST )

    req.token = authenticationToken
    req.user = await this.getUserByToken( authenticationToken )

    next()
  };

  /** @param {User} user new user to save. */
  saveUserInDb = async user => {
    // console.log({ USERRRR:user })
    this.dbManager.insertObject( this.basecollectionName, user )
  };

  /** @param {WS} socket */
  socketConfigurator = socket => {
    socket.userScope = {
      /** @type {string} */
      token: ``,
      /** @type {User} */
      user: {},
    }

    socket.on( `authenticate`, async token => {
      this.logWs( `Socket authorization... (token=${token})` )
      this.refreshToken( token )

      const user = await this.getUserByToken( token )

      socket.userScope.token = token
      Object.assign( socket.userScope.user, user )
    } )

    socket.on( `api.get.users.me`, data =>
      this.authorizedSocket( socket, async token => {
        const user = await this.getUserByToken( token )
        delete user.password

        this.logWs( JSON.stringify({ name:user.name, surname:user.surname }) )
        socket.emit( `api.get.users.me`, user )
      } ),
    )
  };

  /**
   * @param {WS} socket
   * @param {(token:string) => void} cb
   */
  async authorizedSocket( socket, cb ) {
    const { token } = socket.userScope

    const tokenExist = await this.tokenExist( token )

    if (DEBUG || tokenExist) cb( token )
    // TODO po co debug tutaj ?
    else socket.emit( `not authenticated` )
  }

  /** @param {string} token */
  deleteSessionByToken = token => {
    return this.dbManager.deleteObject( this.subcollections.sessions, {
      token: token,
    } )
    // this.dbManager.deleteObject('usersSessions', { token: token })
  };

  /** @param {string} token */
  tokenExist = token => {
    return this.dbManager.findObject( this.subcollections.sessions, {
      token: token,
    } )
    //  t= this.dbManager.findObject('usersSessions', { token: token })
  };

  /** @param {string} token */
  refreshToken = token => {
    return this.dbManager.updateObject(
      this.subcollections.sessions,
      { token:token },
      { $set:{ lastActivity:Date.now() } },
    )
    // this.dbManager.updateObject('usersSessions', { token: token }, { $set: { lastActivity: Date.now() } })
  };

  /**
   * @param {Request} request
   * @returns {string|null}
   */
  getTokenFromRequest = request => {
    const authentication = request.header( `Authentication` )
    return authentication ? authentication.match( /Bearer (.*)/ )[ 1 ] : null
  };

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  test = async(req, res, next) => {
    console.log( `TEST ROUTE` )

    return res.status( 200 ).json({
      ActiveSessions: await this.dbManager.getCollection(
        this.subcollections.sessions,
      ),
      AcctivationEmailsCollection: emailsManager.getAllAcctivationEmails(),
      ResetEmailCollection: emailsManager.getAllResetEmails(),
    })
  };

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  tokenRefreshMiddleware = async(req, res, next) => {
    const authenticationToken = this.getTokenFromRequest( req )
    if (authenticationToken)
      if (await this.tokenExist( authenticationToken )) {
        // found a authentication header.
        await this.refreshToken( authenticationToken )
      }

    // NOT found a authentication header.
    next()
  };

  /** @param {string} token */
  handleWhoAmI = async token => {
    const user = await this.getUserByToken( token ) // get user associated token.
    delete user.password
    return user
  };

  saveRegObject = regObj =>
    this.dbManager.insertObject( this.subcollections.registration_confirm, regObj )

  findRegObject = userId =>
    this.dbManager.findOne( this.subcollections.registration_confirm, { "user.id":{ $eq:userId } } )

  findAndDeleteRegObj = userId =>
    this.dbManager.findOneAndDelete( this.subcollections.registration_confirm, { "user.id":{ $eq:userId } } )

  findResetObject = code =>
    this.dbManager.findOne( this.subcollections.reset_confirm, { code:{ $eq:code } } )

  saveResetObject = object =>
    this.dbManager.insertObject( this.subcollections.reset_confirm, object )

  findAndDeleteResetObject = code =>
    this.dbManager.findOneAndDelete( this.subcollections.reset_confirm, { code:{ $eq:code } } )


    acctivateAndChangeUserLogin = (login, userId) =>
      this.dbManager.findOneAndUpdate( this.basecollectionName,
        { id:{ $eq:userId } },
        { $set:{ login:login, activated:true } },
        { new:true },
      )

  changeUserLoginAndPassw = (userId, login, password) =>
    this.dbManager.findOneAndUpdate( this.basecollectionName,
      { id:{ $eq:userId } },
      { $set:{ login:login, password:password } },
      { new:true },
    )

  changeUserLogin = (userId, login) =>
    this.dbManager.findOneAndUpdate( this.basecollectionName,
      { id:{ $eq:userId } },
      { $set:{ login:login } },
      { new:true },
    )

  doesEmailExistsInDb = async email => {
    const user = await this.dbManager.findOne( this.basecollectionName,
      { email:{ $eq:email } } )
    return user ? true : false
  }

  userExist = userId => {
    let exist = this.dbManager.objectExist( this.basecollectionName, {
      id: { $eq:userId },
    } )
    // exist = this.dbManager.objectExist(`users`, { id: { $eq: userId } })
    return exist
  };

  /** @param {string} token */
  getSessionByToken = async token => {
    let session = await this.dbManager.findObject(
      this.subcollections.sessions,
      { token:token },
    )
    // session = await this.dbManager.findObject('usersSessions', { token: token })
    return session
  };

  getUserByUserData = (name, surname, email) =>
    this.dbManager.findOne( this.basecollectionName, {
      $and: [
        { name:{ $eq:name } },
        { surname:{ $eq:surname } },
        { email:{ $eq:email } },
      ],
    } );

  getUserByLogin = login =>
    this.dbManager.findOne(
      this.basecollectionName,
      { login:{ $eq:login } },
    )
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

  getUserById = async user_id => {
    let userObj = await this.dbManager.findObject( this.basecollectionName, {
      id: user_id,
    } )
    //  userObj = await this.dbManager.findObject('users', { id: user_id })
    return userObj
  };

  /** @param {string} token */
  getUserByToken = async token => {
    // TODO: Refactor, first call to usersSesstions
    // next take user id. find user by id and return.

    // console.log( token )
    const sessionObj = await this.getSessionByToken( token )
    if (!sessionObj) return false

    const userObj = this.getUserById( sessionObj.userId )
    return userObj
  };

  getUserByEmail = email =>
    this.dbManager.findObject( this.basecollectionName, { email:{ $eq: email } } )

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
    mailContent = null,
  ) {
    // name, surname, email, {  password = null, login = null, activated = false, avatar = null } = {}
    // BUG: wyslac login i hasło userowi
    if (!(name && surname && email)) return false

    const user = new User(name, surname, email, restOfUser)
    let notValid = null

    if (!DEBUG) {
      // TODO: Start Point.
      if ((notValid = user.validEmail()) !== undefined)
        // jesli zwrocilo objekt Answer.error
        return notValid

      if ((notValid = user.validPasswords()) !== undefined) return notValid

      if ((notValid = user.validNames()) !== undefined) return notValid
    }

    await this.dbManager.insertObject( this.basecollectionName, user )

    if (mailContent)
      emailsManager.sendEmail({
        title: mailContent.titleText,
        body: mailContent.bodyHtml,
        email: user.email,
      })

    return user
  }



  /** @returns {string}  Name of class */
  toString = () => this.constructor.toString();

  /** @returns {string}  Name of class */
  static toString = () => `UserModule`;
}
