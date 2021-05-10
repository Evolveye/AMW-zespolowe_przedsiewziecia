import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import { fetchOrGet } from "../utils/functions.js"



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
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  validator: PropTypes.func,
  getDataAddress: PropTypes.string,
  validateInitialData: PropTypes.func,
}


const InputField = ({
  defaultValue,
  className = ``,
  type,
  getDataAddress,
  processor,
  validator = () => true,
  validateInitialData = it => it,
  runAfterDataLoad,
}) => {
  const controlledProcessor = data => {
    const processedData = processor( data )
    return (typeof processedData === `object` && `value` in processedData && `label` in processedData)
      ? processedData
      : { label:processedData, value:processedData }
  }
  const [ data, setData ] = useState()
  const standardProps = {
    defaultValue: defaultValue ? controlledProcessor( defaultValue )?.value : undefined,
    key: typeof data,
    onChange: ({ target }) => validator( target.value ),
    className,
  }

  useEffect( () => {
    runAfterDataLoad( () => {
      if (getDataAddress) fetchOrGet( getDataAddress, setData )
    } )
  }, [] )

  switch (type) {
    case `file`: return <input type="file" {...standardProps} />
    case `text`: return <input type="text" {...standardProps} />
    case `color`: return <input type="color" {...standardProps} />
    case `number`: return <input type="number" {...standardProps} />
    case `checkbox`: return <input type="checkbox" {...standardProps} defaultChecked={standardProps.defaultValue} />
    case `datetime-local`: return <input type="datetime-local" {...standardProps} />
    case `textarea`: return <textarea {...standardProps} />

    case `select`: return (
      <select {...standardProps}>
        {
          (Array.isArray( data ) ? data : []).map( validateInitialData ).filter( it => it != null ).map( field => {
            const { value, label } = controlledProcessor( field )

            return <option key={value} value={value}>{label}</option>
          } )
        }
      </select>
    )

    default: null
  }
}


export default class DataTable extends React.Component {
  constructor( props ) {
    super( props )

    this.fields = React.Children
      .toArray( props.children )
      .filter( ({ type }) => type === Field.type )
      .map( ({ props }) => props )
      .map( props => {
        const childrenFilter = Component => React.Children
          .toArray( props.children )
          .filter( ({ type }) => type === Component.type )[ 0 ]

        const processor = childrenFilter( Processor )

        return {
          ...props,
          adder: childrenFilter( Adder ),
          processor: processor?.props.render || (it => it),
          processEntireField: processor?.props.entire || false,
        }
      } )

    const abilities = props.actionPosibility?.()
    let colspanCounter = 1

    this.tableAdderFields = this.fields.reduce( (obj, { name, adder, processor }) => {
      if (!obj || !adder) return null
      if (colspanCounter !== 1) {
        colspanCounter--
        return obj
      }

      colspanCounter = adder.props.colspan || 1

      return {
        [ name ]: defaultValue => (
          <InputField
            {...{
              defaultValue,
              processor,
              ...adder.props,
              runAfterDataLoad: this.runAfterDataLoad,
            }}
          />
        ), // this.getInputCreator({ processor, ...adder.props }),
        ...obj,
      }
    }, {} )

    colspanCounter = 1

    this.state = {
      tableHeaders: (
        <tr>
          {this.fields.map( ({ label, className = `` }) => <th className={className} key={label}>{label}</th> )}
          {!props.noActions && <th>{props.actionsLabel || `Actions`}</th>}
        </tr>
      ),

      tableAdder: (
        <>
          {
            this.tableAdderFields && this.fields.map( ({ label, name, children }) => {
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
          {
            !props.noActions && (
              <td>
                {
                  (abilities || abilities?.create) && (
                    <button className={props.create?.className || ``}>
                      {props.create?.label || `Create`}
                    </button>
                  )
                }
              </td>
            )
          }
        </>
      ),

      tableRows: [],
      waitingForDataCbs: [],
      inputs: {},
    }
  }


  async componentDidMount() {
    const {
      data: initialData,
      getData,
      getDataAddress = getData?.address,
      delete: del,
      edit,
      actionPosibility = () => false,
      noActions,
    } = this.props

    const data = initialData || await fetchOrGet( getDataAddress, getData?.headers || {} )

    if (!data) return

    const dataArr = Array.isArray( data ) ? data : data[ getData.responseField ]
    const tableRows = dataArr.map( field => {
      const abilities = actionPosibility( field )
      let editable = false

      return (
        <tr key={field.id}>
          {
            this.fields.map( ({ editable:editableField, name, dataFieldname = name, processEntireField, processor }) => {
              if (editableField && (abilities || abilities.edit)) editable = true

              const filler = editable ? this.tableAdderFields[ name ] : data => {
                // TODO show error on null // console.log( field, dataFieldname, field[ dataFieldname ] )
                const processedData = processor( data )
                return processedData?.label ?? processedData
              }

              const data = filler( processEntireField ? field : field[ dataFieldname ] )
              const value = typeof data === `boolean`
                ? <input disabled type="radio" defaultChecked={data} style={{ display:`block`, margin:`0 auto` }} />
                : data

              return <td key={name}>{value}</td>
            } )
          }
          {
            !noActions && (
              <td>
                {(abilities ?? abilities.delete) && (
                  <button className={del?.className || ``}>
                    {del?.label || `Delete`}
                  </button>
                )}

                {editable && (
                  <button className={edit?.className || ``}>
                    {edit?.label || `Edit`}
                  </button>
                )}
              </td>
            )
          }
        </tr>
      )
    } )

    this.setState({ tableRows })
    this.runAfterDataLoad()
  }


  runAfterDataLoad = cb => {
    if (cb && !this.state.tableRows.length) return this.setState( s => ({
      waitingForDataCbs: [ cb, ...s.waitingForDataCbs ],
    }) )

    Array( cb, ...this.state.waitingForDataCbs ).forEach( cb => cb?.() )

    if (this.state.waitingForDataCbs.length) this.setState({ waitingForDataCbs:[] })
  }


  render = () => (
    <table className={this.props.className || ``}>
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
DataTable.propTypes = {
  className: PropTypes.string,
  actionPosibility: PropTypes.func,
  actionsLabel: PropTypes.string,
  noActions: PropTypes.bool,
  data: PropTypes.arrayOf( PropTypes.object ),
  create: PropTypes.shape({ label:PropTypes.string, className:PropTypes.string }),
  delete: PropTypes.shape({ label:PropTypes.string, className:PropTypes.string }),
  edit: PropTypes.shape({ label:PropTypes.string, className:PropTypes.string }),
}
