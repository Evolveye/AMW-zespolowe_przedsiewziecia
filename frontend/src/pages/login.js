import React from "react"

import { BACKEND_LOGIN_URL } from "../config.js"

import Layout from "../components/layout.js"
import Form from "../components/form.js"

import classes from "./login.module.css"

export default class Login extends React.Component {
  fields = [
    { title: `Login`, name: `lagin`, icon: `user` },
    {
      title: `Hasło`,
      name: `password`,
      icon: `lock`,
      type: `password`,
      autoComplete: `off`,
    },
  ]

  handleOk = response => {
    console.log({ response })
  }

  render = () => (
    <Layout className={classes.formWrapper}>
      <Form
        fields={this.fields}
        title="Platforma edukacyjna - logowanie"
        submitName="Zaloguj się"
        method="POST"
        headers={{ "Content-Type": "application/json" }}
        address={BACKEND_LOGIN_URL}
        onOk={this.handleOk}
      />
    </Layout>
  )
}
