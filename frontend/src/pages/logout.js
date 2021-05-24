import React from "react"
import { navigate } from "gatsby"

import { logout } from "../utils/auth.js"
import Layout from "../layouts/main.js"
import { isBrowser } from "../utils/functions.js"

export default () => {
  logout()
  if (isBrowser()) navigate( `/` )

  return (
    <Layout title="Logowanie">
      <h1 className="h1">
      Platforma edukacyjna
      </h1>
      <small className="h1-small">Trwa wylogowywanie</small>
    </Layout>
  )
}
