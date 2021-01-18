import { Link } from "gatsby"
import React from "react"

export default class PlatformSettigs extends React.Component {
  state = {
    platformId: "",
  }

  render() {
    
    return (
      <> 
        <div className="right-container-profile">
          <div className="right-container-profile-left">
            <div className="right-container-profile-left-text">
              <span>Ustawienia platformy</span>
            </div>

            <div className="subjects-list">
              <div className="subject">
                <div className="subject-name">
                  <Link to="/platformsGeneral/" state={{platformId: this.props.platformId}}>Ogólne</Link>
                </div>
              </div>
              <div className="subject">
                <div className="subject-name">
                  <Link to="/usersPlatform/" state={{platformId: this.props.platformId}}>Użytkownicy</Link>
                </div>
              </div>
              <div className="subject">
                <div className="subject-name">Role</div>
              </div>
              <div className="subject">
                <div className="subject-name">
                  <Link to="/platformGroups/" state={{platformId: this.props.platformId}}>Grupy</Link>
                </div>
              </div>
            </div>

            <div className="right-container-profile-left-text">
              <span>Grupy</span>
            </div>
            <div className="subjects-list">
              <div className="subject">
                <div className="subject-icon"></div>
                <div className="subject-name">
                  <Link to="/groups/">Przedmiot 1</Link>
                </div>
              </div>
              <div className="subject">
                <div className="subject-icon"></div>
                <div className="subject-name">Przedmiot 2</div>
              </div>
            </div>
          </div>

          <div className="hr-vertical"></div>

          <div className="right-container-profile-right">
            <div className="platform-name">
              <span>Platforma: {this.props.platformName}</span>
            </div>
            <div className="calendar">
              <div className="calendar-header">
                <span>Kalendarz</span>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } 
}
