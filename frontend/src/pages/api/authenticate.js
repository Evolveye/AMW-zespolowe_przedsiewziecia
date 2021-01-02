import React from "react"



import SEO from "../../components/seo"

import LeftContainer from "../../components/left-container"
import RightContainerLogin from "../../components/rightComponents/login"

import "../../components/style.css"

const LoginPage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerLogin />
    </div>

)

export default LoginPage
