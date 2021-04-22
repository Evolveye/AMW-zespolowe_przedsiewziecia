import React from "react"

import classes from "./spoiler.module.css"

export default ({ title, className = ``, children }) => (
  <details className={`${classes.spoiler} ${className}`}>
    <summary className={classes.summary}>{title}</summary>

    <div className={classes.content}>{children}</div>
  </details>
)
