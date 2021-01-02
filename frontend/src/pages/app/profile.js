import React from "react"
import { Router } from "@reach/router" 
import PrivateRoute from "../../components/privateRoute"

import SEO from "../../components/seo"

import LeftContainer from "../../components/left-container"
import RightContainerProfile  from "../../components/rightComponents/profile"

import "../../components/style.css"

const ProfilePage = () => ( 
  <div className="container"> 
      <SEO title="Home" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <Router className="router-container">
            <PrivateRoute path="/app/profile" component={RightContainerProfile} /> 
        </Router>
    </div>

)

export default ProfilePage
