import React from "react"
import { Link } from "gatsby"

import "../css/sanitize.css"
import "../css/neumorphizm.css"

import SEO from "../components/seo.js"
import PlatformChooser from "../containers/platformChooser.js"
import PlatformSubPagesNav from "../containers/subPagesNav.js"
import SearchBar from "../components/searchBar.js"
import UserField from "../containers/userField.js"

import Logo from "../models/logo.js"

import classes from "./base.module.css"
import { isLogged } from "../utils/auth.js"

export default ({ className = ``, children, title }) => {
  const headerNavigationElements = [
    <Link key="link" className={classes.logo} to="/">
      <Logo
        size={50}
        text=""
      />
    </Link>,

    ...(!isLogged() ? [] : [
      <PlatformChooser key="chooser" className={classes.platformNav} />,
      ...PlatformSubPagesNav({ className:classes.platformSubPages }),
    ]),
  ].map( (link, i, arr) => (
    <React.Fragment key={link.key}>
      {link}
      {i === arr.length - 1 ? null : <span className={classes.separator}>::</span>}
    </React.Fragment>
  ) )

  return (
    <div className={`root ${classes.root}`}>
      <SEO title={title} />

      <header className={classes.header}>
        <section className={classes.navigationPath}>
          {headerNavigationElements}
        </section>

        {
          isLogged() && <>
            <SearchBar className={`${classes.search} is-centered`} />
            <UserField className={classes.userField} />
          </>
        }
      </header>

      <div className={`${classes.contentWrapper} ${className}`}>
        {children}
      </div>
    </div>
  )
}
