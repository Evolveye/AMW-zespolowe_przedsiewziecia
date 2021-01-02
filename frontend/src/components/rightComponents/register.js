import React from "react"
import { Link } from "@reach/router"

/* icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons'

const RightContainerRegister = () => (
  <div className="right-container">
    <div className="login-form">
      <div className="login-form-header">
        <Link to="/"> <div className="logo-mini"></div> </Link>
        <div className="login-form-header-div-text">
          <span className="login-form-header-text">
            Platforma edukacyjna - rejestracja
          </span>
        </div>
      </div>
      <div className="login-box">
        <div className="login-box-form">
          <form method="post">
            <div className="textbox">
              <FontAwesomeIcon icon={faUser} size="2px" />
              <input type="text" name="username" placeholder="Imię" />
            </div>

            <div className="textbox">
            <FontAwesomeIcon icon={faUser} size="2px" />
              <input type="text" name="username" placeholder="Nazwisko" />
            </div>

            <div className="textbox">
            <FontAwesomeIcon icon={faEnvelope} size="2px" />
              <input type="text" name="username" placeholder="E-mail" />
            </div>

            <div className="textbox">
            <FontAwesomeIcon icon={faLock} size="2px" />
              <input type="password" name="username" placeholder="Hasło" />
            </div>

            <div className="textbox">
            <FontAwesomeIcon icon={faLock} size="2px" />
              <input type="password" name="password" placeholder="Powtórz hasło" />
            </div>

            <div className="register-box-submit"> 
              <input type="button" value="Zarejestruj się" /> 
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)

export default RightContainerRegister
