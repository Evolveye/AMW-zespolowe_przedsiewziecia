import React, { useState } from "react"

import SwitchBox from "./switchBox.js"
import classes from "./form.module.css"

export default ({ className = ``, tab, tabs }) => {
  if (tab) tabs = [ tab ]

  const [ fieldsValues, setValues ] = useState({})
  const updateValues = ({ target }) => setValues({ [ target.name ]:target.value, ...fieldsValues })
  const submit = (e, tab) => {
    e.preventDefault()
    tab.summary?.onSubmit( fieldsValues )
  }

  return (
    <SwitchBox
      className={`${classes.form} ${className}`}
      tabChangerClassName={classes.tabChanger}
      isActiveClassName={classes.isActive}
      tabs={
        tabs.map( tab => {
          tab.node = (
            <form className={classes.tab}>
              {
                tab.fields.map( ({ type, name, label, validator }) => (
                  <input
                    key={label}
                    className={classes.input}
                    type={type}
                    name={name}
                    placeholder={label}
                    autoComplete={`${tab.name} ${name}`}
                    onChange={updateValues}
                  />
                ) )
              }
              {
                tab.summary && (
                  <button type="submit" onClick={e => submit( e, tab )}>{tab.summary.label}</button>
                )
              }
            </form>
          )

          return tab
        } )
      }
    />
    // <article className={`${classes.form} ${className}`}>
    //   <section>
    //     {
    //       tabs.map( tab => (
    //         <button
    //           key={tab.name}
    //           className={`${classes.tabChanger} ${activeTab.name === tab.name ? classes.isActive : ``}`}
    //           onClick={() => setActiveTab( tab )}
    //         >
    //           {tab.name}
    //         </button>
    //       ) )
    //     }
    //   </section>
    //   <form className={classes.tab}>
    //     {
    //       activeTab.fields.map( ({ type, name, label, validator }) => (
    //         <input
    //           key={label}
    //           className={classes.input}
    //           type={type}
    //           name={name}
    //           placeholder={label}
    //           autoComplete={`${activeTab.name} ${name}`}
    //           onChange={updateValues}
    //         />
    //       ) )
    //     }
    //     {
    //       activeTab.summary && (
    //         <button type="submit" onClick={submit}>{activeTab.summary.label}</button>
    //       )
    //     }
    //   </form>
    // </article>
  )
}
