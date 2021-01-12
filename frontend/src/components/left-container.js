import React from "react"
import { Link } from "@reach/router"
import { navigate } from "gatsby"
import { isLoggedIn, logout } from "../services/auth"
import socket from "../services/webSocket.js"


class LeftContainer extends React.Component {
  state = {
    platform:[]
   }

 
 componentDidMount() {
   LeftContainer.getData().then( arr => arr.map((a, index) =>
   <div className="platform-item-container" key={index}>
   <Link to="/platforms/">
     <div className="platform-item" title={a.org_name}>{a.org_name.substring(0,5)}</div>
   </Link>
 </div>
   ) ).then( platform => this.setState( { platform } ) )

 }
 
 render = () => <>
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
              alt=""
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
        {this.state.platform}

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


</>

static getData() {
  if(socket) return new Promise(res => 
    {
      res([
        {
          "_id": 1,
          "owner": "Jan",
          "created": "12",
          "assignedGroup": "wf",
          "administrator": "adam",
          "assigned_users": "fa",
          "org_name": "185ic"
      },
      {
          "_id": 2,
          "owner": "Janea",
          "created": "12",
          "assignedGroup": "wf",
          "administrator": "adam",
          "assigned_users": "fa",
          "org_name": "285ic"
      },
      {
          "_id": 3,
          "owner": "Janea",
          "created": "12",
          "assignedGroup": "wf",
          "administrator": "adam",
          "assigned_users": "fa",
          "org_name": "285ic"
      },
      {
          "_id": 4,
          "owner": "Janea",
          "created": "12",
          "assignedGroup": "wf",
          "administrator": "adam",
          "assigned_users": "fa",
          "org_name": "285ic"
      }

      ])
      
    }
      )
    
  else return new Promise(resolve => {
    socket.on(`api.get.platforms`, resolve)
    socket.emit(`api.get.platforms`)
  })
}
}
export default LeftContainer
