import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import Layout from "../../components/meetLayout.js"
import { authFetch } from "../../utils/auth.js"
import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

// import classes from "./meet.module.css"

export default () => {
  const query = urlSearchParams()
  const href = `/group/it?platformId=${query.get(
    "platformId"
  )}&groupId=${query.get("groupId")}`
  const url = URLS.MEET$ID_GET.replace(`:meetId`, query.get(`meetId`))

  const [meet, setMeet] = useState(
    (authFetch({ url }) || { meet: {} }).meet
  )

  useEffect(() => {
    authFetch({
      url,
      cb: ({ meet }) => setMeet(meet),
    })
  }, [url])

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku grupy
      </Link>

      <h1>Spotkanie</h1>
      <div><a href={meet.externalUrl} target="_blank" rel="noreferrer">Link do spotkania</a></div>
      <p>{meet.description}</p>
    </Layout>
  )
}
