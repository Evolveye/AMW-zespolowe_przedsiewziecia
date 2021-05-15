import React from "react"

import Layout from "../../layouts/platform.js"
import EventsCalendar from "../../containers/eventsCalendar.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { isDataLoading } from "../../utils/functions.js"
import GroupSettings from "../../containers/groupSettings.js"

import classes from "../../css/page.module.css"

export default () => {
  const ctx = getWebsiteContext()

  if (isDataLoading( ctx )) return null

  const { platform, group } = ctx

  return (
    <Layout title="Grupa" showMeets={true}>
      <GroupSettings className={classes.groupSettingsSwitch} platformId={platform.id} groupId={group.id} />

      <h1 className="h1">
        <span className="tag">Grupa</span>
        {` `}
        {group?.name}
      </h1>

      <EventsCalendar />
    </Layout>
  )
}
