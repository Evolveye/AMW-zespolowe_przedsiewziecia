import React from "react"

import Layout from "./layout.js"
import Sygnet from "../models/sygnet.js"

import { isLoggedIn } from "../utils/auth.js"

export default ({ children }) =>
  isLoggedIn() ? (
    children
  ) : (
    <Layout className="centered-main">
      <Sygnet size={200} />
      <h1 className="h1">Strona niedostępna</h1>
      <small className="h1-small">
        Stronę tę możesz zobaczyć jedynie będąc zalogowanym i posiadajac
        odpowiednie uprawnienia
      </small>
    </Layout>
  )
