import React from "react"
import { navigate } from "@reach/router"
import socket from "../../services/webSocket.js"
import {
  getSocketEventFromHttp,
  BACKEND_PLATFORMS_USERS_GET,
  BACKEND_PLATFORMS_USERS_ADD,
} from "../../config"
import { getToken } from "../../services/auth"

export default class NotesGroup extends React.Component {
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
      <div className="group-users">
        <div class="add-user-notes-wrapp">
          <div class="box funkcja1"></div>
          <div class="box imie1">Imię</div>
          <div class="box nazwisko1">Nazwisko</div>
          <div class="box ocena1">Ocena</div>
          <div class="box opis1">Opis</div>
          <div class="box znak1"></div>

          <div class="add-user-notes-new-row">
            <div class="box funkcjaD">Dodaj</div>
            <div class="box imieD">
              <select>
                <option>1</option>
              </select>
            </div>
            <div class="box ocenaD">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div class="box opisD">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div class="box znakD">
              <input
                type="submit"
                className="dodaj"
                value="+"
                onClick={this.handleSubmit}
              />
            </div>
          </div>
        </div>

        <div class="filtre-user-notes-wrapp">
          <div class="box funkcja1"></div>
          <div class="box imie1">Imię</div>
          <div class="box nazwisko1">Nazwisko</div>
          <div class="box ocena1">Ocena</div>
          <div class="box opis1">Ocena końcowa</div>
          <div class="box znak1"></div>

          <div class="add-user-notes-new-row">
            <div class="box funkcjaF">Filtruj</div>
            <div class="box imieF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div class="box nazwiskoF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div class="box ocenaF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div class="box opisF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div class="box znakF"></div>
          </div>
        </div>

        <div class="list-user-notes-wrapp">
          <div class="box funkcjaLF"></div>
          <div class="box imieLF">Imie</div>
          <div class="box nazwiskoLF">Nazwisko</div>
          <div class="box ocenyLF">Oceny</div>
          <div class="box ocenaKoncowaLF">Ocena Końcowa</div>
          <div class="box znakLF"></div>

          <div class="list-user-notes-new-row">
            <div class="box funkcjaLR"></div>
            <div class="box imieLR">jakies</div>
            <div class="box nazwiskoLR">jakiesN</div>
            <div class="box ocenyLR">jakiesO</div>
            <div class="box ocenyKLR">jakiesOK</div>
            <div class="box znakLR">X</div>
          </div>
        </div>
      </div>
    </div>
  )
}
