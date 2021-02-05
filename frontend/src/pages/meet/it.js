import React from "react"

import Layout from "../../components/meetLayout.js"
import { authFetch } from "../../utils/auth.js"
import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

// import classes from "./meet.module.css"

export default () => {
  const meetId = urlSearchParams().get(`meetId`)

  authFetch( { url:URLS.MEET$ID_USERS_GET.replace( `:meetId`, meetId ) } )

  return (
    <Layout>
      <h1>Spotkanie</h1>
      <div>Twoje miejsce na reklamę</div>
    </Layout>
  )
}
