import React from "react"
import { Link } from "@reach/router"
/* icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEnvelope} from '@fortawesome/free-solid-svg-icons'
import { DEBUG, BACKEND_PASSWORD_REMIND_URL } from "../../config.js"
import { navigate } from "gatsby"
import { handleForm } from "../formsHandling.js"


class RightContainerRemindPassword extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: ``
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
      BACKEND_PASSWORD_REMIND_URL,
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
                Platforma edukacyjna - przypomnij hasło
              </span>
            </div>
          </div>
          <div className="login-box">
            <div className="login-box-form">
              <form method="post" onSubmit={this.handleSubmit}>
              <div className="textbox textbox-remindPassword">
                  <FontAwesomeIcon icon={faEnvelope} size="1x" />
                  <input
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  onChange={this.handleInputChange}
                  required
                  />
                </div>
              <div className="register-box-submit">
                  <input type="submit" value="Wyślij link" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  }
}
export default RightContainerRemindPassword