import React from "react"

export default ({ className = ``, children }) => (
  <ul className={className}>
    {children}
  </ul>
)
