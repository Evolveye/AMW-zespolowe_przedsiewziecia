import React from "react"

import { BACKEND_PLATFORMS_URL_PUT } from "../../config.js"

import Layout from "../../components/platformLayout.js"
import Form from "../../components/form.js"

import classes from "./platform.module.css"

const fields = [
  { title: `Nazwa`, name: `name` },
  { title: `Opis`, name: `description`, type: `textarea` },
]

export default () => (
  <Layout className="is-centered">
    <Form
      fields={fields}
      title="Ustawienia platformy"
      submitName="Zatwierdź"
      method="POST"
      headers={{ "Content-Type": "application/json" }}
      address={BACKEND_PLATFORMS_URL_PUT}
      onOk={response => {
        console.log(response)
      }}
      // onError={(error) => console.log( code)}
    />
    <button className={classes.removeButton}>Skasuj</button>
  </Layout>
)
