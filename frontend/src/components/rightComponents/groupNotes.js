import React from "react"
import { navigate } from "@reach/router"
//import socket from "../../services/webSocket.js"
//import {getSocketEventFromHttp} from "../../config"
import {
  BACKEND_PLATFORMS_GROUP_USERS_GET,
  BACKEND_PLATFORMS_GROUPS_USER_NOTES_ADD,
  BACKEND_PLATFORMS_GROUPS_USER_NOTES_GET,
  BACKEND_PLATFORMS_GROUPS_USER_NOTES_DEL,
} from "../../config"
import { getToken } from "../../services/auth"

export default class NotesGroup extends React.Component {
  Note = class Note extends React.Component {
    flooredNotesColors = {
      // 5: `#5f5`,
      // 4: `#33f`,
      // 3: `#33f`,
      // 2: `red`,
      default: `#555`,
    }

    /** @type {React.CSSProperties} */
    bigNoteStyle = {
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
      margin: `0 auto`,
      width: `75px`,
      height: `127px`,
      borderRadius: `10px`,
      color: `white`,
      fontWeight: `bold`,
      fontSize: `35px`,
    }

    h3Style = {
      marginTop: `40px`,
      marginBottom: 0,
    }

    /** @type {React.CSSProperties} */
    noteStyle = {
      display: `block`,
      padding: `3px 4px`,
      margin: `4px`,
      borderRadius: `2px`,
      color: `white`,
      fontWeight: `bold`,
    }

    deleteButtonStyle = {
      backgroundColor: `red`,
      border: `unset`,
      fontWeight: `bold`,
    }

    state = {
      hover: false
    }

    handleDelete = async noteId => {
      const data = await NotesGroup.delDataUserNote(noteId)
      if(data.error){
        alert("nie udało się usunąć oceny")
      }else{
        alert("ocena została usunięta")
      }
    }

    handleClick = () => {
      this.setState( { clicked:true } )
    }

    handleHoverStart = () => {
      const { note } = this.props
      const backgroundColor = Math.floor( note.value ) in this.flooredNotesColors
        ? this.flooredNotesColors[ note.value ]
        : this.flooredNotesColors.default

      this.setState( { hover:true } )

      this.props.detailsHtmlSetter( <>
        <h2>Szczegóły</h2>

        <div style={{ backgroundColor, ...this.bigNoteStyle }}>{note.value}</div>

        <h3 style={this.h3Style}>Opis</h3>
        {note.description}

        <h3 style={this.h3Style}>Wystawiajacy</h3>
        {note.lecturer.name} {note.lecturer.surname}

        <div style={{ marginTop:`40px` }}>
          <button style={this.deleteButtonStyle} onClick={() => this.handleDelete( note.id )}>Usuń ocenę</button>
        </div>
      </> )
    }
    handleHoverEnd = () => {
      if (!this.state.clicked) this.props.detailsHtmlSetter( <></> )

      this.setState( { hover:false, clicked:false } )
    }

    render = () => {
      const { note } = this.props
      const { active } = this.state
      const backgroundColor = note.value in this.flooredNotesColors
        ? this.flooredNotesColors[ note.value ]
        : this.flooredNotesColors.default

      return <span
        style={{ backgroundColor, ...this.noteStyle }}
        onPointerEnter={this.handleHoverStart}
        onPointerLeave={this.handleHoverEnd}
        onClick={this.handleClick}
      >
        {note.value}
      </span>
    }
  }

  state = {
    userListGroup: [],
    notesList: [],
    value: ``,
    description: ``,
    userId: ``,
    detailsJsx: <></>
  }
  data = {
    grades: [],
    average: "",
  }

  updateDetailsColumn = jsx => {
    this.setState( { detailsJsx:jsx } )
  }

  goBack = () => {
    navigate(-1)
  }

  showProps() {
    console.log("group id: ", this.props.groupId)
  }

