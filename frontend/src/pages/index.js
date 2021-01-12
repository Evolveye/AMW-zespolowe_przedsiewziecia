import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerMain from "../components/rightComponents/main"

import "../components/style.css"

const IndexPage = () => (
  <div className="container">
      <SEO title="Strona główna" />

        <LeftContainer />
        <div className="hr-vertical"></div>
        <RightContainerMain />
    </div>

)

export default IndexPage
