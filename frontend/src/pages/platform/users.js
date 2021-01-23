import React from "react"

import Layout from "../../components/platformLayout.js"
import { BACKEND_PLATFORMS_USERS_GET } from "../../config.js"
import { getToken } from "../../utils/auth.js"

// import classes from "./platform.module.css"

export default class PlatformUsers extends React.Component {
  componentDidMount() {
    fetch( BACKEND_PLATFORMS_USERS_GET.replace( `:platformId` ), {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(res => console.log( res ))
  }

  render = () => (
    <Layout>
      <h1>Platforma edukacyjna</h1>
    </Layout>
  )
}
