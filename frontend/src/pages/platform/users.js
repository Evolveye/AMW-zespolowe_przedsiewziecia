import React from "react"

import Layout from "../../components/platformLayout.js"
import {
  BACKEND_PLATFORMS_USERS_DEL,
  BACKEND_PLATFORMS_USERS_GET,
  BACKEND_PLATFORMS_USERS_POST,
} from "../../config.js"
import { getToken } from "../../utils/auth.js"
import ERRORS from "../../utils/errorList.js"

import classes from "./platform.module.css"

export default class PlatformUsers extends React.Component {
  state = {
    error: ``,
    usersList: [],
    newUserName: ``,
    newUserSurname: ``,
    newUserEmail: ``,
    newUserRole: ``,
  }

  constructor(props) {
    super(props)

    const query = new URLSearchParams(window.location.search)
    this.platformId = query.get(`platformId`)
  }

  deleteUser = userId => {
    fetch(
      BACKEND_PLATFORMS_USERS_DEL.replace(
        `:platformId`,
        this.platformId
      ).replace(`:userId`, userId),
      {
        method: `DELETE`,
        headers: { Authentication: `Bearer ${getToken()}` },
      }
    )
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log(data, this.state )
          this.setState(old => ({
            usersList: old.usersList.filter(({ key }) => key !== userId),
          }))
        }
      })
  }

  createUser = () => {
    fetch(
      BACKEND_PLATFORMS_USERS_POST.replace(`:platformId`, this.platformId),
      {
        method: `POST`,
        headers: {
          Authentication: `Bearer ${getToken()}`,
          "Content-Type": `application/json`,
        },
        body: JSON.stringify({
          name: this.state.newUserName,
          surname: this.state.newUserSurname,
          email: this.state.newUserEmail,
          role: this.state.newUserRole,
        }),
      }
    )
      .then(res => res.json())
      .then(({ error, code, user }) => {
        if (error) return this.setState({ error: ERRORS[code] })

        this.addUserToTable(user)
      })
  }

  updateNewUserField = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  addUserToTable = ({ id, name, surname, email, role = `student` }) => {
    const newRow = (
      <tr key={id}>
        <td className={classes.field}>{name}</td>
        <td className={classes.field}>{surname}</td>
        <td className={classes.field}>{email}</td>
        <td className={classes.field}>{role}</td>
        <td className={classes.field}>
          <button type="button" onClick={() => this.deleteUser(id)}>
            Usuń z platformy
          </button>
        </td>
      </tr>
    )

    this.setState(old => ({ usersList: [newRow, ...old.usersList] }))
  }

  componentDidMount() {
    fetch(BACKEND_PLATFORMS_USERS_GET.replace(`:platformId`, this.platformId), {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(({ error, users }) => {
        if (error) {
          return console.error(error)
        }

        const usersList = users.forEach(this.addUserToTable)
      })
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Platforma edukacyjna</h1>

      <article className={classes.main}>
        <table className="table">
          <thead className="thead">
            <tr>
              <td>Imię</td>
              <td>Nazwisko</td>
              <td>Email</td>
              <td>Rola</td>
              <td>Akcje</td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="inputCell">
                <input onChange={this.updateNewUserField} name="newUserName" />
              </td>
              <td className="inputCell">
                <input
                  onChange={this.updateNewUserField}
                  name="newUserSurname"
                />
              </td>
              <td className="inputCell">
                <input onChange={this.updateNewUserField} name="newUserEmail" />
              </td>
              <td className="inputCell">
                <input onChange={this.updateNewUserField} name="newUserRole" />
              </td>
              <td>
                <button type="button" onClick={this.createUser}>
                  Dodaj do platformy
                </button>
              </td>
            </tr>

            <tr className="emptyRow">
              <td colSpan="5">{this.state.error}</td>
            </tr>
            <tr className="emptyRow" />

            {this.state.usersList}
          </tbody>
        </table>
      </article>
    </Layout>
  )
}
