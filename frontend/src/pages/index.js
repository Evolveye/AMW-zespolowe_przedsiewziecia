import React from "react"

import NotLoggedForm from "../containers/notLoggedForm.js"
import Layout from "../layouts/main.js"
import { useUser } from "../utils/auth.js"

export default () => (
  <Layout title="Strona główna">
    <article className="is-centered">
      <h1 className="h1">
          Platforma edukacyjna
      </h1>
      <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
    </article>
    {
      !useUser() && (
        <article className="is-centered">
          <NotLoggedForm />
        </article>
      )
    }
  </Layout>
)
