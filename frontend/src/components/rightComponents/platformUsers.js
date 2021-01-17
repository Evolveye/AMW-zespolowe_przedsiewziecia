import React from "react"
import { navigate } from "@reach/router"
import socket from "../../services/webSocket.js"
import {
  getSocketEventFromHttp,
  BACKEND_PLATFORMS_USERS_GET,
  BACKEND_PLATFORMS_USERS_POST,
} from "../../config"
import { getToken } from "../../services/auth"

export default class PlatformUsers extends React.Component {
  state = {
    name: ``,
    surname: ``,
    email: ``,
    //role: ``,
    userList: []

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
    alert("kliknales wyslij")
    console.log("dane: ", this.state)
    console.log("props id: ", this.platformId)
    const { userList, ...formData } = this.state
    const reply = PlatformUsers.setData(formData,this.props.platformId)
    reply.then(({ user }) => {
      if (!user.error) {
        console.log(user)
        alert(
          'użytkownik "' +
            this.state.name +
            " " +
            this.state.surname +
            '" został dodany'
        )
      } else {
        //błąd z serwera
        alert("wystąpił błąd, użytkownik nie został dodany")
      }
      document.getElementById("add-name").value = ""
      document.getElementById("add-surname").value = ""
      document.getElementById("add-email").value = "" 
    })
  }

  handleDelete = event => {
    event.preventDefault()
    alert("kliknales usuń")
  }

  
  componentDidMount() {
    PlatformUsers.getData(this.props.platformId) 
      .then(({users}) =>
        users.map((user, index) => (
          <div className="grades-gained-container-grid-new-row" key={index}>
              <div className="grid-item  dodaj border-bottom-none"></div>
              <div className="grid-item  imie border-bottom-none">{user.name}</div>
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
      ).then(userList => this.setState( {userList } ))
      .then(console.log('pobiera dane'))
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
          <div className="filtre-add-user-wrapp">
            <div className="grid-item  empty-filtre-user"></div>
            <div className="grid-item  imie">Imię</div>
            <div className="grid-item  nazwisko">Nazwisko</div>
            <div className="grid-item  email">Adres E-mail</div>
            <div className="grid-item  rola">Rola</div>
            <div className="grid-item  znak"></div>

            <div className="grades-gained-container-grid-new-row">
              <div className="grid-item  dodaj border-bottom-none">Filtruj</div>
              <div className="grid-item  imie">
                <input type="text" name="filtreName" placeholder="Wpisz..." />
              </div>
              <div className="grid-item nazwisko">
                <input
                  type="text"
                  name="filtreSurname"
                  placeholder="Wpisz..."
                />
              </div>
              <div className="grid-item email">
                <input type="text" name="filtreEmail" placeholder="Wpisz..." />
              </div>
              <div className="grid-item  rola">
                <select name="role">
                  <option value="Właściciel">Właściciel</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Prowadzący">Prowadzący</option>
                  <option value="Uczeń">Uczeń</option>
                </select>
              </div>
              <div className="grid-item  znak border-bottom-none"></div>
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
              <div className="grid-item nazwisko border-bottom-none">
                <input
                  type="text"
                  name="surname"
                  placeholder="Wpisz..."
                  id="add-surname"
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="grid-item email border-bottom-none">
                <input
                  type="text"
                  name="email"
                  placeholder="Wpisz..."
                  id="add-email"
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="grid-item  rola border-bottom-none">
                <select name="role">
                  <option value="Właściciel">Właściciel</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Prowadzący">Prowadzący</option>
                  <option value="Uczeń">Uczeń</option>
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
          <div className="filtre-add-user-wrapp">
            <div className="grid-item  empty-filtre-user"></div>
            <div className="grid-item  imie">Imię</div>
            <div className="grid-item  nazwisko">Nazwisko</div>
            <div className="grid-item  email">Adres E-mail</div>
            <div className="grid-item  rola">Rola</div>
            <div className="grid-item  znak"></div>

            {this.state.userList} 
          </div>
        </div>
      </div>
    </div>
  )

  static setData(data, id) {
    console.log("id platformy dodaj użytkownika: ", id)
    return fetch(BACKEND_PLATFORMS_USERS_POST.replace("id:number", id), {
      method: `POST`,
      headers: {
        "Content-Type": "application/json",
        Authentication: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  }
  static getData(id) {
    console.log("id platformy dodaj użytkownika: ", id)
    return fetch(BACKEND_PLATFORMS_USERS_GET.replace("id:number", id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      }
    }).then(res => res.json())
  }

  // static setData(data, id) {
  //   const eventName = getSocketEventFromHttp(`post`, BACKEND_PLATFORMS_USERS_GET.replace('id:number', id ))

  //   if (!socket) return new Promise(res => res([]))
  //   else
  //     return new Promise(resolve => {
  //       console.log('adres: ',id)
  //       socket.emit(eventName, data)
  //       socket.on(eventName, resolve)
  //       console.log(resolve)
  //     }).catch(error => console.error(`${eventName} :: ${error}`))
  // }

  // static getData(id) {
  //   const eventName = getSocketEventFromHttp(`get`, BACKEND_PLATFORMS_USERS_GET.replace('id:number', id))
  //   if (!socket) return new Promise(res => res([]))
  //   else
  //     return new Promise(resolve => {
  //       socket.on(eventName, resolve)
  //       socket.emit(eventName)
  //       // console.error("jesteś w moich ocenach, po 'socket.on(`api.get.users.me.notes`, resolve) socket.emit(`api.get.users.me.notes`)'")
  //     }).catch(error => console.error(`${eventName} :: ${error}`))
  // }
}
