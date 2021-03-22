import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"

// import classes from "./group.module.css"


class FileInput extends React.Component {
  render = () => <input
    type="file"
    name={this.props.name}
    onChange={({ target }) => {
      console.dir( target.files[ 0 ] )
      this.props.onChange( target.name, target.files[ 0 ] )
    }}
  />
}


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

      <h1>Grupa -- Materiały</h1>

      <TableForm
        fetchPostAddress={URLS.GROUPS$ID_FILE_POST.replace(`:groupId`, groupId)}
        fetchGetAddress={URLS.GROUP$ID_NOTES_GET.replace(`:groupId`, groupId)}
        fetchDeleteAddress={URLS.GROUP_NOTES$ID_DELETE}
        enctype="multipart/form-data"
        deleteIdParameterName=":noteId"
        responseGetDataName="notes"
        responsePostDataName="note"
        buttonAdd="Wyślij plik"
        buttonDelete="Usuń plik"
        staticPostBodyData={{}}
        objectsFields={[
          `description`,
          `file`,
        ]}
        titleFields={[`Opis`, `Plik`]}
        inputFieldsComponents={{
          file: {
            component: FileInput,
            props: {
                name: `myFile`,
            },
          },
        }}
        colSpans={{ name: 2 }}
      />
    </Layout>
  )
}
