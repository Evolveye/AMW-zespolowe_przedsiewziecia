import React from "react"

import { BACKEND_LOGIN_URL } from "../config.js"
import ERRORS from "../utils/errorList.js"

import Layout from "../components/layout.js"
import { setToken } from "../utils/auth.js"
import Form from "../components/form.js"

import classes from "./forms.module.css"
import { navigate } from "gatsby"

export default class Login extends React.Component {
  state = { error: null }

  fields = [
    { title: `Login`, name: `login`, icon: `user` },
    {
      title: `Hasło`,
      name: `password`,
      icon: `lock`,
      type: `password`,
      autoComplete: `off`,
    },
  ]

  render = () => (
    <Layout className="main_wrapper">
      <Form
        fields={this.fields}
        title="Platforma edukacyjna - logowanie"
        submitName="Zaloguj się"
        method="POST"
        headers={{ "Content-Type": "application/json" }}
        address={BACKEND_LOGIN_URL}
        onOk={({ token }) => {setToken( token ); navigate( `/user/me` )}}
        onError={({ code }) => this.setState({ error: ERRORS[code] })}
      />
      {this.state.error && <article className={classes.errorBox}>{this.state.error}</article>}
    </Layout>
  )
}
