import React from "react"

import SEO from "./seo.js"
import MainNav from "./mainNav.js"
import UserNav from "./userNav.js"

import "../utils/sanitize.css"
import classes from "./layout.module.css"
import { isLoggedIn } from "../utils/auth.js"

export default ({ className = ``, children }) => (
  <div className={classes.root}>
    <SEO title="Strona główna" />

    <article className={classes.leftColumn}>
      {isLoggedIn() ? (
        <UserNav className={classes.nav} />
      ) : (
        <MainNav className={classes.nav} />
      )}

      <footer className={classes.footer}>
        &copy; Copyright {new Date().getUTCFullYear()}
      </footer>
    </article>

    <main className={`${classes.main} ${className}`}>{children}</main>
  </div>
)
