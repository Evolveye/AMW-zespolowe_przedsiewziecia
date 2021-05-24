import React from "react"
import { navigate } from "gatsby-link"

import Layout from "../../layouts/main.js"
import Form, { Text, Password, Submit } from "../../components/form.js"

import pageClasses from "../../css/page.module.css"
import classes from "../../css/box.module.css"
import URLS from "../../utils/urls.js"
import { authFetcher } from "../../utils/auth.js"
import { getUrnQuery } from "../../utils/functions.js"

const formClassNames = {
  it: `${classes.centered} ${classes.smallBox}`,
  successBox: `${classes.successBox} ${classes.isLime}`,
  errorBox: `${classes.errorBox}`,
}
// const formClassName = `${classes.centered} ${classes.smallBox}`

export default () => {
  const { code } = getUrnQuery()

  return (
    <Layout className={`${pageClasses.content} ${pageClasses.isCenteredAndSplited}`} title="Ustawienia">
      <Form classNames={formClassNames}>
        <Password className={classes.input} name="password1">Nowe hasło</Password>
        <Password className={classes.input} name="password2">Powtórzone nowe hasło</Password>
        <Submit
          className="neumorphizm is-button"
          handler={async data => {
            const res =  await authFetcher.post( URLS.PASSWORD_RESET_POST(), { code, ...data } )
            if (res?.success) {
              res.success = `Hasło zmieniono pomyślnie. Niebawem nastąpi przekierowanie na stronę główną`
              setTimeout( () => navigate( `/` ), 1000 * 10 )
            }
            return res
          }}
          children="Zatwierdź"
        />
      </Form>
    </Layout>
  )
}
