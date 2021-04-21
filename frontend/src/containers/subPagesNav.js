import React, { useContext } from "react"
import { Link } from "gatsby"

import { AuthContext } from "../utils/auth.js"

import classes from "./subPagesNav.module.css"
import { getWebsiteContext } from "../utils/functions.js"


const queryPaths = [ `/group?p&g`, `/meet?p&m` ]


export default ({ classNames }) => {
  const websiteContext = getWebsiteContext()
  const search = Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )
  const navItems =  queryPaths.map( link => {
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
      <span key={link} className={classNames?.item}>
        <Link
          to={`${linkParts[ 0 ]}?${paramsWithValues.join( `&` )}`}
          className={classes.link}
          children={getnavItemName( websiteContext, linkParts[ 0 ].slice( 1 ) )}
        />
      </span>
    )
  } ).filter( Boolean )

  return navItems
}


function getnavItemName( websiteContext, itemType ) {
  switch (itemType) {
    case `group`: return websiteContext.group.name
    case `meet`: return websiteContext.meet.description
  }
}
