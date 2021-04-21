import React from "react"

import Layout from "./base.js"
import GroupsList from "../containers/groupsList.js"

import classes from "./platform.module.css"
import { Authorized } from "../utils/auth.js"

export default ({ children, title }) => (
  <Authorized>
    <Layout title={title}>
      <main className={classes.main}>
        <GroupsList className={classes.groups} />
        <div className={classes.content}>
          {children}
        </div>
      </main>
    </Layout>
  </Authorized>
)
