import React from "react"
import { navigate } from "@reach/router"
import socket from "../../services/webSocket.js"
import {
  getSocketEventFromHttp,
  BACKEND_PLATFORMS_GROUPS_GET,
  BACKEND_PLATFORMS_USERS_GET,
  BACKEND_PLATFORMS_GROUPS_POST,
} from "../../config"
import { getToken } from "../../services/auth"
export default class PlatformGroups extends React.Component {
  state = {
    name: ``,
    lecturer: ``,
    platformId: this.props.platformId,
    groupList: [],
    userList: [],
  }

  goBack = () => {
    navigate(-1)
  }

  handleUpdate = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    alert("kliknales wyślij")
    console.log("dane: ", this.state)
    const { userList, groupList, ...formData } = this.state
    const reply = PlatformGroups.setDataGroups(formData)
    console.log("formData wysyłanie: ", formData)
    reply.then(data => {
      if (data.error) {
        //błąd z serwera
        alert("wystąpił błąd, grupa nie została dodana")
        return null
      }
      const {groups} = data
      console.log(groups)
      alert('grupa "' + this.state.name + '" została dodana')
      document.getElementById("add-name").value = ""
    })
  }

  showUsers = () => {
    console.log("metoda showUsers")
    const reply = PlatformGroups.getDataUsers(this.props.platformId)
    reply
      .then(({ users }) => {
        if (!users.error) {
          console.log(users)
          return users.map((user, index) => (
            <option
              value={user.id}
              key={index}
            >{`${user.name} ${user.surname}`}</option>
          ))
        } else {
          alert("nie udało się załadować użytkowników")
          return this.state.userList
        }
      })
      .then(userList => this.setState({ userList }))
  }

  componentDidMount() {
    this.showUsers()
    console.log("id platformy: ", this.props.platformId)
    PlatformGroups.getDataGroups(this.props.platformId)
      .then(({ groups }) =>
      //console.log("grupy lista: ", groups)
        groups.map((group, index) => (
          <div className="grades-gained-container-grid-new-row" key={index}>
            <div className="grid-item  dodaj border-bottom-none"></div>
            <div className="grid-item  imie border-bottom-none">
              {group.name}
            </div>
            <div className="grid-item nazwisko rola border-bottom-none">
            {`${group.lecturer.name} ${group.lecturer.surname}`}
            </div>
            <div className="grid-item  znak delete border-bottom-none">X</div>
          </div>
        ))
      )
      .then(groupList => this.setState({ groupList })) 
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
      <div className="platform-users">
        <div className="grid-filtre">
          <div className="filtre-add-group-wrapp">
            <div className="grid-item  empty-filtre-user"></div>
            <div className="grid-item  imie">Nazwa</div>
            <div className="grid-item  nazwisko rola">Prowadzący</div>
            <div className="grid-item  znak"></div>

            <div className="grades-gained-container-grid-new-row">
              <div className="grid-item  filtruj">Filtruj</div>
              <div className="grid-item  imie"></div>
              <div className="grid-item nazwisko rola"></div>
              <div className="grid-item  znak"></div>
            </div>

            <div className="grades-gained-container-grid-new-row">
              <div className="grid-item  dodaj border-bottom-none">Dodaj</div>
              <div className="grid-item  imie border-bottom-none">
                <input
                  type="text"
                  name="name"
                  placeholder="Wpisz..."
                  id="add-name"
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="grid-item prowadzacy border-bottom-none rola">
                <select name="lecturer" onChange={this.handleUpdate}>
                  {this.state.userList}
                </select>
              </div>
              <div className="grid-item  znak border-bottom-none">
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
          <div className="filtre-add-group-wrapp">
            <div className="grid-item  empty-filtre-user"></div>
            <div className="grid-item  imie">Nazwa</div>
            <div className="grid-item  nazwisko rola">Prowadzący</div>
            <div className="grid-item  znak"></div> 
            {this.state.groupList}
          </div>
        </div>
      </div>
    </div>
  )

  static getDataGroups(id) {
    console.log("adres http pobrania grup: ", BACKEND_PLATFORMS_GROUPS_GET.replace(':platformId', id))
    return fetch(BACKEND_PLATFORMS_GROUPS_GET.replace(':platformId', id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }

  static getDataUsers(id) {
    console.log(
      "adres http pobrania użytkowników: ",
      BACKEND_PLATFORMS_USERS_GET.replace("id:number", id)
    )
    return fetch(BACKEND_PLATFORMS_USERS_GET.replace("id:number", id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }

  static setDataGroups(data) {
    console.log("adres http dodania grup: ", BACKEND_PLATFORMS_GROUPS_POST)
    return fetch(BACKEND_PLATFORMS_GROUPS_POST, {
      method: `POST`,
      headers: {
        "Content-Type": "application/json",
        Authentication: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  }

  /*
  static setData(data) {
    const eventName = getSocketEventFromHttp(`post`, BACKEND_PLATFORMS_GROUPS_POST)

    if (!socket) return new Promise(res => res([]))
    else
      return new Promise(resolve => { 
        socket.emit(eventName, data)
        socket.on(eventName, resolve)
        console.log(resolve)
      }).catch(error => console.error(`${eventName} :: ${error}`))
  }

  static getData() {
    const eventName = getSocketEventFromHttp(`get`, BACKEND_PLATFORMS_GROUPS_GET) 
    if (!socket) return new Promise(res => res([]))
    else
      return new Promise(resolve => {
        socket.on(eventName, resolve)
        socket.emit(eventName) 
      }).catch(error => console.error(`${eventName} :: ${error}`))
  }
  */
}
