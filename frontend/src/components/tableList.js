import React from "react"

export default ({ className, children }) => (
  <table className={className}>
    <tbody>
      {children}
    </tbody>
  </table>
)

export const Tr = ({ className, children }) =>
  <tr className={className}>{children}</tr>

export const Td = ({ className, slim, children }) =>
  <td className={className}>{children}</td>
