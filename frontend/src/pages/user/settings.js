import React from "react"

import Layout from "../../layouts/main.js"
import Form, { Text, Password, Submit } from "../../components/form.js"

import pageClasses from "../../css/page.module.css"
import classes from "../../css/box.module.css"
import URLS from "../../utils/urls.js"
import { authFetcher } from "../../utils/auth.js"

const formClassNames = {
  it: `${classes.centered} ${classes.smallBox}`,
  successBox: `${classes.successBox} ${classes.isLime}`,
  errorBox: classes.errorBox,
}

export default () => {
  const updateUser = data => authFetcher.put( URLS.USER_ME_PUT(), data )
  const getSubmitButton = () => <Submit className="neumorphizm is-button" handler={updateUser}>Zaktualizuj</Submit>

  return (
    <Layout className={`${pageClasses.content} ${pageClasses.isCenteredAndSplited}`} title="Ustawienia">
      <section className={`${classes.centered} ${classes.isFlexColumn}`}>
        <Form classNames={formClassNames}>
          <Text name="login">Login</Text>
          {getSubmitButton()}
        </Form>

        <Form classNames={formClassNames}>
          <Text name="name">Imię</Text>
          {getSubmitButton()}
        </Form>

        <Form classNames={formClassNames}>
          <Text name="surname">Nazwisko</Text>
          {getSubmitButton()}
        </Form>

        <Form classNames={formClassNames}>
          <Text name="email">E-mail</Text>
          {getSubmitButton()}
        </Form>
      </section>

      {/* <Form classNames={{ it:classes.centered }}>
        <Text className={classes.input} name="name">Imię</Text>
        <Text className={classes.input} name="surname">Nazwisko</Text>
        <Text className={classes.input} name="email">E-mail</Text>
        <Submit className={`neumorphizm is-button ${classes.button}`}>Zaktualizuj</Submit>
      </Form> */}

      <Form classNames={formClassNames}>
        <Password className={classes.input} name="password">Aktualne hasło</Password>
        <Password className={classes.input} name="password1">Nowe hasło</Password>
        <Password className={classes.input} name="password2">Powtórz nowe hasło</Password>
        {getSubmitButton()}
      </Form>
    </Layout>
  )
}
