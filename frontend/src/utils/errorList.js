import React from "react"

const DEFAULT_ERROR = <>Coś poszło nie tak</>
const ERRORS = {
  100: (
    <>
      Niepoprawne dane logowanie!.
      Nie znaleziono użytkownika o podanym loginie lub haśle
    </>
  ),
  102: <>Hasła nie są identyczne!</>,
  106: <>Hasło nie spełnia standardów bezpieczeństwa!</>,
  113: <>Uznaliśmy, że wprowadzony email jest niepoprawny. Zmień go!</>,
  117: <>To konto nie zostało jeszcze aktywowane!</>,
  118: <>Imię i nazwisko nie mogą być takie same!</>,
  121: <>Twoje imię nie spełnia naszych standardów!</>,
}

export default new Proxy(ERRORS, {
  get(ERRORS, code) {
    if (code in ERRORS) return ERRORS[code]

    console.info(`NIEOBSŁUGIWANY KOD BŁĘDU: ${code}`)

    return DEFAULT_ERROR
  },
})
