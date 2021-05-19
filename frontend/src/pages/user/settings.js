import React, { useState } from "react"

import Layout from "../../layouts/main.js"
import Form, { Text, Password, Submit } from "../../components/form.js"

import pageClasses from "../../css/page.module.css"
import classes from "../../css/box.module.css"
import URLS from "../../utils/urls.js"
import { authFetcher, fetchUser } from "../../utils/auth.js"

const formClassNames = {
  it: `${classes.centered} ${classes.smallBox}`,
  successBox: `${classes.successBox} ${classes.isLime} ${classes.settingsFormMessage}`,
  errorBox: `${classes.errorBox} ${classes.settingsFormMessage}`,
}

export default () => {
  const [ responseDetails, setResponseDetails ] = useState({})
  const [ responsePassword, setResponsePassword ] = useState({})
  const updateUser = async(data, setResponse) => {
    const response = await authFetcher.put( URLS.USER_ME_PUT(), data )

    if (response?.error) return setResponse?.({ success:null, error:response.error })
    if (response?.success) {
      setResponse?.({ success:response.success, error:null })
      fetchUser()
      return
    }

    setResponse?.({ success:null, error:null })
  }

  const updateUserDetails = async data => updateUser( data, setResponseDetails )
  const updateUserPassword = async data => updateUser( data, setResponsePassword )

  const getSubmitButtonDetails = () => <Submit className="neumorphizm is-button" handler={updateUserDetails}>Zaktualizuj</Submit>
  const getSubmitButtonPassword = () => <Submit className="neumorphizm is-button" handler={updateUserPassword}>Zaktualizuj</Submit>

  return (
    <Layout className={`${pageClasses.content} ${pageClasses.isCenteredAndSplited}`} title="Ustawienia">
      <section style={{ position:`relative` }} className={`${classes.centered} ${classes.isFlexColumn}`}>
        <Form classNames={formClassNames}>
          <Text name="login">Login</Text>
          {getSubmitButtonDetails()}
        </Form>

        <Form classNames={formClassNames}>
          <Text name="name">Imię</Text>
          {getSubmitButtonDetails()}
        </Form>

        <Form classNames={formClassNames}>
          <Text name="surname">Nazwisko</Text>
          {getSubmitButtonDetails()}
        </Form>

        <Form classNames={formClassNames}>
          <Text name="email">E-mail</Text>
          {getSubmitButtonDetails()}
        </Form>

        {responseDetails.error && <div className={formClassNames.errorBox}>{responseDetails.error}</div>}
        {responseDetails.success && <p className={formClassNames.successBox}>Zmieniono pomyślnie</p>}
      </section>

      {/* <Form classNames={{ it:classes.centered }}>
        <Text className={classes.input} name="name">Imię</Text>
        <Text className={classes.input} name="surname">Nazwisko</Text>
        <Text className={classes.input} name="email">E-mail</Text>
        <Submit className={`neumorphizm is-button ${classes.button}`}>Zaktualizuj</Submit>
      </Form> */}

      <section style={{ position:`relative` }} className={`${classes.centered} ${classes.isFlexColumn}`}>
        <Form classNames={formClassNames}>
          <Password className={classes.input} name="password">Aktualne hasło</Password>
          <Password className={classes.input} name="password1">Nowe hasło</Password>
          <Password className={classes.input} name="password2">Powtórz nowe hasło</Password>
          {getSubmitButtonPassword()}
        </Form>
        {responsePassword.error && <div className={formClassNames.errorBox}>{responsePassword.error}</div>}
        {responsePassword.success && <p className={formClassNames.successBox}>Zmieniono pomyślnie</p>}
      </section>
    </Layout>
  )
}
