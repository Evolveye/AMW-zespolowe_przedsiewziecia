import { json } from "body-parser"

// ###################### LOGIN ######################
res = await fetch(`/api/login`, {
    method: `POST`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({
        login: `adam`,
        password: `adam`,
    })
})
answer = await res.json()

answer
// ###################### LOGOUT ######################
headers = {
    "Content-Type": "application/json",
    "Authentication": `Bearer ${res.token}`
}
headers
res = await fetch(`http://localhost:3000/api/logout`, {
    method: `POST`,
    headers: headers,
})
answer = await res.json()

answer

// ###################### REGISTER ######################
headers = {
    'Content-Type': 'application/json'
}
headers
userCredentials = {
    "name": "Olek",
    "surname": "Wiadro",
    "email": "tepod63675@maksap.com",
    "password1": "onion",
    "password2": "onion"
}
userCredentials
answer = await fetch(`http://localhost:3000/api/register`, {
    method: `POST`,
    headers: headers,
    body: JSON.stringify(userCredentials)
}).then(data => data.json())

// Czemu register na awaitach wysyła 2 razy email?


// ###################### ACCTIVATE ######################
// /activate/<login>


answer = await fetch(`http://localhost:3000/activate/${answer.login}`,
    {
        method: 'GET'
    })
    .then(data => data.json())
answer


// ###################### REMIND ######################
headers = { 'Content-Type': 'application/json' }
userCredentials = { 'email': 'adam.szr98@gmail.com' }
res = await fetch(`http://localhost:3000/api/password/remind`, {
    method: `POST`,
    headers: headers,
    body: JSON.stringify(userCredentials)
})
answer = await res.json()

// ###################### RESET ######################
// /api/password/reset?code={{uniqueId}}

headers = { 'Content-Type': 'application/json' }
uniqueId = 0.8680668423829649

body = { 'password1': '12341234#', 'password2': '12341234#', "code": uniqueId }


res = await fetch(`http://localhost:3000/api/password/reset?code${uniqueId}`, {
    method: `POST`,
    headers: headers,
    body: JSON.stringify(body)
})
answer = await res.json()

// ###################### ME ######################
// {{host}}/api/users/me



headers = {
    "Authentication": `Bearer ${0.41317782076262666}`
}
res = await fetch(`http://localhost:3000/api/users/me`, {
    method: `GET`,
    headers: headers,
})

answer = await res.json()


