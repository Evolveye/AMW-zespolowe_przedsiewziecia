import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerActiatedAccount from "../components/rightComponents/activatedAccount"

import "../components/style.css"

const ActivatedAccountPage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerActiatedAccount />
    </div>

)

export default ActivatedAccountPage
