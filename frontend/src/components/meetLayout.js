import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import { authFetch, AuthorizedContent, getMeetPerms } from "../utils/auth.js"
import { processUrn, urlSearchParams } from "../utils/functions.js"
import URLS from "../utils/urls.js"

import Layout from "./layout.js"
import FlatTile from "../models/flatTile.js"

const menyItems = [
  { urn: `settings`, name: `Ustawienia ogólne` },
  { urn: `users`, name: `Użytkownicy` },
]

const participantsLisMap = ({ id, name, surname, avatar }) => (
  <li key={id}>
    <FlatTile
      src={processUrn(avatar)}
      alt={`${name}'s avatar`}
      title={`${name} ${surname}`}
      color={`#3e8bff`}
    />
  </li>
)

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
  const url = URLS.MEET$ID_USERS_GET.replace(`:meetId`, meetId)

  const [menuLis, setMenuRows] = useState(
    menuLisBuilder(getMeetPerms(meetId) || {}, meetQuery)
  )
  const [participantsLis, setParticipantsLis] = useState(
    (authFetch({ url }) || { participants: [] }).participants.map(
      participantsLisMap
    )
  )

  useEffect(() => {
    getMeetPerms(meetId, perms => {
      setMenuRows(menuLisBuilder(perms || {}, meetQuery))
    })

    authFetch({
      url: URLS.MEET$ID_USERS_GET.replace(`:meetId`, meetId),
      cb: ({ participants }) =>
        setParticipantsLis(participants.map(participantsLisMap)),
    })
  }, [meetId, meetQuery])

  return (
    <AuthorizedContent>
      <Layout className="main_wrapper-splited">
        <nav className="main_wrapper-splited-left_column">
          <h2>Panel ustawień</h2>

          <ul className="list">{menuLis}</ul>

          <hr />

          <h2>Lista uczestników</h2>
          <ul className="list">
            {participantsLis}
            {/* <li className="list-item">Jakiś random</li> */}
          </ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
