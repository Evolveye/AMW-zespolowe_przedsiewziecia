import React from "react"
import { navigate } from "gatsby"

import URLS from "../utils/urls.js"
import ERRORS from "../utils/errorList.js"

import Layout from "../components/layout.js"
import Form from "../components/form.js"

import classes from "./forms.module.css"

const fields = [
  { title: `Imię`, name: `name`, icon: `user` },
  { title: `Nazwisko`, name: `surname` },
  { title: `E-mail`, name: `email`, icon: `email` },
  {
    title: `Hasło`,
    name: `password1`,
    icon: `lock`,
    type: `password`,
    autoComplete: `off`,
  },
  {
    title: `Powtórz hasło`,
    name: `password2`,
    type: `password`,
    autoComplete: `off`,
  },
]

export default class RegisterPage extends React.Component {
  state = { error: null }

  render = () => (
    <Layout className="main_wrapper">
      <Form
        fields={fields}
        title="Platforma edukacyjna - rejestracja"
        submitName="Zarejestruj się"
        method="POST"
        headers={{ "Content-Type": "application/json" }}
        address={URLS.REGISTER_POST}
        onOk={() => navigate( `/checkMail` )}
        onError={({ code }) => this.setState({ error: ERRORS[code] })}
      />
      {this.state.error && <article className={classes.errorBox}>{this.state.error}</article>}
    </Layout>
  )
}
