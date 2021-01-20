import { BACKEND_USER_ME_URL, DEBUG_USER_ME_URL, DEBUG } from "../config.js"
import { isBrowser } from "./functions.js";

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

const STORAGE_TOKEN_NAME = `sessionToken`
const STORAGE_USER = `gatsbyUser`

export const getToken = () =>
  isBrowser() ? window.localStorage.getItem(STORAGE_TOKEN_NAME) : null

export const setToken = token =>
  isBrowser() && window.localStorage.setItem(STORAGE_TOKEN_NAME, token)

const setUser = user =>
  window.localStorage.setItem(STORAGE_USER, JSON.stringify(user))

/** @return {Promise<User?>} */
export async function getUser() {
  if (!isBrowser()) return

  const cachedUser = JSON.parse(window.localStorage.getItem(STORAGE_USER))

  if (cachedUser && !cachedUser.error) return cachedUser

  const cachedToken = getToken()

  if (!cachedToken) return null

  const f = () =>
    DEBUG
      ? fetch(DEBUG_USER_ME_URL)
      : fetch(BACKEND_USER_ME_URL, {
          headers: { Authentication: `Bearer ${cachedToken}` },
        })

  return await f()
    .then(data => data.json())
    .then(({ error, user }) => {
      if (error) {
        console.error(error)

        return null
      }

      setUser(user)

      return user
    })
    .catch(console.error)
}

export function isLoggedIn() {
  if (isBrowser()) return !!getToken()
}

export function logout(cb) {
  setUser(null)

  cb()

  if (isBrowser()) {
    fetch(`/api/logout`, {
      method: `post`,
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(() => window.localStorage.clear())
      .catch(console.error)
  }
}
