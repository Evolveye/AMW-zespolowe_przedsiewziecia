import React from "react"
import { Link } from "gatsby"

import classes from "./mainNav.module.css"

export default ({ className }) => (
  <nav className={className}>
    <ul className={classes.list}>
      <li className={classes.item}><Link to="/">Strona główna</Link></li>
      <li className={classes.item}><Link to="/login">Zaloguj się</Link></li>
      <li className={classes.item}><Link to="/register">Zarejestruj się</Link></li>
    </ul>
  </nav>
)
