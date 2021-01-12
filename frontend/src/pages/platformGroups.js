import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformGroups from "../components/rightComponents/platformGroups"

import "../components/style.css"

const PlatformGroupsPage = () => ( 
  <div className="container"> 
      <SEO title="Grupy" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PlatformGroups />
    </div>

)

export default PlatformGroupsPage
