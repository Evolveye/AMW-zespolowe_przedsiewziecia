import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import SwitchBox, { Tab as SwitchTab } from "./switchBox.js"


const formFieldProps = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  validator: PropTypes.func,
  value: PropTypes.string,
  children: PropTypes.any,
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


export const Button = () => null
Button.type = (<Button name="" />).type
Button.propTypes = { ...formFieldProps, onClick:PropTypes.func }


const Form = ({ errorBoxClassName, successBoxClassName, tab }) => {
  const [ fieldsValues, setValues ] = useState({})
  const [ response, setResponse ] = useState({ error:null, success:null })

  const updateValues = ({ target }) => {
    setValues( currentValues => ({
      ...currentValues,
      [ target.name ]: target.value,
    }) )
  }

  const onSubmit = async(e, { handler }) => {
    e.preventDefault()
    if (typeof handler !== `function`) return

    const response = await handler( fieldsValues )

    console.log({ response })
    if (response?.error) return setResponse({ success:null, error:response.error })
    if (response?.success) return setResponse({ success:response.success, error:null })

    setResponse({ success:null, error:null })
  }

  return (
    <form>
      {processFormChildren( tab, updateValues, onSubmit )}
      {response.error && <div className={errorBoxClassName}>{response.error}</div>}
      {response.success && <div className={successBoxClassName}>{response.success}</div>}
    </form>
  )
}


export default function FormWrapper({ classNames, children }) {
  const tabs = React.Children
    .toArray( children )
    .filter( c => c.type === Tab.type )

  if (!tabs.length) tabs.push( <Tab name="">{children}</Tab> )

  return (
    <SwitchBox classNames={classNames}>
      {
        tabs.map( tab => (
          <SwitchTab
            key={tab.props.name}
            name={tab.props.name}
            className={tab.props.className}
          >
            <Form successBoxClassName={classNames.successBox} errorBoxClassName={classNames.errorBox} tab={tab} />
          </SwitchTab>
        ) )
      }
    </SwitchBox>
  )
}


function processFormChildren( element, updateValues, onSubmit ) {
  return React.Children.map( element.props.children, child => {
    if (typeof child.type === `string`) {
      return React.cloneElement( child, child.props, processFormChildren( child, updateValues, onSubmit ) )
    }

    const { props } = child
    const [ value, setValue ] = useState( [ `number`, `string` ].includes( typeof props.value ) ? props.value : null )
    const inputProps = {
      key: props.name,
      name: props.name,
      autoComplete: `${element.name} ${props.name}`,
      className: props.className,
      placeholder: props.children,
      onInput: updateValues,
      defaultValue: value,
    }

    useEffect( () => {
      if (props.value instanceof Promise) props.value.then( setValue )
    }, [] )

    switch (child.type) {
      case Text.type:     return <input type="text" {...inputProps} />
      case Password.type: return <input type="password" {...inputProps} />
      case Button.type: return <button type="button" {...props} />

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
