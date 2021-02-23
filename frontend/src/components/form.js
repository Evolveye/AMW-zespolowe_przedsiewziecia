import React, { useState } from "react"

import classes from "./form.module.css"

export default ({ className = ``, tab, tabs }) => {
  if (tab) {
    tabs = [ tab ]
  }

  const [ activeTab, setActiveTab ] = useState( tabs[ 0 ] )
  const [ fieldsValues, setValues ] = useState({})
  const updateValues = ({ target }) => setValues({ [ target.name ]:target.value, ...fieldsValues })
  const submit = e => {
    e.preventDefault()
    activeTab.summary?.onSubmit( fieldsValues )
  }

  return (
    <article className={`${classes.form} ${className}`}>
      <section>
        {
          tabs.map( tab => (
            <button
              key={tab.name}
              className={`${classes.tabChanger} ${activeTab.name === tab.name ? classes.isActive : ``}`}
              onClick={() => setActiveTab( tab )}
            >
              {tab.name}
            </button>
          ) )
        }
      </section>
      <form className={classes.tab}>
        {
          activeTab.fields.map( ({ type, name, label, validator }) => (
            <input
              key={label}
              className={classes.input}
              type={type}
              name={name}
              placeholder={label}
              autoComplete={`${activeTab.name} ${name}`}
              onChange={updateValues}
            />
          ) )
        }
        {
          activeTab.summary && (
            <button type="submit" onClick={submit}>{activeTab.summary.label}</button>
          )
        }
      </form>
    </article>
  )
}
