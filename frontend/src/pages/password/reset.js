import React from "react"

import SEO from "../../components/seo"

import LeftContainer from "../../components/left-container"
import RightContainerPasswordReset from "../../components/rightComponents/resetPassword"

import "../../components/style.css"

const ResetPasswordPage = () => ( 
  <div className="container"> 
      <SEO title="Resetuj hasło" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerPasswordReset />
    </div>

)

export default ResetPasswordPage
