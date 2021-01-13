import React from "react"
import { Link } from "@reach/router"
/* icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faLock} from '@fortawesome/free-solid-svg-icons'
import { DEBUG, BACKEND_PASSWORD_RESET_URL} from "../../config.js"
import { navigate } from "gatsby"
import { handleForm } from "../formsHandling.js"
import {isBrowser} from "../../services/auth"
class RightContainerPasswordReset extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      password1: ``,
      password2: ``,
      code: !isBrowser() ? "" : new URLSearchParams(window.location.search).get("code"),
    };
  }

  /**
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
    if (DEBUG) navigate('/changedPassword')
    else handleForm(
      BACKEND_PASSWORD_RESET_URL,
      'post',
      { "Content-Type": 'application/json' },
      this.state,
      { okCb: () => navigate('/changedPassword') }
    )
  }
  render() {

    return <>
      <div className="right-container">
        <div className="login-form">
          <div className="login-form-header">
            <Link to="/">
              <div className="logo-mini"></div>
            </Link>
            <div className="login-form-header-div-text">
              <span className="login-form-header-text">
                Platforma edukacyjna - resetuj hasło
              </span>
            </div>
          </div>
          <div className="login-box">
            <div className="login-box-form">
              <form method="post" onSubmit={this.handleSubmit}>
              <div className="textbox textbox-remindPassword">
                  <FontAwesomeIcon icon={faLock} size="1x" />
                  <input
                  type="password"
                  name="password1"
                  value={this.state.name}
                  placeholder="Nowe hasło"
                  onChange={this.handleInputChange}
                  required
                  />
                </div>
                <div className="textbox textbox-remindPassword">
                  <FontAwesomeIcon icon={faLock} size="1x" />
                  <input
                  type="password"
                  name="password2"
                  value={this.state.name}
                  placeholder="Powtórz hasło"
                  onChange={this.handleInputChange}
                  required
                  />
                </div>
              <div className="register-box-submit">
                  <input type="submit" value="Zresetuj" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  }
}
export default RightContainerPasswordReset