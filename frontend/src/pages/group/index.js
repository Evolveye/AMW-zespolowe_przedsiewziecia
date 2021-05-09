import React from "react"

import Layout from "../../layouts/platform.js"
import EventsCalendar from "../../containers/eventsCalendar.js"
import getWebsiteContext from "../../utils/websiteContext.js"

export default () => {
  const { group } = getWebsiteContext()

  return (
    <Layout title="Grupa" showMeets={true}>
      <h1 className="h1">
        <span className="tag">Grupa</span>
        {` `}
        {group.name}
      </h1>

      <EventsCalendar />
    </Layout>
  )
}
