import React from "react"

import {
  BACKEND_PLATFORMS_URL_DEL,
  BACKEND_PLATFORMS_URL_PUT,
} from "../../config.js"

import Layout from "../../components/platformLayout.js"
import Form from "../../components/form.js"

import classes from "./platform.module.css"
import { getToken } from "../../utils/auth.js"
import { navigate } from "gatsby"

const fields = [
  { title: `Nazwa`, name: `name` },
  { title: `Opis`, name: `description`, type: `textarea` },
]

export default class SettingsView extends React.Component {
  constructor(props) {
    super(props)

    const query = new URLSearchParams(window.location.search)
    this.platformId = query.get(`platformId`)
  }

  hremovePlatform = () => {
    fetch(BACKEND_PLATFORMS_URL_DEL.replace( `:platformId`, this.platformId ), {
      method: `DELETE`,
      headers: { Authentication: `Bearer ${getToken()}` },
    }).then( res => res.json() ).then( ({ code, success, error }) => {
      if (error) {
        return console.error( error )
      }

      navigate( `/user/me` )
    } )
  }

  render = () => (
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
      <button className={classes.removeButton} onClick={this.hremovePlatform}>
        Skasuj
      </button>
    </Layout>
  )
}
