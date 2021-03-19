import React from "react"

import ToggleBox from "./toggableBox.js"

import classes from "./select.module.css"
import { Link } from "gatsby"

export default ({
  className = ``,
  selectedItemClassName = ``,
  itemsClassName = ``,
  btnClassName = ``,
  btnIsActiveClassname,
  children,
  render,
}) => (
  <article className={`${className} ${classes.select}`}>
    <section className={`${classes.value} ${selectedItemClassName}`}>
      {render()}
    </section>

    <ToggleBox
      className={classes.toggleBox}
      boxClassName={`${classes.toggleBoxContent} ${itemsClassName}`}
      btnClassName={`${classes.toggleBoxBtn} ${btnClassName}`}
      btnIsActiveClassname={btnIsActiveClassname}
      btnContent=""
    >
      {children}
    </ToggleBox>
  </article>
)

export const Item = ({ className, children, linkTo }) => (
  linkTo
    ? <Link className={`${classes.item} ${className}`} to={linkTo}>{children}</Link>
    : <span className={`${classes.item} ${className}`}>{children}</span>
)
