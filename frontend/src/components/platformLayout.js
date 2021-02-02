import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import URLS from "../utils/urls.js"
import { urlSearchParams } from "../utils/functions.js"
import { AuthorizedContent, getPlatformPerms, getToken } from "../utils/auth.js"
import ERRORS from "../utils/errorList.js"

import Layout from "./layout.js"

const navItems = [
  { urn: `settings`, name: `Ogólne`, permName: `isMaster` },
  { urn: `users`, name: `Użytkownicy`, permName: `isMaster` },
  // { urn: `roles`, name: `Role`, permName: `isMaster` },
  { urn: `groups`, name: `Grupy`, permName: `isMaster` },
]

export default ({ children, className = `` }) => {
  const query = urlSearchParams()
  const platformId = query.get(`platformId`)

  const [groupsLis, setGroupsRows] = useState([])
  const [menuLis, setMenuRows] = useState([])

  useEffect(() => {
    fetch(URLS.GROUP_FROM_PLATFORM$ID_GET.replace(`:platformId`, platformId), {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(async ({ code, error, groups }) => {
        if (error) {
          return console.error({ code, error, translatedErr: ERRORS[code] })
        }

        const groupsLis = groups.map(({ id, name }) => (
          <li key={id} className="list-item">
            <Link to={`/group/it?platformId=${platformId}&groupId=${id}`}>
              {name}
            </Link>
          </li>
        ))

        const perms = await getPlatformPerms(platformId) || {}
        const menuLis = navItems
          .filter(({ permName }) => !permName || perms[permName])
          .map(({ urn, name }) => (
            <li key={urn} className="list-item">
              <Link to={`/platform/${urn}?platformId=${platformId}`}>
                {name}
              </Link>
            </li>
          ))

        setGroupsRows(groupsLis)
        setMenuRows(menuLis)
      })
  }, [platformId])

  return (
    <AuthorizedContent>
      <Layout className="main_wrapper-splited">
        <nav className="main_wrapper-splited-left_column">
          {menuLis.length ? (
            <>
              <h2>Panel ustawień</h2>
              <ul className="list">{menuLis}</ul>
              <hr />
            </>
          ) : null}

          <h2>Grupy</h2>
          <ul className="list">
            {groupsLis.length ? groupsLis : "Nie należysz do zadnej grupy"}
          </ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
