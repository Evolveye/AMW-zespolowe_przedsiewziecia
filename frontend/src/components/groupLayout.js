import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import { urlSearchParams, getDate } from "../utils/functions.js"
import { AuthorizedContent, getToken, getGroupPerms } from "../utils/auth.js"
import URLS from "../utils/urls.js"

import Layout from "./layout.js"

const menyItems = [
  // { urn: `settings`, name: `Ustawienia ogólne`, permName:`isMaster` },
  { urn: `notes`, name: `Oceny`, permName:`isMaster` },
  { urn: `users`, name: `Użytkownicy`, permName:`isMaster` },
  // { urn: `roles`, name: `Role`, permName:`isMaster` },
  { urn: `meets`, name: `Spotkania`, permName:`isMaster` },
]

export default ({ children, className = `` }) => {
  const query = urlSearchParams()

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}`

  const [meetsLis, setMeetsRows] = useState([])
  const [menuLis, setMenuRows] = useState([])

  useEffect(() => {
    fetch(URLS.MEET_FROM_GROUP$ID_GET.replace(`:groupId`, groupId), {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then( async ({ code, error, meets }) => {
        if (error) return console.error({ code, error })

        const meetsLis = meets.map(({ id, dateStart, description }) => (
          <li key={id} className="list-item">
            <Link
              to={`/meet/it?platformId=${platformId}&groupId=${groupId}&meetId=${id}`}
            >
              {getDate(`YYYY.MM.DD - hh:mm`, dateStart)}
              <br />
              {description}
            </Link>
          </li>
        ))

        const perms = await getGroupPerms(platformId) || {}
        const menuLis = menyItems
          .filter(({ permName }) => !permName || perms[permName])
          .map(({ urn, name }) => (
            <li key={urn} className="list-item">
              <Link to={`/group/${urn}?${platformAndGroupQuery}`}>{name}</Link>
            </li>
          ))

        setMeetsRows(meetsLis)
        setMenuRows(menuLis)
      })
  }, [platformId, groupId, platformAndGroupQuery])

  return (
    <AuthorizedContent>
      <Layout className="main_wrapper-splited">
        <nav className="main_wrapper-splited-left_column">
          <h2>Panel ustawień</h2>
          <ul className="list">{menuLis}</ul>

          <hr />

          <h2>Spotkania</h2>
          <ul className="list">{meetsLis}</ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
