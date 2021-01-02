import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerCheckMail from "../components/rightComponents/checkMail"

import "../components/style.css"

const CheckMailPage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerCheckMail />
    </div>

)

export default CheckMailPage
