import React from "react"
import { Link } from "gatsby"

import { AuthorizedContent } from "../utils/auth.js"
import Layout from "./layout.js"

export default ({ children, className=`` }) => (
  <AuthorizedContent>
    <Layout className="main_wrapper-splited">
      <nav className="main_wrapper-splited-left_column">
        <h2>Panel ustawień</h2>

        <ul className="list">
          {[
            { urn: `settings`, name: `Ustawienia ogólne` },
            { urn: `users`, name: `Użytkownicy` },
          ].map(({ urn, name }) => (
            <li key={urn} className="list-item">
              <Link to={`/meet/${urn}`}>{name}</Link>
            </li>
          ))}
        </ul>

        <hr />

        <h2>Lista uczestników</h2>
        <ul className="list">
          <li className="list-item">Jakiś random</li>
        </ul>
      </nav>

      <article className={`main_wrapper-splited-right_column ${className}`}>
        {children}
      </article>
    </Layout>
  </AuthorizedContent>
)
