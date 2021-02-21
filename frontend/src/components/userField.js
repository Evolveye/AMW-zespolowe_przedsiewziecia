import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import classes from "./userField.module.css"

const query = graphql`
  query {
    defaultAvatar: file( relativePath:{ eq:"default_avatar.png" } ) {
      childImageSharp {
        fluid( maxWidth:500 ) { ...GatsbyImageSharpFluid }
      }
    }
  }
`

export default ({ className=`` }) => {
  const { defaultAvatar } = useStaticQuery( query )
  const name = `Imię`
  const surname = `Nazwisko`

  return (
    <Link className={`${classes.userField} ${className}`} to="/user/profile">
      <Img
        className={classes.avatar}
        style={{ width:`40px` }}
        fluid={defaultAvatar.childImageSharp.fluid}
        alt="user avatar"
      />

      <div className={classes.userData}>
        <span className={classes.name}>{name}</span>
        <span className={classes.surname}>{surname}</span>
      </div>
    </Link>
  )
}
