import React from "react"

import Layout from "../../components/platformLayout.js"
import Select from "../../components/select.js"
import TableForm from "../../components/tableForm.js"
import {
  BACKEND_PLATFORMS_GROUPS_ADD,
  BACKEND_PLATFORMS_GROUPS_DEL,
  BACKEND_PLATFORMS_GROUPS_GET,
  BACKEND_PLATFORMS_USERS_GET,
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
        fetchPostAddress={BACKEND_PLATFORMS_GROUPS_ADD}
        fetchGetAddress={BACKEND_PLATFORMS_GROUPS_GET.replace(
          `:platformId`,
          this.platformId
        )}
        fetchDeleteAddress={BACKEND_PLATFORMS_GROUPS_DEL}
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
              fetchDataAddress: BACKEND_PLATFORMS_USERS_GET.replace(
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
