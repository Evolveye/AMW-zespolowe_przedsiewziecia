import {
    BACKEND_LOGIN_URL,
    BACKEND_USER_ME_URL,

    DEBUG_LOGIN_URL,
    DEBUG_USER_ME_URL,

    DEBUG
  } from "../config.json"

  const STORAGE_TOKEN_NAME = "sessionToken"
  const STORAGE_USER = "gatsbyUser"

  // DEBUG: fetch( `/api/login` ).then( res => res.text() ).then( console.log )


  /**
   * @typedef {object} User
   * @property {string} login
   * @property {string} avatarSrc
   * @property {string} email
   * @property {string} name
   * @property {string} surname
   */

  export const isBrowser = () => typeof window !== "undefined"

  /** @return {Promise<User?>} */
  export async function getUser() {
    if (!isBrowser()) return

    const cachedUser = JSON.parse( window.localStorage.getItem(STORAGE_USER) )

    if (cachedUser) return cachedUser

    const cachedToken = window.localStorage.getItem(STORAGE_TOKEN_NAME)

    if (!cachedToken) return null

    const f = () => DEBUG
      ? fetch( DEBUG_USER_ME_URL )
      : fetch( BACKEND_USER_ME_URL, {
        headers: { "Authenticate":`Basic ${cachedToken}` }
      } )

    console.log( DEBUG ? DEBUG_USER_ME_URL : BACKEND_USER_ME_URL )
    return await f().then( data => data.json() )
      .then( user => {
        console.log( `FETCHED USER`, user )
        setUser( user )

        return user
      } )
      .catch( console.error )
  }

  const setUser = user => window.localStorage.setItem(STORAGE_USER, JSON.stringify(user))
  const setToken = token => window.localStorage.setItem(STORAGE_TOKEN_NAME, token)


  export async function handleLogin({ login, password }) {
    console.log( {DEBUG, BACKEND_LOGIN_URL, login, password} )

    const response = DEBUG
      ? await fetch( DEBUG_LOGIN_URL )
      : await fetch( BACKEND_LOGIN_URL, {
        method: `POST`,
        headers: { "Content-Type": `application/json` },
        body: JSON.stringify( { login, password } ),
      } )

    const responseText = await response.text()

    try {
      let json = JSON.parse( responseText )

      if (DEBUG) console.log( json )
      if (json.error) {
        console.error( `ERROR: ${json.error}` )

        return false
      }

      setToken( json.token )

      return true
    } catch (err) {
      console.error( `ERROR: Niewłaściwa odpowiedź\n${err}\n${responseText}` )

      return false
    }

    // if (username === `admin` && password === `admin`) {
    //   return setUser({
    //     username: `admin`,
    //     name: `aaddmmiinn`,
    //     email: `admin@example.org`,
    //   })
    // }

    // return false
  }
  export function isLoggedIn() {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(STORAGE_TOKEN_NAME)
  }
  }
  export const logout = callback => {
    setUser(null)
    callback()
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }

  }
