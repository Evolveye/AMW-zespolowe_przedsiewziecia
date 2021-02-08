import { navigate } from "gatsby"
import React from "react"
import { logout } from "./auth"

export const DEFAULT_ERROR = <>Coś poszło nie tak</>

const ERRORS = {
  100: <>Niepoprawne dane logowanie!. Nie znaleziono użytkownika o podanym loginie lub haśle.</>,
  102: <>Hasła nie są identyczne!</>,
  106: <>Hasło nie spełnia standardów bezpieczeństwa!</>,
  110: <>Sesja wygasła!</>,
  113: <>Uznaliśmy, że wprowadzony email jest niepoprawny. Zmień go!</>,
  117: <>To konto nie zostało jeszcze aktywowane!</>,
  // 118: <>Imię i nazwisko nie mogą być takie same!</>,
  118: <>Imię i hasło nie mogą być takie same!</>,
  121: <>Twoje imię/nazwisko nie spełnia naszych standardów!</>,
  122: <>Musisz podać wszystkie dane przed zakończeniem rejestracji!</>,
  124: <>Konto z podanym mailem występuje już w systemie! Nie możesz zarejestrować ponownie tego samego adresu email.</>,
  126: <>Imię wraz z nazwiskiem nie moga zawierać spacji, liczb, i znaków specjalnych!</>,


  203: <>Musisz podać nazwę platformy!</>,
  204: <>Nie można skasować właściciela platformy!</>,
  209: <>Nie masz permisji do dodawania użytkowników do tej platformy!</>,
  210: <>Wyczerpałęś już limit swoich platform, nie mozesz utworzyć kolejnej!</>,
  215: <>Podany email nie wygląda jak email!</>,
  219: <>Platforma o tej nazwie już istnieje! Musisz wybrać inną nazwę.</>,
  // 222: <>Nie podałeś wszystkich niezbędnych danych!</>,
  255: <>
    Użytkownik o podanym mailu istnieje w systemie pod innym imieniem i nazwiskiem.
    Skontaktuj się z osobą, którą próbujesz dodać aby porównać wprowadzane dane
  </>,
  256: <>Imię wraz z nazwiskiem nie moga zawierać spacji, liczb, i znaków specjalnych!</>,
  276: <>Przekroczyłeś dopuszczalną długość nazwy platformy (255 znaków)!</>,


  300: <>Tylko administrator moze dodawać grupy!</>,
  311: <>Nie można zidentyfikować Twojej roli! W żądaniu brakuje identyfikatora grupy.</>,
  313: <>Nie mozesz nadawać sam sobie ocen!</>,
  324: <>Wartość oceny musi być wartością całkowitą.</>,
  326: <>Nie można utworzyć grupy, nie podałeś wymaganych informacji.</>,
  355: <>Grupa o podanej nazwie już istnieje! Podaj inną nazwę.</>,
  356: <>Podana nazwa grupy jest zbyt długa.</>,


  401: <>Podana data jest niewłaściwa.</>,
  409: <>Nie podałeś wszystkich wymaganych danych aby utworzyć spotkanie.</>,
  410: <>Nieprawidłowy adres linku. Adres powinien zaczynać się od http(s) (podaj pełny adres doelowej strony).</>,
  456: <>Przekroczyłeś maksymalną długość opisu spotkania, która wynosi 255 znaków.</>,
}

export default new Proxy(ERRORS, {
  get(ERRORS, code) {
    if (Number(code) === 110) return logout() || null
    if (Number(code) === 208) {
      navigate( `/user/me` )
      return null
    }
    if (code in ERRORS) return ERRORS[code]

    console.info(`NIEOBSŁUGIWANY KOD BŁĘDU: ${code}`)
  },
})
