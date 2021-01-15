import React from "react"

import { navigate } from "@reach/router"

export default class PatformsSettingsGeneral extends React.Component {
  goBack = () => {
    navigate(-1)
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
              <input type="button" name="loginMergeRequest" value="Skasuj" />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
