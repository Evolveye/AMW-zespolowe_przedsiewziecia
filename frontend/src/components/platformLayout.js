import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import URLS from "../utils/urls.js"
import { urlSearchParams } from "../utils/functions.js"
import {
  AuthorizedContent,
  getPlatformPerms,
  authFetch,
} from "../utils/auth.js"

import Layout from "./layout.js"

import FlatTile from "../models/flatTile.js"

const navItems = [
  { urn: `settings`, name: `Ogólne`, permName: `isMaster` },
  { urn: `users`, name: `Użytkownicy`, permName: `isMaster` },
  { urn: `roles`, name: `Role`, permName: `isMaster` },
  { urn: `groups`, name: `Grupy`, permName: `isMaster` },
]

const groupsLisMap = ({ id, name }, platformId) => (
  <li key={id}>
    <FlatTile
      title={name}
      color={`#3e8bff`}
      linkAddress={`/group/it?platformId=${platformId}&groupId=${id}`}
    />
  </li>
)

const menuLisBuilder = (perms, platformId) =>
  navItems
    .filter(({ permName }) => !permName || perms[permName])
    .map(({ urn, name }) => (
      <li key={urn} className="list-item">
        <Link to={`/platform/${urn}?platformId=${platformId}`}>{name}</Link>
      </li>
    ))

export default ({ children, className = `` }) => {
  const query = urlSearchParams()
  const platformId = query.get(`platformId`)
  const url = URLS.GROUP_FROM_PLATFORM$ID_GET.replace(`:platformId`, platformId)

  const [groupsLis, setGroupsRows] = useState(
    (authFetch({ url }) || { groups: [] }).groups.map(group =>
      groupsLisMap(group, platformId)
    )
  )
  const [menuLis, setMenuRows] = useState(
    menuLisBuilder(getPlatformPerms(platformId) || {}, platformId)
  )

  useEffect(() => {
    authFetch({
      url,
      cb: ({ groups }) =>
        setGroupsRows(groups.map(group => groupsLisMap(group, platformId))),
    })
  }, [url, platformId])

  useEffect(() => {
    getPlatformPerms(platformId, perms => {
      setMenuRows(menuLisBuilder(perms || {}, platformId))
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
            {groupsLis.length ? groupsLis : "Nie należysz do żadnej grupy"}
          </ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
