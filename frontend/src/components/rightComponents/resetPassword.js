import React from "react"
import { Link } from "@reach/router"
/* icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faLock} from '@fortawesome/free-solid-svg-icons'

import { navigate } from "gatsby"


class RightContainerPasswordReset extends React.Component {
  
  handleSubmit = event => {
    event.preventDefault();
    navigate('/changedPassword');
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
                  <FontAwesomeIcon icon={faLock} size="2px" />
                  <input type="password" name="password" placeholder="Nowe hasło" />
                </div>
                <div className="textbox textbox-remindPassword">
                  <FontAwesomeIcon icon={faLock} size="2px" />
                  <input type="password" name="password2" placeholder="Powtórz hasło" />
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