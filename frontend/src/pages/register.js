import React from "react"

import { BACKEND_REGISTER_URL } from "../config.js"

import Layout from "../components/layout.js"
import Form from "../components/form.js"

import classes from "./login.module.css"

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

export default () => (
  <Layout className={classes.formWrapper}>
    <Form
      fields={fields}
      title="Platforma edukacyjna - rejestracja"
      submitName="Zarejestruj się"
      method="POST"
      headers={{ "Content-Type": "application/json" }}
      address={BACKEND_REGISTER_URL}
      onOk={console.log}
    />
  </Layout>
)
