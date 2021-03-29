import React from "react"
import { Link } from "gatsby"

import { urlSearchParams, getDate } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"



class DateInput extends React.Component{
  
  render = () => <input 
    type="datetime-local"  
    onChange={({ target }) => this.props.onChange(target.name, target.value)}
    />
}


//const DateInput = props => <input type="datetime-local" {...props} />



class FileInput extends React.Component {
    render = () => <input
      type="file"
      name={this.props.name}
      onChange={({ target }) => this.props.onChange( target.name, target.files[ 0 ] )}
    />
  }


export default class PlatformGroups extends React.Component {
  constructor(props) {
    super(props)

    const query = urlSearchParams()

    this.groupId = query.get(`groupId`)
    this.platformId = query.get(`platformId`)

    this.href = `/group/it?platformId=${this.platformId}&groupId=${this.groupId}`
  }



  render = () => (
    <Layout className="is-centered">
      <Link className="return_link" to={this.href}>
        Powrót do widoku grupy
      </Link>

      <h1>Grupa -- dodawanie zadań przez prowadzącego</h1>
      

      <TableForm
        fetchPostAddress={URLS.GROUPS$ID_TASKS_POST.replace(`:groupId`, this.groupId)}
        fetchGetAddress={URLS.GROUPS$ID_TASKS_GET.replace(`:groupId`,this.groupId)}
        fetchDeleteAddress={URLS.GROUPS$ID_TASKS_DELETE}
        deleteIdParameterName=":taskId"
        responseGetDataName="tasks"
        responsePostDataName="task"
        buttonAdd="Dodaj zadanie"
        buttonDelete="Usuń zadanie"
        staticPostBodyData={{
          groupId: this.groupId,
          platformId: this.platformId,
        }}
        objectsFields={[
          {
            name: `created`,
            processor: dateTime => getDate(`YYYY:MM:DD hh:mm`, dateTime),
          },
          {
            name: `expire`,
            processor: dateTime => getDate(`YYYY:MM:DD hh:mm`, dateTime),
          },
          `title`,
          `description`,
        ]}
        titleFields={[
          `Data rozpoczęcia`,
          `Data zakończenia`,
          `Nazwa`,
          `Opis`,
          
        ]}
        inputFieldsComponents={{
          dateStart: { component: DateInput },
          dateEnd: { component: DateInput },
        
        }}
      />
    </Layout>
  )
}
