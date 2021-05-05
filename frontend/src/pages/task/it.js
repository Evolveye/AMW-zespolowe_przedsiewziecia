import React, {useState, useEffect} from "react"
import { Link } from "gatsby"

import TableForm from "../../components/tableForm"
import Layout from "../../components/groupLayout.js"
import { urlSearchParams } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"
import {getUser, getGroupPerms} from "../../utils/auth.js"



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
  const [ perms, setPerm ] = useState(null)
  const query = urlSearchParams()
  const href = `/group/it?platformId=${query.get(
    "platformId"
  )}&groupId=${query.get("groupId")}`
  const groupId = query.get(`groupId`)
  const taskId = query.get("taskId")

  useEffect( () => { getGroupPerms( groupId, console.log)}, [ setPerm, groupId ] )
  //console.log("getGroupPerms",perms)

  const [ user, setUser ] = useState(null)

  useEffect( () => { getUser().then( setUser ) }, [ setUser ] )
  //console.log("user:", user)

  console.log({ perms, user })

  return (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>

        Powrót do widoku grupy
      </Link>
      <h1>Oddawanie zadań</h1>
      <TableForm
        fetchPostAddress={URLS.GROUPS$ID_TASKS_DONE_POST.replace(`:groupId`, groupId).replace(`:taskId`, taskId)}
        fetchGetAddress={URLS.GROUPS$ID_TASKS_DONE_GET.replace(`:groupId`, groupId).replace(`:taskId`, taskId)}
        //fetchDeleteAddress={URLS.GROUPS$ID_TASKS_DELETE.replace(`:groupId`, groupId)}
        enctype="multipart/form-data"
        deleteIdParameterName=":taskId"
        responseGetDataName="tasks"
        responsePostDataName="fileData"
        buttonAdd="Wyślij plik"
        //buttonDelete="Usuń plik"
        staticPostBodyData={{}}
        objectsFields={
          [
          { name: `file`, alt:`filePath`, entire:true, processor: file =>

            //console.log(file.user.id)
            <a download href={`/` + file.filepath}>{file.filename}</a>
          },
          `description`,
          { name: `user`, processor: ({name, surname}) => `${name} ${surname}` },
        ]}
        titleFields={[`Plik`, `Komentarz`, `Dodał`]}
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
