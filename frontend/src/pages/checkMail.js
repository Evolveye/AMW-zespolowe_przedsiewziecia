import React from "react"

import Layout from "../components/layout.js"
import Sygnet from "../models/sygnet.js"

export default () => (
  <Layout className="main_wrapper">
    <Sygnet size={200} />
    <h1 className="h1">Sprawdź email!</h1>
    <small className="h1-small">
      Link atywacyjny został wysłany na podany adres email
    </small>
  </Layout>
)
