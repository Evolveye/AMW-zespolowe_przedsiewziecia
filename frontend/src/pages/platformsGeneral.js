import React from "react"



import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PatformsSettingsGeneral from "../components/rightComponents/platformsSettingsGeneral"

import "../components/style.css" 

const PlatformGeneralPage = () => ( 
  <div className="container"> 
      <SEO title="Platforma" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PatformsSettingsGeneral />
    </div>

)

export default PlatformGeneralPage
