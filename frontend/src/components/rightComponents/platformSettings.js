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
              <span>Ustawienia platformy </span>
            </div>

            <div className="subjects-list">
              <div className="subject">
                <div className="subject-name">
                  <Link to="/platformsGeneral/">Ogólne</Link>
                </div>
              </div>
              <div className="subject">
                <div className="subject-name">
                  <Link to="/usersPlatform/">Użytkownicy</Link>
                </div>
              </div>
              <div className="subject">
                <div className="subject-name">Role</div>
              </div>
              <div className="subject">
                <div className="subject-name">
                  <Link to="/platformGroups/">Grupy</Link>
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
