import React from "react"
import { Link } from "gatsby"

import { urlSearchParams, translateRole } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/platformLayout.js"
import TableForm from "../../components/tableForm.js"
import Select from "../../components/select.js"

export default class PlatformUsers extends React.Component {
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
        Powrót
      </Link>

      <h1>Zarządzanie użytkownikami platformy</h1>

      <TableForm
        fetchGetAddress={URLS.PLATFORM$ID_USERS_GET.replace(
          `:platformId`,
          this.platformId
        )}
        fetchPostAddress={URLS.PLATFORM$ID_USERS_POST.replace(
          `:platformId`,
          this.platformId
        )}
        fetchDeleteAddress={URLS.PLATFORM$ID_USERS$ID_DELETE.replace(
          `:platformId`,
          this.platformId
        )}
        deleteIdParameterName=":userId"
        responseGetDataName="users"
        responsePostDataName="user"
        staticPostBodyData={{ platformId: this.platformId }}
        objectsFields={[
          `name`,
          `surname`,
          `email`,
          { prop: `perms`, processor: ({ name }) => translateRole(name) },
        ]}
        titleFields={[`Imię`, `Nazwisko`, `Email`, `Rola`]}
        inputFieldsComponents={{
          perms: {
            component: Select,
            props: {
              name: `roleName`,
              fetchDataAddress: URLS.PLATFORM$ID_PERMISSIONS_GET.replace(
                `:platformId`,
                this.platformId
              ),
              fetchGetDataName: `permissions`,
              fetchDataFilter: ({ name }) => name !== `owner`,
              fetchDataProcessor: ({ name }) => translateRole(name),
            },
          },
        }}
      />
    </Layout>
  )
}
