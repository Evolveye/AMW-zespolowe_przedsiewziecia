import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"
import Select from "../../components/select.js"

// import classes from "./group.module.css"

export default () => {
  const query = urlSearchParams()

  // const platformId = query.get(`platformId`)
  const groupId = query.get(`groupId`)
  const href = `/group/it?platformId=${query.get(
    "platformId"
  )}&groupId=${groupId}`

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku grupy
      </Link>

      <h1>Grupa -- Oceny</h1>

      <TableForm
        fetchPostAddress={URLS.GROUP$ID_NOTES_POST.replace(`:groupId`, groupId)}
        fetchGetAddress={URLS.GROUP$ID_NOTES_GET.replace(`:groupId`, groupId)}
        fetchDeleteAddress={URLS.GROUP_NOTES$ID_DELETE}
        deleteIdParameterName=":noteId"
        responseGetDataName="notes"
        responsePostDataName="note"
        buttonAdd="Dodaj ocenę"
        buttonDelete="Usuń ocenę"
        staticPostBodyData={{}}
        objectsFields={[
          `value`,
          `description`,
          { name: `user`, processor: obj => `${obj.name} ${obj.surname}` },
        ]}
        titleFields={[`Wartość całkowita`, `Opis`, `Student`]}
        inputFieldsComponents={{
          user: {
            component: Select,
            props: {
              name: `userId`,
              fetchDataAddress: URLS.GROUP$ID_USERS_GET.replace(
                `:groupId`,
                groupId
              ),
              fetchGetDataName: "users",
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
