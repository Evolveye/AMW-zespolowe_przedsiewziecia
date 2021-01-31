import React from "react"
import { logout } from "./auth"

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
  110: <>Sesja wygasła!</>,
  113: <>Uznaliśmy, że wprowadzony email jest niepoprawny. Zmień go!</>,
  117: <>To konto nie zostało jeszcze aktywowane!</>,
  118: <>Imię i nazwisko nie mogą być takie same!</>,
  121: <>Twoje imię nie spełnia naszych standardów!</>,

  209: <>Nie masz permisji do dodawania użytkowników do tej platformy!</>,
  222: <>Nie podałeś wszystkich niezbędnych danych!</>,

  300: <>Tylko administrator moze dodawać grupy!</>,
  311: <>Nie można zidentyfikować Twojej roli! W żądaniu brakuje identyfikatora grupy</>,
}

export default new Proxy(ERRORS, {
  get(ERRORS, code) {
    if (code === 110) return logout()
    if (code in ERRORS) return ERRORS[code]

    console.info(`NIEOBSŁUGIWANY KOD BŁĘDU: ${code}`)

    return DEFAULT_ERROR
  },
})
