import nodemail from "nodemailer";

import {
  ACTIVATE_ADDR,
  EMAIL,
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
} from "./consts.js";

class EmailManager {
  #emailCollection = [];

  #transporter = nodemail.createTransport({
    host: EMAIL.GMAIL_SERVICE_HOST,
    port: EMAIL.GMAIL_SERVICE_PORT,
    secure: EMAIL.GMAIL_SERVICE_SECURE,
    auth: {
      user: EMAIL.GMAIL_USER_NAME,
      pass: EMAIL.GMAIL_USER_PASSWORD,
    },
  });

  constructor() {
    setInterval(() => {
      //console.log("DELETE EXPIRED EMAIL MECHANISM.");
      this.#emailCollection = this.#emailCollection.filter(this.filterExpireEmails);
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  /**
   * 
   * @param {Object} obj type of emailCollObj.
   */
  filterExpireEmails = (obj) => ( Date.now() - obj.SEND_DATE ) < EMAIL.EMAIL_EXPIRE_TIME; // nie minelo .

  /**
   * Checks that an account can be activated.
   * 
   * @param {number} login 
   * @returns {boolean} 
   */
  isEmailActive(login) {
    //TODO: refactor return user OBJ or false.

    const collObj = this.#emailCollection.find(
      (obj, idx) => obj.USER_ID == login
    );

    if (collObj) {
      const idx = this.#emailCollection.indexOf(collObj);
      this.#emailCollection.splice(idx, 1); // delete email obj in collection.
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {string} name User name.
   * @param {string} email User personal e-mail.
   * @param {number} userID User login.
   */
  sendAcctivationEmail(name, email, userID) {
    const mailOptions = {
      from: EMAIL.GMAIL_USER_NAME,
      to: email,
      subject: EMAIL.ACCTIVATE_ACCOUNT_SUBJECT,
      html: `<h1><a href="${ACTIVATE_ADDR}/${userID}"> Acctivate </a></h1>
             <br/> ${ACTIVATE_ADDR}/${userID}
      `,
    };

    this.#transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Cannot send e-mail", { err });
      } else {
        const emailCollObj = {
          EMAIL_OPTIONS: mailOptions,
          SEND_DATE: Date.now(),
          USER_ID: userID,
          USER_NAME: name,
        };
        this.#emailCollection.push(emailCollObj);
        console.log(`Email succesfully. USER Login ${userID}`);
      }
    });
  }
}

export default new EmailManager();
