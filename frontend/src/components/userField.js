import React, { useState } from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import ToggableBox from "./toggableBox.js"
import { getUser } from "../utils/auth"

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

export default ({ className = `` }) => {
  const { defaultAvatar } = useStaticQuery( query )
  const { name, surname } = getUser()

  return (
    <ToggableBox
      className={`${classes.userField} ${className}`}
      btnClassName={classes.activator}
      boxClassName={classes.data}
      btnContent={
        <Img
          className={classes.avatar}
          fluid={defaultAvatar.childImageSharp.fluid}
          alt="user avatar"
        />
      }
    >
      <span className={classes.name}>{name}</span>
      <span className={classes.surname}>{surname}</span>

      <hr />

      <Link to="/logout">Wyloguj</Link>
    </ToggableBox>
  )
}
