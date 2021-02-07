import React from "react"
import PropTypes from "prop-types"

import { getToken } from "../utils/auth.js"
import ERRORS from "../utils/errorList.js"
import { isBrowser, fetchWithStatusProcessing } from "../utils/functions.js"

// TODO cały komponent do przerobienia
export default class TableForm extends React.Component {
  state = {
    error: ``,
    rows: [],
    data: [],
    creatingLis: [],
    creationAllowed: true,
  }

  onFillListeners = []

  componentDidMount() {
    this.setCreatingElements()

    fetchWithStatusProcessing(this.props.fetchGetAddress, {
      method: `GET`,
      headers: { Authentication: `Bearer ${getToken()}` },
    }).then(data => {
      if (data.error) {
        const { code, error } = data
        return console.error({ code, error })
      }

      if (data.success) {
        const { code, success } = data
        return console.info({ code, success })
      }

      this.addToTable(data[this.props.responseGetDataName])
      this.onFillListeners.forEach(({ ref, field }) => ref.current[field]())
    })
  }

  updateNewField = e => {
    const element = e.target || e

    this.setState({ [element.name]: element.value })
  }

  deleteRow = id => {
    fetchWithStatusProcessing(
      this.props.fetchDeleteAddress.replace(
        this.props.deleteIdParameterName,
        id
      ),
      {
        method: `DELETE`,
        headers: { Authentication: `Bearer ${getToken()}` },
      }
    ).then(({ code, error, success }) => {
      if (error) {
        return console.error({ code, error })
      }

      if (success) {
        this.setState(old => ({
          rows: old.rows.filter(({ key }) => key !== id),
        }))

        this.onFillListeners.forEach(({ ref, field }) => ref.current[field]())

        return console.info({ code, success })
      }
    })
  }

  sendCreationData = () => {
    const {
      error,
      rows,
      data,
      creatingLis,
      creationAllowed,
      ...fieldsData
    } = this.state

    this.setCreatingElements()
    this.setState({ creationAllowed: false })

    fetchWithStatusProcessing(this.props.fetchPostAddress, {
      method: `POST`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({ ...fieldsData, ...this.props.staticPostBodyData }),
    }).then(data => {
      this.setState({ creationAllowed: true })

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
            <td key={field.name}>{field.processor(obj[field.name])}</td>
          )
        } else fields.push(<td key={field}>{obj[field]}</td>)
      }

      return (
        <tr key={obj.id}>
          {fields}

          <td>
            <button type="button" onClick={() => this.deleteRow(obj.id)}>
              {this.props.buttonDelete}
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

  setCreatingElements = () => {
    const creatingLis = []

    for (let i = 0; i < this.props.objectsFields.length; ++i) {
      const objectField = this.props.objectsFields[i]
      const objectFieldName = objectField.name || objectField

      const customInputField = this.props.inputFieldsComponents?.[
        objectFieldName
      ]
      const colSpan = this.props.colSpans?.[objectFieldName]

      let element = (
        <input onChange={this.updateNewField} name={objectFieldName} />
      )

      if (colSpan) i += colSpan - 1
      if (customInputField) {
        if (!(`props` in customInputField)) customInputField.props = {}
        if (typeof customInputField.component == `string`) {
          element = (
            <customInputField.component
              name={objectFieldName}
              {...customInputField.props}
              onChange={this.updateNewField}
            />
          )
        } else {
          const ref = React.createRef()

          element = (
            <customInputField.component
              name={objectFieldName}
              {...customInputField.props}
              onChange={this.updateNewField}
              getTableData={() => this.state.data}
              ref={ref}
            />
          )

          if (customInputField.onTableFillTrigger) {
            this.onFillListeners.push({
              ref,
              field: customInputField.onTableFillTrigger,
            })
          }
        }
      }

      creatingLis.push(
        <td
          key={`${Date.now()}.${Math.random()}`}
          colSpan={colSpan}
          className="inputCell"
        >
          {element}
        </td>
      )
    }

    this.setState({ creatingLis })
  }

  render = () => (
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
          {this.state.creatingLis}

          <td>
            <button
              type="button"
              onClick={this.sendCreationData}
              disabled={!this.state.creationAllowed}
            >
              {this.props.buttonAdd}
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

TableForm.propTypes = {
  fetchGetAddress: PropTypes.string.isRequired,
  fetchDeleteAddress: PropTypes.string.isRequired,
  fetchPostAddress: PropTypes.string.isRequired,

  deleteIdParameterName: PropTypes.string.isRequired,
  responseGetDataName: PropTypes.string.isRequired,
  responsePostDataName: PropTypes.string,
  staticPostBodyData: PropTypes.objectOf(PropTypes.string).isRequired,

  buttonAdd: PropTypes.string.isRequired,
  buttonDelete: PropTypes.string.isRequired,

  objectsFields: PropTypes.array.isRequired,
  titleFields: PropTypes.array.isRequired,
  inputFieldsComponents: PropTypes.object,
  colSpans: PropTypes.object,
}
