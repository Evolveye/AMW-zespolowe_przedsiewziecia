import React from "react"
import { Link } from "gatsby"

export default (className, content, linkAddress=``) => {
  if (!linkAddress) return <div className={className}>{content}</div>
  if (/http/.test( linkAddress )) return <a className={`${className} is-not-decorative`} href={linkAddress}>{content}</a>

  return <Link className={`${className} is-not-decorative`} to={linkAddress}>{content}</Link>
}