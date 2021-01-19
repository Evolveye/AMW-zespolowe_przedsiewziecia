import React from "react"
import SEO from "../components/seo"
import LeftContainer from "../components/left-container"
import NotesGroup from "../components/rightComponents/groupNotes"
import { isBrowser } from "../services/auth"

import "../components/style.css"

const GroupNotesPage = ({ location }) => (
  <div className="container">
    <SEO title="Oceny w grupie" />

    <LeftContainer />
    <div className="hr-vertical"></div>
    {isBrowser() ? (
      <NotesGroup groupId={location.state.groupId} />
    ) : (
      <NotesGroup />
    )}
  </div>
)

export default GroupNotesPage
