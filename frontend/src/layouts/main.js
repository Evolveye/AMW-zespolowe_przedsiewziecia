import React from "react"

import SEO from "../components/seo.js"
import MainNav from "../components/mainNav.js"
import UserField from "../components/userField.js"
import MainSearch from "../components/mainSearch.js"
import TitlesNav from "../components/titlesNav.js"

import "../css/sanitize.css"

import classes from "./main.module.css"

export default ({ className = ``, header, nav, children }) => (
  <div className={`root ${classes.root}`}>
    <SEO title="Strona główna" />

    <MainNav className={classes.mainNav} />
    <UserField className={classes.userField} />

    <header className={classes.header}>
      <TitlesNav className={classes.titlesNav} />
      {/* {titlesNav({ className:classes.titlesNav })} */}
      <MainSearch className={classes.search} />
    </header>

    {nav({ className:classes.nav })}

    <main className={`${classes.main} ${className}`}>
      {children}
    </main>

    <footer className={classes.footer}>
      &copy; Copyright
      {` `}
      {new Date().getUTCFullYear()}
    </footer>
  </div>
)
