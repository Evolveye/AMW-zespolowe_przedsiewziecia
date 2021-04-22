import React from "react"

import Layout from "../../layouts/main.js"
import Note from "../../containers/note.js"
import DataTable, { Field, Processor } from "../../components/dataTable.js"

import classes from "../../css/page.module.css"
import Spoiler from "../../containers/spoiler.js"

export default () => {
  const fakeData = [
    { id: `0`, name: `Akademia`, groups: [
      { id:`0`, notes:[ 1, 2, 3 ], lecturer:`Paweł`, name:`Programowanie` },
      { id:`1`, notes:[ 4, 5, 6 ], lecturer:`Paweł`, name:`Trolowanie na forach` },
    ] },
    { id:`1`, name:`Wysypisko`, groups:[] },
  ]
  return (
    <Layout className={classes.content} title="Settings">
      <h1 className="h1">Oceny</h1>

      {
        fakeData.map( ({ id, name, groups }) => (
          <Spoiler key={id} title={<h2>{name}</h2>}>
            <DataTable noActions data={groups} className={classes.reducedWidthContent}>
              <Field label="Przedmiot" name="name" />
              <Field label="Prowadzący" name="lecturer" />
              <Field label="Nabyte oceny" name="notes">
                <Processor
                  render={
                    notes => (
                      <div className={classes.flexList}>
                        {
                          notes.map(
                            note => <Note description="bla bla bla, Adam nie ma nóg" value={note} color="coral" />,
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
