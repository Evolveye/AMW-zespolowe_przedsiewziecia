import { sameWords, validateWord,randomString, isEmailValid} from './../../src/utils.js'
import {
  ANSWERS,
  REGISTER_RESTRICTION,
  NAMES_RESTRICTIONS,
  PASSWORD_RESTRICTIONS,
} from './consts.js'

export default class User {
  /**
   * @param {string} name
   * @param {string} surname
   * @param {string} email
   * @param {object} param3
   * @param {string} param3.login
   * @param {string} param3.password1
   * @param {string} param3.password2
   * @param {boolean} param3.activated
   * @param {string} param3.avatar
   */
  constructor(name, surname, email, { password = null, login = null, activated = false, avatar = null } = {}) {
    this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
    this.name = name
    this.surname = surname
    this.email = email
    this.login = login ?? name.slice(0, 2)
      + Math.random().toString().slice(2, 5)
      + surname.slice(0, 2)
    this.password = password ?? randomString(8,4)

    this.activated = activated
    this.avatar = avatar ?? `/media/image/avatarDefault.jpg`
    this.createdDatetime = Date.now()

  }

  validEmail() {
    return User.validEmail(this.email)
  }

  validPasswords() {
    return User.validPassword(this.password, this.name, this.surname)
  }

  validNames() {
    return User.validName(this.name, this.surname)
  }

  static validEmail( email ) {
    if (!isEmailValid(email))
      return ANSWERS.EMAIL_NOT_CORRECT
  }

  static validPassword( password, name, surname ) {
    if (!REGISTER_RESTRICTION.canNamePasswordSame)
      if (sameWords(name, password))
        return ANSWERS.REGISTER_SAME_NAME_PASSWORD

    if (!REGISTER_RESTRICTION.canSurnamePasswordSame)
      if (sameWords(surname, password))
        return ANSWERS.REGISTER_SAME_SURNAME_PASSWORD

    if (!validateWord(password, PASSWORD_RESTRICTIONS))
      return ANSWERS.PASSWD_POLICES_ERR
  }

  static validName( name, surname ) {
    if (!REGISTER_RESTRICTION.canNameSurnameSame)
      if (sameWords(name, surname))
        return ANSWERS.REGISTER_SAME_NAME_SURNAME

    if (!(validateWord(name, NAMES_RESTRICTIONS) && validateWord(surname, NAMES_RESTRICTIONS)))
      return ANSWERS.REGISTER_NAMES_POLICES_ERR
  }
}