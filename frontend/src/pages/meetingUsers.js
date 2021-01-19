import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import MeetingUsers from "../components/rightComponents/meetingUsers"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const MeetingUsersPage = ({ location }) => (
  <div className="container">
    <SEO title="Dodawanie użytkownika do spotkania" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <MeetingUsers 
        meetingId={location.state.meetingId} 
        groupId={location.state.groupId}
      />
    ) : (
      <MeetingUsers />
    )}
  </div>
)

export default MeetingUsersPage
