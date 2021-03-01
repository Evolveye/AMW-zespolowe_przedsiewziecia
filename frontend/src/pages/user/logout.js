import { navigate } from "gatsby"
import React from "react"

import { AuthorizedContent, logout } from "../../utils/auth.js"

import classes from "./user.module.css"

export default class Logout extends React.Component {
  componentDidMount() {
    logout( () => navigate( `/` ) )
  }

  render = () => (
    <AuthorizedContent>
      <article className={classes.logout}>Trwa wylogowywanie</article>
    </AuthorizedContent>
  )
}
