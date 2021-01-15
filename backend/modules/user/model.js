import { sameWords, validateWord } from './../../src/utils.js'
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
  constructor(name, surname, email, { password1 = null, password2 = null, login = null, activated = false, avatar = null } = {}) {
    this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
    this.name = name
    this.surname = surname
    this.email = email
    this.login = login ?? Math.random().toString()
    this.password1 = password1 ?? Math.random().toString().slice(2).substring(0, 4)
    this.password2 = password2 ?? Math.random().toString().slice(2).substring(0, 4)
    this.activated = activated
    this.avatar = avatar ?? `/media/image/avatarDefault.jpg`
    this.createdDatetime = Date.now()
  }

  validEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email))
      return ANSWERS.EMAIL_NOT_CORRECT
  }

  validPasswords() {

    if (!sameWords(this.password1, this.password2))
      return ANSWERS.PASSWD_NOT_SAME

    if (!REGISTER_RESTRICTION.canNamePasswordSame)
      if (sameWords(this.name, this.password1))
        return ANSWERS.REGISTER_SAME_NAME_PASSWORD

    if (!REGISTER_RESTRICTION.canSurnamePasswordSame)
      if (sameWords(this.surname, this.password1))
        return ANSWERS.REGISTER_SAME_SURNAME_PASSWORD

    if (!validateWord(this.password1, PASSWORD_RESTRICTIONS))
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