import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerRegister from "../components/rightComponents/register"

import "../components/style.css"

const RegisterPage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerRegister />
    </div>

)

export default RegisterPage
