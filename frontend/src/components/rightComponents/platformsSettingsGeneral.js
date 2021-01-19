import React from "react" 
import { navigate } from "@reach/router"
import { BACKEND_PLATFORMS_URL_DEL } from "../../config" 
import { getToken } from "../../services/auth"

export default class PatformsSettingsGeneral extends React.Component {
  goBack = () => {
    navigate(-1)
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log("props id: ", this.props.platformId)
    const reply = PatformsSettingsGeneral.delData(this.props.platformId) 
    reply.then((answer) => {
      if (!answer.error) {
        console.log(answer)
        alert('platforma została usunięta') 
        navigate(`/users/me`)
      } else {
        //błąd z serwera
        alert("wystąpił błąd, platforma nie została usunięta") 
      }
    })
  }

  render = () => (
    <div className="right-container-settings">
      <div className="settings-header">
        <div className="avatar-container">
          <div className="platform-adding">
            <div className="platform-adding-logo"></div>
          </div>
        </div>
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

      <div className="hr-horizontal"></div>
      <div className="settings-form">
        <form>
          <div className="settings-form-element">
            <div className="settings-form-element-label">Nazwa</div>
            <div className="settings-form-element-input">
              <input type="text" name="name" />
            </div>
          </div>
          <div className="settings-form-element">
            <div className="settings-form-element-label">Opis</div>
            <div className="settings-form-element-input">
              <textarea type="text" name="description" />
            </div>
          </div>

          <div className="settings-form-element">
            <div className="settings-form-element-label">
              Potwierdź logowanie hasłem
            </div>
            <div className="settings-form-element-input">
              <input type="password" name="password" />
            </div>
          </div>
          <div className="settings-form-element">
            <div className="settings-form-element-label"></div>
            <div className="settings-form-element-input settings-form-element-button">
              <input type="submit" name="loginMergeRequest" value="Skasuj" onClick={this.handleSubmit}/>
            </div>
          </div>
        </form>
      </div>
    </div>
  )


  static delData(id){ 
    console.log("adres usuwania: ", BACKEND_PLATFORMS_URL_DEL.replace('id:number', id ))
    return fetch( BACKEND_PLATFORMS_URL_DEL.replace('id:number', id ), {
      method: `DELETE`,
      headers: { 
        "Authentication":`Bearer ${getToken()}`
      }, 
    } ).then( res => res.json() )
  }
  /*
  static setData(data,id) {
    const eventName = getSocketEventFromHttp(`delete`, BACKEND_PLATFORMS_URL_DEL.replace('id:number', id ))

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
