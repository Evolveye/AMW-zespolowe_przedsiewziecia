import React from "react"

import classes from "./list.module.css"

export default ({ array }) => (
  <ul className={classes.list}>
    {array.map( (item, i) => <li key={i} className={`highlighted ${classes.item}`} >{item}</li> )}
  </ul>
)
