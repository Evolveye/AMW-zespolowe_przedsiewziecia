import React, { useState } from "react"
import PropTypes from "prop-types"

// import classes from "./switchBox.module.css"


export const Tab = ({ className, children }) => (
  <section className={className}>{children}</section>
)
Tab.propTypes = {
  name: PropTypes.string.isRequired,
}


export default function SwitchBox({ classNames, children }) {
  const tabs = React.Children
    .toArray( children )
    .filter( ({ type }) => type === (<Tab name="" />).type )

  if (!tabs.length) return null

  const [ activeTab, setActiveTab ] = useState( tabs[ 0 ] )

  return (
    <article className={classNames?.it}>
      <section className={classNames?.switches}>
        {
          tabs.map( tab => {
            const { name } = tab.props
            const activeClassname = activeTab.props.name === name ? classNames?.activeSwitch : ``

            return (
              <button
                key={name}
                className={`${classNames?.switch} ${activeClassname}`}
                onClick={() => setActiveTab( tab )}
              >
                {name}
              </button>
            )
          } )
        }
      </section>

      <article key={activeTab.props.name}>
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
