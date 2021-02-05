import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"

import Layout from "../../components/platformLayout.js"

// import classes from "./platform.module.css"

export default () => {
  const platformId = urlSearchParams().get(`platformId`)

  return (
    <Layout className="main_wrapper-splited">
      <Link
        className="return_link"
        to={`/platform/it?platformId=${platformId}`}
      >
        Powrót do widoku platformy
      </Link>

      <h1>Platforma edukacyjna</h1>
      <div>Role</div>
    </Layout>
  )
}
