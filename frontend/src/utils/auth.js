import React, { useState } from "react"
import { navigate } from "gatsby"
import { fetchOrGet, getUrnQuery, isBrowser } from "./functions.js"

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

export const AuthContext = React.createContext({ user:null, platform:null, group:null, meet:null })
export const Authorized = ({ children }) => isLogged() ? children : navigate( `/unauthorized` )
export const getUser = () => JSON.parse( storage?.getItem( `user` ) )
export const fakeLogin = () => setUser( fakeUser )
export const isLogged = () => !!getUser()
export const logout = () => storage.clear()


export const AuthContextProvider = ({ children }) => {
  const { p, g, m } = getUrnQuery()

  return (
    <AuthContext.Provider
      value={{
        user: getUser(),
        platform: p ? fetchOrGet( `fake://platforms/${p}` ) : null,
        group: g ? fetchOrGet( `fake://groups/${g}` ) : null,
        meet: m ? fetchOrGet( `fake://meet/${m}` ) : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


export const useUser = () => {
  const [ user, setUser ] = useState( getUser() )

  changedUserSetters.push( setUser )

  return user
}
