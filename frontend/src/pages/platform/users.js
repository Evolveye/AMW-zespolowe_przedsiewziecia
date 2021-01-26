import React from "react"

import Layout from "../../components/platformLayout.js"
import TableForm from "../../components/tableForm.js"
import {
  BACKEND_PLATFORMS_USERS_DEL,
  BACKEND_PLATFORMS_USERS_GET,
  BACKEND_PLATFORMS_USERS_POST,
} from "../../config.js"

export default class PlatformUsers extends React.Component {
  constructor(props) {
    super(props)

    const query = new URLSearchParams(window.location.search)
    this.platformId = query.get(`platformId`)
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Platforma edukacyjna</h1>

      <TableForm
        fetchGetAddress={BACKEND_PLATFORMS_USERS_GET.replace(`:platformId`, this.platformId)}
        fetchPostAddress={BACKEND_PLATFORMS_USERS_POST.replace(`:platformId`, this.platformId)}
        fetchDeleteAddress={BACKEND_PLATFORMS_USERS_DEL.replace(`:platformId`, this.platformId)}
        deleteIdParameterName=":userId"
        responseGetDataName="users"
        responsePostDataName="user"
        staticPostBodyData={{ platformId:this.platformId }}
        objectsFields={[
          `name`,
          `surname`,
          `email`,
        ]}
        titleFields={[
          `Imię`,
          `Nazwisko`,
          `Email`,
        ]}
      />
    </Layout>
  )
}
