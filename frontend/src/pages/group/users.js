import React from "react"

import { urlSearchParams } from "../../utils/functions.js"
import {
  URL_GROUP$ID_USERS_GET,
  URL_GROUP$ID_USERS_POST,
  URL_GROUP$ID_USERS$ID_DELETE,
  URL_PLATFORM$ID_USERS_GET,
} from "../../config.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"
import Select from "../../components/select.js"

export default class PlatformGroups extends React.Component {
  constructor(props) {
    super(props)

    const query = urlSearchParams()

    this.platformId = query.get(`platformId`)
    this.groupId = query.get(`groupId`)
  }

  render = () => (
    <Layout className="is-centered">
      <h1>Grupa -- użytkownicy</h1>

      <TableForm
        fetchPostAddress={URL_GROUP$ID_USERS_POST.replace(
          `:groupId`,
          this.groupId
        )}
        fetchGetAddress={URL_GROUP$ID_USERS_GET.replace(
          `:groupId`,
          this.groupId
        )}
        fetchDeleteAddress={URL_GROUP$ID_USERS$ID_DELETE}
        deleteIdParameterName=":userId"
        responseGetDataName="users"
        responsePostDataName="user"
        staticPostBodyData={{ groupId: this.groupId }}
        objectsFields={[`name`, `surname`]}
        titleFields={[`Imię`, `Nazwisko`]}
        inputFieldsComponents={{
          name: {
            component: Select,
            props: {
              name: `userId`,
              fetchDataAddress: URL_PLATFORM$ID_USERS_GET.replace(
                `:platformId`,
                this.platformId
              ),
              fetchGetDataName: "users",
              fetchDataFilter(field) {
                for (const { id } of this.getTableData())
                  if (field.id === id) return false

                return true
              },
              fetchDataProcessor({ id, name, surname }) {
                return { value: id, text: `${name} ${surname}` }
              },
            },
          },
        }}
        colSpans={{ name: 2 }}
      />
    </Layout>
  )
}
