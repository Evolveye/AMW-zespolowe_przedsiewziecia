import React from "react"
import '@fortawesome/fontawesome-svg-core/styles.css';

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import RightContainerLogin from "../components/rightComponents/login"

import "../components/style.css"

export default () => (
  <div className="container">
      <SEO title="Logowanie" />

        <LeftContainer />
        <div className="hr-vertical"></div>
        <RightContainerLogin />
    </div>

)