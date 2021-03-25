import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import Layout from "../../components/groupLayout.js"
import { urlSearchParams, getDate } from "../../utils/functions.js"
import {
  AuthorizedContent,
  authFetch,
  getGroupPerms,
} from "../../utils/auth.js"
import FlatTile from "../../models/flatTile.js"
import URLS from "../../utils/urls.js"

import classes from "./group.module.css"

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

export default () => {
  const query = urlSearchParams()
  const href = `/platform/it?platformId=${query.get("platformId")}`

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}`
  const url = URLS.MEET_FROM_GROUP$ID_GET.replace(`:groupId`, groupId)

  const [meetsLis, setMeetsRows] = useState(
    (authFetch({ url }) || { meets: [] }).meets.map(meet =>
      meetsLisMap(meet, platformAndGroupQuery)
    )
  )
  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku platformy
      </Link>

      <article className={classes.wrapper}>
        <article className={classes.rightColumn}>
          <h2>Spotkania</h2>
          <ul className="list">
            {meetsLis.length ? meetsLis : "Nie należysz do żadnego spotkania"}
          </ul>
        </article>
        
        <article className={classes.rightColumn}>
          <h2>Zadania</h2>
          <ul className="list">{meetsLis.length ? meetsLis : "Brak zadań"}</ul>
        </article>
      </article>
    </Layout>
  )
}
