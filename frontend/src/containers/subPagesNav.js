import React from "react"
import { Link } from "gatsby"

import classes from "./subPagesNav.module.css"

/**
 * @typedef {object} QueryPath
 * @property {string} name
 * @property {link} link
 */

const defaultQueryPaths = [
// { name:`Platforma`, link:`/platform?p` },
  { name:`Grupa`, link:`/group?p&g` },
  { name:`Spotkanie`, link:`/meet?p&g&m` },
]

/**
 * @param {object} param0
 * @param {QueryPath[]} param0.queryPaths
 */
export default ({ queryPaths = defaultQueryPaths }) => {
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
      <Link
        key={link}
        to={`${linkParts[ 0 ]}?${paramsWithValues.join( `&` )}`}
        className={classes.link}
      >
        {name}
      </Link>
    )
  } ).filter( Boolean )
  // .map( (link, i, arr) => (
  //   <React.Fragment key={link.key}>
  //     {link}
  //     {i === arr.length - 1 ? null : <span className={classes.separator}>&gt;</span>}
  //   </React.Fragment>
  // ) )

  return links
  // return (
  //   <article className={`${classes.nav} ${className}`}>
  //     {links}
  //   </article>
  // )
}
