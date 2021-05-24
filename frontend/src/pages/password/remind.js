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
  return (
    <Layout className={`${pageClasses.content} ${pageClasses.isCenteredAndSplited}`} title="Ustawienia">
      <Form classNames={formClassNames}>
        <Text name="email">Mail do konta</Text>
        <Submit
          className="neumorphizm is-button"
          handler={async data => {
            const res =  await authFetcher.post( URLS.PASSWORD_REMIND_POST(), data )
            if (res?.success) {
              res.success = `Mail z linkiem do strony resetujacej hasło został wysłany`
            }
            return res
          }}
          children="Wyślij mail"
        />
      </Form>
    </Layout>
  )
}
