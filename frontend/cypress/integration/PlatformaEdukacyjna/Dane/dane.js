 
 
function randomNumber (){
     return Math.floor(Math.random() * 1000); 
 }

function generateMail() {
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const number = randomNumber()
    const mail = randomString+number+"@ggg.pl"
    return mail
 }

 const dane = {
    address: `http://91.231.24.247:25565`,
    logowanie: {
        t2_1:{
            testName: "Logowanie - poprawne dane",
            login: "Adam",
            password: "123",
        },
        t2_2:{
            testName: "Logowanie - niepoprawny login",
            login: "NiepoprawnyLogin",
            password: "Trudnehaslo1!",
            error: "Niepoprawne dane logowanie!. Nie znaleziono użytkownika o podanym loginie lub haśle."
        },
        t2_3:{
            testName: "Logowanie - niepoprawne hasło",
            login: "Adam",
            password: "NiepoprawneHaslo!",
            error: "Niepoprawne dane logowanie!. Nie znaleziono użytkownika o podanym loginie lub haśle."
        },
        t2_4:{
            testName: "Logowanie - brak loginu",
            login: "",
            password: "Trudnehaslo1!",
            error: "Niepoprawne dane logowanie!. Nie znaleziono użytkownika o podanym loginie lub haśle."
        },
        t2_5:{
            testName: "Logowanie - brak hasła",
            login: "Adam",
            password: "",
            error: "Niepoprawne dane logowanie!. Nie znaleziono użytkownika o podanym loginie lub haśle."
        }
    },
    rejestracja:{
        t1_1:{
            testName: "Rejestracja - poprawne dane",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
        },
        t1_2:{
            testName: "Rejestracja - za krótkie imię",
            imie: "J",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Twoje imię/nazwisko nie spełnia naszych standardów!"
        },
        t1_3:{
            testName: "Rejestracja - za długie imię",
            imie: "Janjanjanjanjanj",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Twoje imię/nazwisko nie spełnia naszych standardów!"
        },
        t1_4:{
            testName: "Rejestracja - za krótkie nazwisko",
            imie: "Jan",
            nazwisko: "K",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Twoje imię/nazwisko nie spełnia naszych standardów!"
        },
        t1_5:{
            testName: "Rejestracja - za długie nazwisko",
            imie: "Jan",
            nazwisko: "KowalskiKowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Twoje imię/nazwisko nie spełnia naszych standardów!"
        },
        t1_6:{
            testName: "Rejestracja - za krótkie hasło",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Taslo1!",
            haslo2: "Taslo1!",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_7:{
            testName: "Rejestracja - za długie hasło",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1",
            haslo2: "Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1!Trudnehaslo1",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_8:{
            testName: "Rejestracja - hasło bez liczb",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo!",
            haslo2: "Trudnehaslo!",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_9:{
            testName: "Rejestracja - hasło bez dużych znaków",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "trudnehaslo1!",
            haslo2: "trudnehaslo1!",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_10:{
            testName: "Rejestracja - hasło bez małych znaków",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "TRUDNEHASLO1!",
            haslo2: "TRUDNEHASLO1!",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_11:{
            testName: "Rejestracja - hasło bez znaku specjalnego",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1",
            haslo2: "Trudnehaslo1",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_12:{
            testName: "Rejestracja - hasło bez liter",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "12345678!",
            haslo2: "12345678!",
            error: "Hasło nie spełnia standardów bezpieczeństwa!"
        },
        t1_13:{
            testName: "Rejestracja - hasła się różnią",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1",
            error: "Hasła nie są identyczne!"
        },
        t1_14:{
            testName: "Rejestracja - hasło takie jak imię",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Jan",
            haslo2: "Jan",
            error: "Hasło takie jak imię!"
        },
        t1_15:{

        },
        t1_16:{
            testName: "Rejestracja - brak pola imię",
            imie: "",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Musisz podać wszystkie dane przed zakończeniem rejestracji!"
        },
        t1_17:{
            testName: "Rejestracja - brak pola nazwisko",
            imie: "Jan",
            nazwisko: "",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Musisz podać wszystkie dane przed zakończeniem rejestracji!"
        },
        t1_18:{
            testName: "Rejestracja - brak pola e-mail",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: "",
            haslo1: "Trudnehaslo1!",
            haslo2: "Trudnehaslo1!",
            error: "Musisz podać wszystkie dane przed zakończeniem rejestracji!"
        },
        t1_19:{
            testName: "Rejestracja - brak pola hasło",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "",
            haslo2: "Trudnehaslo1!",
            error: "Musisz podać wszystkie dane przed zakończeniem rejestracji!"
        },
        t1_20:{
            testName: "Rejestracja - brak pola hasło2",
            imie: "Jan",
            nazwisko: "Kowalski",
            email: generateMail(),
            haslo1: "Trudnehaslo1!",
            haslo2: "",
            error: "Musisz podać wszystkie dane przed zakończeniem rejestracji!"
        },
    },
    wylogowanie:{
        t3_1:{
            testName: "Wylogowanie"
        }
    },
    platforma_tworzenie:{
        t4_1:{
            testName: "Platforma - tworzenie - poprawne dane",
            nazwa: "Nowa organizacja",
            error: ""
        },
        t4_2:{
            testName: "Platforma - tworzenie - przekroczony limit platform",
            nazwa: "",
            error: ""
        },
        t4_3:{
            testName: "Platforma - tworzenie - za długa nazwa",
            nazwa: "Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacja Nowa organizacjaaa",
            error: "Przekroczyłeś dopuszczalną długość nazwy platformy (255 znaków)!"
        },
        t4_4:{
            testName: "Platforma - tworzenie - brak nazwy",
            nazwa: "",
            error: "Musisz podać nazwę platformy!"
        },
        t4_5:{
            testName: "Platforma - tworzenie - powtarzająca się nazwa",
            nazwa: "Nowa organizacja",
            error: "Platforma o tej nazwie już istnieje! Musisz wybrać inną nazwę."
        },
    },
    platforma_dodawanie_uzytkownika:{
        t4_6:{
            testName: "Platforma - Dodawanie użytkownika - Poprawne dane",
            imie: "Janusz",
            nazwisko: "Nowak",
            email: generateMail(),
            error: "Operacja wykonana pomyślnie",
        },
        t4_7:{
            testName: "Platforma - Dodawanie użytkownika - Brak pola imię",
            imie: "",
            nazwisko: "Nowak",
            email: generateMail(),
            error: "Nie znaleziono w systemie użytkownika o takim adresie email! Wprowadź porpawnie pozostałe dane aby utworzyć dla niego konto.",
        },
        t4_8:{
            testName: "Platforma - Dodawanie użytkownika - Brak pola nazwisko",
            imie: "Janusz",
            nazwisko: "",
            email: generateMail(),
            error: "Nie znaleziono w systemie użytkownika o takim adresie email! Wprowadź porpawnie pozostałe dane aby utworzyć dla niego konto.",
        },
        t4_9:{
            testName: "Platforma - Dodawanie użytkownika - Brak pola e-mail",
            imie: "Janusz",
            nazwisko: "Nowak",
            email: "",
            error: "Podany email nie wygląda jak email!",
        },
        
    },
    grupa_tworzenie:{
        t5_1:{
            testName: "Grupa - Tworzenie - Poprawne dane",
            nazwaGrupy: "185IC",
            prowadzacy: "Jan Kowalski",
            error:"",
        },
        t5_2:{
            testName: "",
            nazwaGrupy: "",
            prowadzacy: "",
            error:"",
        },
        t5_3:{
            testName: "Grupa - Tworzenie - Za długa nazwa",
            nazwaGrupy: "123451234512345123451234512345123",
            prowadzacy: "Jan Kowalski",
            error:"",
        },
        t5_4:{
            testName: "Grupa - Tworzenie - Brak pola nazwa grupy",
            nazwaGrupy: "",
            prowadzacy: "Jan Kowalski",
            error:"",
        },
        t5_5:{
            testName: "Grupa - Tworzenie - Brak pola prowadzący",
            nazwaGrupy: "185IC",
            prowadzacy: "",
            error:"",
        },
        t5_6:{
            testName: "Grupa - Tworzenie - Pomyślne usunięcie",
            nazwaGrupy: "185IC",
            prowadzacy: "",
            error:"",
        },
        t5_7:{
            testName: "Grupa - Użytkownik - Pomyślne dodanie użytkownika",
            nazwaGrupy: "185IC",
            prowadzacy: "",
            error:"",
        },
        t5_8:{
            testName: "Grupa - Użytkownik - Pomyślne usunięcie użytkownika",
            nazwaGrupy: "185IC",
            prowadzacy: "",
            error:"",
        },
        
    }
    
}

export default dane;