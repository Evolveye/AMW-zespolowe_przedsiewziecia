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

const tasksLisMap = ({ id, created,expire, description, title }, platformAndGroupQuery) => (
  <li key={id}>
    <FlatTile
      title={ getDate(`YYYY.MM.DD - hh:mm`, expire)}
      description={title}
      color={`#3e8bff`}
      linkAddress={`/task/it?${platformAndGroupQuery}&taskId=${id}`}
    />
  </li>
)

export default () => {
  const query = urlSearchParams()
  const href = `/platform/it?platformId=${query.get("platformId")}`

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}`
  const urlMeets = URLS.MEET_FROM_GROUP$ID_GET.replace(`:groupId`, groupId)
  const urlTasks = URLS.GROUPS$ID_TASKS_GET.replace(`:groupId`, groupId)
  console.log({urlTasks})

  
  const [meetsLis, setMeetsRows] = useState(
    (authFetch({ url:urlMeets }) || { meets: [] }).meets.map(meet =>
      meetsLisMap(meet, platformAndGroupQuery)
    )
  )
  const [tasksLis, setTasksRows] = useState(
    (authFetch({ url:urlTasks }) || { tasks: [] }).tasks.map(task =>
      tasksLisMap(task, platformAndGroupQuery)
    )
  )

  console.log(urlTasks)


  useEffect(() => {
    authFetch({
      url:urlMeets,
      cb: ({ meets }) =>
        setMeetsRows(
          meets.map(meet => meetsLisMap(meet, platformAndGroupQuery))
        ),
    })
  }, [urlMeets, platformAndGroupQuery])

  useEffect(() => {
    authFetch({
      url: urlTasks,
      cb: ({ tasks }) =>
        setTasksRows(
          tasks.map(task => tasksLisMap(task, platformAndGroupQuery))
        ),
    })
  }, [urlTasks, platformAndGroupQuery])
  console.log({tasksLis})
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
          <ul className="list">{tasksLis.length ? tasksLis : "Brak zadań"}</ul>
        </article>
      </article>
    </Layout>
  )
}
