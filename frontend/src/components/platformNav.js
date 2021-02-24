import { Link, navigate } from "gatsby"
import React, { useState } from "react"

import ToggableBox from "./toggableBox.js"
import { getUrnQuery } from "../utils/functions"

import classes from "./platformNav.module.css"

const defaultValue = `Wybierz platformę...`
const fakePlatforms = [
  { id:1, name:`Szkoła` },
  { id:2, name:`Akademia` },
  { id:3, name:`Szkółka leśna` },
]

export default ({ className = `` }) => {
  const { p } = getUrnQuery()

  return (
    <article className={className}>
      {
        !p ? defaultValue : (
          <span>
            platform-
            {` `}
            {p}
          </span>
        )
      }

      <ToggableBox boxClassName={classes.nav}>
        <ul>
          {
            fakePlatforms.map( ({ id, name }) => (
              <li key={id}><Link to={`/platform?p=${id}`} state={{}}>{name}</Link></li>
            ) )
          }
        </ul>
      </ToggableBox>

    </article>
  )
}
