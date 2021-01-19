import React from "react"
import socket from "../../services/webSocket.js"
import { getSocketEventFromHttp, BACKEND_PLATFORMS_URL } from "../../config"
import { navigate } from "gatsby"
import { getToken } from "../../services/auth"
import { isBrowser } from "../../services/auth"

export default class AddPlatform extends React.Component {
  state = {
    name: "",
    description: "",
    //password: "",
  }

  handleUpdate = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log("kliknąłeś wyślij")
    console.log("wysyłane dane: ", this.state)
    const reply = AddPlatform.setData(this.state)
    reply.then(answer => {
      if (!answer.error) {
        console.log(answer)
        alert('platforma "' + this.state.name + '" została dodana')
        navigate(`/users/me`)
      } else {
        //błąd z serwera
        alert("wystąpił błąd, platforma nie została dodana")
        if (isBrowser) {
          document.getElementById("addPlatformForm").reset()
          this.setState({ name: "", description: "" })
        }
      }
    })
  }
  render = () => (
    <div className="right-container-settings">
      <div className="settings-header">
        <div className="avatar-container">
          <div className="platform-adding">
            <div
              className="platform-adding-logo"
              title={this.state.description}
            >
              {this.state.name.substring(0, 5)}
            </div>
          </div>
        </div>
      </div>

      <div className="hr-horizontal"></div>
      <div className="settings-form">
        <form method="post" onSubmit={this.handleSubmit} id="addPlatformForm">
          <div className="settings-form-element">
            <div className="settings-form-element-label">Nazwa</div>
            <div className="settings-form-element-input">
              <input type="json" name="name" onChange={this.handleUpdate} />
            </div>
          </div>
          <div className="settings-form-element">
            <div className="settings-form-element-label">Opis</div>
            <div className="settings-form-element-input">
              <textarea
                type="json"
                name="description"
                onChange={this.handleUpdate}
              />
            </div>
          </div>

          {/* <div className="settings-form-element">
            <div className="settings-form-element-label">
              Potwierdź utworzenie hasłem
            </div>
            <div className="settings-form-element-input">
              <input
                type="password"
                name="password"
                onChange={this.handleUpdate}
              />
            </div>
          </div> */}
          <div className="settings-form-element">
            <div className="settings-form-element-label"></div>
            <div className="settings-form-element-input settings-form-element-button">
              <input type="submit" value="Utwórz" />
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  static setData(data) {
    return fetch(BACKEND_PLATFORMS_URL, {
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
    const eventName = getSocketEventFromHttp(`post`, BACKEND_PLATFORMS_URL)

    if (!socket) return new Promise(res => res([]))
    else
      return new Promise(resolve => {
        socket.emit(eventName, data)
        socket.on(eventName, resolve)
        console.log(resolve)
      }).catch(error => console.error(`${eventName} :: ${error}`))
  }
  */
}
