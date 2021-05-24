import { navigate } from "gatsby-link"
import { useEffect, useState } from "react"
import { getAuthHeaders } from "./auth"
import { fetchOrGet, getUrnQuery } from "./functions"
import URLS from "./urls"

const pendingRequests = new Map()

export default function getWebsiteContext() {
  const getData = address => {
    if (pendingRequests.has( address )) return pendingRequests.get( address )

    const promise = fetchOrGet( address, getAuthHeaders() )

    pendingRequests.set( address, fetchOrGet( address, getAuthHeaders() ) )

    return promise
  }
  const { p, g, m } = getUrnQuery()

  // console.log({ p, g, m })
  const getCtxData = () => [
    { key:`platform`, value:p ? getData( URLS.PLATFORM$ID_GET( p ) ) : null },
    { key:`group`, value:g ? getData( URLS.GROUP$ID_GET( g ) ) : null },
    { key:`meet`, value:m ? getData( URLS.MEET$ID_GET( m ) ) : null },
  ]

  const [ ctx, setCtx ] = useState( getCtxData() )

  useEffect( () => {
    const ctxData = getCtxData()

    if (ctxData.some( ({ value }) => value instanceof Promise )) Promise.all(
      ctxData.map( ({ key, value }) => new Promise( r =>
        value instanceof Promise
          ? value.then( res => res ? r({ key, value:res[ key ] }) : navigate( `/logout` ) )
          : r({ key, value }),
      ) ),
    ).then( data => setCtx( data ) )
  }, [ p, g, m ] )

  return ctx.reduce( (obj, { key, value }) => ({ ...obj, [ key ]:value }), {} )
}
