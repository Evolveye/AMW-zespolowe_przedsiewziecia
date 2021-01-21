import React from "react"
import { Link } from "gatsby"

import classes from "./mainNav.module.css"

export default ({ className }) => (
  <nav className={className}>
    <ul className={classes.list}>
      <li><Link className={classes.item} to="/">Strona główna</Link></li>
      <li><Link className={classes.item} to="/login">Zaloguj się</Link></li>
      <li><Link className={classes.item} to="/register">Zarejestruj się</Link></li>
    </ul>
  </nav>
)
