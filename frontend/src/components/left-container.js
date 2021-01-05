import React from "react"
import { Link } from "@reach/router"
import { navigate } from "gatsby"
import { isLoggedIn, logout } from "../services/auth"

const LeftContainer = () => (
  <div className="left-container">
    {!isLoggedIn() ? (
      <>
        <nav>
          <Link to="/login/">Zaloguj się</Link>
          <Link to="/register/">Zarejestruj się</Link>
        </nav>
        <div className="copyright">Copyright © 2020</div>
      </>
    ) : (
      <>
        <div className="avatar-container">
          <Link to="/users/me">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Marcin_Najman_2014.jpg"
              alt={"avatar"}
            />
          </Link>
        </div>
        <nav>
          <Link to="/users/me">Mój profil</Link>
          <Link to="/settings">Ustawienia</Link>
          <Link to="/users/grades">Moje oceny</Link>
          <Link to="/" onClick={event => {
              event.preventDefault()
              logout(() => navigate(`/`))
            }}
          >
            Wyloguj
          </Link>
        </nav>

        <hr className="hr-under-menu" />

        <div className="platform-list">
          <div className="platform-item-container">
            <Link to="/app/platformSettings">
              <div className="platform-item">a</div>
            </Link>
          </div>
          <div className="platform-item-container">
            <Link to="/app/platformSettings">
              <div className="platform-item">b</div>
            </Link>
          </div>
          <div className="platform-item-container">
            <Link to="/app/platformSettings">
              <div className="platform-item">c</div>
            </Link>
          </div>
          <div className="platform-item-container">
            <Link to="/app/platformSettings">
              <div className="platform-item">d</div>
            </Link>
          </div>


          <div className="platform-item-container">
            <Link to="/app/platformSettings">
              <div className="platform-item">e</div>
            </Link>
          </div>

          <div className="platform-item-container">
            <div className="platform-item-add">
              <Link to="/addPlatform">
                <img
                  src="https://www.freepnglogos.com/uploads/plus-icon/plus-icon-plus-math-icon-download-icons-9.png"
                  alt=""
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="copyright">Copyright © 2020</div>
      </>
    )}
  </div>
)

export default LeftContainer
