import nodemail from "nodemailer";
//import Mail from "nodemailer/lib/mailer";
import {
  ACTIVATE_ADDR,
  EMAIL,
  REFRESHING_INTERVAL_TIME_IN_MINUTES,
} from "./consts.js";

class EmailManager {
  #EmailCollection = [];

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
    
      this.#EmailCollection = this.#EmailCollection.filter(({ SEND_DATE }) => {
        SEND_DATE > Date.now() - EMAIL.EMAIL_EXPIRE_TIME;
      });
    }, REFRESHING_INTERVAL_TIME_IN_MINUTES);
  }

  CanAcctivateAccount(login) {
    let collObj = this.#EmailCollection.find(
      (obj, idx) => obj.USER_ID == login
    );

    if (collObj && collObj.SEND_DATE > Date.now() - EMAIL.EMAIL_EXPIRE_TIME) {
      let idx = this.#EmailCollection.indexOf(collObj);
      this.#EmailCollection.splice(idx, 1);

      return true;
    }
    return false;
  }

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
        this.#EmailCollection.push(emailCollObj);
        console.log(`Email succesfully. USER Login ${userID}`);
      }
    });
  }
}

export default new EmailManager();
