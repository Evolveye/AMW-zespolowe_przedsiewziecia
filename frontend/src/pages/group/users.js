import React from "react"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"
import {
  BACKEND_PLATFORMS_USERS_GROUPS_POST,
  BACKEND_PLATFORMS_GROUP_USERS_GET,
  BACKEND_PLATFORMS_GROUP_USERS_DELETE,
} from "../../config.js"

// import classes from "./group.module.css"

export default class PlatformGroups extends React.Component {
  constructor(props) {
    super(props)

    const query = new URLSearchParams(window.location.search)
    this.groupId = query.get(`groupId`)
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Grupa -- użytkownicy</h1>

      <TableForm
        fetchPostAddress={BACKEND_PLATFORMS_USERS_GROUPS_POST}
        fetchGetAddress={BACKEND_PLATFORMS_GROUP_USERS_GET.replace(`:groupId`, this.groupId)}
        fetchDeleteAddress={BACKEND_PLATFORMS_GROUP_USERS_DELETE}
        deleteIdParameterName=":userId"
        responseGetDataName="users"
        responsePostDataName="user"
        staticPostBodyData={{ groupId: this.groupId }}
        objectsFields={[
          `name`,
          `surname`,
        ]}
        titleFields={[`Imię`, `Nazwisko`]}
      />
    </Layout>
  )
}
