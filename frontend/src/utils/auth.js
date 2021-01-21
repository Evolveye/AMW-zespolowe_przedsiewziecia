import React from "react"
import { navigate } from "gatsby"

import {
  BACKEND_USER_ME_URL,
  DEBUG_USER_ME_URL,
  BACKEND_LOGOUT_URL,
  DEBUG,
} from "../config.js"
import { isBrowser } from "./functions.js"

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

  if (isBrowser()) {
    fetch(BACKEND_LOGOUT_URL, {
      method: `post`,
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(() => window.localStorage.clear())
      .then(() => cb && cb())
      .catch(console.error)
  }
}

export const AuthorizedContent = ({ children = `Unauthorized` }) =>
  isLoggedIn() ? children : <>{navigate(`/unauthorized`)}</>
