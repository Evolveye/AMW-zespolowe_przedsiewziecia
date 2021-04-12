import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"

import FormRulePlatform from "../../components/formRulePlatform.js"
import Layout from "../../components/platformLayout.js"

// import classes from "./platform.module.css"

export default class PlatformRules extends React.Component {
  constructor(props) {
    super(props)
    const query = urlSearchParams()
    this.platformId = query.get(`platformId`)
  }
  
  render = () => (
    <Layout className="is-centered">
      <Link
        className="return_link"
        to={`/platform/it?platformId=${this.platformId}`}
      >
        Powrót do widoku platformy
      </Link>

      <h1>Platforma edukacyjna</h1>
      <div>
        <FormRulePlatform />
      </div>
    </Layout>
  )
}
