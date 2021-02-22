import React from "react"
import { graphql, useStaticQuery, Link } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo.js"
import PlatformNav from "../components/platformNav.js"
import PlatformSubPages from "../components/platformSubPages.js"
import MainSearch from "../components/mainSearch.js"
import UserField from "../components/userField.js"

import Logo from "../models/logo.js"

import "../css/sanitize.css"
import classes from "./base.module.css"

const query = graphql`
  query {
    user: file( relativePath:{ eq:"user.png" } ) {
      childImageSharp {
        fluid( maxWidth:500 ) { ...GatsbyImageSharpFluid }
      }
    }

    userArrow: file( relativePath:{ eq:"user_arrow.png" } ) {
      childImageSharp {
        fluid( maxWidth:500 ) { ...GatsbyImageSharpFluid }
      }
    }
  }
`

const notLogged = [
  { icon:`user`,      text:`Logowanie`,   link:`/login` },
  { icon:`userArrow`, text:`Rejestracja`, link:`/register` },
]

export default ({ className=``, children, title, logged }) => {
  const queryResult = useStaticQuery( query )

  return (
    <div className={`root ${classes.root}`}>
      <SEO title={title} />

      <header className={classes.header}>
        <Link className={classes.logo} to="/">
          <Logo
            size={50}
            text=""
          />
        </Link>

        <PlatformNav className={classes.platformNav} />
        <PlatformSubPages className={classes.platformSubPages} />
        <MainSearch className={`${classes.search} is-centered`} />

        {
          logged ? <UserField className={classes.userField} /> : (
            <ol className={classes.noUserNav}>
              {
                notLogged.map( ({ icon, text, link }) => (
                  <li key={icon}>
                    <Link to={link} className={classes.noUserNavField}>
                      <div className={classes.noUserNavFieldIconWrapper}>
                        <Img
                          className={classes.noUserNavFieldIcon}
                          fluid={queryResult[ icon ].childImageSharp.fluid}
                          alt="icon"
                        />
                      </div>
                      <span className={classes.noUserNavFieldText}>{text}</span>
                    </Link>
                  </li>
                ) )
              }
            </ol>
          )
        }

      </header>

      <div className={`${classes.contentWrapper} ${className}`}>
        {children}
      </div>
    </div>
  )
}
