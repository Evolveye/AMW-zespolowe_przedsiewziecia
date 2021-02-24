import { Link } from "gatsby"
import React from "react"

export const QueryLink = ({ className = ``, to, requiredParams, params, children }) => {
  const search = Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )
  const processedQueryParams = requiredParams.map( p => {
    if (!(p in search)) throw `Missing required param ${p}`

    let value = search[ p ]

    if (p in params) {
      value = params[ p ]
      delete params[ p ]
    }

    return { name:p, value }
  } )

  params.forEach( ({ name, value }) => processedQueryParams.push({ name, value }) )

  console.log( processedQueryParams )
  const queryString = processedQueryParams.map( ({ name, value }) => `${name}=${value}` ).join( `&` )

  return <Link className={className} to={`${to}?${queryString}`}>{children}</Link>
}
