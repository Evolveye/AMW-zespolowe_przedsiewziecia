import { LOG_PAGES_ROUTE, LOG_WS_EVENTS, CLEAR_CONSOLE } from "./../consts.js"
import Logger, { logUnderControl as logUnderCtrl, addNextLineToLog as addNextLn } from "./Logger.js"

export const addNextLineToLog = addNextLn
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
export const notContainDigit = (n) => n.split('').every(char => !isDigit(char))
export const isEmailValid = (email) => /[a-z]\w+@[a-z]\w+\.[a-z]{2,}/i.test(email)
export const isEveryChar = (n) => !/[\s`0-9~!@#$%^&*()_+\-=[\]\\{}|;':",./<>?]/.test(n)


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


/**
 * @param {string} word An word to check validation.
 * @param {Restriction} param1  Restriction.
 */
export const validateWord = (word, config) => {
  const createCharReg = str => new RegExp( str.split(``).map( char => `\\${char}` ).join(`|`) )
  const {
    minLen,
    maxLen,
    bannedChars,
    bannedWords,
    requireUpperCaseLetter,
    requireLowerCaseLetter,
    requireDigit,
    specialChars
  } = config

  let noWords = true

  if (bannedWords) {
    const wordsArrayCorrect = Array.isArray(bannedWords) &&
       bannedWords.every(word => typeof word == 'string')
    noWords = wordsArrayCorrect ? bannedWords.every((banned) => banned != word) : false
  }

  return true
    && (minLen ? word.length >= minLen : true)
    && (maxLen ? word.length <= maxLen : true)
    && (bannedChars ? !createCharReg( bannedChars ).test( word ) : true)
    && (specialChars ? createCharReg( specialChars ).test( word ) : true)
    && (requireUpperCaseLetter ? /[A-Z]/.test( word ) : true)
    && (requireLowerCaseLetter ? /[a-z]/.test( word ) : true)
    && (requireDigit ? /[0-9]/.test( word ) : true)
    && (noWords)
}


export function randomString(length=8,countOfSpecChars=1,countOfNumbers=1) {
  const alphabet = `abcdefghijklmnouprstwxyz`
  const ALPHABET = alphabet.toUpperCase()
  const specChars = `!@#$%^&*-+<>`

 const alp_len = length - countOfSpecChars - countOfNumbers

 const randomBoolean = () => Math.random() >= 0.5 ? true : false
 const randomChar = (alph)=> alph.charAt( Math.floor(Math.random()*alph.length))
 const randomSpecChar = () => specChars.charAt( Math.floor(Math.random()*specChars.length))
 const randomPosition = (password) => Math.floor( Math.random()*password.length )
 const insertCharIntoString = (char,string,startPos)=>
      string.substring(0, startPos) + char + string.substr(startPos);
  const randomNumber = () => Math.floor(Math.random()*10)


  let password = ``

  for(let i=0;i<alp_len/2;i++)
  {
      password = insertCharIntoString(
          randomChar(ALPHABET),
          password,
          randomPosition(password))

      password = insertCharIntoString(
          randomChar(alphabet),
          password,
          randomPosition(password))
  }

  for(let i = 0; i<countOfSpecChars; i++)
  {
      password = insertCharIntoString(
          randomChar(specChars),
          password,
          randomPosition(password))
  }
  for (let index = 0; index < countOfNumbers; index++) {
      password = insertCharIntoString(
          randomNumber(),
          password,
          randomPosition(password)
      )
  }

  return password
}



export function changeCharInString(string, index, newChar) {
  let str = string.split('');
  str[index] = newChar;
  str = str.join('');
  return str
}

export function random(min = 0, max = 9) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateId(){ return  `${Date.now()}t${Math.random().toString().slice(2)}r`}

export function validateDate(date, maxYearsAhead) {
  const now = Date.now()
  const year = 1000 * 60 * 60 * 24 * 365

  const years = maxYearsAhead * year

  if (date < now)
    return false

  if (date > now + years)
    return false

  return true
}

export function buildRestFromMap( app, map, logLine=null ) {
  map.forEach((methods, path) => {
    path = path.match( /\/?(?:api)?\/?(.+)/ )[ 1 ]

    if (typeof methods === `function`) {
      logLine( `[fgYellow]/api/${path}[] :: GET`)

      return app.get(`/api/${path}`, methods )
    }

    const includedMethods = Object.keys(methods)
      .filter(method => [`post`,`get`,`put`,`delete`].includes( method ))
      .filter(method => typeof methods[method] === `function`)
      .map(method => {
        app[method](`/api/${path}`, methods[method] )

        return method.toUpperCase()
      })

    logLine?.( `[fgYellow]/api/${path}[] :: ${includedMethods.join( ` ` )}`)
  })
}

export function buildRestFromNestedObj( app, obj, rootPath=``, logLine=null ) {
  const buildRest = (obj, rootPath=`` ) => {
    const isKeyPredictedMethod = str => [`post`,`get`,`put`,`delete`].includes( str )
    const entries = Object.entries( obj )
    const methods = entries.filter( ([ key, value ]) => isKeyPredictedMethod( key ) && typeof value === `function` )
    const paths = entries.filter( ([ key, value ]) => !isKeyPredictedMethod( key ) && typeof value === `object` )

    methods.forEach( ([ method, caller ]) => app[ method ](`/api${rootPath}`, caller ) )

    if (methods.length) {
      logLine?.( `[fgYellow]/api${rootPath}[] :: ${methods.map( ([ method ]) => method ).join( ` ` )}`)
    }

    paths.forEach( ([ path, config ]) => buildRest( config, `${rootPath}/${path}` ))
  }

  buildRest( obj, rootPath )
}