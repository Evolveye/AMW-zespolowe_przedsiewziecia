import React from "react"

import Layout from "../components/layout.js"
import Sygnet from "../models/sygnet.js"

import classes from "./index.module.css"

export default () => (
  <>
    <Layout className={classes.main}>
      <Sygnet className={classes.sygnet} size={200} />
      <h1 className={classes.logotype}>Sprawdź email!</h1>
      <small className={classes.brand}>Link atywacyjny został wysłany na podany adres email</small>
    </Layout>
    {/* <LeftContainer />
    <div className="hr-vertical"></div>
    <RightContainerMain /> */}
  </>
)
