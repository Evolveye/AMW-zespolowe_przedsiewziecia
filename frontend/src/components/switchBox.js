import React, { useState } from "react"
import PropTypes from "prop-types"

// import classes from "./switchBox.module.css"


export const Tab = () => null
Tab.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
}


export default function SwitchBox({ classNames, children }) {
  const css = classNames || {}
  const tabs = React.Children
    .toArray( children )
    .filter( ({ type }) => type === (<Tab name="" />).type )

  if (!tabs.length) return null

  const [ activeTab, setActiveTab ] = useState( tabs[ 0 ] )
  const activeProps = activeTab.props

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
        {activeTab.props.children}
      </article>
    </article>
  )
}

SwitchBox.propTypes = {
  classNames: PropTypes.shape({
    it: PropTypes.string,
    switch: PropTypes.string,
    switches: PropTypes.string,
    activeSwitch: PropTypes.string,
  }),
}
