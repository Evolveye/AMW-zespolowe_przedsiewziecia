import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import { AuthorizedContent, getMeetPerms } from "../utils/auth.js"
import { urlSearchParams } from "../utils/functions.js"

import Layout from "./layout.js"

const menyItems = [
  { urn: `settings`, name: `Ustawienia ogólne` },
  { urn: `users`, name: `Użytkownicy` },
]

const menuLisBuilder = (perms, meetQuery) =>
  menyItems
    .filter(({ permName }) => !permName || perms[permName])
    .map(({ urn, name }) => (
      <li key={urn} className="list-item">
        <Link to={`/meet/${urn}?${meetQuery}`}>{name}</Link>
      </li>
    ))

export default ({ children, className = `` }) => {
  const query = urlSearchParams()

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const meetId = query.get(`meetId`)
  const meetQuery = `platformId=${platformId}&groupId=${groupId}&meetId=${meetId}`

  const [menuLis, setMenuRows] = useState(
    menuLisBuilder(getMeetPerms(meetId) || {}, meetQuery)
  )

  useEffect(() => {
    getMeetPerms(meetId, perms => {
      setMenuRows(menuLisBuilder(perms || {}, meetQuery))
    })
  }, [meetId, meetQuery])

  return (
    <AuthorizedContent>
      <Layout className="main_wrapper-splited">
        <nav className="main_wrapper-splited-left_column">
          <h2>Panel ustawień</h2>

          <ul className="list">
            {menuLis}
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
