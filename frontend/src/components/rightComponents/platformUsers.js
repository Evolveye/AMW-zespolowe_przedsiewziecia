import React from "react"
import { navigate } from "@reach/router"

export default class PlatformUsers extends React.Component {
  goBack = () => {
    navigate(-1)
  }

  handleSubmit = event => {
    event.preventDefault()
    alert("kliknales wyslij")
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
                <input type="text" name="filtre-name" placeholder="Wpisz..." />
              </div>
              <div className="grid-item nazwisko">
                <input type="text" name="filtre-surname" placeholder="Wpisz..." />
              </div>
              <div className="grid-item email">
                <input type="text" name="filtre-email" placeholder="Wpisz..." />
              </div>
              <div className="grid-item  rola">Rola</div>
              <div className="grid-item  znak border-bottom-none"></div>
            </div>

            <div className="grades-gained-container-grid-new-row">
              <div className="grid-item  dodaj border-bottom-none">Dodaj</div>
              <div className="grid-item  imie border-bottom-none">
                <input type="text" name="add-name" placeholder="Wpisz..." />
              </div>
              <div className="grid-item nazwisko border-bottom-none">
                <input type="text" name="add-surname" placeholder="Wpisz..." />
              </div>
              <div className="grid-item email border-bottom-none">
                <input type="text" name="add-email" placeholder="Wpisz..." />
              </div>
              <div className="grid-item  rola border-bottom-none">Rola</div>
              <div className="grid-item  znak border-bottom-none">
                <input type="submit" className="dodaj" value="+" onClick={this.handleSubmit}/>
              </div>
            </div>
          </div>
        </div>
        <dic classNameName="grid-users">
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
              <div className="grid-item nazwisko border-bottom-none">Nazwisko</div>
              <div className="grid-item  email  border-bottom-none">Adres E-mail</div>
              <div className="grid-item  rola border-bottom-none">Rola</div>
              <div className="grid-item  znak delete border-bottom-none">
              <input type="submit" className="delete" value="X" onClick={this.handleSubmit}/>
              </div>
            </div>
          </div>
        </dic>
      </div>
    </div>
  )
}

/*

<div class="filtre-add-user-wrapp">
            <div class="grid-item  empty-filtre-user"></div>
            <div class="grid-item  imie">Imię</div>
            <div class="grid-item  nazwisko">Nazwisko</div>
            <div class="grid-item  rola">Rola</div>
            <div class="grid-item  znak"></div>

            <div class="grades-gained-container-grid-new-row">
              <div class="grid-item  filtruj">Filtruj</div>
              <div class="grid-item  imie">Imie</div>
              <div class="grid-item nazwisko">Nazwisko</div>
              <div class="grid-item  rola">Rola</div>
              <div class="grid-item  znak"></div>
            </div>

            <div class="grades-gained-container-grid-new-row">
              <div class="grid-item  dodaj border-bottom-none">Dodaj</div>
              <div class="grid-item  imie border-bottom-none">Imie</div>
              <div class="grid-item nazwisko border-bottom-none">Nazwisko</div>
              <div class="grid-item  rola border-bottom-none">Rola</div>
              <div class="grid-item  znak border-bottom-none">+</div>
            </div>
          </div>
          */
