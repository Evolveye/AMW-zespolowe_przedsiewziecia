import React from "react"
import { Link } from "gatsby"

export default ({ className=`` }) => (
  <nav className={className}>
    <ul className="list">
      <li className="list-item"><Link to="/">Strona główna</Link></li>
      <li className="list-item"><Link to="/login">Zaloguj się</Link></li>
      <li className="list-item"><Link to="/register">Zarejestruj się</Link></li>
    </ul>
  </nav>
)
