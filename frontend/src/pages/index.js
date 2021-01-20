import React from "react"

import Layout from "../components/layout.js"
import MainNav from "../components/mainNav.js"

import classes from "./index.module.css"

export default () => (
  <>
    <Layout className={classes.main} nav={<MainNav />}>
      <div className={classes.sygnet}></div>
      <h1 className={classes.logotype}>Platforma edukacyjna</h1>
      <small className={classes.brand}>Edukacja, szkolenia, spotkania, kursy</small>
    </Layout>
    {/* <LeftContainer />
    <div className="hr-vertical"></div>
    <RightContainerMain /> */}
  </>
)
