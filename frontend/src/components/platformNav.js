import { Link } from "gatsby"
import React from "react"

import SwitchBox from "./switchBox.js"
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
          <Link to={`/platform?p=${p}`}>
            platform-
            {` `}
            {p}
          </Link>
        )
      }

      <ToggableBox boxClassName={classes.nav} btnContent="Ustawienia" fullScreened>
        <SwitchBox tabs={
          [
            { name:`Użytkownicy`, node:<>Jakaś tabelka z użytkownikami</> },
            { name:`Grupy`, node:<>Jakaś tabelka z grupami</> },
          ]
        }
        />
      </ToggableBox>

      <ToggableBox boxClassName={classes.nav} btnContent="Wybierz platformę">
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
