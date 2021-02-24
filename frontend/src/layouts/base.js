import React from "react"
import { Link } from "gatsby"

import SEO from "../components/seo.js"
import PlatformNav from "../components/platformNav.js"
import PlatformSubPages from "../components/platformSubPages.js"
import MainSearch from "../components/mainSearch.js"
import UserField from "../components/userField.js"

import Logo from "../models/logo.js"

import "../css/sanitize.css"
import classes from "./base.module.css"
import { isLogged } from "../utils/auth.js"

export default ({ className = ``, children, title }) => {
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


        {
          isLogged() && (
            <>
              <PlatformNav className={classes.platformNav} />
              <PlatformSubPages className={classes.platformSubPages} />
              <MainSearch className={`${classes.search} is-centered`} />
              <UserField className={classes.userField} />
            </>
          )
        }
      </header>

      <div className={`${classes.contentWrapper} ${className}`}>
        {children}
      </div>
    </div>
  )
}
