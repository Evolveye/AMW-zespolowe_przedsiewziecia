import React from "react"
import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"

// import classes from "./group.module.css"

export default class PlatformGroups extends React.Component {
  constructor(props) {
    super(props)

    const query = urlSearchParams()

    this.groupId = query.get(`groupId`)
    this.platformId = query.get(`platformId`)
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Grupa -- spotkania</h1>

      <TableForm
        fetchPostAddress={URLS.MEET_POST}
        fetchGetAddress={URLS.MEET_FROM_GROUP$ID_GET.replace(
          `:groupId`,
          this.groupId
        ).replace(`:platformId`, this.platformId)}
        fetchDeleteAddress={URLS.MEET$ID_DELETE}
        deleteIdParameterName=":meetId"
        responseGetDataName="meets"
        responsePostDataName="meet"
        staticPostBodyData={{
          groupId: this.groupId,
          platformId: this.platformId,
        }}
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
