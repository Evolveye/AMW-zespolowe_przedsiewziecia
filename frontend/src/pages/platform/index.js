import React from "react"

import Layout from "../../layouts/platform.js"
import EventsCalendar from "../../containers/eventsCalendar.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { isDataLoading } from "../../utils/functions.js"

export default () => {
  const ctx = getWebsiteContext()

  return isDataLoading( ctx ) ? null : (
    <Layout title="Grupa" showMeets={true}>
      <h1 className="h1">
        <span className="tag">Platforma</span>
        {` `}
        {ctx.platform.name}
      </h1>

      <EventsCalendar />
    </Layout>
  )
}
