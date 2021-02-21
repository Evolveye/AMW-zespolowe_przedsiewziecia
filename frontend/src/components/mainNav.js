import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import Img from "gatsby-image"

import classes from "./mainNav.module.css"

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

const Field = ({ iconFluid, text, link }) => (
  <li className={classes.field}>
    <Link to={link}>
      <div className={classes.fieldIconWrapper}>
        <Img
          className={classes.fieldIcon}
          fluid={iconFluid}
          alt="icon"
        />
      </div>
      <span className={classes.fieldText}>{text}</span>
    </Link>
  </li>
)

export default ({ className=`` }) => {
  const queryResult = useStaticQuery( query )

  return (
    <nav className={`${classes.nav} ${className}`}>
      <ol className={classes.fields}>
        {
          notLogged.map( ({ icon, ...rest }) => (
            <Field
              key={icon}
              iconFluid={queryResult[ icon ].childImageSharp.fluid}
              {...rest}
            />
          ) )
        }
      </ol>
      {/* <ul className="list">
        <li className="list-item"><Link to="/">Strona główna</Link></li>
        <li className="list-item"><Link to="/login">Zaloguj się</Link></li>
        <li className="list-item"><Link to="/register">Zarejestruj się</Link></li>
      </ul> */}
    </nav>
  )
}
