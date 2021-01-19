import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import MeetingSetting from "../components/rightComponents/meetingSetting"
import { isBrowser } from "../services/auth"
import "../components/style.css"

const MeetingSettingPage = ({ location }) => (
  <div className="container">
    <SEO title="Ustawienia spotkania" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <MeetingSetting
        platformId={location.state.platformId} 
        meetingId={location.state.meetingId}
        meetingLink={location.state.meetingLink}
        groupId={location.state.groupId}
      />
    ) : (
      <MeetingSetting />
    )}
  </div>
)

export default MeetingSettingPage
