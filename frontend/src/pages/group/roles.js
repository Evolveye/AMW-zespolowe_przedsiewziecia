import React from "react"
import { Link } from "gatsby"
import FormRuleGroup from "../../components/formRuleGroup.js"
import { urlSearchParams } from "../../utils/functions.js"

import Layout from "../../components/groupLayout.js"

// import classes from "./group.module.css"

export default class GroupRules extends React.Component {
  constructor(props) {
    super(props)
    const query = urlSearchParams()
    this.platformId = query.get(`platformId`)
    this.groupId = query.get(`groupId`)
    this.href = `/group/it?platformId=${this.platformId}&groupId=${this.groupId}`
  }

  render = () => (
    <Layout className="is-centered">
      <Link className="return_link" to={this.href}>
        Powrót do widoku grupy
      </Link>

      <h1>Grupa -- role</h1>
      <div>
        <FormRuleGroup />
      </div>
    </Layout>
  )
}
