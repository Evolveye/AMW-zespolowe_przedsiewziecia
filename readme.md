# Platforma edukacyjna



```
root/
 |- frontend/
 |   ` readme.md
 |
 |- backend/
 |   ` readme.md
 |
 |- .gitignore
 |- modules_info.jsonc
  ` readme.md
```


## Opis API


Opis API (endpointów) udostępnianego przez moduły [./modules_info.jsonc](./modules_info.jsonc)


### Prosty REST


Prosta wersja REST API zakłada obsługę poniższych metod HTTP:
  * **GET** odpowiada za pobranie danych
    Każde pobranie danych jest semantyczne określone w zwróconym przez serwer obiekcie.
    Przykłądowo, dla endpointu `/api/platforms`:
    ```jsonc
    // Poprawna odpowiedź -- obiekt z nazwaną tablicą
    { "platforms": [ ... ] }
    
    // Błędna odpowiedź -- nienazwana tablica
    [ ... ]
    ```
  * **DELETE** odpowiada za skasowanie danych
  * **POST** odpowiada za stworzenie danych
  * **PUT** odpowiada za edycję danych


### WebSocket


Do endpointów APi należy utworzyć zdarzenia WS o nazwach pasujacych do szablonu
`api.<metoda>.<...reszta adresu HTTP bez parametrów z zamienionymi "/" na ".">`.  
Przykład
  - HTTP: GET :: `/api/groups/:groupId/notes`
  - WS: `api.get.groups.notes`

Wszelkie parametry idące z adresem HTTP
powinny być umieszcozne w danych przesyłanych na serwer

**Przykład**:
```js
socket.emit( `api.get.groups.notes`, {
  $args: {
    groupId: `string`,
  },
} )
socket.emit( `api.post.groups`, {
  name: "string"
  lecturer: "string"
} )
```


### Zależności między modułami


Każdy moduł moze mieć zdefiniowany własny zestaw zależności wymaganych i dodatkowych.
Moduły mogą komunikować się ze sobą jedynie poprzez tego typu zależności.

**Przykład**:
Moduł `platform` zależy obowiązkowo od moduły `user` --
bez modułu `user` moduł `platform` nigdy by się nie stworzył i
jego instancja nigdy by nie została utworzona na serwerze.

**Przykład**:
Moduł `platform` potrafi korzystać z modułu `group`
(moduł `group` jest modułem dodatkowym, rozszerzajacym możliwości `platform`).
Moduł `platform` moze odnosić się do kolekcji bazy danych oraz pól instancji modułu `group`.
