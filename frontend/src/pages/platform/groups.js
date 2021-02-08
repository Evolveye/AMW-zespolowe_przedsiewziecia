import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/platformLayout.js"
import Select from "../../components/select.js"
import TableForm from "../../components/tableForm.js"

export default class PlatformGroups extends React.Component {
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
        Powrót do widoku platformy
      </Link>

      <h1>Zarządzanie grupami platformy</h1>
      <p>
        <strong>Ważne!</strong> Lista grup po lewej stronie zaktualizuje się
        dopiero po odświeżeniu strony
      </p>

      <TableForm
        fetchPostAddress={URLS.GROUP_POST}
        fetchGetAddress={URLS.GROUP_FROM_PLATFORM$ID_GET.replace(
          `:platformId`,
          this.platformId
        )}
        fetchDeleteAddress={URLS.GROUP$ID_DELETE}
        deleteIdParameterName=":groupId"
        responseGetDataName="groups"
        responsePostDataName="group"
        buttonAdd="Dodaj do platformy"
        buttonDelete="Usuń z platformy"
        staticPostBodyData={{ platformId: this.platformId }}
        objectsFields={[
          `name`,
          { name: `lecturer`, processor: obj => `${obj.name} ${obj.surname}` },
        ]}
        titleFields={[`Nazwa grupy`, `Prowadzący`]}
        inputFieldsComponents={{
          lecturer: {
            component: Select,
            props: {
              name: `lecturerId`,
              fetchDataAddress: URLS.PLATFORM$ID_USERS_GET.replace(
                `:platformId`,
                this.platformId
              ),
              fetchGetDataName: "users",
              fetchDataFilter(field) {
                return field
              },
              fetchDataProcessor({ id, name, surname }) {
                return { value: id, text: `${name} ${surname}` }
              },
            },
          },
        }}
      />
    </Layout>
  )
}
