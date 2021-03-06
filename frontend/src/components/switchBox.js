import React, { useState } from "react"

// import classes from "./switchBox.module.css"

export default ({ className = ``, tabChangerClassName = ``, isActiveClassName = ``, tabs }) => {
  const [ activeTab, setActiveTab ] = useState( tabs[ 0 ] )

  return (
    <article className={className}>
      <section>
        {
          tabs.map( tab => (
            <button
              key={tab.name}
              className={`${tabChangerClassName} ${activeTab.name === tab.name ? isActiveClassName : ``}`}
              onClick={() => setActiveTab( tab )}
            >
              {tab.name}
            </button>
          ) )
        }
      </section>

      <section>
        <React.Fragment key={activeTab.name}>
          {activeTab.node}
        </React.Fragment>
      </section>
    </article>
  )
}
