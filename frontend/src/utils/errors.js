import React from "react"
import { navigate } from "gatsby"
import { isBrowser } from "./functions.js"

export const DEFAULT_ERROR = <p>Coś poszło nie tak</p>

const ERRORS = {
  100: <p>Niepoprawne dane logowanie!. Nie znaleziono użytkownika o podanym loginie lub haśle.</p>,
  102: <p>Hasła nie są identyczne!</p>,
  106: <p>Hasło nie spełnia standardów bezpieczeństwa!</p>,
  107: <p>Nieprawidłowy token</p>,
  108: <p>Nie podałeś adresu email!</p>,
  110: <p>Sesja wygasła!</p>,
  113: <p>Uznaliśmy, że wprowadzony email jest niepoprawny. Zmień go!</p>,
  117: <p>To konto nie zostało jeszcze aktywowane!</p>,
  // 118: <p>Imię i nazwisko nie mogą być takie same!</p>,
  118: <p>Imię i hasło nie mogą być takie same!</p>,
  119: <p>Hasło takie jak imię!</p>,
  121: <p>Twoje imię/nazwisko nie spełnia naszych standardów!</p>,
  122: <p>Musisz podać wszystkie dane przed zakończeniem rejestracji!</p>,
  124: <p>Konto z podanym mailem występuje już w systemie! Nie możesz zarejestrować ponownie tego samego adresu email.</p>,
  126: <p>Imię wraz z nazwiskiem nie moga zawierać spacji, liczb, i znaków specjalnych!</p>,
  128: <p>Nie przekazałeś danych do zaktualizowania!</p>,
  129: <p>Aktualne hasło jest niepoprawne!</p>,
  130: <p>Ten login jest już w użyciu!</p>,


  203: <p>Musisz podać nazwę platformy!</p>,
  204: <p>Nie można skasować właściciela platformy!</p>,
  209: <p>Nie masz permisji do dodawania użytkowników do tej platformy!</p>,
  210: <p>Wyczerpałęś już limit swoich platform, nie mozesz utworzyć kolejnej!</p>,
  215: <p>Podany email nie wygląda jak email!</p>,
  219: <p>Platforma o tej nazwie już istnieje! Musisz wybrać inną nazwę.</p>,
  222: <p>Rola o podanej nazwie już istnieje. Wprowadź inną nazwę!</p>,
  223: <p>Podałeś niepoprawne hasło!</p>,
  227: <p>Nie podałeś nazwy platformy do utworzenia!</p>,
  239: <p>Nie znaleziono w systemie użytkownika o takim adresie email! Wprowadź porpawnie pozostałe dane aby utworzyć dla niego konto.</p>,
  255: <p>
    Użytkownik o podanym mailu istnieje w systemie pod innym imieniem i nazwiskiem.
    Skontaktuj się z osobą, którą próbujesz dodać aby porównać wprowadzane dane.
  </p>,
  256: <p>Imię wraz z nazwiskiem nie moga zawierać spacji, liczb, i znaków specjalnych!</p>,
  276: <p>Przekroczyłeś dopuszczalną długość nazwy platformy (255 znaków)!</p>,


  300: <p>Tylko administrator moze dodawać grupy!</p>,
  311: <p>Nie można zidentyfikować Twojej roli! W żądaniu brakuje identyfikatora grupy.</p>,
  313: <p>Nie mozesz nadawać sam sobie ocen!</p>,
  322: <p>Nie mozesz utworzyć grupy nieposiadającej nazwy!</p>,
  323: <p>Nie mozesz dodać oceny, ponieważ wartość nie została podana!</p>,
  324: <p>Wartość oceny musi być wartością całkowitą.</p>,
  326: <p>Nie można utworzyć grupy, nie podałeś wymaganych informacji.</p>,
  338: <p>Oceny powinny być wartościami całkowitymi!</p>,
  347: <p>Musisz podać nazwę zadania.</p>,
  348: <p>Skala nie została zmieniona, ponieważ nie podałeś nowych wartości.</p>,
  350: <p>Nie można utworzyć roli bez podania jej nazwy.</p>,
  355: <p>Grupa o podanej nazwie już istnieje! Podaj inną nazwę.</p>,
  356: <p>Podana nazwa grupy jest zbyt długa.</p>,
  362: <p>Wprowadzona ocena nie znajduje się w dostępnej skali ocen.</p>,
  364: <p>Oceny w skali powinny być wartościami unikalnymi.</p>,


  401: <p>Podana data jest niewłaściwa.</p>,
  409: <p>Nie podałeś wszystkich wymaganych danych aby utworzyć spotkanie.</p>,
  410: <p>Nieprawidłowy adres linku. Adres powinien zaczynać się od http(s) (podaj pełny adres doelowej strony).</p>,
  456: <p>Przekroczyłeś maksymalną długość opisu spotkania, która wynosi 255 znaków.</p>,
}

export default new Proxy(ERRORS, {
  get( ERRORS, code ) {
    if (Number( code ) === 110) return isBrowser() && navigate( `/logout` )
    if (code in ERRORS) return ERRORS[ code ]

    console.info( `NIEOBSŁUGIWANY KOD BŁĘDU: ${code}` )

    // return <p>Wystąpił nieoczekiwany problem</p>
  },
})
