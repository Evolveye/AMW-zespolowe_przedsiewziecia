import React from "react"

import Layout from "../../components/platformLayout.js"
import Select from "../../components/select.js"
import TableForm from "../../components/tableForm.js"
import {
  URL_GROUP_POST,
  URL_GROUP$ID_DELETE,
  URL_GROUP_FROM_PLATFORM$ID_GET,
  URL_PLATFORM$ID_USERS_GET
} from "../../config.js"

export default class PlatformGroups extends React.Component {
  constructor(props) {
    super(props)

    const query = new URLSearchParams(window.location.search)
    this.platformId = query.get(`platformId`)
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Platforma edukacyjna</h1>

      <TableForm
        fetchPostAddress={URL_GROUP_POST}
        fetchGetAddress={URL_GROUP_FROM_PLATFORM$ID_GET.replace(
          `:platformId`,
          this.platformId
        )}
        fetchDeleteAddress={URL_GROUP$ID_DELETE}
        deleteIdParameterName=":groupId"
        responseGetDataName="groups"
        responsePostDataName="group"
        staticPostBodyData={{ platformId: this.platformId }}
        objectsFields={[
          `name`,
          { prop: `lecturer`, processor: obj => `${obj.name} ${obj.surname}` },
        ]}
        titleFields={[`Nazwa grupy`, `Prowadzący`]}
        inputFieldsComponents={{
          lecturer: {
            component: Select,
            props: {
              name: `lecturerId`,
              fetchDataAddress: URL_PLATFORM$ID_USERS_GET.replace(
                `:platformId`,
                this.platformId
              ),
              fetchGetDataName:"users",
              fetchDataFilter( field ) {
                return field
              },
              fetchDataProcessor( { id, name, surname } ) {
                return { value:id, text:`${name} ${surname}` }
              },
            },
          },
        }}
      />
    </Layout>
  )
}
