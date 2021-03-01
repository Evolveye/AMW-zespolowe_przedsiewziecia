import React from "react"

import URLS from "../../utils/urls.js"

import { AuthorizedContent, getToken } from "../../utils/auth.js"
import Layout from "../../components/layout.js"
import Note from "../../models/note.js"

import classes from "./user.module.css"

export default class Notes extends React.Component {
  state = {
    notesTable: null,
    platformsList: [],
    noteDetails: null,
    noteDetailsHover: null,
  }

  componentDidMount() {
    fetch(URLS.GROUP_NOTES_GET, {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(({ code, error, data, userId }) => {
        if (error) {
          return console.error({ code, error })
        }

        const platformsList = data.map(({ platform, groups }) => (
          <button key={platform.id} onClick={() => this.showNotesTable(groups, userId)}>
            {platform.name}
          </button>
        ))

        this.setState({ platformsList })
      })
  }

  showNotesTable = (groups, myId) => {
    const myNotes = groups.filter( ({ notes }) => {
      for (const { user } of notes)
        if (user.id !== myId) return false

      return true
    } )
    // const studentsNotes = groups.filter( ({ notes }) => {
    //   for (const { lecturer } of notes)
    //     if (lecturer.id != myId) return false

    //   return true
    // } )

    this.setState({
      notesTable: (
        <table className="table">
          <thead className="thead">
            <tr>
              <td>Nazwa grupy</td>
              <td>Główny prowadzacy</td>
              <td>Oceny cząstkowe</td>
              <td>Średnia końcowa</td>
            </tr>
          </thead>
          <tbody>
            {myNotes.map(({ group, notes }) => {
              const average = notes.length === 0 ? ` - ` :
                notes.reduce((sum, { value }) => sum + Number(value), 0) /
                notes.length

              const notesElements = notes.map(note => (
                <Note
                  key={note.id}
                  className={classes.note}
                  note={note}
                  detailsSetter={this.setDetails}
                />
              ))

              return (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>
                    {group.lecturer.name} {group.lecturer.surname}
                  </td>
                  <td>{notesElements}</td>
                  <td>{average}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ),
    })
  }

  setDetails = (jsx, hover = false) => {
    this.setState({
      [hover ? `noteDetailsHover` : `noteDetails`]: jsx,
    })
  }

  render = () => (
    <AuthorizedContent>
      <Layout className="main_wrapper-splited">
        <article className={classes.leftColumn}>
          <section className={classes.noteDetails}>
            <h2>Szczegóły oceny</h2>
            {this.state.noteDetailsHover || this.state.noteDetails || (
              <p className={classes.noNote}>Brak aktywnej oceny</p>
            )}
          </section>

          <section className={classes.platforms}>
            <h2>Wybierz platformę</h2>
            {this.state.platformsList || (
              <p className={classes.empty}>
                Wygląda na to, że nie należysz do żadnej grupy, z której mógłyś
                zdobywać oceny
              </p>
            )}
          </section>
        </article>

        <article className={classes.rightColumn}>
          <h1>Twoje oceny</h1>
          {this.state.notesTable || (
            <div className={classes.noTable}>
              Wybierz platformę z lewej kolumny, aby zobaczyć zdobyte na niej
              oceny
            </div>
          )}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
