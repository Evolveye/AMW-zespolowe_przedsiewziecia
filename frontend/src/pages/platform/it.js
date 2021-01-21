import React from "react"
import { Link } from "gatsby"

import { AuthorizedContent } from "../../utils/auth.js"
import Layout from "../../components/layout.js"

import classes from "./platform.module.css"

export default () => (
  <AuthorizedContent>
    <Layout className="main_wrapper-splited">
      <nav className={classes.leftColumn}>
        <h2>Panel ustawień</h2>

        <ul className="list">
          {[
            { urn: `settings`, name: `Ogólne` },
            { urn: `users`, name: `Użytkownicy` },
            { urn: `roles`, name: `Role` },
            { urn: `groups`, name: `Grupy` },
          ].map(({ urn, name }) => (
            <li key={urn} className="list-item">
              <Link to={`/platform/${urn}`}>{name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <article className={classes.rightColumn}>
        <h1>Platforma edukacyjna</h1>
        <div>Twoje miejsce na reklamę</div>
      </article>
    </Layout>
  </AuthorizedContent>
)
