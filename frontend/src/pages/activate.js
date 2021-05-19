import React from "react"

import Layout from "../layouts/main.js"
import Form, { Text, Password, Submit } from "../components/form.js"

import pageClasses from "../css/page.module.css"
import classes from "../css/box.module.css"
import URLS from "../utils/urls.js"
import { authFetcher } from "../utils/auth.js"
import { getUrnQuery } from "../utils/functions.js"
import { navigate } from "gatsby-link"

const formClassNames = {
  it: `${classes.centered} ${classes.smallBox}`,
  successBox: `${classes.successBox} ${classes.isLime}`,
  errorBox: `${classes.errorBox}`,
}
// const formClassName = `${classes.centered} ${classes.smallBox}`

export default () => {
  const { code, initialCode } = getUrnQuery()

  console.log({ code, initialCode })

  return (
    <Layout className={`${pageClasses.content} ${pageClasses.isCenteredAndSplited}`} title="Ustawienia">
      {
        code && (
          <Form classNames={formClassNames}>
            <Text name="login">Unikalny login</Text>
            <Submit
              className="neumorphizm is-button"
              handler={async data => {
                const res =  await authFetcher.post( URLS.REGISTER_ACTIVATE_POST(), { code, ...data } )
                if (res?.success) {
                  res.success = `Ustawiono pomyślnie. Za moment zostaniesz przekierowany na stronę główną`
                  setTimeout( () => navigate( `/` ), 1000 * 10 )
                }
                return res
              }}
              children="Zatwierdź"
            />
          </Form>
        )
      }
      {
        initialCode && (
          <Form classNames={formClassNames}>
            <Text className={classes.input} name="login">Unikalny login</Text>
            <Password className={classes.input} name="password1">Hasło</Password>
            <Password className={classes.input} name="password2">Powtórz hasło</Password>
            <Submit
              className="neumorphizm is-button"
              handler={async data => {
                const res =  await authFetcher.post( URLS.PLATFORM_USERS_ACTIVATE_POST(), { code:initialCode, ...data } )
                if (res?.success) {
                  res.success = `Ustawiono pomyślnie. Za moment zostaniesz przekierowany na stronę główną`
                  setTimeout( () => navigate( `/` ) )
                }
                return res
              }}
              children="Zatwierdź"
            />
          </Form>
        )
      }
    </Layout>
  )
}
