import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformSettigs from "../components/rightComponents/platformSettings"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const PlatformPage = ({ location }) => (
  <div className="container">
    <SEO title="Platforma" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <PlatformSettigs
        platformId={location.state.platformId}
        platformName={location.state.platformName}
      />
    ) : (
      <PlatformSettigs />
    )}
  </div>
)

export default PlatformPage
