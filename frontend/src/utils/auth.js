import React from "react"
import { navigate } from "gatsby"

import { isBrowser, memoizedFetch } from "./functions.js"
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
// const STORAGE_PPERMS = `platformPerms`
// const STORAGE_GPERMS = `groupPerms`

const setUser = user =>
  window.localStorage.setItem(STORAGE_USER, JSON.stringify(user))

const addAuthoirizationHeader = init =>
  `headers` in init
    ? (init.headers["Authentication"] = `Bearer ${getToken()}`)
    : (init.headers = { Authentication: `Bearer ${getToken()}` })

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
function getPerms(url, cb) {
  const init = {}
  const getPermsProxy = perms =>
    new Proxy(perms, {
      get(perm, key) {
        if (!(key in perm)) return null
        if (perm.isMaster) return true

        return perm[key] || false
      },
    })

  addAuthoirizationHeader(init)

  const cachedPerms = memoizedFetch({
    url,
    init,
    cb: !cb ? null : ({ permissions }) => cb(getPermsProxy(permissions)),
  })

  if (cachedPerms) return getPermsProxy(cachedPerms.permissions)
}

export function getPlatformPerms(platformId, cb) {
  const url = URLS.PLATFORM$ID_PERMISSIONS_MY_GET.replace(
    `:platformId`,
    platformId
  )
  return getPerms(url, cb)
}

export function getGroupPerms(groupId, cb) {
  const url = URLS.GROUP$ID_PERMISSIONS_MY_GET.replace(`:groupId`, groupId)

  return getPerms(url, cb)
}

export function getMeetPerms(meetId, cb) {
  return new Proxy({}, {
    get(perm, key) {
      if (perm.isMaster) return true

      return perm[key] || false
    },
  })
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

/**
 * @param {object} param0
 * @param {RequestInfo} param0.url
 * @param {RequestInit} param0.init
 * @param {boolean} param0.runOnlyCbWhenUpdate
 * @param {(res:any) => void} param0.cb
 */
export function authFetch({ url, init = {}, runOnlyCbWhenUpdate = true, cb }) {
  addAuthoirizationHeader(init)
  return memoizedFetch({ url, init, runOnlyCbWhenUpdate, cb })
}
