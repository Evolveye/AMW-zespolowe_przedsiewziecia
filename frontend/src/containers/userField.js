import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import ToggableBox from "../components/toggableBox.js"
import { getUser } from "../utils/auth"

import boxesClasses from "../css/box.module.css"
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
  console.log( getUser() )
  const { name, surname } = getUser()

  return (
    <ToggableBox
      className={`${classes.userField} ${className}`}
      btnClassName={`neumorphizm is-button ${classes.activator}`}
      btnIsActiveClassname="is-active"
      boxClassName={`${boxesClasses.wrapper} ${classes.data}`}
      btnContent={
        <Img
          className={classes.avatar}
          fluid={defaultAvatar.childImageSharp.fluid}
          alt="user avatar"
        />
      }
    >
      <h2>
        <span className={classes.name}>{name}</span>
        <span className={classes.surname}>{surname}</span>
      </h2>

      <hr />

      <Link className={`neumorphizm is-button ${classes.link}`} to="/user/notes">
        Oceny
      </Link>

      <Link className={`neumorphizm is-button ${classes.link}`} to="/user/settings">
        Ustawienia
      </Link>

      <hr />

      <Link className={`neumorphizm is-button ${classes.link} ${classes.logout}`} to="/logout">
        Wyloguj
      </Link>
    </ToggableBox>
  )
}
