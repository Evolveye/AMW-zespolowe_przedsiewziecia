import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import { urlSearchParams, getDate } from "../utils/functions.js"
import { AuthorizedContent, getToken } from "../utils/auth.js"
import URLS from "../utils/urls.js"

import Layout from "./layout.js"

export default ({ children, className = `` }) => {
  const query = urlSearchParams()

  const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const platformAndGroupQuery = `platformId=${platformId}&groupId=${groupId}`


  const [meetsLis, setMeetsRows] = useState()

  useEffect(() => {
    fetch(URLS.MEET_FROM_GROUP$ID_GET.replace(`:groupId`, groupId), {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(({ code, error, meets }) => {
        if (error) return console.error({ code, error })

        const lis = meets.map(({ id, dateStart, description }) => (
          <li key={id} className="list-item">
            <Link to={`/group/it?platformId=${platformId}&groupId=${groupId}&groupId=${id}`}>
              {getDate( `YYYY.MM.DD - hh:mm`, dateStart )}
              <br />
              {description}
            </Link>
          </li>
        ))

        console.log( lis )

        setMeetsRows(lis)
      })
  }, [platformId, groupId])

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
            {meetsLis}
          </ul>
        </nav>

        <article className={`main_wrapper-splited-right_column ${className}`}>
          {children}
        </article>
      </Layout>
    </AuthorizedContent>
  )
}
