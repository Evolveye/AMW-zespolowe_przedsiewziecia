import React from "react"
import { Link } from "gatsby"

import { AuthorizedContent } from "../utils/auth.js"
import Layout from "./layout.js"

export default ({ children, className = `` }) => {
  const query = new URLSearchParams(window.location.search)
  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}`

  return (
    <AuthorizedContent>
      <Layout className="main_wrapper-splited">
        <nav className="main_wrapper-splited-left_column">
          <h2>Panel ustawień</h2>

          <ul className="list">
            {[
              { urn: `settings`, name: `Ustawienia ogólne` },
              { urn: `notes`, name: `Oceny` },
              { urn: `users`, name: `Użytkownicy` },
              { urn: `roles`, name: `Role` },
              { urn: `meets`, name: `Spotkania` },
            ].map(({ urn, name }) => (
              <li key={urn} className="list-item">
                <Link to={`/group/${urn}?${platformAndGroupQuery}`}>{name}</Link>
              </li>
            ))}
          </ul>

          <hr />

          <h2>Spotkania</h2>
          <ul className="list">
            <li className="list-item">
              <Link to={`/meet/it?${platformAndGroupQuery}`}>Spotkanie tymczasowe</Link>
            </li>
          </ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
