import React from "react"

import SEO from "../../components/seo"

import LeftContainer from "../../components/left-container"
import RightContainerRemindPassword from "../../components/rightComponents/remindPassword"

import "../../components/style.css"

const RemindPasswordPage = () => ( 
  <div className="container"> 
      <SEO title="Przypomnij hasło" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <RightContainerRemindPassword />
    </div>

)

export default RemindPasswordPage
