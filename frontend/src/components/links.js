import React from "react"
import { Link } from "gatsby"

import classes from "./links.module.css"

export default ({ className=``, to }) => (
  <Link className={className} to={to}>
    search link
  </Link>
)

export const LinksPath = ({ staticPath=[], queryPath=[], className }) => {
  const search = Object.fromEntries( new URLSearchParams( window.location.search ) )

  if (queryPath.some( ({ query }) => !( query in search) )) {
    throw `Wrong query`
  }

  const linksFromQuery = queryPath.map( ({ link, queryParam }) => {
    const linkParts = link.split( `?` )

    if (linkParts.length === 1) {
      if (link.indexOf( `?` ) < 0) linkParts.unshift( `` )
      else linkParts.push( `` )
    }

    console.log( linkParts )

    const linkSearch = new URLSearchParams( linkParts[ 1 ] )

    linkSearch.forEach( (_, k) => linkSearch.set( k, search[ k ] ) )

    return { link:linkParts.join( `?` ), value:queryParam }
  } )

  const links = [ ...staticPath, ...linksFromQuery ].map( ({ link, value }, i) => (
    <span key={link}>
      <Link
        className={classes.link}
        to={link}
      >
        {value}
      </Link>
      {i < queryPath.length - 1 && <span className={classes.separator}> -&gt; </span>}
    </span>
  ) )

  return (
    <span className={className}>
      {links}
    </span>
  )
}
