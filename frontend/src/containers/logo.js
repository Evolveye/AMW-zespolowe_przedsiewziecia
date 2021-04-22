import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

const query = graphql`
  query {
    logo: file( relativePath:{ eq:"logo.png" } ) {
      childImageSharp {
        fluid( maxWidth:500 ) { ...GatsbyImageSharpFluid }
      }
    }
  }
`

export default ({ className = ``, size, text = `Platforma edukacyjna` }) => {
  const { logo } = useStaticQuery( query )

  return (
    <div className={`is-centered ${className}`}>
      <Img
        style={{ width:`${size}px` }}
        fluid={logo.childImageSharp.fluid}
        alt="logo"
      />
      {
        text && (
          <span>
            blablablabla
          </span>
        )
      }

    </div>
  )
}
