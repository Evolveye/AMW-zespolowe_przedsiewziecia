import React from "react"

import { AuthorizedContent } from "../../utils/auth.js"
import Layout from "../../components/layout.js"

import classes from "./user.module.css"

export default () => (
  <AuthorizedContent>
    <Layout className="main_wrapper-splited">
      <article className={classes.leftColumn}>
        <h2>Przypęte przedmioty</h2>
        <p className={classes.empty}>Brak</p>
      </article>

      <article className={classes.rightColumn}>
        <h1>Twój profil</h1>
      </article>
    </Layout>
  </AuthorizedContent>
)
