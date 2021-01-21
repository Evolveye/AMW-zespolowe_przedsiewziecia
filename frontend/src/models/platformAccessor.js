import React from "react"
import { Link } from "gatsby"

import classes from "./platformAccessor.module.css"

export default class PlatformAccessor {
  render = () => {
    const { id, name } = this.props.platform
    const shortcut = name
      .split(/ /g)
      .map(word => word.charAt(0))
      .slice(0, 4)
      .join(``)
    const getColorFromStr = str =>
      `#${str[0] ?? 5}f${str[1] ?? 5}f${str[2] ?? 5}f`
    const backgroundColor = getColorFromStr(shortcut)

    return (
      <Link
        className={classes.accessor}
        style={{ backgroundColor }}
        to={`/platform?id=${id}`}
      >
        {shortcut}
      </Link>
    )
  }
}

export const PlatformAdder = () => (
  <Link className={classes.adder} to={`/platform/create`} />
)
