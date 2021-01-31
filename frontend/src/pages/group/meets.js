import React from "react"
import { urlSearchParams, getDate } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"

// import classes from "./group.module.css"

const DateInput = () => <input type="date" />

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
      <p><strong>Ważne!</strong> Lista spotkań po lewej stronie zaktualizuje się dopiero po odświeżeniu strony</p>

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
        objectsFields={[
          {
            prop: `dateStart`,
            processor: ms => getDate(`YYYY:MM:DD hh:mm`, ms),
          },
          { prop: `dateEnd`, processor: ms => getDate(`YYYY:MM:DD hh:mm`, ms) },
          `description`,
          { prop: `externalUrl`, processor: url => <a href={url}>Link do spotkania</a> },
        ]}
        titleFields={[
          `Data rozpoczęcia`,
          `Data zakończenia`,
          `Opis`,
          `Link do spotkania`,
        ]}
        inputFieldsComponents={{
          dateStart: {
            component: DateInput,
            props: {},
          },
          dateEnd: {
            component: DateInput,
            props: {},
          },
        }}
      />
    </Layout>
  )
}
