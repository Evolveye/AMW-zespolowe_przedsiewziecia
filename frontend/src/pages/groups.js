import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformSettigsGroup from "../components/rightComponents/groups"

import "../components/style.css"

const GroupsPage = () => ( 
  <div className="container"> 
      <SEO title="Grupy" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PlatformSettigsGroup />
    </div>

)

export default GroupsPage
