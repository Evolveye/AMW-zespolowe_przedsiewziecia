import { Link } from "gatsby"
import React from "react"
//import {BACKEND_PLATFORMS_GROUPS_MEET} from "../../config"
//import { getToken } from "../../services/auth"

class MeetingSetting extends React.Component {
 
  showProps(){
    console.log("platform id: ", this.props.platformId)
    console.log("group id: ", this.props.groupId)
    console.log("meeting id: ", this.props.meetingId)
    console.log("link do spotkania, ", this.props.meetingLink)
  } 

  componentDidMount(){
      this.showProps()
  }
  render = () => ( 
    <div className="right-container-profile"> 
      <div className="right-container-profile-left">
        <div className="right-container-profile-left-text">
          <span>Ustawienia Spotkania</span>
        </div>

        <div className="subjects-list">
          <div className="subject">
            <div className="subject-name">
              <Link to="/meetingUsers/" state={{groupId:this.props.groupId,meetingId:this.props.meetingId}}>Użytkownicy</Link>
            </div>
          </div> 
        </div> 
      </div>

      <div className="hr-vertical"></div>

      <div className="right-container-profile-right">
        <div className="calendar">
          <div className="calendar-header">
            <span>Spotkania</span>
          </div>
          <div className="meeting-meeting-link">
              <span><a href={this.props.meetingLink} target="_blank" rel="noreferrer" >{this.props.meetingLink}</a></span>
              {/* <span><Link to={this.props.meetingLink}>{this.props.meetingLink}</Link> </span> */}
          </div>
        </div>
      </div>
    </div>
  ) 
} 
export default MeetingSetting
