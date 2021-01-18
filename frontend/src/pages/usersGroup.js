import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import GroupUsers from "../components/rightComponents/groupUsers"

import "../components/style.css"

const UsersGroupPage = ({location}) => ( 
  <div className="container"> 
      <SEO title="Zarejestrowany" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <GroupUsers groupId={location.state.groupId} platformId={location.state.platformId}/>
    </div>

)

export default UsersGroupPage
