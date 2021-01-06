import {
  BACKEND_USER_ME_URL,

  DEBUG_USER_ME_URL,

  DEBUG
} from "../config.json"

/* DEBUG FETCH:
  fetch( `/api/login`, {
    method: `POST`,
    headers: { "Content-Type": 'application/json' },
    body: JSON.stringify( { login:`a`, password:`b` } ),
  } ).then( res => res.text() ).then( console.log )
*/

/**
 * @typedef {object} User
 * @property {string} login
 * @property {string} avatarSrc
 * @property {string} email
 * @property {string} name
 * @property {string} surname
 */

const STORAGE_TOKEN_NAME = "sessionToken"
const STORAGE_USER = "gatsbyUser"

export function setToken(token){
  window.localStorage.setItem(STORAGE_TOKEN_NAME, token)
}

const isBrowser = () => typeof window !== "undefined"
const setUser = user => window.localStorage.setItem(STORAGE_USER, JSON.stringify(user))


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

export function isLoggedIn() {
  if (isBrowser()) return window.localStorage.getItem(STORAGE_TOKEN_NAME)
}

export function logout( cb ) {
  setUser(null)
  cb()

  if (isBrowser()) window.localStorage.clear()
}
