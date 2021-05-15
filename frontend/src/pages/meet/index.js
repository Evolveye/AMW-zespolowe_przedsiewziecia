import React, { useEffect, useState } from "react"

import Layout from "../../layouts/base.js"
import { fetchOrGet, isDataLoading } from "../../utils/functions.js"

import Paint from "../../containers/paint.js"
import SwitchBox, { Tab } from "../../components/switchBox.js"

import classes from "../../css/meet.module.css"
import URLS from "../../utils/urls.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { authFetcher } from "../../utils/auth.js"

export default () => {
  const ctx = getWebsiteContext()
  const [ participants, setParticipants ] = useState([])

  useEffect( () => {
    if (isDataLoading( ctx.meet )) return () => {}

    authFetcher.get( URLS.MEET$ID_USERS_GET( ctx.meet.id ) ).then( r => setParticipants( r.participants ) )
  }, [ ctx.meet?.id ] )

  if (isDataLoading( ctx.meet )) return <Layout className={classes.layout} title="Grupa" />
  else return (
    <Layout className={classes.layout} title="Grupa">
      <SwitchBox
        classNames={{
          it: classes.screen,
          switches: `${classes.nav} ${classes.mainNav}`,
          switch: `neumorphizm is-button`,
        }}
      >
        <Tab className={classes.tab} name="Tablica">
          <Paint
            classNames={{
              it: classes.tabContent,
              nav: classes.nav,
              tool: classes.tool,
            }}
          />
        </Tab>

        <Tab className={classes.tab} name="Ekran">

        </Tab>
      </SwitchBox>

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
