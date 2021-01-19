import React from "react"
import { navigate } from "@reach/router"
//import socket from "../../services/webSocket.js"
//impoty {getSocketEventFromHttp} from "../../config"
import {
  BACKEND_PLATFORMS_USERS_GET,
  BACKEND_PLATFORMS_USERS_ADD,
  BACKEND_PLATFORMS_GROUP_USERS_GET
} from "../../config"
import { getToken } from "../../services/auth"

export default class GroupUsers extends React.Component {
  state = {
    groupId: this.props.groupId,
    usersIds: new Set(),
    //role: ``,
    userList: [],
    userGroupList:[],
  }

  goBack = () => {
    navigate(-1)
  }

  handleUpdate = event => {
    if (event.target.name === "usersIds") {
      this.state.usersIds.add(event.target.value)
    } else {
      this.setState({
        [event.target.name]: event.target.value,
      })
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log("usersIds: ", this.state.usersIds)
    const { usersIds, groupId } = this.state
    console.log({ usersIds, groupId })
    const reply = GroupUsers.setData({
        usersIds: Array.from(usersIds),
        groupId
    })
    reply.then(data => {
      if (data.error) {
        alert("wystąpił błąd, użytkownik nie został przypisany do grupy")
        return null
      }
      const { user } = data
      console.log(user)
      alert("użytkownik został przypisany")
    })
  }

  componentDidMount() {
    console.log("id grupy: ", this.props.groupId)
    console.log("id platform: ", this.props.platformId)
    const reply = GroupUsers.getDataPlatformUser(this.props.platformId)
    reply
      .then(({ users }) => {
        if (users.error) {
          alert("nie udało się załadować użytkowników")
          return null
        }
        console.log(users)
        return users.map((user, index) => (
          <option
            value={user.id}
            key={index}
          >{`${user.name} ${user.surname}`}</option>
        ))
      })
      .then(userList => this.setState({ userList }))

      const replyGroup = GroupUsers.getDataGroupUsers(this.props.groupId)
      replyGroup.then(({users})=>{
        if(users.error){
          console.log("brak użytkowników")
          return null
        }
        console.log("uzytkownicy: ", users)
        return users.map((user,index)=>(
          <div className="grades-gained-container-grid-new-row" key={index}>
            <div className="grid-item  dodaj border-bottom-none"></div>
            <div className="grid-item  imie border-bottom-none">
              {user.name}
            </div>
            <div className="grid-item nazwisko border-bottom-none">
              {user.surname}
            </div>
            <div className="grid-item  email  border-bottom-none">
              {user.email}
            </div>
            <div className="grid-item  rola border-bottom-none">Rola</div>
            <div className="grid-item  znak delete border-bottom-none">
              <input
                type="submit"
                className="delete"
                value="X"
                onClick={this.handleDelete}
              />
            </div>
          </div>
        ))
      }).then(userGroupList => this.setState({ userGroupList }))
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
          <div className="grid-add-user-group">
            <div className="box funkcja1 funkcja"></div>
            <div className="box imie1">Imię</div>
            <div className="box nazwisko1">Nazwisko</div>
            <div className="box rola1">Rola</div>
            <div className="box znak1 znak"></div>

            <div className="grid-add-user-group-new-row">
              <div className="box funkcjaF funkcja">Filtruj</div>
              <div className="box imieF">
                <input type="text" name="filtreName" placeholder="Wpisz..." />
              </div>
              <div className="box nazwiskoF">
                <input type="text" name="filtreEmail" placeholder="Wpisz..." />
              </div>
              <div className="box rolaF">Rola</div>
              <div className="box znakF znak"></div>
            </div>

            <div className="grid-add-user-group-new-row">
              <div className="box funkcjaD funkcja">Dodaj</div>
              <div className="box imieD">
                <select name="usersIds" onBlur={this.handleUpdate}>
                  {this.state.userList}
                </select>
              </div>
              <div className="box rolaD">Rola</div>
              <div className="box znakD znak">
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
          <div className="filtre-add-user-wrapp">
            <div className="grid-item  empty-filtre-user"></div>
            <div className="grid-item  imie">Imię</div>
            <div className="grid-item  nazwisko">Nazwisko</div>
            <div className="grid-item  email">Adres E-mail</div>
            <div className="grid-item  rola">Rola</div>
            <div className="grid-item  znak"></div>
            {this.state.userGroupList}
          </div>
        </div>
      </div>
    </div>
  )

  static getDataPlatformUser(platformId) {
    return fetch(BACKEND_PLATFORMS_USERS_GET.replace("id:number", platformId), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }

  static setData(data) {
    console.log("to co wysyłam: ", data)
    console.log("adres: ", BACKEND_PLATFORMS_USERS_ADD)
    return fetch(BACKEND_PLATFORMS_USERS_ADD, {
      method: `POST`,
      headers: {
        "Content-Type": "application/json",
        Authentication: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  }

  static getDataGroupUsers(id){
    console.log("adres: ", BACKEND_PLATFORMS_GROUP_USERS_GET.replace(':groupId', id))
    return fetch(BACKEND_PLATFORMS_GROUP_USERS_GET.replace(':groupId', id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }
  
}
