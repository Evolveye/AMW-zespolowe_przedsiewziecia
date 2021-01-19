import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import GroupUsers from "../components/rightComponents/groupUsers"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const UsersGroupPage = ({ location }) => (
  <div className="container">
    <SEO title="Zarejestrowany" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <GroupUsers
        groupId={location.state.groupId}
        platformId={location.state.platformId}
      />
    ) : (
      <GroupUsers />
    )}
  </div>
)

export default UsersGroupPage
