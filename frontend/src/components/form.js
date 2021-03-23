import React, { useState } from "react"
import PropTypes from "prop-types"

import SwitchBox, { Tab as SwitchTab } from "./switchBox.js"


const formFieldProps = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  validator: PropTypes.func,
}


export const Tab = () => null
Tab.type = (<Tab name="" />).type
Tab.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
}


export const Text = () => null
Text.type = (<Text name="" />).type
Text.propTypes = formFieldProps


export const Password = () => null
Password.type = (<Password name="" />).type
Password.propTypes = formFieldProps


export const Submit = () => null
Submit.type = (<Submit />).type
Submit.propTypes = {
  className: PropTypes.string,
  handler: PropTypes.func,
}


export default function Form({ classNames, children }) {
  const [ fieldsValues, setValues ] = useState({})
  const updateValues = ({ target }) => setValues({
    [ target.name ]: target.value,
    ...fieldsValues,
  })
  const onSubmit = (e, { handler }) => {
    e.preventDefault()
    if (typeof handler === `function`) handler( fieldsValues )
  }

  return (
    <SwitchBox classNames={classNames}>
      {
        React.Children
          .toArray( children )
          .filter( c => c.type === Tab.type )
          .map( tab => (
            <SwitchTab
              key={tab.props.name}
              name={tab.props.name}
              className={tab.props.className}
            >
              <form>
                {processFormChildren( tab, updateValues, onSubmit )}
              </form>
            </SwitchTab>
          ) )
      }
    </SwitchBox>
  )
}
Form.propTypes = {
  classNames: PropTypes.shape({
    it: PropTypes.string,
    switch: PropTypes.string,
    switcher: PropTypes.string,
    switches: PropTypes.string,
    activeSwitch: PropTypes.string,
  }),
}


function processFormChildren( element, updateValues, onSubmit ) {
  return React.Children.map( element.props.children, child => {
    if (typeof child.type === `string`) {
      return React.cloneElement( child, child.props, processFormChildren( child ) )
    }

    const { props } = child
    const inputProps = {
      key: props.name,
      name: props.name,
      autoComplete: `${element.name} ${props.name}`,
      className: props.className,
      placeholder: props.children,
      onChange: updateValues,
    }

    switch (child.type) {
      case Text.type:     return <input type="text" {...inputProps} />
      case Password.type: return <input type="password" {...inputProps} />

      case Submit.type: return (
        <button
          key="submit"
          className={props.className}
          onClick={e => onSubmit( e, props )}
        >
          {props.children}
        </button>
      )

      default: return null
    }
  } )
}
