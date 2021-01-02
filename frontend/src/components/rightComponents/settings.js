import React from "react" 
import { getUser } from "../../services/auth"



export default class Settings extends React.Component {
  user = getUser()

  handleRef = ref => {
    this.user.then( ({ email, name, surname, login, avatarSrc }) => {
      ref.querySelector( `[name="login"]` ).placeholder = login
      ref.querySelector( `[name="email"]` ).placeholder = email
      ref.querySelector( `[name="name"]` ).placeholder = name
      ref.querySelector( `[name="surname"]` ).placeholder = surname
      // ref.querySelector( `.avatar-image` ).src = avatarSrc
    } )
  }

  render = () => <div className="right-container-settings" ref={this.handleRef}>
    <div className="settings-header">
      <div className="avatar-container">
        <img
          className="avatar-image"
          src="https://upload.wikimedia.org/wikipedia/commons/5/55/Marcin_Najman_2014.jpg"
          alt=""
        />
        <span className="avatar-container-text">
          Kliknij aby zmienić profilowe
        </span>
      </div>
    </div>

    <div className="hr-horizontal"></div>
    <div className="settings-form">
      <form>
        <div className="settings-form-element">
          <div className="settings-form-element-label">Login</div>
          <div className="settings-form-element-input">
            <input type="text" name="login" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label">E-mail</div>
          <div className="settings-form-element-input">
            <input type="email" name="email" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label">Imię</div>
          <div className="settings-form-element-input">
            <input type="text" name="name" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label">Nazwisko</div>
          <div className="settings-form-element-input">
            <input type="text" name="surname" />
          </div>
        </div>

        <div className="hr-horizontal"></div>

        <div className="settings-form-element">
          <div className="settings-form-element-label">Motyw kolorystyczny</div>
          <div className="settings-form-element-input">
            <input type="text" name="theme" disabled />
          </div>
        </div>

        <div className="hr-horizontal"></div>

        <div className="settings-form-element">
          <div className="settings-form-element-label">Powiadomienia email</div>
          <div className="settings-form-element-input">
            <input type="text" name="notifications" disabled />
          </div>
        </div>

        <div className="hr-horizontal"></div>

        <div className="settings-form-element">
          <div className="settings-form-element-label">
            Login konta do scalenia
          </div>
          <div className="settings-form-element-input">
            <input type="text" name="loginMerge" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label"></div>
          <div className="settings-form-element-input settings-form-element-button">
            <input
              type="button"
              name="loginMergeRequest"
              value="Wyślij żądanie scalenia"
            />
          </div>
        </div>

        <div className="hr-horizontal"></div>

        <div className="settings-form-element">
          <div className="settings-form-element-label">Nowe hasło</div>
          <div className="settings-form-element-input">
            <input type="password" name="password" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label">Powtórz nowe hasło</div>
          <div className="settings-form-element-input">
            <input type="password" name="repassword" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label">
            Potwierdź starym hasłem
          </div>
          <div className="settings-form-element-input">
            <input type="password" name="oldpassword" />
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label"></div>
          <div className="settings-form-element-input settings-form-element-button">
            <input type="button" name="loginMergeRequest" value="Zatwierdź" />
          </div>
        </div>
      </form>
    </div>
  </div>
}
