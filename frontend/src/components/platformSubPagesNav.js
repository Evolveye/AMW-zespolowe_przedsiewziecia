import React from "react"
import { Link } from "gatsby"

import classes from "./platformSubPagesNav.module.css"

/**
 * @typedef {object} QueryPath
 * @property {string} name
 * @property {link} link
 */

/**
 * @param {object} param0
 * @param {QueryPath[]} param0.queryPaths
 */
export default ({ queryPaths = [], className }) => {
  const search = Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )
  const links = queryPaths.map( ({ name, link }) => {
    const linkParts = link.split( `?` )

    if (linkParts.length === 1) {
      if (link.indexOf( `?` ) < 0) linkParts.unshift( `` )
      else linkParts.push( `` )
    }

    const paramsWithValues = linkParts[ 1 ].split( `&` ).map( param => {
      const value = search[ param ]

      if (!value) return

      return `${param}=${value}`
    } )

    return paramsWithValues.includes( undefined ) ? null : (
      <Link key={link} to={`${linkParts[ 0 ]}?${paramsWithValues.join( `&` )}`}>
        {name}
      </Link>
    )
  } ).filter( Boolean )

  return (
    <span className={className}>
      {links}
    </span>
  )
}
