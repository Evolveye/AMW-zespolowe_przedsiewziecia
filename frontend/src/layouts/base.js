import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import "../css/sanitize.css"
import "../css/main.css"
import "../css/neumorphizm.css"

import SEO from "../components/seo.js"
import PlatformChooser from "../containers/platformChooser.js"
import PlatformSubPagesNav from "../containers/subPagesNav.js"
// import SearchBar from "../components/searchBar.js"
import UserField from "../containers/userField.js"

import Logo from "../containers/logo.js"

import { isLogged } from "../utils/auth.js"
import { getWebsiteContext } from "../utils/functions.js"

import classes from "./base.module.css"


export default ({ className = ``, children, title }) => {
  const [ websiteContext, setWebsiteContext ] = useState( getWebsiteContext() )

  useEffect( () => {
    if (!(websiteContext instanceof Promise)) return

    let mounted = true

    websiteContext.then( ctx => mounted && setWebsiteContext( ctx ) )

    return () => mounted = false
  }, [] )

  return (
    <div className={`root ${classes.root}`}>
      <SEO title={title} />
      {websiteContext instanceof Promise ? <Loading /> : <PageContent className={className} children={children} />}
    </div>
  )
}


const Loading = () => (
  <div>
    <span>Ładowanie</span>
  </div>
)


const PageContent = ({ className, children }) => (
  <>
    <header className={classes.header}>
      <section className={classes.navigationPath}>
        <Link className={classes.logo} to="/">
          <Logo size={50} text="" />
        </Link>
        {
          isLogged() && <>
            <span className={classes.separator}>::</span>
            <PlatformChooser className={classes.platformNav} />
            <PlatformSubPagesNav classNames={{ item:classes.navigationPathItem }} />
          </>
        }
      </section>

      {
        isLogged() && <>
          {/* <SearchBar className={`${classes.search} is-centered`} /> */}
          <UserField className={classes.userField} />
        </>
      }
    </header>

    <div className={`${classes.contentWrapper} ${className}`}>
      {children}
    </div>
  </>
)
