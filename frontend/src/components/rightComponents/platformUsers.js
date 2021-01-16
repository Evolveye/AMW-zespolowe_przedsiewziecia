import React from "react"
import { navigate } from "@reach/router"
import socket from "../../services/webSocket.js"
import { getSocketEventFromHttp, BACKEND_PLATFORMS_USERS_GET } from "../../config"


export default class PlatformUsers extends React.Component {
  state = {
    name: ``,
    surname: ``,
    email: ``,
    //role: ``,
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
    console.log("props id: ", this.props.platformId)
    /*
    const reply = PlatformUsers.setData(this.state)
    reply.then(({success}) => {
      if(success===true){
        console.log(success)
        alert('użytkownik "'+ this.state.name+ ' ' + this.state.surname+ '" został dodany')

      }
    })
    */
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
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="grid-item nazwisko border-bottom-none">
                <input
                  type="text"
                  name="surname"
                  placeholder="Wpisz..."
                  onChange={this.handleUpdate}
                />
              </div>
              <div className="grid-item email border-bottom-none">
                <input
                  type="text"
                  name="email"
                  placeholder="Wpisz..."
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

            <div className="grades-gained-container-grid-new-row">
              <div className="grid-item  dodaj border-bottom-none"></div>
              <div className="grid-item  imie border-bottom-none">Imie</div>
              <div className="grid-item nazwisko border-bottom-none">
                Nazwisko
              </div>
              <div className="grid-item  email  border-bottom-none">
                Adres E-mail
              </div>
              <div className="grid-item  rola border-bottom-none">Rola</div>
              <div className="grid-item  znak delete border-bottom-none">
                <input
                  type="submit"
                  className="delete"
                  value="X"
                  onClick={this.handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  static setData(data) {
    const eventName = getSocketEventFromHttp(`post`, BACKEND_PLATFORMS_USERS_GET.replace('id:number', this.props.platformId))

    if (!socket) return new Promise(res => res([]))
    else
      return new Promise(resolve => {
        socket.emit(eventName, data)
        socket.on(eventName, resolve)
        console.log(resolve)
      }).catch(error => console.error(`${eventName} :: ${error}`))
  }

}
