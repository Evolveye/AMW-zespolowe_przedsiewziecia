import React, { useState } from "react"
import { navigate } from "gatsby"
import { isBrowser } from "./functions"

const fakeUser = {
  login: `fakelogin`,
  name: `Fakename`,
  surname: `Fakesurname`,
  email: `fake@email.com`,
}

const changedUserSetters = []
const storage = isBrowser() ? window.sessionStorage : null
const setUser = user => {
  storage?.setItem( `user`, JSON.stringify( user ) )

  changedUserSetters.forEach( setter => setter( user ) )
}

export const getUser = () => JSON.parse( storage?.getItem( `user` ) )
export const Authorized = ({ children }) => getUser() ? children : navigate( `/unauthorized` )
export const fakeLogin = () => setUser( fakeUser )
export const isLogged = () => !!getUser()
export const logout = () => storage.clear()

export const useUser = () => {
  const [ user, setUser ] = useState( getUser() )

  changedUserSetters.push( setUser )

  return user
}
