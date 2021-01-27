import React from "react"
import { navigate } from "gatsby"

import { isBrowser } from "./functions.js"
import { URL_USER_ME_GET, URL_LOGOUT_POST } from "../config.js"

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

  return fetch(URL_USER_ME_GET, {
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

export function isLoggedIn() {
  if (isBrowser()) return !!getToken()
}

export function logout(cb) {
  setUser(null)

  if (isBrowser()) {
    fetch(URL_LOGOUT_POST, {
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
