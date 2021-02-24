import { Link, navigate } from "gatsby"
import React from "react"

import { getUrnQuery } from "../utils/functions.js"
import { QueryLink } from "../components/link.js"

import classes from "./groupNav.module.css"

const fakeGroups = {
  1: [
    { id:1, meets:[ 4, 5 ] },
    { id:2, meets:[] },
    { id:3, meets:[ 10 ] },
  ],
  2: [
    { id:1, meets:[ 1, 2, 3 ] },
    { id:2, meets:[] },
    { id:3, meets:[ 4 ] },
  ],
  3: [
    { id:1, meets:[ 1, 2, 3 ] },
    { id:2, meets:[ 4, 5 ] },
    { id:3, meets:[ 6, 7, 8, 9 ] },
    { id:4, meets:[] },
    { id:5, meets:[ 10 ] },
  ],
}

export default ({ className = ``, showMeets }) => {
  const { p, g } = getUrnQuery()
  const groups = fakeGroups[ p ]
  const group = groups?.find( ({ id }) => id == g )

  return (
    <article className={`${classes.nav} ${className}`}>
      <section className={classes.groups}>
        Grupy
        {
          groups?.map( ({ id }) => (
            <QueryLink
              key={id}
              className={classes.groupLink}
              to="/group"
              requiredParams={[ `p` ]}
              params={[ { name:`g`, value:id } ]}
            >
              group
              {` `}
              {id}
            </QueryLink>
          ) )
        }
      </section>

      <section className={classes.meets} hidden={!showMeets}>
        Spotkania
        {
          group?.meets.map( id => (
            <QueryLink
              key={id}
              className={classes.meetLink}
              to="/group"
              requiredParams={[ `p` ]}
              params={[ { name:`g`, value:id } ]}
            >
              meet
              {` `}
              {id}
            </QueryLink>
          ) )
        }
      </section>
    </article>
  )
}
