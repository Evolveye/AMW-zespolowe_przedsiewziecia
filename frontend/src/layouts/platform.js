import React from "react"

import Layout from "./base.js"
import GroupsList from "../containers/groupsList.js"
import EventsCalendar from "../containers/eventsCalendar.js"

import classes from "./platform.module.css"
import { Authorized } from "../utils/auth.js"

export default ({ className = ``, children, title, showMeets }) => (
  <Authorized>
    <Layout title={title}>
      <main className={classes.main}>
        <GroupsList className={classes.groups} />
        <EventsCalendar className={classes.calendar} />
        {/* {children} */}
      </main>
    </Layout>
  </Authorized>
)
