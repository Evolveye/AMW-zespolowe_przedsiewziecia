import {
    BACKEND_LOGIN_URL,
    BACKEND_USER_ME_URL,
  
    DEBUG_LOGIN_URL,
    DEBUG_USER_ME_URL,

    DEBUG
  } from "../config.json"
  
  const STORAGE_TOKEN_NAME = "sessionToken"
  const STORAGE_USER = "gatsbyUser"
 
  
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
  
  
  export function handleLogin({ login, password }) {
    const f = () => DEBUG
      ? fetch( DEBUG_LOGIN_URL )
      : fetch( BACKEND_LOGIN_URL, {
        method: `POST`,
        body: {
          login,
          password,
        }
      } )
  
    return f ().then( data => data.json() )
      .then( ({ token }) => setToken( token ) )
      .then( () => true )
      .catch( console.error ) // TODO
  
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
  