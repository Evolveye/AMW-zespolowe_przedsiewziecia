//import { Link } from "gatsby"
import React from "react"
import {
  BACKEND_PLATFORMS_GROUP_USERS_GET,
  BACKEND_PLATFORMS_GROUPS_MEET_ADD_USER,
  BACKEND_PLATFORMS_GROUPS_MEET_GET_USER,
  BACKEND_PLATFORMS_GROUPS_MEET_DEL_USER,
} from "../../config"
import { getToken } from "../../services/auth"

class MeetingUsers extends React.Component {
  state = {
    usersIds: ``,
    meetingId: this.props.meetingId,
    participantsIds: new Set(),
    userListMeeting: [],
    userListGroup: [],
  }

  handleDelete = id => {
    console.log("id do usunięcia: ", id)
        const reply = MeetingUsers.delData(id, this.state.meetingId)
        reply.then(data => {
            if(data.error){
                alert("nie udało się usunąć użytkownika ze spotkania")
                return null
            }
            const {del} = data
            console.log("usunieto spotkanie: ", del)
            alert("użytkownik usunięty ze spotkania")
        })
  }

  handleUpdate = event => { 
      this.setState({
        [event.target.name]: event.target.value,
      }) 
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log("usersIds: ", this.state.usersIds)
    const { usersIds, meetingId } = this.state
    const reply = MeetingUsers.setData(
      {
        participantsIds: Array.from(usersIds),
      },
      meetingId
    )
    reply.then(data => {
      if (data.error) {
        alert("wystąpił błąd, użytkownik nie został przypisany do spotkania")
        return null
      }
      alert("użytkownik został przypisany")
    })
  }

  componentDidMount() {
    console.log("group id: ", this.props.groupId)
    const reply = MeetingUsers.getDataUsers(this.props.groupId)
    reply
      .then(({ users }) => {
        if (users.error) {
          alert("najpierw dodaj użytkowników do grupy")
          return null
        }
        return users.map((user, index) => (
          <option
            key={index}
            value={user.id}
          >{`${user.name} ${user.surname}`}</option>
        ))
      })
      .then(userListGroup => this.setState({ userListGroup }))

    const replyUserMeet = MeetingUsers.getData(this.state.meetingId)
    replyUserMeet
      .then(({ participants }) => {
          console.log({participants})
        if (participants.error) {
          return null
        }
        return participants.map((participant, index) => (
          <div className="add-user-meeting-wrapper-new-row" key={index}>
            <div className="box funkcja"></div>
            <div className="box imie">{participant.name}</div>
            <div className="box nazwisko">{participant.surname}</div>
            <div className="box znak">
            <input
                type="submit"
                className="delete"
                value="X"
                onClick={() => this.handleDelete(participant.id)}
              />
            </div>
          </div>
        ))
      })
      .then(userListMeeting => this.setState({ userListMeeting }))
  }
  render = () => (
    <div className="right-container-settings">
      <div className="settings-header">
        <div className="back-main-view">
          <span
            onClick={this.goBack}
            onKeyDown={this.goBack}
            role="button"
            tabIndex="0"
          >
            Powrót do widoku głównego
          </span>
        </div>
      </div>
      <div className="group-users">
        <div className="grid-filtre">
          <div className="add-user-meeting-wrapper">
            <div className="box funkcjaNaglowek"></div>
            <div className="box imieNaglowek">Imię</div>
            <div className="box nazwiskoNaglowek">Nazwisko</div>
            <div className="box znakNaglowek"></div>

            <div className="add-user-meeting-wrapper-new-row">
              <div className="box funkcjaFiltruj">Filtruj</div>
              <div className="box imieFiltruj">
                <input
                  type="text"
                  name=""
                  placeholder="Wpisz..." 
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="box nazwiskoFiltruj">
                <input
                  type="text"
                  name=""
                  placeholder="Wpisz..." 
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="box znakFiltruj"></div>
            </div>

            <div className="add-user-meeting-wrapper-new-row">
              <div className="box funkcjaDodaj">Dodaj</div>
              <div className="box imieDodaj">
                <select name="usersIds" onBlur={this.handleUpdate}>
                  <option>wybierz</option>
                  {this.state.userListGroup}
                </select>
              </div>
              <div className="box znakDodaj">
                <input
                  type="submit"
                  className="dodaj"
                  value="+"
                  onClick={this.handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid-users">
          <div className="add-user-meeting-wrapper">
            <div className="box funkcjaNaglowek"></div>
            <div className="box imieNaglowek">Imię</div>
            <div className="box nazwiskoNaglowek">Nazwisko</div>
            <div className="box znakNaglowek"></div>

            <div className="add-user-meeting-wrapper-new-row">
              <div className="box funkcja"></div>
              <div className="box imie"></div>
              <div className="box nazwisko"></div>
              <div className="box znak"></div>
            </div>
            {this.state.userListMeeting}
          </div>
        </div>
      </div>
    </div>
  )

  static getDataUsers(id) {
    return fetch(BACKEND_PLATFORMS_GROUP_USERS_GET.replace(":groupId", id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }

  static setData(data, id) {
    console.log("to co wysyłam: ", data)
    console.log(
      "adres: ",
      BACKEND_PLATFORMS_GROUPS_MEET_ADD_USER.replace(":meetId", id)
    )
    return fetch(
      BACKEND_PLATFORMS_GROUPS_MEET_ADD_USER.replace(":meetId", id),
      {
        method: `POST`,
        headers: {
          "Content-Type": "application/json",
          Authentication: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      }
    ).then(res => res.json())
  }

  static getData(id) {
    console.log(
        "adres: ",
        BACKEND_PLATFORMS_GROUPS_MEET_GET_USER.replace(":meetId", id)
      )
    return fetch(
      BACKEND_PLATFORMS_GROUPS_MEET_GET_USER.replace(":meetId", id),
      {
        method: `GET`,
        headers: {
          Authentication: `Bearer ${getToken()}`,
        },
      }
    ).then(res => res.json())
  }

  static delData(userId, meetingId){
    const address1 = BACKEND_PLATFORMS_GROUPS_MEET_DEL_USER.replace(':meetId',meetingId)
    const address2 = address1.replace(':userId', userId)
    return fetch(address2,{
      method: `DELETE`,
      headers: { 
        "Authentication":`Bearer ${getToken()}`
      }, 
    } ).then( res => res.json() )
}
}
export default MeetingUsers
