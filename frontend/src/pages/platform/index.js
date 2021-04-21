import React from "react"

import Layout from "../../layouts/platform.js"
import EventsCalendar from "../../containers/eventsCalendar.js"
import { getWebsiteContext } from "../../utils/functions.js"

export default () => {
  const { platform } = getWebsiteContext()

  return (
    <Layout title="Grupa" showMeets={true}>
      <h1 className="h1">
        <span className="tag">Platforma</span>
        {` `}
        {platform.name}
      </h1>

      <EventsCalendar />
    </Layout>
  )
}
