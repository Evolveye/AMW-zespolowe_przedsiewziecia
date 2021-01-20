import React from "react"

import Layout from "../components/layout.js"
import Form from "../components/form.js"

import classes from "./login.module.css"

const fields = [
  { name:`Login` },
  { name:`Password`, type:`password` },
]

export default () => (
  <Layout className={classes.formWrapper}>
    <Form fields={fields} title="Platforma edukacyjna - logowanie" />
  </Layout>
  // <div className="container">
  //     <SEO title="Logowanie" />

  //       <LeftContainer />
  //       <div className="hr-vertical"></div>
  //       <RightContainerLogin />
  //   </div>

)