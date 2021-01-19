import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import PlatformUsers from "../components/rightComponents/platformUsers"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const RegisteredPage = ({ location }) => (
  <div className="container">
    <SEO title="Zarejestrowany" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <PlatformUsers platformId={location.state.platformId} />
    ) : (
      <PlatformUsers />
    )}
  </div>
)

export default RegisteredPage
