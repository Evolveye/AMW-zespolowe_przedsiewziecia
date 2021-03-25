import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import { urlSearchParams, getDate } from "../utils/functions.js"
import { AuthorizedContent, authFetch, getGroupPerms } from "../utils/auth.js"
import URLS from "../utils/urls.js"

import Layout from "./layout.js"

import FlatTile from "../models/flatTile.js"

const menyItems = [
  // { urn: `settings`, name: `Ustawienia ogólne`, permName:`isMaster` },
  { urn: `notes`, name: `Oceny`, permName: `isMaster` },
  { urn: `users`, name: `Użytkownicy`, permName: `isMaster` },
  // { urn: `roles`, name: `Role`, permName:`isMaster` },
  { urn: `tasks`, name: `Zadania`, permName: `isMaster` },
  { urn: `materials`, name: `Materiały`, permName: `isMaster` },
  { urn: `meets`, name: `Spotkania`, permName: `isMaster` },
]

const meetsLisMap = ({ id, dateStart, description }, platformAndGroupQuery) => (
  <li key={id}>
    <FlatTile
      title={getDate(`YYYY.MM.DD - hh:mm`, dateStart)}
      description={description}
      color={`#3e8bff`}
      linkAddress={`/meet/it?${platformAndGroupQuery}&meetId=${id}`}
    />
  </li>
)
const menuLisBuilder = (perms, platformAndGroupQuery) =>
  menyItems
    .filter(({ permName }) => !permName || perms[permName])
    .map(({ urn, name }) => (
      <li key={urn} className="list-item">
        <Link to={`/group/${urn}?${platformAndGroupQuery}`}>{name}</Link>
      </li>
    ))

export default ({ children, className = `` }) => {
  const query = urlSearchParams()

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}`
  const url = URLS.MEET_FROM_GROUP$ID_GET.replace(`:groupId`, groupId)

  const [meetsLis, setMeetsRows] = useState(
    (authFetch({ url }) || { meets: [] }).meets.map(meet =>
      meetsLisMap(meet, platformAndGroupQuery)
    )
  )
  const [menuLis, setMenuRows] = useState(
    menuLisBuilder(getGroupPerms(groupId) || {}, platformAndGroupQuery)
  )

  useEffect(() => {
    authFetch({
      url,
      cb: ({ meets }) =>
        setMeetsRows(
          meets.map(meet => meetsLisMap(meet, platformAndGroupQuery))
        ),
    })
  }, [url, platformAndGroupQuery])

  useEffect(() => {
    getGroupPerms(groupId, perms => {
      setMenuRows(menuLisBuilder(perms || {}, platformAndGroupQuery))
    })
  }, [groupId, platformAndGroupQuery])

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

          <h2>Spotkania</h2>
          <ul className="list">
            {meetsLis.length ? meetsLis : "Nie należysz do żadnego spotkania"}
          </ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
