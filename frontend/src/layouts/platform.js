import React from "react"

import Layout from "./base.js"
import GroupNav from "../components/groupNav.js"

import classes from "./platform.module.css"

export default ({ className=``, children, title, showMeets }) => (
  <Layout
    className={classes.root} title={title}
    logged
  >
    <GroupNav className={classes.groupNav} showMeets={showMeets} />

    <main className={`${classes.main} ${className}`}>
      {children}
    </main>
  </Layout>
)
