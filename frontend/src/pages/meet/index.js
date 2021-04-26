import React, { useEffect, useState } from "react"

import Layout from "../../layouts/base.js"
import { fetchOrGet } from "../../utils/functions.js"

import Paint from "../../containers/paint.js"
import SwitchBox, { Tab } from "../../components/switchBox.js"

import classes from "../../css/meet.module.css"

export default () => {
  const [ participants, setParticipants ] = useState([])

  useEffect( () => {
    fetchOrGet( `fake://platformUsers`, setParticipants )
  }, [] )

  return (
    <Layout className={classes.layout} title="Grupa">
      {/* <article className={classes.column}></article> */}
      <article className={classes.screen}>
        <Paint className={classes.canvas} />
      </article>

      <article className={classes.nav}>

      </article>

      <SwitchBox
        classNames={{
          it: classes.column,
          switches: classes.buttons,
          switch: `neumorphizm is-button`,
        }}
      >
        <Tab name="Użytkownicy">
          <h2>Lista uczestników</h2>

          <ul className={classes.users}>
            {
              participants.map( ({ id, name, surname }) => (
                <li key={id} className={classes.user}>
                  {name}
                  {` `}
                  {surname}
                </li>
              ) ).sort()
            }
          </ul>
        </Tab>

        <Tab name="Czat">

        </Tab>
      </SwitchBox>

    </Layout>
  )
}
