import React from "react"
import { Link } from "gatsby"
import { getToken } from "../../utils/auth.js"
import { urlSearchParams } from "../../utils/functions.js"
import Form from "../../components/formSettings.js"
import Layout from "../../components/groupLayout.js"
import ERRORS, { DEFAULT_ERROR } from "../../utils/errorList.js"
import URLS from "../../utils/urls.js"
import classes from "./group.module.css"

const query = urlSearchParams()
const href = `/group/it?platformId=${query.get(
  "platformId"
)}&groupId=${query.get("groupId")}`
const groupId = query.get(`groupId`)
const address = URLS.GROUP$ID_GRADINGSCALE_PUT.replace(`:groupId`, groupId)

export default class Settings extends React.Component {
  state = { error: null,
}
  generalFormsFields = {
    submitName: `Zmień`,
    method: `PUT`,
    address: address,
    headers: {
      Authentication: `Bearer ${getToken()}`,
      "Content-Type": `application/json`,
    },
  }
  fieldsGrades = [{ title: `Skala ocen`, name: `gradingScale` }]
  okMsg = `Operacja wykonana pomyślnie`




  ok = (okField, errorField) =>
    this.setState({ [okField]: this.okMsg, [errorField]: null })
  error = (okField, errorField, code) =>
    this.setState({
      [okField]: null,
      [errorField]: ERRORS[code] || DEFAULT_ERROR,
    })
  infoBoxes = (okField, errorField) => (
    <>
      {this.state[errorField] && (
        <article className="errorBox">{this.state[errorField]}</article>
      )}
      {this.state[okField] && (
        <article className="okBox">{this.state[okField]}</article>
      )}
    </>
  )
  createForm = (fields, okField, errorField) => (
    <>
      <Form
        {...this.generalFormsFields}
        fields={fields}
        onError={({ code }) => this.error(okField, errorField, code)}
        onOk={() => this.ok(okField, errorField)}
      />
      {this.infoBoxes(okField, errorField)}
    </>
  )
  render = () => (
    <Layout className="is-centered">
      <Link className="return_link" to={href}>
        Powrót do widoku grupy
      </Link>

      <article className={classes.rightColumnWithOverFlow}>
        <h1 className={classes.sectionTitle}>Ustawienia</h1>

        <h1>Skala ocen</h1>
        <span>(Przykład: 1,2,3,4,5)</span>
        {this.createForm(this.fieldsGrades, `okGrades`, `errorGrades`)}
        <hr className={classes.hrWidth} />
      </article>
    </Layout>
  )
}
