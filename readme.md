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
  ` readme.md
```



## Opis API


### WebSocket

Do poniższych endpointów APi
należy utworzyć także zdarzenia WS o nazwach pasujacych do szablonu
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


### Prosty REST


Prosta wersja REST API zakłada obsługę poniższych metod HTTP:
  * **GET** odpowiada za pobranie danych
    Każde pobranie danych jest semantyczne określone w zwróconym przez serwer obiekcie.
    Przykłądowo, dla endpointu `/api/platforms`:
    ```json
    // Poprawna odpowiedź -- obiekt z nazwaną tablicą
    { "platforms": [ ... ] }
    
    // Błędna odpowiedź -- nienazwana tablica
    [ ... ]
    ```
  * **DELETE** odpowiada za skasowanie danych
  * **POST** odpowiada za stworzenie danych
  * **PUT** odpowiada za edycję danych


### Parametry

Niektóre elementy (w tym parametry) mogą być opcjonalne, czyli nie musza występować.

**Przykład**:
```json
{
  "nazwa_pola_obowiązkowego": "typ",
  "nazwa_pola_oopcjonalnego?": "typ"
}
```
**Przykład**:  
Aby dowiedzieć się wiecej o poniższym przykładzie zejdź do [sekcji z szablonem](#Szablon-endpointu)
```json
GET // brak nazwy uprawnień
{ // body -- zamiast "response" oraz brak "header"

}
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


### Szablon endpointu


&lt;nazwa endpointu&gt; `<ścieżka>`
```json
<metoda> [uprawnienie]
{ "pole": "typ danych" } // header?
{ "pole": "typ danych" } // body | response
```

Uprawnienie może odnosić się do tego konkretnego modułu (przedrostek "this."),
lub do zależnego modułu (przedrostek będący nazwą modułu, przykłądowo "platform.").


## Routing API



<details>
  <summary>Zapytania generalne "/api/*"</summary>

  <!-- ### Zapytania generalne "/api/*" -->


  Logowanie `/api/login`
  ```json
  POST
  { //body 
    "login": "string",
    "password": "string"
  } 
  ```

  Rejestracja `/api/register`
  ```json
  POST
  { //body 
    "name": "string",
    "surname": "string",
    "email": "string",
    "password1": "string",
    "password2": "string",
  }
  ```

  Przypomnij hasło `/api/password/remind`
  ```json
  POST
  { //body 
    "email": "string"
  }
  ```

  Resetowanie hasła `/api/password/reset`
  ```json
  POST
  { //body 
    "password1": "string",
    "password2": "string",
    "code": "string",
  } 
  ```
</details>

<details>
  <summary>Zapytania modułu użytkownika "/api/users/*"</summary>

  <!-- ### Zapytania modułu użytkownika "/api/users/*" -->


  Dane zalogowanego użytkownika `/api/users/me`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "user": {
      "login": "string",
      "name": "string",
      "surname": "string",
      "email": "string",
      "activated": "boolean",
      "avatar": "string",
      "createdDatetime": "number"
    }
  }
  ```

  Aktualizacja danych zalogowanego użytkownika `/api/users/me`
  ```json
  PUT
  { "authenthication": "string" } // header
  { // body
    "login?": "string",
    "name?": "string",
    "surname?": "string",
    "email?": "string",
    "avatar?": "string",
    "password?": "string",
    "newPassword1?": "string",
    "newPassword2?": "string",
  }
  ```

  Pobranie przypiętych elementów `/api/users/me/pinned`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "pinned": [
      {
        "type": "string",
        "name": "string",
        "id": "string",
      }
    ]
  }
  ```

  Skasowanie przypiętego elementu `/api/users/me/pinned/:elementId`
  ```json
  DELETE
  { "authenthication": "string" } // header
  ```

  Dodawanie przypiętego elementu `/api/users/me/pinned`
  ```json
  POST
  { "authenthication": "string" } // header
  { // body
    "id": "string",
    "type": "string",
  }
  ```
</details>

<details>
  <summary>Zapytania modułu platformy "/api/platforms/*"</summary>

  <!-- ### Zapytania modułu platformy "/api/platforms/*" -->

  **Zależny obowiązkowo od**: user
  **Zależny nieobowiązkowo od**: group

  Uprawnienia i ich domyślne wartości w obrębie platformy
  ```js
  isOwner = false
  isPersonel = false

  canEditDetails = false
  canManageUsers = false
  canManageRoles = false
  canManageGroups = false
  canManageCalendar = false
  canManageMeets = false
  ```

  ---

  Lista wszystkich platform usera `/api/platforms`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "platforms": [
      {
        "id": "string",
        "owner": "Object<User>",
        "created": "number",
        "administrator": "object<User>",
        "name": "string",
      }
    ]
  }
  ```

  Tworzenie platformy `/api/platforms`
  ```json
  POST
  { "authenthication": "string" } // header
  { // body
    "name": "string",
  }
  ```

  Kasowanie platformy `/api/platforms/:platformId`
  ```json
  DELETE this.isOwner
  { "authenthication": "string" } // header
  ```

  Lista userów platformy `/api/platforms/:platformId/users`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "users": [
      {
        "id": "string",
        "login": "string",
        "name": "string",
        "surname": "string",
        "email": "string",
        "activated": "boolean",
        "avatar": "string",
        "createdDatetime": "number",
      }
    ]
  }
  ```

  Dodawanie użytkownika do platformy `/api/platforms/:platformId/users`
  ```json
  POST this.canManageUsers
  { "authenthication": "string" } // header
  { // body
    "name": "string",
    "surname": "string",
    "email": "string",
    "roleName?": "string",
  }
  ```

  Kasowanie userów z platformy `/api/platforms/:platformId/users/:userId`
  ```json
  DELETE this.canManageUsers
  { "authenthication": "string" } // header
  ```
</details>

<details>
  <summary>Zapytania modułu grupy "/api/groups/*"</summary>

  <!-- ### Zapytania modułu grupy "/api/groups/*" -->

  **Zależny obowiązkowo od**: user, platform

  Uprawnienia i ich domyślne wartości w obrębie grupy
  ```js
  isOwner = false

  canManageUsers = false
  canManageNotes = false
  canManageMeets = false
  ```

  ---

  Lista grup użytkownika `/api/groups`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "groups": [
      {
        "id": "string",
        "name": "string",
        "createdDatetime": "number",
        "lecturer": "User",
      }
    ]
  }
  ```

  Tworzenie grupy `/api/groups`
  ```json
  POST platform.canManageGroups
  { "authenthication": "string" } // header
  { // body
    "name": "string",
    "lecturerId": "string",
    "platformId": "string",
  }
  ```

  Lista grup użytkownika z danej platformy `/api/groups/platform/:platformId`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "groups": [
      "<Groups>",
    ]
  }
  ```

  Dodawanie usera do grupy `/api/groups/users`
  ```json
  POST this.canManageUsers
  { "authenthication": "string" } // header
  { // body
    "groupId": "string",
    "usersIds": [
      "<string>",
    ]
  }
  ```

  Pobieranie listy użytkowników z grupy `/api/groups/:groupId/users`
  ```json
  GET
  { "authenthication": "string" } // header
  { // body
    "users": [
      "<User>",
    ]
  }
  ```

  Usuwanie usera z grupy `/api/groups/:groupId/users/:userId`
  ```json
  DELETE this.canManageUsers
  { "authenthication": "string" } // header
  ```

  Kasowanie grupy `/api/groups/:groupId`
  ```json
  DELETE this.isOwner
  { "authenthication": "string" } // header
  ```

  Pobranie wszystkich ocen użytkownika `/api/groups/notes`
  ```json 
  GET this.canManageNotes?
  { "authenthication": "string" } // header
  { // response
    "data": [
      {
        "platform": "Platform",
        "groups": [
          {
            "group": "Group",
            "notes": [
              {
                "id": "string",
                "value": "string",
                "description": "string",
                "date": "number",
                "lecturer": "User",
              }
            ]
          }
        ]
      }
    ]
  }
  ```

  Pobranie wszystkich ocen użytkownika z danej grupy `/api/groups/:groupId/notes`
  ```json
  GET this.canManageNotes?
  { "authenthication": "string" } // header
  { // response
    "notes": [
      "<Notes>",
    ]
  }
  ```

  Stworzenie oceny `/api/groups/:groupId/notes/`
  ```json
  POST this.canManageNotes
  { "authenthication": "string" } // header
  { // body
    "value": "string",
    "description": "string",
    "userId": "string",
  }
  ```

  Skasowanie oceny `/api/groups/notes/:noteId`
  ```json
  DELETE this.canManageNotes
  { "authenthication": "string" } // header
  ```

  Edycja oceny `/api/groups/notes/:noteId`
  ```json
  PUT this.canManageNotes
  { "authenthication": "string" } // header
  { // body
    "value": "string",
    "description": "string",
  }
  ```
</details>

<details>
  <summary>Zapytania modułu kalendarza "/api/meets/*"</summary>

  <!-- ### Zapytania modułu kalendarza "/api/meets/*" -->

  **Zależny obowiązkowo od**: user, platform
  
  Uprawnienia i ich domyślne wartości w obrębie grupy
  ```js
  isOwner = false

  canManageUsers = false
  ```

  ---

  Tworzenie spotkania `/api/meets`
  ```json
  POST (platform.canManageMeets | group.canManageMeets)
  { "authenthication": "string" } // header
  { // body
    "dateStart": "number",
    "dateEnd": "number",
    "description": "string",
    "externalUrl": "string",
    "platformId": "string",
    "groupId?": "string"
  }
  ```

  Odczytywanie wszystkich spotkań `/api/meets`
  ```json
  GET
  { "authenthication": "string" } // header
  { // body
    "meets": [
      "<Meet>"
    ]
  }
  ```

  Odczytywanie wszystkich spotkań z danej grupy `/api/meets/group/:groupId`
  ```json
  GET
  { "authenthication": "string" } // header
  { // body
    "meets": [
      "<Meet>"
    ]
  }
  ```

  Odczytywanie wszystkich publicznych spotkań `/api/meets/public`
  ```json
  GET
  { "authenthication": "string" } // header
  { // body
    "meets": [
      "<Meet>"
    ]
  }
  ```

  Odczytywanie wszystkich spotkań nieprzypisanych do grupy `/api/meets/groupless`
  ```json
  GET
  { "authenthication": "string" } // header
  { // body
    "meets": [
      "<Meet>"
    ]
  }
  ```

  Odczytywanie spotkania `/api/meets/:meetId`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "meet": {
      "id": "string",
      "dateStart": "number",
      "dateEnd": "number",
      "description": "string",
      "link": "string",
    }
  }
  ```

  Kasowanie spotkania `/api/meets/:meetId`
  ```json
  DELETE this.isOwner
  { "authenthication": "string" } // header
  ```

  Odczytywanie uczestników spotkania `/api/meets/:meetId/users`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "participants": [
      "<User>"
    ]
  }
  ```

  Dodawanie uczestników do spotkania `/api/meets/:meetId/users`
  ```json
  POST this.canManageUsers
  { "authenthication": "string" } // header
  { // body
    "participantsIds": [
      "<string>"
    ]
  }
  ```

  Usuwanie uczestnika ze spotkania `/api/meets/:meetId/users/:userId`
  ```json
  DELETE this.canManageUsers
  { "authenthication": "string" } // header
  ```
</details>

<details>
  <summary>Zapytania modułu kalendarza "/api/calendar/*"</summary>

  <!-- ### Zapytania modułu kalendarza "/api/calendar/*" -->

  **Zależny obowiązkowo od**: user

  ---

  Kalendarz `/api/calendar`
  ```json
  GET
  { "authenthication": "string" } // header
  { // response
    "events": [
      {
        "type": "string",
        "date": "string",
        "elementId": "string",
      }
    ]
  }
  ```
</details>
