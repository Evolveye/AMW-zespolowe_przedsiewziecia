import React from "react"

import { urlSearchParams } from "../../utils/functions.js"
import {
  URL_PLATFORM$ID_DELETE,
  URL_PLATFORM$ID_PUT,
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

    const query = urlSearchParams()

    this.platformId = query.get(`platformId`)
  }

  hremovePlatform = () => {
    fetch(URL_PLATFORM$ID_DELETE.replace( `:platformId`, this.platformId ), {
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
        address={URL_PLATFORM$ID_PUT}
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
