import React from "react"

/**
 * @typedef {object} Props
 * @property {object[]} fields
 * @property {string} fields.name
 * @property {string} fields.label
 * @property {string} [fields.dataFieldname]
 * @property {(field) => string} [fields.processor]
 * @property {object} [fields.adder]
 * @property {number} [fields.adder.colspan]
 * @property {(data:string) => Error?} fields.adder.validator
 */

const fakeGroupRoles = [
  {
    id: `1`,
    color: 0xff0000,
    name: `Admin`,
    abilities: {
      canManageGroup: true,
    },
  },
  {
    id: `2`,
    color: 0x00ff00,
    name: `Asystent`,
    abilities: {
      canManageGroup: true,
    },
  },
]
const fakePlatformUsers = [
  {
    id: `1`,
    name: `Paweł`,
    surname: `Stolarski`,
    role: fakeGroupRoles.find( ({ name }) => name === `Admin` ),
  },
  {
    id: `2`,
    name: `Adam`,
    surname: `Szreiber`,
    role: fakeGroupRoles.find( ({ name }) => name === `Asystent` ),
  },
]
const fakeData = {
  fakePlatformUsers,
  fakeGroupRoles,
}

export default class DataTable extends React.Component {
  constructor( props ) {
    super( props )

    let colspanCounter = 1

    this.tableAdderFields = props.fields.reduce( (obj, { adder = {}, name }) => {
      if (colspanCounter !== 1) {
        colspanCounter--
        return obj
      }

      colspanCounter = adder.colspan || 1

      return { [ name ]:this.getInputCreator( adder ), ...obj }
    }, {} )

    colspanCounter = 1

    this.state = {
      tableHeaders: (
        <tr>
          {
            props.fields.map( ({ name, label }) => (
              <td key={name}>{label}</td>
            ) )
          }
        </tr>
      ),

      tableAdder: (
        props.fields.map( ({ adder = {}, name }) => {
          if (colspanCounter !== 1) {
            colspanCounter--
            return null
          }

          colspanCounter = adder.colspan || 1

          return (
            <td key={name} colSpan={colspanCounter}>
              {this.tableAdderFields[ name ]()}
            </td>
          )
        } )
      ),

      tableRows: [],
    }
  }


  componentDidMount() {
    const { getDataAddress, fields } = this.props
    const data = fakeData[ getDataAddress ]
    const tableRows = data.map( field => (
      <tr key={field.id}>
        {
          fields.map( ({ editable, dataFieldname, name, processor = it => it }) => (
            <td key={name}>
              {editable ? this.tableAdderFields[ name ]( field[ dataFieldname ] ) : processor( field[ dataFieldname ] )}
            </td>
          ) )
        }
      </tr>
    ) )

    this.setState({ tableRows })
  }


  getInputCreator({ type = `text`, getDataAddress, validator = it => it }) {
    let inputCreator = null

    switch (type) {
      case `text`:
        inputCreator = defaultValue => <input value={validator( defaultValue )} />
        break

      case `select`:
        inputCreator = defaultValue => {
          console.log( defaultValue )
          return (
            <select defaultValue={defaultValue?.name}>
              {
                fakeData[ getDataAddress ].map( field => (
                  <option key={field.id} value={field.name}>{validator( field )}</option>
                ) )
              }
            </select>
          )
        }
        break
    }

    return inputCreator
  }


  render = () => (
    <table>
      <thead>
        {this.state.tableHeaders}
      </thead>
      <tbody>
        <tr>
          {this.state.tableAdder}
        </tr>
      </tbody>
      <tbody>
        {this.state.tableRows}
      </tbody>
    </table>
  )
}
