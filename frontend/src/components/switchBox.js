import React, { useState } from "react"

// import classes from "./switchBox.module.css"

export default ({
  className = ``,
  switchClassname = ``,
  switchesWrapperClassname = ``,
  activeSwitchClassname = ``,
  children,
}) => {
  const tabs = React.Children
    .toArray( children )
    .filter( ({ type }) => type === (<Tab />).type )

  if (!tabs.length) return null

  const [ activeTab, setActiveTab ] = useState( tabs[ 0 ] )

  return (
    <article className={className}>
      <section className={switchesWrapperClassname}>
        {
          tabs.map( tab => {
            const { name } = tab.props
            const activeClassname = activeTab.props.name === name ? activeSwitchClassname : ``

            return (
              <button
                key={name}
                className={`${switchClassname} ${activeClassname}`}
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

export const Tab = ({ className, children }) => (
  <section className={className}>{children}</section>
)
