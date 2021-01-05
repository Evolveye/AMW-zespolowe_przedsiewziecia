import React from "react"
import { Link } from "@reach/router"
/* icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEnvelope} from '@fortawesome/free-solid-svg-icons'

import { navigate } from "gatsby"


class RightContainerRemindPassword extends React.Component {
  
  handleSubmit = event => {
    event.preventDefault();
    navigate('/checkMail');
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
                  <FontAwesomeIcon icon={faEnvelope} size="2px" />
                  <input type="text" name="email" placeholder="E-mail" />
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