import React from "react"

import Layout from "../../layouts/main.js"
import Form, { Text, Password, Submit } from "../../components/form.js"
import classes from "../../containers/form.module.css"

export default () => {
  return (
    <Layout title="Ustawienia">
      <Form classNames={{ it:classes.centered }}>
        <Text className={classes.input} name="name">Imię</Text>
        <Text className={classes.input} name="surname">Nazwisko</Text>
        <Text className={classes.input} name="email">E-mail</Text>
        <Submit className={`neumorphizm is-button ${classes.button}`}>Zaktualizuj</Submit>
      </Form>

      <Form classNames={{ it:classes.centered }}>
        <Password className={classes.input} name="password">Aktualne hasło</Password>
        <Password className={classes.input} name="password1">Nowe hasło</Password>
        <Password className={classes.input} name="password2">Powtórz nowe hasło</Password>
        <Submit className={`neumorphizm is-button ${classes.button}`}>Zaktualizuj</Submit>
      </Form>
    </Layout>
  )
}
