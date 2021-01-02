import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import Settings from "../components/rightComponents/settings"

import "../components/style.css"

const SettingsPage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <Settings />
    </div>

)

export default SettingsPage
