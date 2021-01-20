import React from "react"

/** @type {React.CSSProperties} */
const style = {
  display: `block`,
  backgroundColor: `#96d588`,
  borderRadius: `50%`,
  border: `1px solid #aaa`,
}

export default ({ size = 100 }) => (
  <div style={{ width: `${size}px`, height: `${size}px`, ...style }}></div>
)
