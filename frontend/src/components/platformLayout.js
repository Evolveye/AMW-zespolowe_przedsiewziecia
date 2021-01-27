import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import { URL_GROUP_FROM_PLATFORM$ID_GET } from "../config.js"

import { AuthorizedContent, getToken } from "../utils/auth.js"
import Layout from "./layout.js"

const query = new URLSearchParams(window.location.search)
const platformId = query.get(`platformId`)

export default ({ children, className = `` }) => {
  const [groupsLis, setGroupsRows] = useState()

  useEffect(() => {
    fetch(URL_GROUP_FROM_PLATFORM$ID_GET.replace(`:platformId`, platformId), {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(({ code, error, groups }) => {
        if (error) return console.error({ code, error })

        const lis = groups.map(({ id, name }) => (
          <li key={id} className="list-item">
            <Link to={`/group/it?platformId=${platformId}&groupId=${id}`}>
              {name}
            </Link>
          </li>
        ))

        setGroupsRows(lis)
      })
  }, [])

  return (
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
                <Link to={`/platform/${urn}?platformId=${platformId}`}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>

          <hr />

          <h2>Grupy</h2>
          <ul className="list">{groupsLis}</ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
