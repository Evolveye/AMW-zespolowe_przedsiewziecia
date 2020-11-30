import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const LoginForm = () => (
    <form class="box" action="" method="post">
        <h1>Logowanie</h1>
        <input type="text" name="" placeholder="Login" />
        <input type="password" name="" placeholder="Hasło" />
        <input type="submit" name="" value="zaloguj" />
    </form>

)


export default LoginForm
