import React from "react"
import { Router } from "@reach/router" 
import PrivateRoute from "../../components/privateRoute"

import SEO from "../../components/seo"

import LeftContainer from "../../components/left-container"
import RightContainerMyGrades  from "../../components/rightComponents/myGrades"

import "../../components/style.css"

const GradesPage = () => ( 
  <div className="container"> 
      <SEO title="Moje oceny" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <Router className="router-container">
            <PrivateRoute path="/users/grades" component={RightContainerMyGrades} /> 
        </Router>
    </div>

)

export default GradesPage
