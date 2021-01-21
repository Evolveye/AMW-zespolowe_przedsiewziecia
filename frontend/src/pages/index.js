import React from "react"

import Layout from "../components/layout.js"
import Sygnet from "../models/sygnet.js"

export default () => (
  <Layout className="main_wrapper">
    <Sygnet size={200} />
    <h1 className="h1">Platforma edukacyjna</h1>
    <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
  </Layout>
)
