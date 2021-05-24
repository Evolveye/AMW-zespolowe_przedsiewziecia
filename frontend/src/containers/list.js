import React from "react"

import classes from "./list.module.css"

export default ({ className = ``, array }) => (
  <ul className={`${classes.list} ${className}`}>
    {array.map( (item, i) => <li key={i} className={`highlighted ${classes.item}`} >{item}</li> )}
  </ul>
)
