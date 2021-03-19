import React from "react"


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
  {
    id: `3`,
    name: `Kamil`,
    surname: `Czarny`,
    role: fakeGroupRoles.find( ({ name }) => name === `Student` ),
  },
]
const fakeGroups = [
  {
    id: `1`,
    name: `Przyroda`,
    lecturer: fakePlatformUsers[ 1 ],
  },
  {
    id: `2`,
    name: `Oceanografia`,
    lecturer: fakePlatformUsers[ 0 ],
  },
]
const fakeData = {
  fakePlatformUsers,
  fakeGroupRoles,
  fakeGroups,
}

/**
 * @param {object} props
 * @param {object[]} props.fields
 * @param {string} props.fields.name
 * @param {string} props.fields.label
 * @param {string} [props.fields.dataFieldname]
 * @param {(field) => string} [props.fields.processor]
 * @param {object} [props.fields.adder]
 * @param {number} [props.fields.adder.colspan]
 * @param {(data:string) => Error?} props.fields.adder.validator
 */


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
              <th key={name}>{label}</th>
            ) )
          }
          <th>{props.staticLabels?.actions || `Actions`}</th>
        </tr>
      ),

      tableAdder: (
        <>
          {
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
          }
          <td>
            <button>{props.staticLabels?.create || `Create`}</button>
          </td>
        </>
      ),

      tableRows: [],
    }
  }


  componentDidMount() {
    // const tableAdderFields
    const {
      getDataAddress,
      fields,
      staticLabels,
      deletePosibilityChecker = () => false,
    } = this.props

    const del = this.props.deleteDataAddress != null
    const data = fakeData[ getDataAddress ]
    const tableRows = data.map( field => {
      let edit = false

      return (
        <tr key={field.id}>
          {
            fields.map( ({ editable, name, dataFieldname = name, processor = it => it }) => {
              if (editable) edit = true

              return (
                <td key={name}>
                  {
                    editable
                      ? this.tableAdderFields[ name ]( field[ dataFieldname ] )
                      : processor( field[ dataFieldname ] )
                  }
                </td>
              ) },
            )
          }
          <td>
            {del && deletePosibilityChecker( field ) && <button>{staticLabels?.delete || `Delete`}</button>}
            {edit && <button>{staticLabels?.edit || `Edit`}</button>}
          </td>
        </tr>
      )
    } )

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
