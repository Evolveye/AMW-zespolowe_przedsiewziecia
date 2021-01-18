import { Link } from "gatsby"
import React from "react"
import { getToken } from "../../services/auth"
import { BACKEND_PLATFORMS_GROUPS_GET } from "../../config"

export default class PlatformSettigs extends React.Component {
  state = {
    platformId: this.props.platformId,
    groupList: [],
  }

  componentDidMount(){
    PlatformSettigs.getDataGroups(this.state.platformId)
      .then(({ groups }) =>
      //console.log("grupy lista: ", groups)
        groups.map((group,index)=>( 
          <div className="subject" key={index}>
                <div className="subject-icon"></div>
                <div className="subject-name">
                  <Link to="/groups/" state={{platformId: this.state.platformId, groupId: group.id}}>{group.name}</Link>
                </div>
          </div>

        ))
      ).then(groupList=> this.setState({groupList}))
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
              {/* <div className="subject">
                <div className="subject-icon"></div>
                <div className="subject-name">
                  <Link to="/groups/">Przedmiot 1</Link>
                </div>
              </div>
              <div className="subject">
                <div className="subject-icon"></div>
                <div className="subject-name">Przedmiot 2</div>
              </div> */}
              {this.state.groupList}
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

  static getDataGroups(id) {
    console.log("adres http pobrania grup: ", BACKEND_PLATFORMS_GROUPS_GET.replace(':platformId', id))
    return fetch(BACKEND_PLATFORMS_GROUPS_GET.replace(':platformId', id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }
}
