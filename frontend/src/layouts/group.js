import React from "react"

import Layout from "./base.js"
import PlatformNav from "../containers/platformNav.js"
import GroupNav from "../containers/groupNav.js.js.js"

import classes from "./platform.module.css"

export default ({ className = ``, children, title, showMeets }) => (
  <Layout
    className={classes.root} title={title}
    logged
  >
    <PlatformNav className={classes.groupNav} showMeets={showMeets} />
    <GroupNav className={classes.groupNav} showMeets={showMeets} />

    <main className={`${classes.main} ${className}`}>
      {children}
    </main>
  </Layout>
)
