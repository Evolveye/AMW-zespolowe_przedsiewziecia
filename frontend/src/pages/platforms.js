import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import AddPlatform from "../components/rightComponents/addPlatform"

import "../components/style.css"

const AddPlatformPage = () => ( 
  <div className="container"> 
      <SEO title="Nowa platforma" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <AddPlatform />
    </div>

)

export default AddPlatformPage
