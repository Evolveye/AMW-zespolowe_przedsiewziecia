import React from "react"
import { Link } from "@reach/router"
import { navigate } from "gatsby"
/* icons */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons"

import { DEBUG, BACKEND_REGISTER_URL } from "../../config.json"


class RightContainerRegister extends React.Component {

  /**
   *
   * @param {Subm} event
   */
  handleSubmit = event => {
    event.preventDefault();

    if (DEBUG) navigate('/checkMail')
    else fetch( BACKEND_REGISTER_URL, { method:`POST`, body: {
      name: ``,
      surname: ``,
      email: ``,
      password: ``,
      password2: ``,
    } } )
      // .then( res => res.json() )
      // .then( data => {
      //   // ...

      //   navigate('/checkMail')
      // } )
      .then( res => res.text() )
      .then( console.log )
      .catch( console.error )
  }


  render = () => (
    <div className="right-container">
      <div className="login-form">
        <div className="login-form-header">
          <Link to="/">
            {" "}
            <div className="logo-mini"></div>{" "}
          </Link>
          <div className="login-form-header-div-text">
            <span className="login-form-header-text">
              Platforma edukacyjna - rejestracja
            </span>
          </div>
        </div>
        <div className="login-box">
          <div className="login-box-form">
            <form method="post" onSubmit={this.handleSubmit}>
              <div className="textbox">
                <FontAwesomeIcon icon={faUser} size="1x" />
                <input type="text" name="name" placeholder="Imię" />
              </div>

              <div className="textbox">
                <input className="padding-left" type="text" name="surname" placeholder="Nazwisko" />
              </div>

              <div className="textbox under-space">
                <FontAwesomeIcon icon={faEnvelope} size="1x" />
                <input type="text" name="email" placeholder="E-mail" />
              </div>

              <div className="textbox under-space">
                <FontAwesomeIcon icon={faLock} size="1x" />
                <input type="password" name="password" placeholder="Hasło" />
              </div>

              <div className="textbox">
                <input
                  className="padding-left"
                  type="password"
                  name="password2"
                  placeholder="Powtórz hasło"
                />
              </div>

              <div className="register-box-submit">
                <input type="submit" value="Zarejestruj się" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
export default RightContainerRegister
/*
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
              <input type="text" name="surname" placeholder="Nazwisko" />
            </div>

            <div className="textbox under-space">
            <FontAwesomeIcon icon={faEnvelope} size="2px" />
              <input type="text" name="email" placeholder="E-mail" />
            </div>

            <div className="textbox under-space">
            <FontAwesomeIcon icon={faLock} size="2px" />
              <input type="password" name="password" placeholder="Hasło" />
            </div>

            <div className="textbox">
              <input type="password" name="password2" placeholder="Powtórz hasło" />
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
*/
