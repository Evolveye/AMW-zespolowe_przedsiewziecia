import React from "react"

// import Form from "../../components/form.js"
import Layout from "../../layouts/main.js"
// import { fakeLogin, isLogged } from "../../utils/auth.js"
// import { useForceUpdate } from "../../utils/functions.js"
import DataTable, { Adder, Field, Processor } from "../../components/dataTable.js"

export default () => {
  return (
    <Layout title="Settings">
      <DataTable noActions getDataAddress="fake://notes">
        <Field label="Wartość" name="value">
          <Adder type="number" />
        </Field>

        <Field label="Opis" name="description">
          <Adder type="textarea" />
        </Field>
      </DataTable>
    </Layout>
  )
}
