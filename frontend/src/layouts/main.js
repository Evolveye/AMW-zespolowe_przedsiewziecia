import React from "react"

import Layout from "./base.js"

import classes from "./main.module.css"

export default ({ className = ``, title, children }) => (
  <Layout className={classes.root} title={title}>
    <main className={`${classes.main} ${className}`}>
      {children}
    </main>

    <footer className={`${classes.footer} is-centered`}>
      &copy; Copyright
      {` `}
      {new Date().getUTCFullYear()}
    </footer>
  </Layout>
)
