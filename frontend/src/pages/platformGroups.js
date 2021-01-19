import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformGroups from "../components/rightComponents/platformGroups"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const PlatformGroupsPage = ({ location }) => (
  <div className="container">
    <SEO title="Grupy" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <PlatformGroups platformId={location.state.platformId} />
    ) : (
      <PlatformGroups />
    )}
  </div>
)

export default PlatformGroupsPage
