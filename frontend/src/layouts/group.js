import React from "react"

import Layout from "./base.js"
import PlatformNav from "../containers/platformNav.js"
import GroupNav from "../containers/groupNav.js"

import classes from "./platform.module.css"
import { Authorized } from "../utils/auth.js"

export default ({ className = ``, children, title, showMeets }) => (
  <Authorized>
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
  </Authorized>
)
