import React from "react"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"
import {
  BACKEND_PLATFORMS_GROUPS_MEET_POST,
  BACKEND_PLATFORMS_GROUPS_MEET_GET,
  BACKEND_PLATFORMS_GROUPS_MEET_DEL,
} from "../../config.js"

// import classes from "./group.module.css"

export default class PlatformGroups extends React.Component {
  constructor(props) {
    super(props)

    const query = new URLSearchParams(window.location.search)
    this.groupId = query.get(`groupId`)
    this.platformId = query.get(`platformId`)
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Grupa -- spotkania</h1>

      <TableForm
        fetchPostAddress={BACKEND_PLATFORMS_GROUPS_MEET_POST}
        fetchGetAddress={BACKEND_PLATFORMS_GROUPS_MEET_GET.replace(
          `:groupId`,
          this.groupId
        ).replace( `:platformId`, this.platformId )}
        fetchDeleteAddress={BACKEND_PLATFORMS_GROUPS_MEET_DEL}
        deleteIdParameterName=":meetId"
        responseGetDataName="meets"
        responsePostDataName="meet"
        staticPostBodyData={{ groupId: this.groupId }}
        objectsFields={[`dateStart`, `dateEnd`, `description`, `externalUrl`]}
        titleFields={[
          `Data rozpoczęcia`,
          `Data zakończenia`,
          `Opis`,
          `Link do spotkania`,
        ]}
      />
    </Layout>
  )
}
