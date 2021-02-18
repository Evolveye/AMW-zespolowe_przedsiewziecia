export const ONE_MINUTE = 1000 * 60
export const TOKEN_EXPIRE_TIME_IN_MINUTES = ONE_MINUTE * 30
export const REFRESHING_INTERVAL_TIME_IN_MINUTES = ONE_MINUTE * 5

export const ANSWERS = { // error - success
    USER_NAMES_WITH_SPACE:           { code:125, error:"User name/surname contain space, char(0x32). Please insert correct name/surname." },
    USER_NOT_EXIST:                  { code:100, error:"Cannot find user with passed credentials." },
    USER_ALREADY_EXIST:              { code:101, error:"Credentials are already used." },
    NAMES_NOT_CHARS_ONLY:            { code:126, error:"name and surname cannot contain any special characters ( Like _,.(*_=-0+ )"},

    PASSWD_NOT_SAME:                 { code:102, error:"Password's are not the same." },
    PASSWD_CHANGE_SUCCESS:           { code:103, success:"Your password has been changed sucessfuly." },
    PASSWD_REMIND_SUCCES:            { code:104, success:"Reset Password email has been sended. Check your E-mail" },
    PASSWD_REMIND_WRONG_EMAIL:       { code:105, error:"Cannot find user with that email" },
    PASSWD_POLICES_ERR:              { code:106, error:"Password not passed polices." },
    PASSWD_RESET_NO_CODE_PROVIDED:   { code:107, error:"Reset password, can not found code in request body." },
    PASSWD_RESET_NO_EMAIL_PROVIDED:  { code:108, error:"Can not find email in request body." },

    TOKEN_NOT_PROVIDED:              { code:109, error:"Your request does not contain authentication token" },
    TOKEN_NOT_EXIST:                 { code:110, error:"Provided token has propably expired or you are not logged in. Please login again." },

    EMAIL_RESET_EXPIRED:             { code:111, error:"Reset email time expired " },
    EMAIL_ACTIVATE_EXPIRED:          { code:112, error:"Activate email time expired" },
    EMAIL_NOT_CORRECT:               { code:113, error:"Provided email not match restriction pattern. Make sure u passed correct adres email." },

    LOGOUT_SUCCESS:                  { code:114, success:"You has been logged out." },

    ACCOUNT_ACTIVATION_SUCCESS:      { code:115, success:"Your account has ben activated successfully" },
    ACCOUNT_ALREADY_ACTIVATED:       { code:116, error:"Account has ben already activated." },
    ACCOUNT_NOT_ACTIVATED:           { code:117, error:"Your acctount is not activated. Please check your adress email and activate account.." },

    REGISTER_SAME_NAME_SURNAME:      { code:118, error:"Name and surname can not be the same" },
    REGISTER_SAME_NAME_PASSWORD:     { code:119, error:"Name and password can not be the same" },
    REGISTER_SAME_SURNAME_PASSWORD:  { code:120, error:"Password and surname can not be the same" },
    REGISTER_NAMES_POLICES_ERR:      { code:121, error:"Provided name or surname dont mach restrictions." },
    REGISTER_CREDENTIAL_NOT_PROVIDED:{ code:122, error:`Registeration process failed, Missing data in request. Provide fully correct data set. `},
    REGISTER_EMAIL_IN_USE:           { code:124, error:"User with provided email already exists in PE. Click remind password to restore your account."},

    CREATE_CREDENTIAL_NOT_PROVIDED:  { code:123, error:"Name surname or email is empty." },
}

const password = "secret123#"
const email = "sass.project.amw@gmail.com"

export const PASSW_RESET_ADDR = "http://localhost:3000/api/password/reset"
export const PASSW_RESET_FRONT_ADDR = "http://localhost:3000/password/reset"

export const ACTIVATE_REQUEST_ADDR = "http://localhost:3000/api/activate"
export const ACTIVATE_FRONT_ADDR = "http://localhost:3000/activate"

export const EMAIL = {
    ACTIVATION_EXPIRE_TIME: ONE_MINUTE * 30,
    PASSWD_RESET_EXPIRE_TIME: ONE_MINUTE * 10,
    ACCTIVATE_ACCOUNT_SUBJECT: "Aktywuj swoje konto w Platformie Edukacyjnej.",
    PASSWORD_RESET_SUBJECT: "Zmiania hasła Platformy Edukacyjnej.",
    GMAIL_SERVICE_NAME: "gmail",
    GMAIL_SERVICE_HOST: "smtp.gmail.com",
    GMAIL_SERVICE_SECURE: false,
    GMAIL_SERVICE_PORT: 587,
    GMAIL_USER_NAME: email,
    GMAIL_USER_PASSWORD: password,
}

export const PASSWORD_RESTRICTIONS = {
    minLen: 8,
    maxLen: Infinity,
    bannedChars: ``,
    bannedWords: ['password'],
    requireSpacialChar: true,
    specialChars: `!@#$%^&*-+<>`,
    minUpperCase: 1,
    minLowerCase: 1,
}

export const NAMES_RESTRICTIONS = {
    minLen: 2,
    maxLen: 30,
}

export const REGISTER_RESTRICTION = {
    canNamePasswordSame: false,
    canNameSurnameSame: true,
    canSurnamePasswordSame: false,
}
