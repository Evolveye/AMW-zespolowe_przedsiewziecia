import React from "react"
import { Link } from "gatsby"

import { DEBUG } from "../config.js"

import classes from "./userNav.module.css"

const defaultAvatarSrc = `${
  DEBUG ? `http://localhost:3000` : ``
}/media/image/avatarDefault.jpg`

export default ({ className }) => (
  <nav className={className}>
    <div className={classes.avatarWrapper}>
      <img src={defaultAvatarSrc} alt="User avatar" />
    </div>

    <ul className={classes.list}>
      <li className={classes.item}>
        <Link to="/user/me">Profil</Link>
      </li>
      <li className={classes.item}>
        <Link to="/user/settings">Ustawienia</Link>
      </li>
      <li className={classes.item}>
        <Link to="/user/notes">Zebrane oceny</Link>
      </li>
      <li className={classes.item}>
        <Link to="/user/logout">Wyloguj</Link>
      </li>
    </ul>

    <hr />

    <ul className={classes.list}>
      <li className={classes.item}>
        <Link to="/">Strona główna</Link>
      </li>
    </ul>
  </nav>
)
