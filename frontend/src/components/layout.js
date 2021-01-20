import React from "react"

import SEO from "./seo.js"
import MainNav from "./mainNav.js"

import "../utils/sanitize.css"
import classes from "./layout.module.css"

export default ({ className=``, nav, children }) => (
  <div className={classes.root}>
    <SEO title="Strona główna" />

    <MainNav className={classes.nav}/>

    <main className={`${classes.main} ${className}`}>{children}</main>
  </div>
)
