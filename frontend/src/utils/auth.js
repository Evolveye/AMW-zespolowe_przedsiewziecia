import React, { useState } from "react"
import { navigate } from "gatsby"
import { fetcher, fetchOrGet, getUrnQuery, isBrowser } from "./functions.js"
import URLS from "./urls.js"

const fakeUser = {
  login: `fakelogin`,
  name: `Fakename`,
  surname: `Fakesurname`,
  email: `fake@email.com`,
}

const changedUserSetters = []
const storage = isBrowser() ? window.sessionStorage : null
const getJsonFromStorage = key => JSON.parse( storage?.getItem( key ) )
const setJsonInStorage = (key, value) => storage?.setItem( key, JSON.stringify( value ) )
const setToken = token => setJsonInStorage( `token`, token )
const setUser = user => {
  setJsonInStorage( `user`, user )

  changedUserSetters.forEach( setter => setter( user ) )
}

export const AuthContext = React.createContext({ user:null, platform:null, group:null, meet:null })
export const getAuthHeaders = () => ({ Authentication:`Bearer ${getToken()}` })
export const Authorized = ({ children }) => isLogged() ? children : navigate( `/unauthorized` )
export const getUser = () => getJsonFromStorage( `user` )
export const getToken = () => getJsonFromStorage( `token` )
export const fakeLogin = () => setUser( fakeUser )
export const isLogged = () => !!getUser()
export const logout = () => storage.clear()


export const AuthContextProvider = ({ children }) => {
  const { p, g, m } = getUrnQuery()

  return (
    <AuthContext.Provider
      children={children}
      value={{
        user: getUser(),
        platform: p ? fetchOrGet( `fake://platforms/${p}` ) : null,
        group: g ? fetchOrGet( `fake://groups/${g}` ) : null,
        meet: m ? fetchOrGet( `fake://meets/${m}` ) : null,
      }}
    />
  )
}


export const useUser = () => {
  const [ user, setUser ] = useState( getUser() )

  changedUserSetters.push( setUser )

  return user
}


export const register = data => {
  fetcher.post( URLS.REGISTER_POST, data )
}


export const login = async data => {
  const { token } = await fetcher.post( URLS.LOGIN_POST, data )

  if (!token) return

  setToken( token )

  const { user } = await fetcher.get( URLS.USER_ME_GET, getAuthHeaders() )

  if (user) return setUser( user )
}
