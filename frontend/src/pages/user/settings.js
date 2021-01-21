import React from "react"

import { AuthorizedContent } from "../../utils/auth.js"
import Layout from "../../components/layout.js"

export default () => (
  <AuthorizedContent>
    <Layout className="main_wrapper">
      <h1>Ustawienia</h1>
      <div>Twoje miejsce na reklamę</div>
    </Layout>
  </AuthorizedContent>
)
