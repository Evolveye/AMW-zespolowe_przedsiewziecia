import React from "react"

import classes from "./note.module.css"

export default ({ className = ``, description, value, color }) => {

  return (
    <div className={`${classes.note} ${className}`}>
      <span className={classes.value} style={{ backgroundColor:color }}>{value}</span>
      <p className={classes.description}>{description}</p>
    </div>
  )
}
