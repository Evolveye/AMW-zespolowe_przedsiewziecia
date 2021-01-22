import React from "react"
import { Link } from "gatsby"

import { AuthorizedContent } from "../utils/auth.js"
import Layout from "./layout.js"

export default ({ children }) => (
  <AuthorizedContent>
    <Layout className="main_wrapper-splited">
      <nav className="main_wrapper-splited-left_column">
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

        <hr />

        <h2>Grupy</h2>
        <ul className="list">
          <li className="list-item">
            <Link to={`/group/it?id=0`}>Grupa tymczasowa</Link>
          </li>
        </ul>
      </nav>

      <article className="main_wrapper-splited-right_column">
        {children}
      </article>
    </Layout>
  </AuthorizedContent>
)
