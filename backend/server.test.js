<<<<<<< HEAD
import { assert } from "./src/utils.js"

import dbManager from "./src/dbManager.js"

import UserModule from "./modules/user/index.js"

const { userModule } = setup()



assert( "Test log - false", 1, 2 )
assert( "Test log - true",  3, 3 )

assert( "Test hasła - digits",   UserModule.isPasswordCorrect("12345"), false )
assert( "Test hasła - length",   UserModule.isPasswordCorrect("abcdefghijklrmoprst"), false)
assert( "Test hasła - correct",  UserModule.isPasswordCorrect("12345!%#$"), true )
assert( "Test hasła - bad word", UserModule.isPasswordCorrect("admin"), false )
assert( "Test hasła - length",   UserModule.isPasswordCorrect("abc"), false )
assert( "Test hasła - bad char", UserModule.isPasswordCorrect("adam123?"), false )
assert( "Test hasła - correct",  UserModule.isPasswordCorrect("mikolaj@"), true )



function setup(){
  return {
    userModule: new UserModule( console.log, dbManager ),
  }
}
=======
import { exec } from "child_process"

import pkg from 'chai'
import fetch from "node-fetch"
import { url } from "inspector"
const {should,assert,expect} = pkg

exec("node server.js")
await new Promise( res => setTimeout( res, 1000 ) )

const host = `http://localhost:3000`

// app.post("/api/login", (req, res, next) => loginMiddleware({ req, res, next, ...utils }))
//     app.post("/api/register", (req, res, next) => registerMiddleware({ req, res, next, ...utils }))
//     app.post("/api/password/remind", (req, res, next) => passwordRemindMiddleware({ req, res, next, ...utils }))
//     app.post("/api/password/reset", (req, res, next) => passwordResetMiddleware({ req, res, next, ...utils })) // update passw in db
//     app.get("/api/activate/:code", (req, res, next) => acctivateAccountMiddleware({ req, res, next, ...utils }))


describe('TESTOWY ', () => {
    before(()=>{
        let indexer = 0
        const methods = Object.entries( assert )
            .map( ([k, v]) => `${indexer++}. ${k}: ${v.toString().split( /function|{\n/ )[ 1 ]}` )

        console.log( methods.slice( 0, 20 ) )
        console.log( methods.slice( 20, 40 ) )
        console.log( methods.slice( 40, 60 ) )
        console.log( methods.slice( 60 ) )
    })

    it('liczby ', () => {
        const numb = 10
        assert.ok(numb === numb)
    })
})

describe(('User Module Tests'),()=>{
    it(`Test localhost-a`, async () =>{
      const mypath = `${host}/test`
      const response = await fetch(mypath,{ method:`GET`})

      assert.equal(response.status,200)
    })

    it(`Login Test`, async()=>{
        const endpoint = `${host}/api/login`
        const headers =  { "Content-Type": `application/json` }
        const body = {
            login: "adam",
            password: "adam",
        }

        const response = await fetch(endpoint,{headers, body:JSON.stringify(body), method:`POST`})
        const text = await response.json(response)
        assert.ok(text,'Pobrano dane z serwera')
        assert.equal(response.status,200,'Bad request')
    })

})
>>>>>>> origin/dev-backend-node
