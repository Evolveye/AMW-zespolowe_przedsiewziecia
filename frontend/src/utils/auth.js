import { useEffect, useState } from "react"
import { navigate } from "gatsby"
import { fetcher, getFromStorage, clearStorage, isBrowser, setInStorage } from "./functions.js"
import URLS from "./urls.js"

const fakeUser = {
  login: `fakelogin`,
  name: `Fakename`,
  surname: `Fakesurname`,
  email: `fake@email.com`,
}

const changedUserSetters = []
const setToken = token => setInStorage( `token`, token )
const setUser = user => {
  setInStorage( `user`, user )

  changedUserSetters.forEach( setter => setter( user ) )
}

// export const AuthContext = React.createContext({ user:null, platform:null, group:null, meet:null })
export const getAuthHeaders = () => ({ Authentication:`Bearer ${getToken()}` })
export const Authorized = ({ children }) => isLogged() ? children : navigate( `/unauthorized` )
export const getUser = () => getFromStorage( `user` )
export const getToken = () => getFromStorage( `token` )
export const fakeLogin = () => setUser( fakeUser )
export const isLogged = () => !!getUser()
export const logout = () => clearStorage()


// export const AuthContextProvider = ({ children }) => {
//   const { p, g, m } = getUrnQuery()

//   return (
//     <AuthContext.Provider
//       children={children}
//       value={{
//         user: getUser(),
//         platform: p ? fetchOrGet( `fake://platforms/${p}` ) : null,
//         group: g ? fetchOrGet( `fake://groups/${g}` ) : null,
//         meet: m ? fetchOrGet( `fake://meets/${m}` ) : null,
//       }}
//     />
//   )
// }


export const authFetcher = new Proxy( fetcher, {
  get( fetcher, key ) {
    if ([ `get` ].includes( key )) {
      return address => fetcher[ key ]( address, getAuthHeaders() )
    }

    if ([ `post`, `put`, `delete` ].includes( key )) {
      return (address, data) => fetcher[ key ]( address, data, getAuthHeaders() )
    }

    return fetcher[ key ]
  },
} )


export const useUser = () => {
  const [ user, setUser ] = useState( getUser() )

  changedUserSetters.push( setUser )

  useEffect( () =>
    () => changedUserSetters.splice( changedUserSetters.indexOf( setUser ), 1 )
  , [] )

  return user
}


export const register = data => {
  fetcher.post( URLS.REGISTER_POST(), data )
}


export const login = async data => {
  const tokenData = await fetcher.post( URLS.LOGIN_POST(), data )

  if (!tokenData?.token) return

  setToken( tokenData.token )

  const { user } = await fetcher.get( URLS.USER_ME_GET(), getAuthHeaders() )

  if (user) return setUser( user )
}
