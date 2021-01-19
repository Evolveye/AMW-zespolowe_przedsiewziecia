import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformSettigsGroup from "../components/rightComponents/groups"

import "../components/style.css"

const GroupsPage = ({location}) => ( 
  <div className="container"> 
      <SEO title="Grupy" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <PlatformSettigsGroup platformId={location.state.platformId} groupId={location.state.groupId}/>
    </div>

)

export default GroupsPage