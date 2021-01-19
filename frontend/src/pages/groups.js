import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformSettigsGroup from "../components/rightComponents/groups"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const GroupsPage = ({ location }) => (
  <div className="container">
    <SEO title="Grupy" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <PlatformSettigsGroup
        platformId={location.state.platformId}
        groupId={location.state.groupId}
      />
    ) : (
      <PlatformSettigsGroup />
    )}
  </div>
)

export default GroupsPage
