import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <header>
    <Link
          to="/"
          className="logo"
        >
          SASS
        </Link>
        <ul className="navigate">
            <li> <Link to="#wstep">Start</Link> </li>
            <li> <Link to="#logowanie">Logowanie</Link> </li>
            <li> <Link to="#rejestracja">Rejestracja</Link> </li>
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
