const isDigit = (n) => Boolean([true, true, true, true, true, true, true, true, true, true][n])
const isEveryDigit = (n) => n.split('').every(char => isDigit(char))
const isEveryUpper = (n) => n.split('').every(char => char === char.toUpperCase())
const isEveryLowwer = (n) => n.split('').every(char => char === char.toLowerCase())
const notContainDigit = (n) => word.split('').every(char => !isDigit(char))


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
function test(word, { minLen, maxLen, bannedChars, bannedWords, requireSpacialChar, specialChars }) {
  const mnlen = minLen ? word.length >= minLen : true
  const mxlen = maxLen ? word.length <= maxLen : true
  const notBannedChars = bannedChars ? !word.split('').some((char) => bannedChars.includes(char)) : true
  const specChars = requireSpacialChar ?
    specialChars ? specialChars.split('').some(char => word.includes(char)) : false
    : true
  let noWords = true;
  if (bannedWords) {
    const wordsArrayCorrect = Array.isArray(bannedWords) && bannedWords.every(word => typeof word == 'string')
    noWords = wordsArrayCorrect ? bannedWords.every((banned) => banned != word)
        : false

        noWords= false
  }
  return mnlen && mxlen && notBannedChars && specChars && noWords
}


let nameRES = {
    minLen: 2,
    maxLen: 5,
    bannedChars: `1abc`,
    bannedWords:false
}

const word1 = "223"
console.log(test(word1, nameRES))



