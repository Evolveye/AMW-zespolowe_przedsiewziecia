import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"

import Layout from "../../components/groupLayout.js"

// import classes from "./group.module.css"

export default () => {
  const query = urlSearchParams()
  const href = `/group/it?platformId=${query.get(
    "platformId"
  )}&groupId=${query.get("groupId")}`

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku grupy
      </Link>

      <h1>Grupa -- ustawienia ogólne</h1>
      <div>Twoje miejsce na reklamę</div>
    </Layout>
  )
}
