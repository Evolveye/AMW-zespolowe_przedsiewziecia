import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerChangedPassword from "../components/rightComponents/changedPassword"

import "../components/style.css"

const ChangedPasswordPage = () => ( 
  <div className="container"> 
      <SEO title="Zmieniono hasło" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerChangedPassword />
    </div>

)

export default ChangedPasswordPage
