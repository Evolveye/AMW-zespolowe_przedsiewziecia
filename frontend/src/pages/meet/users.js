import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"

import Layout from "../../components/meetLayout.js"

// import classes from "./group.module.css"

export default () => {
  const query = urlSearchParams()
  const href = `/meet/it?platformId=${query.get(
    "platformId"
  )}&groupId=${query.get("groupId")}&meetId=${query.get("meetId")}`

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku spotkania
      </Link>

      <h1>Spotkanie -- uczestnicy</h1>
      <div>Twoje miejsce na reklamę</div>
    </Layout>
  )
}
