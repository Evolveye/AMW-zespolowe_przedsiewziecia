import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

// import classes from "./switchBox.module.css"


export const Tab = () => null
Tab.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  children: PropTypes.any,
}


export default function SwitchBox({ classNames, children }) {
  const css = classNames || {}
  const tabs = React.Children
    .toArray( children )
    .filter( ({ type }) => type === (<Tab name="" />).type )

  if (!tabs.length) return null

  const [ activeTab, setActiveTab ] = useState( null )
  const tabToShow = activeTab ?? tabs[ 0 ]
  const activeProps = tabToShow.props

  return (
    <article className={css.it}>
      {
        (tabs.length > 1 || tabs[ 0 ].props.name != ``) && (
          <section className={css.switches}>
            {
              tabs.map( tab => {
                const { name } = tab.props
                const activeClassname = activeProps.name === name ? css.activeSwitch : ``

                return (
                  <button
                    key={name}
                    className={`${css.switch} ${activeClassname}`}
                    onClick={() => setActiveTab( tab )}
                  >
                    {name}
                  </button>
                )
              } )
            }
          </section>
        )
      }

      <article key={activeProps.name} className={activeProps.className}>
        {tabToShow.props.children}
      </article>
    </article>
  )
}


