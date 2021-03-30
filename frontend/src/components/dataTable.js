import React from "react"
import PropTypes from "prop-types"


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
  {
    id: `3`,
    color: null,
    name: `Student`,
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

export const Field = () => null
Field.type = (<Field name="" />).type
Field.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  dataFieldname: PropTypes.string,
  editable: PropTypes.bool,
}


export const Processor = () => null
Processor.type = (<Processor name="" />).type
Processor.propTypes = {
  render: PropTypes.func.isRequired,
}


export const Adder = () => null
Adder.type = (<Adder name="" />).type
Adder.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  validator: PropTypes.func,
  getDataAddress: PropTypes.func,
}


export default class DataTable extends React.Component {
  constructor( props ) {
    super( props )

    this.fields = React.Children
      .toArray( this.props.children )
      .filter( ({ type }) => type === Field.type )
      .map( ({ props }) => props )
    let colspanCounter = 1

    this.tableAdderFields = this.fields.reduce( (obj, { name, children }) => {
      if (colspanCounter !== 1) {
        colspanCounter--
        return obj
      }

      const adder = React.Children
        .toArray( children )
        .filter( ({ type }) => type === Adder.type )[ 0 ]

      colspanCounter = adder.props.colspan || 1

      return { [ name ]:this.getInputCreator( adder.props ), ...obj }
    }, {} )

    colspanCounter = 1

    this.state = {
      tableHeaders: (
        <tr>
          {this.fields.map( ({ label }) => <th key={label}>{label}</th> )}
          <th>{props.staticLabels?.actions || `Actions`}</th>
        </tr>
      ),

      tableAdder: (
        <>
          {
            this.fields.map( ({ label, name, children }) => {
              const adder = React.Children
                .toArray( children )
                .filter( ({ type }) => type === Adder.type )[ 0 ]

              if (colspanCounter !== 1) {
                colspanCounter--
                return null
              }

              colspanCounter = adder.props.colspan || 1

              return (
                <td key={label} colSpan={colspanCounter}>
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
            this.fields.map( ({ editable, name, dataFieldname = name, children }) => {
              const processor = React.Children
                .toArray( children )
                .filter( ({ type }) => type === Processor.type )[ 0 ]
                ?.props
                .render || (it => it)

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
        inputCreator = defaultValue => <input defaultValue={validator( defaultValue )} />
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
    <table className={this.props.className || ``}>
      {console.log( this.props )}
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
