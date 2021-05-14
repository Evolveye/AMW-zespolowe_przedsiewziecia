import React, { useEffect, useState } from "react"

import Layout from "../../layouts/main.js"
import Note from "../../containers/note.js"
import DataTable, { Field, Processor } from "../../components/dataTable.js"

import classes from "../../css/page.module.css"
import Spoiler from "../../containers/spoiler.js"
import { authFetcher } from "../../utils/auth.js"
import URLS from "../../utils/urls.js"

export default () => {
  const [ data, setData ] = useState([])

  useEffect( () => {
    authFetcher.get( URLS.GROUP_NOTES_GET() ).then( r => setData( r.data ) )
  }, [] )

  return (
    <Layout className={classes.content} title="Settings">
      <h1 className="h1">Oceny</h1>

      {
        data.map( ({ platform, groups }) => (
          <Spoiler key={platform.id} title={<h2>{platform.name}</h2>}>
            <DataTable noActions data={groups} keyExtractor={({ group }) => group.id} className={classes.reducedWidthContent}>
              <Field label="Przedmiot" name="name">
                <Processor entire render={({ group }) => group.name} />
              </Field>
              <Field label="Prowadzący" name="lecturer">
                <Processor entire render={({ group:{ lecturer } }) => `${lecturer.name} ${lecturer.surname}`} />
              </Field>
              <Field label="Nabyte oceny" name="notes">
                <Processor
                  render={
                    notes => (
                      <div className={classes.flexList}>
                        {
                          notes.map(
                            note => <Note key={note.id} description={note.description} value={note.value} color="coral" />,
                          )
                        }
                      </div>
                    )
                  }
                />
              </Field>
            </DataTable>
          </Spoiler>
        ) )
      }
    </Layout>
  )
}
