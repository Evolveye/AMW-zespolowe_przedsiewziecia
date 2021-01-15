import { LOG_PAGES_ROUTE, LOG_WS_EVENTS, CLEAR_CONSOLE } from "./../consts.js"
import Logger, { logUnderControl as logUnderCtrl } from "./Logger.js"

export const logUnderControl = logUnderCtrl

export function stringifyObjValues(obj) {
  Object.entries(obj)
    .forEach(([key, value]) => obj[key] = value.toString())

  return obj
}

/** @param {import("express").Request} req */
export const isRequestPageRoute = req => !req.url.match(/\.[^\.]+$/)
/** @param {import("express").Request} req */
export const doHttpLogShouldBePrinted = req =>
  CLEAR_CONSOLE ? false : (LOG_PAGES_ROUTE ? isRequestPageRoute(req) : true)
export const doWsLogShouldBePrinted = () =>
  CLEAR_CONSOLE || !LOG_WS_EVENTS ? false : true

export const assertLogger = new Logger([
  { align: `center`, color: `white`, value: `[ ` },
  { align: `center`, color: `white` },
  { align: `center`, color: `white`, value: ` ] ` },
  { align: `right`, color: `blue`, length: 25 },
  { align: `center`, color: `white`, value: `:  ` },
  { align: `right`, color: `white`, length: 10 },
  { align: `center`, color: `yellow`, value: `  ===  ` },
  { align: `left`, color: `white` },
])

export function assert(name, a, b) {
  const result = a === b
  const color = result ? `fgGreen` : `fgRed`
  const resultName = result ? `  OK ` : `ERROR`

  logUnderControl(assertLogger, `[${color}]${resultName}[]`, name, a, b)
}

export const isDigit = (n) => Boolean([true, true, true, true, true, true, true, true, true, true][n])
export const isEveryDigit = (n) => n.split('').every(char => isDigit(char))
export const isEveryUpper = (n) => n.split('').every(char => char === char.toUpperCase())
export const isEveryLowwer = (n) => n.split('').every(char => char === char.toLowerCase())
export const notContainDigit = (n) => word.split('').every(char => !isDigit(char))

/**
 * @param {string} word1
 * @param {string} word2
 */
export const sameWords = (word1, word2) => word1 === word2

/**
 * @typedef {object} Restriction
 * @property {number} minLen minimum length of word
 * @property {number} maxLen maximum length of word
 * @property {string} bannedChars an string with specyfied special characters
 * @property {string[]} bannedWords list of banned words
 * @property {Boolean} requireSpacialChar does word require 1 special character
 * @property {string} specialChars an string with specyfied special characters, if reqireSpecialChar is true and specialChars are not declared, result will be false.
 */


export const isEmailCorrect = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)


