import React from "react"

import { navigate } from "@reach/router"

export default class PlatformGroups extends React.Component {
  goBack = () => {
    navigate(-1)
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
          <div class="filtre-add-group-wrapp">
            <div class="grid-item  empty-filtre-user"></div>
            <div class="grid-item  imie">Nazwa</div>
            <div class="grid-item  nazwisko rola">Prowadzący</div>
            <div class="grid-item  znak"></div>

            <div class="grades-gained-container-grid-new-row">
              <div class="grid-item  filtruj">Filtruj</div>
              <div class="grid-item  imie"></div>
              <div class="grid-item nazwisko rola"></div>
              <div class="grid-item  znak"></div>
            </div>

            <div class="grades-gained-container-grid-new-row">
              <div class="grid-item  dodaj border-bottom-none">Dodaj</div>
              <div class="grid-item  imie border-bottom-none"></div>
              <div class="grid-item nazwisko border-bottom-none rola"></div>
              <div class="grid-item  znak border-bottom-none">+</div>
            </div>
          </div>
        </div>
        <dic className="grid-users">
          <div class="filtre-add-group-wrapp">
            <div class="grid-item  empty-filtre-user"></div>
            <div class="grid-item  imie">Nazwa</div>
            <div class="grid-item  nazwisko rola">Prowadzący</div>
            <div class="grid-item  znak"></div>

            <div class="grades-gained-container-grid-new-row">
              <div class="grid-item  dodaj border-bottom-none"></div>
              <div class="grid-item  imie border-bottom-none"></div>
              <div class="grid-item nazwisko rola border-bottom-none"></div>
              <div class="grid-item  znak delete border-bottom-none">X</div>
            </div>
          </div>
        </dic>
      </div>
    </div>
  )
}
