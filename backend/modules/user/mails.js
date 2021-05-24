import nodemail from "nodemailer"
// import {EMAIL} from './consts.js'
// TODO, potrzebuje sprawdzac w db, czy user juz zostal aktywowany.

import {
  PASSW_RESET_ADDR,
  ACTIVATE_REQUEST_ADDR,
  ACTIVATE_FRONT_ADDR,
  EMAIL,
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
  PASSW_RESET_FRONT_ADDR,
  ONE_MINUTE,
} from "./consts.js"

class EmailManager {
  #acctivateCollection = []
  #passwResetCollection = []

  #transporter = nodemail.createTransport({
    host: EMAIL.GMAIL_SERVICE_HOST,
    port: EMAIL.GMAIL_SERVICE_PORT,
    secure: EMAIL.GMAIL_SERVICE_SECURE,
    tls: { rejectUnauthorized: false },
    auth: {
      user: EMAIL.GMAIL_USER_NAME,
      pass: EMAIL.GMAIL_USER_PASSWORD,
    },
  })

  constructor() {
    setInterval( () => { // Acctivation email's
      this.#acctivateCollection = this.#acctivateCollection.filter( this.filterExpireActivationEmails )
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES )

    setInterval( () => { // Reset Passwd email's
      this.#passwResetCollection = this.#passwResetCollection.filter( this.filterExpireResetEmails )
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES )
  }


  /**
   *
   * @param {Object} obj type of emailCollObj.
   */
  filterExpireResetEmails = obj => (Date.now() - obj.SEND_DATE) < EMAIL.PASSWD_RESET_EXPIRE_TIME // nie minelo .

  getAllAcctivationEmails = () => this.#acctivateCollection
  getAllResetEmails = () => this.#passwResetCollection

  /**
   *
   * @param {Object} obj type of emailCollObj.
   */
  filterExpireActivationEmails = obj => (Date.now() - obj.SEND_DATE) < EMAIL.ACTIVATION_EXPIRE_TIME // nie minelo .

  /**
   * Checks that an account can be activated.
   *
   * @param {number} login
   * @returns {boolean}
   */
  isActiveActivationEmail( login ) {
    // TODO: refactor return user OBJ or false.

    const collObj = this.#acctivateCollection.find( (obj, idx) => obj.USER_ID == login )
    if (!collObj) return false


    const idx = this.#acctivateCollection.indexOf( collObj )
    this.#acctivateCollection.splice( idx, 1 ) // delete email obj in collection.
    return true

  }


  /**
    * Checks that an account can be activated. If can the email will be deleted. otherwise false.
    *
    * @param {number} login
    * @returns {string|boolean}  restuns
    */
  isActiveResetEmail( uniqueId ) {
    // TODO: refactor return user OBJ or false.

    const collObj = this.#passwResetCollection.find(
      (obj, idx) => obj.UNIQUE_ID == uniqueId,
    )

    if (!collObj) return false

    const idx = this.#passwResetCollection.indexOf( collObj )
    this.#passwResetCollection.splice( idx, 1 ) // delete email obj in collection.
    return collObj.EMAIL


  }

  findEmailById( passwResetUniqueCode ) {
    const resetemailobj = this.#passwResetCollection.find( obj => obj.UNIQUE_ID == passwResetUniqueCode )
    return resetemailobj.EMAIL
  }

  removeResetEmail( passwResetUniqueCode ) {
    this.#passwResetCollection = this.#passwResetCollection.filter( obj => obj.UNIQUE_ID != passwResetUniqueCode )
  }

  /**
   *
   * @param {object} param0 an email content
   * @param {string} param0.title title of email
   * @param {string} param0.body html content of email.
   * @param {string} param0.email reciver email
   */
  sendEmail({ title, body, email }) {

    const mailOptions = {
      from: EMAIL.GMAIL_USER_NAME,
      to: email,
      subject: title,
      html: body,
    }

    this.#transporter.sendMail( mailOptions, (err, info) => {
      if (err) {
        throw err
      } else {
        console.log( `Email to ${ mailOptions.to } has been send.` )
      }
    } )
  }





  /**
   *
   * @returns {number} uniqueId.
   */
  sendResetPasswordEmail( req, email, code ) {
    var uniqueId = code

    const mailOptions = {
      from: EMAIL.GMAIL_USER_NAME,
      to: email,
      subject: EMAIL.PASSWORD_RESET_SUBJECT,
      html: `
      <h1>
      <a href="${req?.headers.origin}/password/reset?code=${uniqueId}"> Kliknij aby zresetować hasło. </a>
      </h1>
      `,
    }
    const emailCollObj = {
      EMAIL_OPTIONS: mailOptions,
      SEND_DATE: Date.now(),
      UNIQUE_ID: uniqueId,
      EMAIL: email,
    }

    this.#transporter.sendMail( mailOptions, (err, info) => {
      if (err) {
        console.log( `Cannot send e-mail`, { err } )
      } else {
        // const emailCollObj = {
        //   EMAIL_OPTIONS: mailOptions,
        //   SEND_DATE: Date.now(),
        //   UNIQUE_ID: uniqueId,
        //   EMAIL: email,
        // }
        console.log( `Reset Passw send --> `, { email: emailCollObj.EMAIL_OPTIONS.to } )
        this.#passwResetCollection.push( emailCollObj )
      }
    } )

  }

  /**
   * @param {object} userObj User.
   * @param {string} userObj.name User name.
   * @param {string} userObj.email User personal e-mail.
   * @param {number} userObj.id User login.
   * @param {import('express').Request} req User login.
   */
  sendAcctivationEmail( userObj, req ) {
    const mailOptions = {
      from: EMAIL.GMAIL_USER_NAME,
      to: userObj.email,
      subject: EMAIL.ACCTIVATE_ACCOUNT_SUBJECT, // JUMP
      html: `
        <!-- <h2>Twój login do platformy: ${userObj.login}</h2> -->
        <h2> Witamy na platformie. </h2>
        <p>Na aktywację konta masz ${(EMAIL.ACTIVATION_EXPIRE_TIME) / ONE_MINUTE} minut
        (do ${new Date(new Date().getTime() + EMAIL.ACTIVATION_EXPIRE_TIME ).toLocaleTimeString( `pl-PL` ).slice( 0, 5 )}).</p>
        <p>Kilknij <a href="${req?.headers.origin || ACTIVATE_FRONT_ADDR}/activate?code=${userObj.id}">TUTAJ</a> aby aktywować konto. </p>
        <br/><br/>
        <small>Jeśli nie zakładałeś konta na portalu edukacyjnym, zignoruj tego e-mail.</small>
      `,
    }

    this.#transporter.sendMail( mailOptions, (err, info) => {
      if (err) {
        console.log( `Cannot send e-mail`, { err } )
      } else {
        const emailCollObj = {
          EMAIL_OPTIONS: mailOptions,
          SEND_DATE: Date.now(),
          USER_ID: userObj.id,
        }
        console.log( `Email succesfully. USER LOGIN ${userObj.login} E-MAIL ${userObj.email}` )
      }
    } )
  }
}

export default new EmailManager()
