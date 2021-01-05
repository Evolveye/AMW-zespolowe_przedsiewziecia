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



Logowanie
```json
POST :: /api/login
{ //body 
  "login": "string",
  "haslo": "string"
} 
```

Rejestracja
```json
POST :: /api/register
{ //body 
  "imie,": "string",
  "nazwisko,": "string",
  "email,": "string",
  "haslo1,": "string",
  "haslo2": "string",
}
```
Przypomnij hasło
```json
POST :: /api/password/remind
{ //body 
  "email": "string"
}
```

Resetowanie hasła
```json
POST :: /api/password/reset
{ //body 
  "password1": "string",
  "password2": "string",
  "code": "string",
} 
```

Dane zalogowanego użytkownika
```json
GET :: /api/users/me
{ "authenthication": "string" } // header
{ // response
  "login": "string",
  "activated": "boolean",
  "name": "string",
  "surname": "string",
  "email": "string",
  "created": "number",
  "avatar": "string",
}
```

Lista wszystkich platform usera
```json
GET :: /api/platforms
{ "authenthication": "string" } // header
{ // response
  "platforms": [
    {
      "_id": "string",
      "owner": "object<User>",
      "created": "number",
      "assignedGroup": "array<number>",
      "administrator": "object<User>",
      "assigned_users": "array<number>",
      "org_name": "string",
    }
  ]
}
```

Grupy
```json
GET DELETE :: /api/users/me/pinned
{ "authenthication": "string" } // header
```

Kalendarz
```json
GET :: /api/calendar
{ "authenthication": "string" } // header
{ // response
  "events": [
    {
      "type": "string",
      "date": "string",
      "href": "string",
    }
  ]
}
```

Lista grup platformy
```json
GET :: /api/platforms/id:number/groups
{ "authenthication": "string" } // header
{ // GET response
  "groups": "array<Group>"
}
```

Lista userów platformy
```json
GET :: /api/platforms/id:number/users
{ "authenthication": "string" } // header
{ // response
  "users": "array<User>"
}
```

Tworzenie grupy
```json
POST :: /api/platforms/id:number/groups
{ "authenthication": "string" } // header

{ // body
	"name": "string",
	"prowadzacy": "string",
}
```

Dodawanie usera do grupy
```json
POST
{ "authenthication": "string" } // header
```

Kasowanie userów z platformy
```json
DELETE :: /api/platforms/id:number/users/id:number
{ "authenthication": "string" } // header
```

Kasowanie grupy z platformy
```json
DELETE :: /api/platforms/id:number/groups/id
{ "authenthication": "string" } // header
```

Oceny
```json
GET/POST/PUT/DELETE :: /api/platform/id/groups/id/notes
{ "authenthication": "string" } // header
{ // GET response
  "ocena": "string",
	"opis": "string",
	"data": "number",
	"kto": "string",
}
```

Oceny usera
```json
GET :: /api/users/me/notes
{ "authenthication": "string" } // header
```