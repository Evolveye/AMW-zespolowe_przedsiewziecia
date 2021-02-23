import React from "react"
import { navigate } from "gatsby"
import { isBrowser } from "./functions"

const fakeUser = {
  login: `fakelogin`,
  name: `Fakename`,
  surname: `Fakesurname`,
  email: `fake@email.com`,
}

const storage = isBrowser() ? window.sessionStorage : null
const setUser = user => storage?.setItem( `user`, JSON.stringify( user ) )

export const getUser = () => JSON.parse( storage?.getItem( `user` ) )
export const Authorized = ({ children }) => getUser() ? children : navigate( `/unauthorized` )
export const fakeLogin = () => setUser( fakeUser )
export const isLogged = () => !!getUser()
export const logout = () => storage.clear()
