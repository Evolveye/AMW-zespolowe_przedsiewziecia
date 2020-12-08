import { Link, navigate } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import { getUser, isLoggedIn, logout } from "../services/auth"
const Header = ({ siteTitle }) => (
  <header>
    <Link
          to="/"
          className="logo"
        >
          SASS
        </Link>
        <ul className="navigate">

            <li> <Link to="/">Start</Link> </li>
            {isLoggedIn()?( 
            [
            <li> <Link to="/" >Wyloguj</Link> </li>, 
            ]

            ):[
            <li> <Link to="/app/login2">Logowanie</Link> </li>,
            <li> <Link to="#rejestracja">Rejestracja</Link> </li>
            ]
          }
        </ul>
  </header>
  
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
