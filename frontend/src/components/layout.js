import React from "react"

import SEO from "./seo.js"

import "../utils/sanitize.css"
import classes from "./layout.module.css"

export default ({ className=``, nav, children }) => (
  <div className={classes.root}>
    <SEO title="Strona główna" />

    <nav className={classes.nav}>{nav}</nav>

    <main className={`${classes.main} ${className}`}>{children}</main>
  </div>
)
