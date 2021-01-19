import { Link } from "gatsby"
import React from "react"
import { BACKEND_PLATFORMS_GROUPS_MEET } from "../../config"
import { getToken } from "../../services/auth"

class PlatformSettigsGroup extends React.Component {
  state = {
    meetsList: [],
  }
  showProps() {
    console.log("platform id: ", this.props.platformId)
    console.log("group id: ", this.props.groupId)
  }

  componentDidMount() {
    const reply = PlatformSettigsGroup.getDataMeet(this.props.groupId)
    reply
      .then(({ meets }) => {
        console.log("spotkania: ", meets)
        return meets.map((meet, index) => (
          <div className="subject" key={index}>
            <div className="subject-name">
              <Link
                to="/meetingSetting/"
                state={{
                  platformId: this.props.platformId,
                  groupId: this.props.groupId,
                  meetingId: meet.id,
                  meetingLink: meet.externalUrl,
                }}
              >
                {meet.description}
              </Link>
            </div>
          </div>
        ))
      })
      .then(meetsList => this.setState({ meetsList }))
  }
  render = () => (
    <div className="right-container-profile">
      <div className="right-container-profile-left">
        <div className="right-container-profile-left-text">
          <span>Ustawienia grupy</span>
        </div>

        <div className="subjects-list">
          <div className="subject">
            <div className="subject-name">
              <Link
                to="/usersGroup/"
                state={{
                  platformId: this.props.platformId,
                  groupId: this.props.groupId,
                }}
              >
                Użytkownicy
              </Link>
            </div>
          </div>
          <div className="subject">
            <div className="subject-name">
              <Link
                to="/groupNotes/"
                state={{
                  platformId: this.props.platformId,
                  groupId: this.props.groupId,
                }}
              >
                Oceny
              </Link>
            </div>
          </div>
          <div className="subject">
            <div
              className="subject-name"
              state={{
                platformId: this.props.platformId,
                groupId: this.props.groupId,
              }}
            >
              Role
            </div>
          </div>
          <div className="subject">
            <div className="subject-name">
              <Link
                to="/groupMeets/"
                state={{
                  platformId: this.props.platformId,
                  groupId: this.props.groupId,
                }}
              >
                Spotkania
              </Link>
            </div>
          </div>
        </div>
        <div className="right-container-profile-left-text">
          <span>Spotkania: </span>
        </div>
        <div className="subjects-list">{this.state.meetsList}</div>
      </div>

      <div className="hr-vertical"></div>

      <div className="right-container-profile-right">
        <div className="calendar">
          <div className="calendar-header">
            <span>Forum</span>
          </div>
        </div>
      </div>
    </div>
  )

  static getDataMeet(id) {
    return fetch(BACKEND_PLATFORMS_GROUPS_MEET.replace(":groupId", id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }
}
export default PlatformSettigsGroup
