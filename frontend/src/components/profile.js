import React from "react"
import { getUser } from "../services/auth"
import { isLoggedIn } from "../services/auth"
import { navigate } from "gatsby"
const Profile = () => (
  <>
    {isLoggedIn()?
    [
      <h1>Your profile</h1>,
      <ul>
        <li>Name: {getUser().name}</li>
        <li>E-mail: {getUser().email}</li>
      </ul>

    ]:navigate("/app/login")

    }
    
  </>
)
export default Profile