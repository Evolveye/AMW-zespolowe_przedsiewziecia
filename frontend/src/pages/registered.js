import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerRegistered from "../components/rightComponents/registered"

import "../components/style.css"

const RegisteredPage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerRegistered />
    </div>

)

export default RegisteredPage
