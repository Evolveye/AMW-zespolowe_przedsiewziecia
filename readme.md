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



## Wstępny Routing API



Do poniższych endpointów APi
należy utworzyć także zdarzenia WS o nazwach pasujacych do szablonu
`api.<metoda>.<...reszta adresu HTTP bez parametrów z zamienionymi "/" na ".">`.  
Przykład
  - HTTP: GET :: `/api/groups/:groupId/notes`
  - WS: `api.get.groups.notes`

Wszelkie parametry idące z adresem HTTP
powinny być umieszcozne w danych przesyłanych na serwer

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

Dodatkowo niektóre pola moga być polami opcjonalnymi.
Nazwy takowych pól zakończone są znakiem zapytania

```json
{
  "nazwa_pola_obowiązkowego": "typ",
  "nazwa_pola_oopcjonalnego?": "typ"
}
```

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


---

### Zapytania generalne "/api/*"


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


### Zapytania modułu użytkownika "/api/users/*"


Dane zalogowanego użytkownika `/api/users/me`
```json
GET
{ "authenthication": "string" } // header
{ // response
  "login": "string",
  "name": "string",
  "surname": "string",
  "email": "string",
  "activated": "boolean",
  "avatar": "string",
  "createdDatetime": "number",
}
```

Aktualizacja danych zalogowanego użytkownika `/api/users/me`
```json
PUT
{ "authenthication": "string" } // header
{ // response
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


### Zapytania modułu platformy "/api/platforms/*"


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

Kasowanie platformy `/api/platforms/id:number`
```json
DELETE
{ "authenthication": "string" } // header
```

Lista userów platformy `/api/platforms/id:number/users`
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

Dodawanie użytkownika do platformy `/api/platforms/id:number/users`
```json
POST
{ "authenthication": "string" } // header
{ // body
  "name": "string",
  "surname": "string",
  "email": "string",
}
```

Kasowanie userów z platformy `/api/platforms/id:number/users/id:number`
```json
DELETE
{ "authenthication": "string" } // header
```


### Zapytania modułu grupy "/api/groups/*"


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
POST
{ "authenthication": "string" } // header
{ // body
  "name": "string",
  "lecturer": "string",
  "platformId": "string",
}
```

Lista grup użytkownika z danej platformy `/api/groups/platform/:platformId`
```json
GET
{ "authenthication": "string" } // header
{ // response
  "groups": [
    "<Groups>"
  ]
}
```

Dodawanie usera do grupy `/api/groups/users`
```json
POST
{ "authenthication": "string" } // header
{ // body
  "groupId": "string",
  "usersIds": [
    "string"
  ]
}
```

Usuwanie usera z grupy `/api/groups/users/:userId`
```json
DELETE
{ "authenthication": "string" } // header
```

Kasowanie grupy `/api/groups/:groupId`
```json
DELETE
{ "authenthication": "string" } // header
```

Pobranie wszystkich ocen użytkownika `/api/groups/notes`
```json
GET 
{ "authenthication": "string" } // header
{ // response\
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
```

Pobranie wszystkich ocen użytkownika z danej grupy `/api/groups/:groupId/notes`
```json
GET
{ "authenthication": "string" } // header
{ // response
  "notes": [
    "<Notes>"
  ]
}
```

Skasowanie oceny `/api/groups/notes/:noteId`
```json
DELETE 
{ "authenthication": "string" } // header
```

Stworzenie oceny `/api/groups/notes/`
```json
POST 
{ "authenthication": "string" } // header
{ // body
  "value": "string",
  "description": "string",
}
```

Edycja oceny `/api/groups/notes/:noteId`
```json
PUT 
{ "authenthication": "string" } // header
{ // body
  "value": "string",
  "description": "string",
}
```


### Zapytania modułu kalendarza "/api/calendar/*"


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
