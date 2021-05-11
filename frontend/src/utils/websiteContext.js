import { useEffect, useState } from "react"
import { getAuthHeaders } from "./auth"
import { fetchOrGet, getUrnQuery } from "./functions"
import URLS from "./urls"


export default function getWebsiteContext() {
  const { p, g, m } = getUrnQuery()

  const reducer = arr => arr.reduce( (obj, { key, value }) => ({ ...obj, [ key ]:value }), {} )
  const getData = address => fetchOrGet( address, getAuthHeaders() )
  const [ ctx, setCtx ] = useState([
    { key:`platform`, value:p ? getData( URLS.PLATFORM$ID_GET( p ) ) : null },
    {
      key: `group`,
      value: p && g
        ? getData( URLS.GROUP_GET() + `?platformId=${p}` ).then( ({ groups }) => ({ group:groups[ 0 ] }) )
        : null,
    },
    { key:`meet`,     value:getData( `fake://meets/${m}` ) },
  ])

  useEffect( () => {
    if (ctx.some( ({ value }) => value instanceof Promise )) Promise.all(
      ctx.map( ({ key, value }) => new Promise( r =>
        value instanceof Promise
          ? value.then( resolvedValue => r({ key, value:resolvedValue[ key ] }) )
          : r({ key, value }),
      ) ),
    ).then( setCtx )
  }, [] )

  return reducer( ctx )
}
