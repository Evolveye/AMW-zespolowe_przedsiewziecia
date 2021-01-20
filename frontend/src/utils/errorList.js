import React from "react"

const DEFAULT_ERROR = <span>Coś poszło nie tak</span>
const ERRORS = {
  100: (
    <span>
      <strong style={{ color: `red` }}>Niepoprawne dane logowanie</strong>. Nie
      znaleziono użytkownika o podanym loginie lub haśle
    </span>
  ),
}

export default new Proxy(ERRORS, {
  get(ERRORS, code) {
    if (code in ERRORS) return ERRORS[code]

    console.info(`NIEOBSŁUGIWANY KOD BŁĘDU: ${code}`)

    return DEFAULT_ERROR
  },
})
