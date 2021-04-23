import React, { useEffect, useState } from "react"
import List from "../../containers/list.js"

import Layout from "../../layouts/base.js"
import { fetchOrGet } from "../../utils/functions.js"

import classes from "../../css/meet.module.css"

export default () => {
  const [ participants, setParticipants ] = useState([])

  useEffect( () => {
    fetchOrGet( `fake://platformUsers`, setParticipants )
  }, [] )

  return (
    <Layout className={classes.layout} title="Grupa">
      <article className={classes.screen}>

      </article>

      <article className={classes.nav}>

      </article>

      <article className={classes.column}>
        <h2>Lista uczestników</h2>

        <ul className={classes.users}>
          {
            participants.map( ({ name, surname }) => (
              <li className={classes.user}>
                {name}
                {` `}
                {surname}
              </li>
            ) ).sort()
          }
        </ul>

        <section className={classes.buttons}>
          <button className="neumorphizm is-button">Czat</button>
          <button className="neumorphizm is-button">Użytkownicy</button>
        </section>
      </article>
    </Layout>
  )
}
