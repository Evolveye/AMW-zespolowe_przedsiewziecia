import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import GroupMakeMeets from "../components/rightComponents/groupMeets"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const GroupsMeetsPage = ({ location }) => (
  <div className="container">
    <SEO title="Grupy" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <GroupMakeMeets
        platformId={location.state.platformId}
        groupId={location.state.groupId}
      />
    ) : (
      <GroupMakeMeets />
    )}
  </div>
)

export default GroupsMeetsPage
