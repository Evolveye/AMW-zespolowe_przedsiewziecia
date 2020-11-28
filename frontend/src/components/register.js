import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const RegisterForm = () => (
    <form class="box" action="" method="post">
        <h1>Rejestracja</h1>
        <input type="text" name="" placeholder="Imię" />
        <input type="text" name="" placeholder="Nazwisko" />
        <input type="email" name="" placeholder="Email" />
        <input type="password" name="" placeholder="Hasło" />
        <input type="password" name="" placeholder="Powtórz hasło" />
        <input type="submit" name="" value="zarejestruj" />
    </form>

)


export default RegisterForm
