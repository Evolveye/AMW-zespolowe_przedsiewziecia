import React from "react"



import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformSettigs from "../components/rightComponents/platformSettings"

import "../components/style.css"

const PlatformsPage = () => ( 
  <div className="container"> 
      <SEO title="Platforma" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PlatformSettigs />
    </div>

)

export default PlatformsPage
