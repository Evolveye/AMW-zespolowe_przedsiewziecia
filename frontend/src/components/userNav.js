import React from "react"
import { Link } from "gatsby"

import { DEBUG, BACKEND_PLATFORMS_URL } from "../config.js"
import { getToken } from "../utils/auth.js"
import PlatformAccessor, { PlatformAdder } from "../models/platformAccessor.js"

import classes from "./userNav.module.css"

const defaultAvatarSrc = `${
  DEBUG ? `http://localhost:3000` : ``
}/media/image/avatarDefault.jpg`

export default class UserNav extends React.Component {
  state = {
    platformsAccessors: [],
  }

  componentDidMount() {
    fetch(BACKEND_PLATFORMS_URL, {
      method: `GET`,
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(({ error, platforms }) => {
        const platformsAccessors = error
          ? []
          : platforms.map(platform => (
              <PlatformAccessor key={platform.id} platform={platform} />
            ))

        platformsAccessors.push( <PlatformAdder key="platform adder" />)

        this.setState({ platformsAccessors })
      })
  }

  render = () => (
    <nav className={this.props.className}>
      <div className={classes.avatarWrapper}>
        <img src={defaultAvatarSrc} alt="User avatar" />
      </div>

      <ul className={classes.list}>
          {[
            { urn: `me`, name: `Profil` },
            { urn: `settings`, name: `Ustawienia` },
            { urn: `notes`, name: `Zebrane oceny` },
            { urn: `logout`, name: `Wyloguj` },
          ].map(({ urn, name }) => (
            <li key={urn} className="list-item">
              <Link to={`/user/${urn}`}>{name}</Link>
            </li>
          ))}
      </ul>

      <hr />

      <ul className={classes.list}>
        <li className={classes.item}>
          <Link to="/">Strona główna</Link>
        </li>
      </ul>

      {this.state.platformsAccessors.length && (
        <>
          <hr />
          {this.state.platformsAccessors}
        </>
      )}
    </nav>
  )
}