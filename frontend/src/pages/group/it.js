import React from "react"
import { Link } from "gatsby"

import Layout from "../../components/groupLayout.js"
import { urlSearchParams } from "../../utils/functions.js"

// import classes from "./group.module.css"

export default () => {
  const query = urlSearchParams()
  const href = `/platform/it?platformId=${query.get(
    "platformId"
  )}`

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku platformy
      </Link>

      <h1>Grupa</h1>
      <div>Twoje miejsce na reklamę</div>
    </Layout>
  )
}