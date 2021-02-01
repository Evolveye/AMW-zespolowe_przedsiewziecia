import React from "react"
import { Link } from "gatsby"

import { AuthorizedContent } from "../utils/auth.js"
import { urlSearchParams } from "../utils/functions.js"

import Layout from "./layout.js"

export default ({ children, className = `` }) => {
  const query = urlSearchParams()

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const meetId = query.get(`meetId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}&meetId=${meetId}`

  return (
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
                <Link to={`/meet/${urn}?${platformAndGroupQuery}`}>{name}</Link>
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
}
