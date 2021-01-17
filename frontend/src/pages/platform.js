import React from "react"



import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformSettigs from "../components/rightComponents/platformSettings"

import "../components/style.css"

const PlatformPage = ({ location }) => (
  <div className="container">
      <SEO title="Platforma" />

        <LeftContainer />
        <div className="hr-vertical"></div>
        <PlatformSettigs platformId={location.state.platformId} platformName={location.state.platformName}/> 
    </div>
)

export default PlatformPage
