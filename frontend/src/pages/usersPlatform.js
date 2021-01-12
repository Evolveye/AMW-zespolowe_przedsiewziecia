import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformUsers from "../components/rightComponents/platformUsers"

import "../components/style.css"

const RegisteredPage = () => ( 
  <div className="container"> 
      <SEO title="Zarejestrowany" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PlatformUsers />
    </div>

)

export default RegisteredPage