  handleUpdate = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log("usersIds: ", this.state)
    const { notesList, userListGroup, ...formData } = this.state
    const reply = NotesGroup.setData(formData, this.props.groupId)
    reply.then(data => {
      if (data.error) {
        alert("Wystąpił błąd, ocena nie została dodana")
        return null
      }
      const { note } = data
      console.log(note)
      alert("ocena została dodana")
    })
  }

  componentDidMount() {
    NotesGroup.getDataGroupUsers(this.props.groupId).then(({ users }) => {
      if (users.error) {
        alert("Najpierw dodaj użytkowników do grupy")
        return null
      }
      return users.map((user, index) => (
        <option
          key={index}
          value={user.id}
        >{`${user.name} ${user.surname}`}</option>
      ))
    }).then(userListGroup => this.setState({ userListGroup }))

    NotesGroup.getDataUsersNotes(this.props.groupId).then(({ notes }) => {
      const userData = new Map()

      notes.forEach(note => {
        const userId = note.user.id

        if (!userData.has(userId))
          userData.set(userId, {
            user: note.user,
            notes: [],
          })

        userData.get(userId).notes.push(note)
      })

      return [...userData.values()].map(userData => {
        const {user} = userData
        const sum = userData.notes.reduce(
          (sum, { value }) => sum + Number(value),
          0
        )
        const notesElements = userData.notes.map((note) => <this.Note
          key={note.id}
          note={note}
          detailsHtmlSetter={this.updateDetailsColumn}
        /> )

        return (
          <div className="list-user-notes-new-row" key={user.id}>
            <div className="box funkcjaLR"></div>
            <div className="box imieLR">{user.name}</div>
            <div className="box nazwiskoLR">{user.surname}</div>
            <div className="box ocenyLR" style={{ display:`flex`, padding:`10px` }}>{notesElements}</div>
            <div className="box ocenyKLR">{(sum / notesElements.length).toFixed( 2 )}</div>
            <div className="box znakLR">X</div>
          </div>
        )
      })
    }).then(notesList => this.setState({ notesList }))
  }

  render = () => (
    <div className="right-container-settings">
      <div className="notes-left" ref={this.leftColumns}>{this.state.detailsJsx}</div>
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
        <div className="add-user-notes-wrapp">
          <div className="box funkcja1"></div>
          <div className="box imie1">Imię</div>
          <div className="box nazwisko1">Nazwisko</div>
          <div className="box ocena1">Ocena</div>
          <div className="box opis1">Opis</div>
          <div className="box znak1"></div>

          <div className="add-user-notes-new-row">
            <div className="box funkcjaD">Dodaj</div>
            <div className="box imieD">
              <select name="userId" onBlur={this.handleUpdate}>
                <option>wybierz</option>
                {this.state.userListGroup}
              </select>
            </div>
            <div className="box ocenaD">
              <input
                type="text"
                name="value"
                onChange={this.handleUpdate}
                placeholder="Wpisz..."
              />
            </div>
            <div className="box opisD">
              <input
                type="text"
                name="description"
                onChange={this.handleUpdate}
                placeholder="Wpisz..."
              />
            </div>
            <div className="box znakD">
              <input
                type="submit"
                className="dodaj"
                value="+"
                onClick={this.handleSubmit}
              />
            </div>
          </div>
        </div>

        <div className="filtre-user-notes-wrapp">
          <div className="box funkcja1"></div>
          <div className="box imie1">Imię</div>
          <div className="box nazwisko1">Nazwisko</div>
          <div className="box ocena1">Ocena</div>
          <div className="box opis1">Ocena końcowa</div>
          <div className="box znak1"></div>

          <div className="add-user-notes-new-row">
            <div className="box funkcjaF">Filtruj</div>
            <div className="box imieF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div className="box nazwiskoF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div className="box ocenaF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div className="box opisF">
              <input type="text" name="" placeholder="Wpisz..." />
            </div>
            <div className="box znakF"></div>
          </div>
        </div>

        <div className="list-user-notes-wrapp">
          <div className="box funkcjaLF"></div>
          <div className="box imieLF">Imie</div>
          <div className="box nazwiskoLF">Nazwisko</div>
          <div className="box ocenyLF">Oceny</div>
          <div className="box ocenaKoncowaLF">Ocena Końcowa</div>
          <div className="box znakLF"></div>
          {this.state.notesList}
        </div>
      </div>
    </div>
  )

  static getDataGroupUsers(id) {
    console.log(
      "adres: ",
      BACKEND_PLATFORMS_GROUP_USERS_GET.replace(":groupId", id)
    )
    return fetch(BACKEND_PLATFORMS_GROUP_USERS_GET.replace(":groupId", id), {
      method: `GET`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }

  static setData(data, id) {
    console.log("to co wysyłam: ", data)
    console.log(
      "adres wysłania oceny: ",
      BACKEND_PLATFORMS_GROUPS_USER_NOTES_ADD.replace(":groupId", id)
    )
    return fetch(
      BACKEND_PLATFORMS_GROUPS_USER_NOTES_ADD.replace(":groupId", id),
      {
        method: `POST`,
        headers: {
          "Content-Type": "application/json",
          Authentication: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      }
    ).then(res => res.json())
  }

  static getDataUsersNotes(id) {
    console.log(
      "adres pobrania ocen użytkowników z grupy: ",
      BACKEND_PLATFORMS_GROUPS_USER_NOTES_GET.replace(":groupId", id)
    )
    return fetch(
      BACKEND_PLATFORMS_GROUPS_USER_NOTES_GET.replace(":groupId", id),
      {
        method: `GET`,
        headers: {
          Authentication: `Bearer ${getToken()}`,
        },
      }
    ).then(res => res.json())
  }

  static delDataUserNote(id){
    return fetch(BACKEND_PLATFORMS_GROUPS_USER_NOTES_DEL.replace(':noteId', id),{
      method: `DELETE`,
      headers: {
        "Authentication":`Bearer ${getToken()}`
      },
    }).then( res => res.json() )
  }
}
