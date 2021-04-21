import React from "react"
import { Link } from "gatsby"

import "../css/sanitize.css"
import "../css/main.css"
import "../css/neumorphizm.css"

import SEO from "../components/seo.js"
import PlatformChooser from "../containers/platformChooser.js"
import PlatformSubPagesNav from "../containers/subPagesNav.js"
// import SearchBar from "../components/searchBar.js"
import UserField from "../containers/userField.js"

import Logo from "../models/logo.js"

import classes from "./base.module.css"
import { isLogged, AuthContextProvider } from "../utils/auth.js"

export default ({ className = ``, children, title }) => {
  // const platformSubPagesNav = <PlatformSubPagesNav className={classes.platformSubPages} />
  // const platformSubPagesNavWithSeparators = React.Children.map( platformSubPagesNav.props.children, child => (
  //   <>
  //     <span className={classes.separator}>::</span>
  //     {child}
  //   </>
  // ) )

  // console.log( { platformSubPagesNavWithSeparators }, platformSubPagesNav.props )

  return (
    <div className={`root ${classes.root}`}>
      <SEO title={title} />

      <AuthContextProvider>
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
      </AuthContextProvider>
    </div>
  )
}


// .map( (link, i, arr) => (
//   <React.Fragment key={link.key}>
//     {console.log({ link, i, arr })}
//     {link}
//     {i === arr.length - 1 ? null : <span className={classes.separator}>::</span>}
//   </React.Fragment>
// ) )
