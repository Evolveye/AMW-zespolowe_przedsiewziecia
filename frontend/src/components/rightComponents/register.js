import React from "react"
import { Link } from "@reach/router"
import { navigate } from "gatsby"
/* icons */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons"

import { DEBUG, BACKEND_REGISTER_URL } from "../../config.js"
import { handleForm } from "../formsHandling.js"


class RightContainerRegister extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: ``,
      surname: ``,
      email: ``,
      password1: ``,
      password2: ``
    };
  }
  /**
   *
   * @param {Subm} event
   */

  handleInputChange = (event) => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  }
  handleSubmit = event => {
    event.preventDefault();

    if (DEBUG) navigate('/checkMail')
    else handleForm(
      BACKEND_REGISTER_URL,
      'post',
      { "Content-Type": 'application/json' },
      this.state,
      {
        okCb(){
          navigate('/checkMail')
        }
      }
    )
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
                <input
                type="text"
                name="name"
                placeholder="Imię"
                value={this.state.name}
                onChange={this.handleInputChange}
                required />
              </div>

              <div className="textbox">
                <input
                className="padding-left"
                type="text"
                name="surname"
                placeholder="Nazwisko"
                value={this.state.surname}
                onChange={this.handleInputChange}
                required />
              </div>

              <div className="textbox under-space">
                <FontAwesomeIcon icon={faEnvelope} size="1x" />
                <input
                type="text"
                name="email"
                placeholder="E-mail"
                value={this.state.email}
                onChange={this.handleInputChange}
                required />
              </div>

              <div className="textbox under-space">
                <FontAwesomeIcon icon={faLock} size="1x" />
                <input
                type="password"
                name="password1"
                placeholder="Hasło"
                value={this.state.password1}
                onChange={this.handleInputChange}
                required />
              </div>

              <div className="textbox">
                <input
                  className="padding-left"
                  type="password"
                  name="password2"
                  placeholder="Powtórz hasło"
                  value={this.state.password2}
                  onChange={this.handleInputChange}
                  required />
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
