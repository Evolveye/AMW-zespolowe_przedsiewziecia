import React from "react"
import { Link } from "gatsby"

import { urlSearchParams, getDate } from "../../utils/functions.js"
import URLS from "../../utils/urls.js"

import Layout from "../../components/groupLayout.js"
import TableForm from "../../components/tableForm.js"

const DateInput = props => <input type="datetime-local" {...props} />






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
        fetchPostAddress={URLS.MEET_POST}
        fetchGetAddress={URLS.MEET_FROM_GROUP$ID_GET.replace(
          `:groupId`,
          this.groupId
        ).replace(`:platformId`, this.platformId)}
        fetchDeleteAddress={URLS.MEET$ID_DELETE}
        deleteIdParameterName=":meetId"
        responseGetDataName="meets"
        responsePostDataName="meet"
        buttonAdd="Dodaj do grupy"
        buttonDelete="Usuń z grupy"
        staticPostBodyData={{
          groupId: this.groupId,
          platformId: this.platformId,
        }}
        objectsFields={[
          {
            name: `dateStart`,
            processor: dateTime => getDate(`YYYY:MM:DD hh:mm`, dateTime),
          },
          {
            name: `dateEnd`,
            processor: dateTime => getDate(`YYYY:MM:DD hh:mm`, dateTime),
          },
          `description`,
          { name: `file`, alt:`filePath`, entire:true, processor: file =>
            <a download href={`/` + file.path}>{file.name}</a>
          },
        ]}
        titleFields={[
          `Data rozpoczęcia`,
          `Data zakończenia`,
          `Opis`,
          `Załącznik`,
        ]}
        inputFieldsComponents={{
          dateStart: { component: DateInput },
          dateEnd: { component: DateInput },
          file: {
            component: FileInput,
            props: { name:`myFile` },
          },
        }}
      />
    </Layout>
  )
}
