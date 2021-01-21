import React from "react"

import { AuthorizedContent } from "../utils/auth.js"
import Layout from "../components/layout.js"
import Sygnet from "../models/sygnet.js"

export default () => (
  <AuthorizedContent>
    <Layout className="centered-main">
      <Sygnet size={200} />
      <h1 className="h1">Platforma edukacyjna</h1>
      <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
    </Layout>
  </AuthorizedContent>
)
