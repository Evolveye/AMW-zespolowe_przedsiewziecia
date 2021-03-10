import React from "react"

import ToggleBox from "./toggableBox.js"

import classes from "./select.module.css"
import { Link } from "gatsby"

export default ({ className = ``, children, render }) => (
  <article className={classes.select}>
    <section className={classes.value}>
      {render()}
    </section>

    <ToggleBox
      className={classes.toggleBox}
      boxClassName={classes.toggleBoxContent}
      btnClassName={classes.toggleBoxBtn}
      btnContent=""
    >
      {children}
    </ToggleBox>
  </article>
)

export const Item = ({ children, linkTo }) => (
  linkTo
    ? <Link className={classes.value} to={linkTo}>{children}</Link>
    : <span className={classes.value}>{children}</span>
)
