import React from "react"
import { Link } from "gatsby"

import SEO from "../components/seo.js"
import MainNav from "../components/mainNav.js"
import UserField from "../components/userField.js"
import MainSearch from "../components/mainSearch.js"
import { LinksPath } from "../components/links.js"

import Logo from "../models/logo.js"

import "../css/sanitize.css"
import classes from "./main.module.css"

export default ({ className=``, navElements, titlesPathConfig, children }) => (
  <div className={`root ${classes.root}`}>
    <SEO title="Strona główna" />

    <div className={classes.columnA}>
      <Link className={classes.logo} to="/">
        <Logo
          size={50}
          text=""
        />
      </Link>
      <MainNav className={classes.mainNav} />
    </div>

    <div className={classes.columnB}>
      <UserField className={classes.userField} />

      <nav className={classes.subNav}>
        {
          navElements.map( ({ label, link }) => (
            <Link
              key={link}
              className={classes.subNavField}
              to={link}
            >
              {label}
            </Link>
          ) )
        }
      </nav>
    </div>

    <header className={classes.header}>
      {/* <TitlesNav className={classes.titlesNav} /> */}
      <LinksPath
        className={classes.linksPath}
        staticPath={titlesPathConfig.staticPath}
        queryPath={titlesPathConfig.queryPath}
      />
      <MainSearch className={`${classes.search} is-centered`} />
    </header>

    <main className={`${classes.main} ${className}`}>
      {children}
    </main>

    <footer className={`${classes.footer} is-centered`}>
      &copy; Copyright
      {` `}
      {new Date().getUTCFullYear()}
    </footer>
  </div>
)
