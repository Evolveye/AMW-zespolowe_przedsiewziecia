export const ONE_MINUTE = 1000 * 60
export const TOKEN_EXPIRE_TIME_IN_MINUTES = ONE_MINUTE * 60
export const REFRESHING_INTERVAL_TIME_IN_MINUTES = ONE_MINUTE

export const ERRORS = {
    NOT_EXIST: "Cannot find user with passed credentials.",
    ALREADY_EXIST: "Credentials are already used.",
    PASSWORDS_NOT_SAME: "Password's are not the same.",
    CANNOT_IDENTYFY_USER: "Provided bad token, can not find user with associated token."
}

const password = "secret123#"
const email = "sass.project.amw@gmail.com"

export const PASSW_RESET_ADDR = "http://localhost:3000/api/password/reset"
export const ACTIVATE_ADDR = "http://localhost:3000/activate"
export const EMAIL = {
    ACTIVATION_EXPIRE_TIME: ONE_MINUTE * 60,
    PASSWD_RESET_EXPIRE_TIME: ONE_MINUTE * 10,
    ACCTIVATE_ACCOUNT_SUBJECT: "Verify your SASS Portal account.",
    PASSWORD_RESET_SUBJECT: "Reset your password.",
    GMAIL_SERVICE_NAME: "gmail",
    GMAIL_SERVICE_HOST: "smtp.gmail.com",
    GMAIL_SERVICE_SECURE: false,
    GMAIL_SERVICE_PORT: 587,
    GMAIL_USER_NAME: email,
    GMAIL_USER_PASSWORD: password,
}