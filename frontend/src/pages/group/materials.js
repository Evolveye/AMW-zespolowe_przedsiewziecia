import React from "react"
import { Link } from "gatsby"

import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"
import {getUser} from "../../utils/auth.js"

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

class DisabledInput extends React.Component {
  state = { user:null }

  componentDidMount() {
    getUser().then( user => this.setState({ user }) )
  }
  render = () => <input
    type="text"
    disabled
    name={this.props.name}
    value={this.state.user ? `${this.state.user.name} ${this.state.user.surname}` : ``}
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
        fetchGetAddress={URLS.GROUPS$ID_FILE_GET.replace(`:groupId`, groupId)}
        fetchDeleteAddress={URLS.GROUPS$ID_FILE_DELETE.replace(`:groupId`, groupId)}
        enctype="multipart/form-data"
        deleteIdParameterName=":materialId"
        responseGetDataName="fileDataset"
        responsePostDataName="fileData"
        buttonAdd="Wyślij plik"
        buttonDelete="Usuń plik"
        staticPostBodyData={{}}
        objectsFields={[
          { name: `file`, alt:`filePath`, entire:true, processor: file =>
            <a download href={`/` + file.path}>{file.name}</a>
          },
          { name: `user`, processor: ({name, surname}) => `${name} ${surname}` },
          `description`,
        ]}
        titleFields={[`Plik`, `Dodał`, `Opis`]}
        inputFieldsComponents={{
          file: {
            component: FileInput,
            props: { name:`myFile` },
          },
          user: {
            component: DisabledInput,
            props: { name:"user" }
          },
        }}
      />
    </Layout>
  )
}
