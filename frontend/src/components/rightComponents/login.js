import React from "react"
import { Link } from "@reach/router"
/* icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faLock} from '@fortawesome/free-solid-svg-icons'
/* autentykacja */
import { navigate } from "gatsby"
import { handleLogin, isLoggedIn } from "../../services/auth"

class RightContainerLogin extends React.Component {
  state = {
    rerender: true,
    login: ``,
    password: ``,
  }
  handleUpdate = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }
  handleSubmit = async event => {
    event.preventDefault()

    if (await handleLogin(this.state)) navigate(`/app/profile`)
  }

  componentDidMount() {
    this.setState( { rerender:false } )
  }

  render() {
    if (this.state.rerender && isLoggedIn()) navigate(`/app/profile`)

    return <>
      <div className="right-container">
        <div className="login-form">
          <div className="login-form-header">
            <Link to="/">
              <div className="logo-mini"></div>
            </Link>
            <div className="login-form-header-div-text">
              <span className="login-form-header-text">
                Platforma edukacyjna - logownie
              </span>
            </div>
          </div>
          <div className="login-box">
            <div className="login-box-form">
              <form method="post" onSubmit={this.handleSubmit}>
                <div className="textbox">
                <FontAwesomeIcon icon={faUser} size="2px" />
                  <input
                   type="text"
                   name="login"
                   placeholder="Login"
                   onChange={this.handleUpdate}
                    />
                </div>

                <div className="textbox">
                <FontAwesomeIcon icon={faLock} size="2px" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Hasło"
                    onChange={this.handleUpdate}
                  />
                </div>

                <div className="login-box-submit">
                  <div className="center-text-div">
                    <Link to="">Zapomniałem hasła</Link>
                  </div>
                  <input type="submit" value="Zaloguj się" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  }
}
export default RightContainerLogin

/*
const RightContainerLogin = () => (
  <div className="right-container">
  <div className="login-form">
      <div className="login-form-header">
         <Link to="/"><div className="logo-mini"></div></Link>
          <div className="login-form-header-div-text">
              <span className="login-form-header-text">Platforma edukacyjna - logownie</span>
          </div>
      </div>
      <div className="login-box">
          <div className="login-box-form">
              <form method="post">
                  <div className="textbox">
                      <i className="fas fa-user"></i>
                      <input type="text" name="username" placeholder="Login" />
                  </div>

                  <div className="textbox">
                      <i className="fas fa-lock"></i>
                      <input type="password" name="password" placeholder="Hasło" />
                  </div>

                  <div className="login-box-submit">
                      <div className="center-text-div">
                          <a href="zmien-haslo.html">Zapomniałem hasła</a>
                      </div>
                      <input type="submit" value="Zaloguj się" />
                  </div>
              </form>
          </div>
      </div>
  </div>
</div>
  )

  export default RightContainerLogin
  */
