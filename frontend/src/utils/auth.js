import React from "react"
import { navigate } from "gatsby"

import { isBrowser } from "./functions.js"
import URLS from "./urls.js"


/**
 * @typedef {object} User
 * @property {string} login
 * @property {string} avatarSrc
 * @property {string} email
 * @property {string} name
 * @property {string} surname
 */


const STORAGE_TOKEN_NAME = `sessionToken`
const STORAGE_USER = `gatsbyUser`
const STORAGE_PPERMS = `platformPerms`

const setUser = user =>
  window.localStorage.setItem(STORAGE_USER, JSON.stringify(user))


export const setToken = token =>
  isBrowser() && window.localStorage.setItem(STORAGE_TOKEN_NAME, token)


export const getToken = () =>
  isBrowser() ? window.localStorage.getItem(STORAGE_TOKEN_NAME) : null


/** @return {Promise<User?>} */
export async function getUser() {
  if (!isBrowser()) return

  const cachedUser = JSON.parse(window.localStorage.getItem(STORAGE_USER))

  if (cachedUser && !cachedUser.error) return cachedUser

  const cachedToken = getToken()

  if (!cachedToken) return null

  return fetch(URLS.USER_ME_GET, {
    headers: { Authentication: `Bearer ${cachedToken}` },
  })
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


/** @return {Promise<User?>} */
export async function getPerms( platformId ) {
  if (!isBrowser()) return

  const cachedPPerms = JSON.parse(window.localStorage.getItem(STORAGE_PPERMS))

  if (cachedPPerms && !cachedPPerms.error) return cachedPPerms

  return fetch(URLS.PLATFORM$ID_PERMISSIONS_MY_GET.replace( `:platformId`, platformId ), {
    headers: { Authentication: `Bearer ${getToken()}` },
  })
    .then(data => data.json())
    .then(({ error, permissions }) => {
      if (error) {
        console.error(error)

        return null
      }

      return new Proxy( permissions, {
        get(perm, key) {
          if (!(key in perm)) return null
          if (perm.isMaster) return true

          return perm[key] || false
        }
      } )
    })
    .catch(console.error)
}


export function isLoggedIn() {
  if (isBrowser()) return !!getToken()
}


export function logout(cb) {
  setUser(null)

  if (isBrowser()) {
    fetch(URLS.LOGOUT_POST, {
      method: `post`,
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(() => window.localStorage.clear())
      .then(() => cb && cb())
      .catch(console.error)
  }
}


export const AuthorizedContent = ({ children = `Unauthorized` }) =>
  isLoggedIn() ? children : isBrowser() && <>{navigate(`/unauthorized`)}</>
