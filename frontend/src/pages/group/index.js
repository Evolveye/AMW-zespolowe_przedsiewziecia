import React, { useContext } from "react"

import Layout from "../../layouts/platform.js"
import { AuthContext } from "../../utils/auth.js"
import EventsCalendar from "../../containers/eventsCalendar.js"

export default () => (
  <Layout title="Grupa" showMeets={true}>
    <Pgae />
  </Layout>
)

function Pgae() {
  const { platform } = useContext( AuthContext )

  return (
    <>
      <h1 className="h1">
        <span className="tag">Grupa</span>
        {` `}
        {platform?.name}
      </h1>

      <EventsCalendar />
    </>
  )
}
