import React from "react"



import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PatformsSettingsGeneral from "../components/rightComponents/platformsSettingsGeneral"

import "../components/style.css" 

const PlatformGeneralPage = ({location}) => ( 
  <div className="container"> 
      <SEO title="Platforma" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PatformsSettingsGeneral platformId={location.state.platformId}/>
    </div>

)

export default PlatformGeneralPage
