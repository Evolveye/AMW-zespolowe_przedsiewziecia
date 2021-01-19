import React from "react"

import SEO from "../components/seo"

import LeftContainer from "../components/left-container"
import NotesGroup from "../components/rightComponents/groupNotes"

import "../components/style.css"

const GroupNotesPage = ({location}) => ( 
  <div className="container"> 
      <SEO title="Oceny w grupie" />
      
        <LeftContainer /> 
        <div className="hr-vertical"></div> 
        <NotesGroup platformId={location.state.platformId} groupId={location.state.groupId}/>
    </div>

)

export default GroupNotesPage
