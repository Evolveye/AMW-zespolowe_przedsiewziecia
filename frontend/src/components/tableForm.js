import React from "react"
import PropTypes from "prop-types"

import { getToken } from "../utils/auth.js"
import ERRORS from "../utils/errorList.js"
import { isBrowser } from "../utils/functions.js"

export default class TableForm extends React.Component {
  state = {
    error: ``,
    rows: [],
    data: [],
  }

  componentDidMount() {
    fetch(this.props.fetchGetAddress, {
      method: `GET`,
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          const { code, error } = data
          return console.error({ code, error })
        }

        if (data.success) {
          const { code, success } = data
          return console.info({ code, success })
        }

        this.addToTable(data[this.props.responseGetDataName])
      })
  }

  updateNewField = e => {
    const element = e.target || e

    this.setState({ [element.name]: element.value })
  }

  deleteRow = id => {
    fetch(
      this.props.fetchDeleteAddress.replace(
        this.props.deleteIdParameterName,
        id
      ),
      {
        method: `DELETE`,
        headers: { Authentication: `Bearer ${getToken()}` },
      }
    )
      .then(res => res.json())
      .then(({ code, error, success }) => {
        if (error) {
          return console.error({ code, error })
        }

        if (success) {
          this.setState(old => ({
            rows: old.rows.filter(({ key }) => key !== id),
          }))

          return console.info({ code, success })
        }
      })
  }

  create = () => {
    const { error, rows, data, ...fieldsData } = this.state

    fetch(this.props.fetchPostAddress, {
      method: `POST`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({ ...fieldsData, ...this.props.staticPostBodyData }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          const { code, error } = data

          console.error({ code, error })

          return this.setState({ error: ERRORS[data.code] })
        }

        if (data.success) {
          //TODO get value from every cell and make new row
          const { code, success } = data

          console.info({ code, success })

          return isBrowser() && window.location.reload()
        }

        if (this.props.responsePostDataName) {
          this.addToTable(data[this.props.responsePostDataName])
        }
      })
  }

  /** @param {object[]} itemOrItems */
  addToTable = itemOrItems => {
    if (!Array.isArray(itemOrItems)) itemOrItems = [itemOrItems]

    const newRows = itemOrItems.map(obj => {
      const fields = []

      for (const field of this.props.objectsFields) {
        if (typeof field === `object`) {
          fields.push(
            <td key={field.prop}>
              {field.processor(obj[field.prop])}
            </td>
          )
        } else
          fields.push(
            <td key={field}>
              {obj[field]}
            </td>
          )
      }

      return (
        <tr key={obj.id}>
          {fields}

          <td>
            <button type="button" onClick={() => this.deleteRow(obj.id)}>
              Usuń z platformy
            </button>
          </td>
        </tr>
      )
    })

    this.setState(old => ({
      rows: [...newRows, ...old.rows],
      data: [...itemOrItems, ...old.data],
    }))
  }

  render = () => {
    const createLis = []

    for (let i = 0; i < this.props.objectsFields.length; ++i) {
      const field = this.props.objectsFields[i]

      const customInputField = this.props.inputFieldsComponents?.[
        field.prop || field
      ]
      const colSpan = this.props.colSpans?.[field.prop || field]

      if (colSpan) i += colSpan

      createLis.push(
        <td key={field} colSpan={colSpan} className="inputCell">
          {customInputField ? (
            <customInputField.component
              {...customInputField.props}
              onChange={this.updateNewField}
              getTableData={() => this.state.data}
            />
          ) : (
            <input
              onChange={this.updateNewField}
              name={this.props.objectsFields[i]}
            />
          )}
        </td>
      )
    }

    return (
      <table className="table">
        <thead className="thead">
          <tr>
            {this.props.titleFields.map(field => (
              <td key={field}>{field}</td>
            ))}

            <td>Akcja</td>
          </tr>
        </thead>

        <tbody>
          <tr>
            {createLis}

            <td>
              <button type="button" onClick={this.create}>
                Dodaj do platformy
              </button>
            </td>
          </tr>

          <tr className="emptyRow">
            <td colSpan="5">{this.state.error}</td>
          </tr>
          <tr className="emptyRow" />

          {this.state.rows}
        </tbody>
      </table>
    )
  }
}

TableForm.propTypes = {
  fetchGetAddress: PropTypes.string.isRequired,
  fetchDeleteAddress: PropTypes.string.isRequired,
  fetchPostAddress: PropTypes.string.isRequired,

  deleteIdParameterName: PropTypes.string.isRequired,
  responseGetDataName: PropTypes.string.isRequired,
  responsePostDataName: PropTypes.string,
  staticPostBodyData: PropTypes.objectOf(PropTypes.string).isRequired,

  objectsFields: PropTypes.array.isRequired,
  titleFields: PropTypes.array.isRequired,
  inputFieldsComponents: PropTypes.object,
  colSpans: PropTypes.object,
}
