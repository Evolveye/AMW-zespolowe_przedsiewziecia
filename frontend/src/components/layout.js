import React from "react"

import SEO from "./seo.js"
import MainNav from "./mainNav.js"

import "../utils/sanitize.css"
import classes from "./layout.module.css"

export default ({ className=``, children }) => (
  <div className={classes.root}>
    <SEO title="Strona główna" />

    <article className={classes.leftColumn}>
      <MainNav className={classes.nav}/>
      <footer className={classes.footer}>&copy; Copyright {new Date().getUTCFullYear()}</footer>
    </article>

    <main className={`${classes.main} ${className}`}>{children}</main>
  </div>
)
