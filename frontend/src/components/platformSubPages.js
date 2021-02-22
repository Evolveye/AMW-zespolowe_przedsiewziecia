import React from "react"
import { Link } from "gatsby"

import classes from "./platformSubPages.module.css"

export default ({ className=``, to }) => (
  <Link className={className} to="/">
    links
  </Link>
)

export const LinksPath = ({ staticPath=[], queryPath=[], className }) => {
  const search = Object.fromEntries( new URLSearchParams( window.location.search ) )

  if (queryPath.some( ({ query }) => !( query in search) )) {
    throw `Wrong query`
  }

  const linksFromQuery = queryPath.filter( item => item ).map( ({ link, queryParam }) => {
    const linkParts = link.split( `?` )

    if (linkParts.length === 1) {
      if (link.indexOf( `?` ) < 0) linkParts.unshift( `` )
      else linkParts.push( `` )
    }

    const linkSearch = new URLSearchParams( linkParts[ 1 ] )

    linkSearch.forEach( (_, k) => linkSearch.set( k, search[ k ] ) )

    return { link:linkParts.join( `?` ), value:queryParam }
  } )

  const concatenatedPaths = [ ...staticPath.filter( item => item ), ...linksFromQuery ]
  const links = concatenatedPaths.map( ({ link, value }, i) => (
    <span key={link}>
      <Link
        className={classes.link}
        to={link}
      >
        {value}
      </Link>
      {i < concatenatedPaths.length - 1 && <span className={classes.separator}> -&gt; </span>}
    </span>
  ) )

  return (
    <span className={className}>
      {links}
    </span>
  )
}
