import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import TableForm from "../../components/tableForm" 
import Layout from "../../components/groupLayout.js"
import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"




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
  const href = `/group/it?platformId=${query.get(
    "platformId"
  )}&groupId=${query.get("groupId")}`
  const groupId = query.get(`groupId`)
  const taskId = query.get("taskId")

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
      
        Powrót do widoku grupy
      </Link>
      <h1>Oddawanie zadań</h1>
      <TableForm
        fetchPostAddress={URLS.GROUPS$ID_TASKS_DONE_POST.replace(`:groupId`, groupId).replace(`:taskId`, taskId)}
        fetchGetAddress={URLS.GROUPS$ID_TASKS_DONE_GET.replace(`:groupId`, groupId).replace(`:taskId`, taskId)}
        fetchDeleteAddress={URLS.GROUPS$ID_TASKS_DELETE.replace(`:groupId`, groupId)}
        enctype="multipart/form-data"
        deleteIdParameterName=":taskId"
        responseGetDataName="tasks"
        responsePostDataName="fileData"
        buttonAdd="Wyślij plik"
        buttonDelete="Usuń plik"
        staticPostBodyData={{}}
        objectsFields={[
          { name: `file`, alt:`filePath`, entire:true, processor: file =>
            <a download href={`/` + file.filepath}>{file.filename}</a>
          },
          `description`,
        ]}
        titleFields={[`Plik`, `Komentarz`]}
        inputFieldsComponents={{
          file: {
            component: FileInput,
            props: { name:`myFile` },
          },
        }}
      />
    </Layout>
  )
}
