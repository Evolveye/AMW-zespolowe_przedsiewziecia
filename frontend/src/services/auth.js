import {
  BACKEND_USER_ME_URL,
  DEBUG_USER_ME_URL,
  DEBUG
} from "../config.js"

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

// socket.on( `not authenticated`, console.log )

const STORAGE_TOKEN_NAME = "sessionToken"
const STORAGE_USER = "gatsbyUser"

export const setToken = token => isBrowser() && window.localStorage.setItem(STORAGE_TOKEN_NAME, token)
export const getToken = () => isBrowser() ? window.localStorage.getItem(STORAGE_TOKEN_NAME) : null
const isBrowser = () => typeof window !== "undefined"
const setUser = user => window.localStorage.setItem(STORAGE_USER, JSON.stringify(user))


/** @return {Promise<User?>} */
export async function getUser() {
  if (!isBrowser()) return

  const cachedUser = JSON.parse( window.localStorage.getItem(STORAGE_USER) )

  if (cachedUser) return cachedUser

  const cachedToken = getToken()

  if (!cachedToken) return null

  const f = () => DEBUG
    ? fetch( DEBUG_USER_ME_URL )
    : fetch( BACKEND_USER_ME_URL, {
      headers: { "Authenticate":`Barer ${cachedToken}` }
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
  if (isBrowser()) return getToken()
}

export function logout( cb ) {
  setUser(null)
  cb()

  if (isBrowser()) {
    console.log({
      method: `post`,
      headers: { "Authenticate":`Barer ${getToken()}` },
    })
    fetch( `/api/logout`, {
      method: `post`,
      headers: { "Authenticate":`Barer ${getToken()}` },
    } ).then( () => window.localStorage.clear() )
      .catch( console.error )
  }
}
