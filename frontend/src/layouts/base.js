import React from "react"
import { Link } from "gatsby"

import SEO from "../containers/seo.js"
import PlatformChooser from "../containers/platformChooser.js"
import PlatformSubPagesNav from "../containers/subPagesNav.js"
import SearchBar from "../components/searchBar.js"
import UserField from "../containers/userField.js"

import Logo from "../models/logo.js"

import "../css/sanitize.css"
import classes from "./base.module.css"
import { isLogged } from "../utils/auth.js"

export default ({ className = ``, children, title }) => {
  return (
    <div className={`root ${classes.root}`}>
      <SEO title={title} />

      <header className={classes.header}>
        <section className={classes.navigationPath}>
          <Link className={classes.logo} to="/">
            <Logo
              size={50}
              text=""
            />
          </Link>

          {
            isLogged() && <>
              <PlatformChooser className={classes.platformNav} />
              <PlatformSubPagesNav className={classes.platformSubPages} />
            </>
          }
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
