function validator( word, { minLen, maxLen, bannedChars, bannedWords, requireSpacialChar, specialChars }) {
  const mnlen = minLen ? word.length >= minLen : true
  const mxlen = maxLen ? word.length <= maxLen : true
  const notBannedChars = bannedChars ? !word.split('').some((char) => bannedChars.includes(char)) : true

  let specChars = true
  if (requireSpacialChar) {
    specChars = specialChars ? specialChars.split('').some(char => word.includes(char)) : false
  }

  let noWords = true
  if (bannedWords) {
    const wordsArrayCorrect = Array.isArray(bannedWords) && bannedWords.every(word => typeof word == 'string')
    noWords = wordsArrayCorrect ? bannedWords.every((banned) => banned != word) : false
  }

  return mnlen && mxlen && notBannedChars && specChars && noWords
}


