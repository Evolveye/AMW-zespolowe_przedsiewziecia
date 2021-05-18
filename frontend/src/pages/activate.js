import React from "react"

import Layout from "../layouts/main.js"
import Form, { Text, Password, Submit } from "../components/form.js"

import pageClasses from "../css/page.module.css"
import classes from "../css/box.module.css"
import URLS from "../utils/urls.js"
import { authFetcher } from "../utils/auth.js"
import { getUrnQuery } from "../utils/functions.js"

const formClassName = `${classes.centered} ${classes.smallBox}`

export default () => {
  const { code, initialCode } = getUrnQuery()

  console.log({ code, initialCode })

  return (
    <Layout className={`${pageClasses.content} ${pageClasses.isCenteredAndSplited}`} title="Ustawienia">
      {
        code && (
          <Form classNames={{ it:formClassName }}>
            <Text name="login">Unikalny login</Text>
            <Submit
              className="neumorphizm is-button"
              handler={data => authFetcher.post( URLS.REGISTER_ACTIVATE_POST(), { code, ...data } )}
              children="Zatwierdź"
            />
          </Form>
        )
      }
      {
        initialCode && (
          <Form classNames={{ it:formClassName }}>
            <Text className={classes.input} name="login">Unikalny login</Text>
            <Password className={classes.input} name="password1">Hasło</Password>
            <Password className={classes.input} name="password2">Powtórz hasło</Password>
            <Submit
              className="neumorphizm is-button"
              handler={data => authFetcher.post( URLS.PLATFORM_USERS_ACTIVATE_POST(), { code:initialCode, ...data } )}
              children="Zatwierdź"
            />
          </Form>
        )
      }
    </Layout>
  )
}
