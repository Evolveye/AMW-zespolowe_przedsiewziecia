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
  if (!isEmailValid(this.email))
    return ANSWERS.EMAIL_NOT_CORRECT
}

validPasswords() {

  if (!REGISTER_RESTRICTION.canNamePasswordSame)
    if (sameWords(this.name, this.password))
      return ANSWERS.REGISTER_SAME_NAME_PASSWORD

  if (!REGISTER_RESTRICTION.canSurnamePasswordSame)
    if (sameWords(this.surname, this.password))
      return ANSWERS.REGISTER_SAME_SURNAME_PASSWORD

  const isOk= validateWord(this.password, PASSWORD_RESTRICTIONS)
  if (!isOk)
    return ANSWERS.PASSWD_POLICES_ERR

}

validNames() {
  if (!REGISTER_RESTRICTION.canNameSurnameSame)
    if (sameWords(this.name, this.surname))
      return ANSWERS.REGISTER_SAME_NAME_SURNAME

  if (!(validateWord(this.name, NAMES_RESTRICTIONS) && validateWord(this.surname, NAMES_RESTRICTIONS)))
    return ANSWERS.REGISTER_NAMES_POLICES_ERR
}

}