import React from "react"
import { Link } from "gatsby"

import classes from "./subPagesNav.module.css"
import { getWebsiteContext } from "../utils/functions.js"


const queryPaths = [ `/group?p&g`, `/meet?p&m` ]


export default ({ classNames }) => {
  const websiteContext = getWebsiteContext()
  const search = Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )


  const getnavItemName = (websiteContext, itemType) => {
    switch (itemType) {
      case `group`: return { tag:`Grupa`, text:websiteContext.group?.name }
      case `meet`: return { tag:`Opis wybranego spotkania`, text:websiteContext.meet?.description }
    }
  }


  return queryPaths.map( link => {
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

    const { tag, text } = getnavItemName( websiteContext, linkParts[ 0 ].slice( 1 ) )

    return paramsWithValues.includes( undefined ) ? null : (
      <span key={link} className={classNames?.item}>
        <Link
          to={`${linkParts[ 0 ]}?${paramsWithValues.join( `&` )}`}
          className={`is-highlightable ${classes.link}`}
        >
          <span className={`tag ${classes.linkTag}`}>{tag}</span>
          <span className={classes.linkText}>{text}</span>
        </Link>
      </span>
    )
  } ).filter( Boolean )
}
