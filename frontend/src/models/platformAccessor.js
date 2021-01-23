import React from "react"
import { Link } from "gatsby"

import classes from "./platformAccessor.module.css"

export default class PlatformAccessor extends React.Component {
  render = () => {
    const { id, name } = this.props.platform
    const shortcut = name
      .split(/ /g)
      .map(word => word.charAt(0))
      .slice(0, 4)
      .join(``)
    const getHexPart = char => char ? (char.charCodeAt( 0 ) % 16).toString( 16 ) : 5
    const getColorFromStr = str =>
      `#${getHexPart( str[0] )}f${getHexPart( str[1] )}f${getHexPart( str[2] )}f`
    const backgroundColor = getColorFromStr(shortcut)

    return (
      <Link
        className={classes.accessor}
        style={{ backgroundColor }}
        to={`/platform/it?platformId=${id}`}
      >
        {shortcut}
      </Link>
    )
  }
}

export const PlatformAdder = () => (
  <Link className={classes.adder} to={`/platform/create`} />
)
