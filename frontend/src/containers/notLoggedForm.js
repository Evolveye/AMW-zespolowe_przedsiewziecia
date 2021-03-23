import React from "react"

import Form, { Tab, Text, Password, Submit } from "../components/form.js"
import { fakeLogin } from "../utils/auth.js"

import settingsClasses from "./settings.module.css"
import classes from "./form.module.css"

export default () => (
  <Form
    classNames={{
      it: `${classes.form} ${settingsClasses.settings}`,
      switch: `neumorphizm is-button ${classes.switch}`,
      switches: classes.switches,
      activeSwitch: `is-active`,
    }}
  >
    <Tab className={classes.tab} name="Logowanie">
      <Text className={classes.input} name="login" validator={() => true}>Login</Text>
      <Password className={classes.input} name="password" validator={() => true}>Hasło</Password>

      <Submit className={`neumorphizm is-button ${classes.button}`} handler={fakeLogin}>
        Zaloguj
      </Submit>
    </Tab>

    <Tab className={classes.tab} name="Rejestracja">
      <Text className={classes.input} name="name" validator={() => true}>Imię</Text>
      <Text className={classes.input} name="surname" validator={() => true}>Nazwisko</Text>
      <Text className={classes.input} name="email" validator={() => true}>email</Text>

      <div>
        <Password className={classes.input} name="password1" validator={() => true}>Hasło</Password>
        <Password className={classes.input} name="password2" validator={() => true}>Powtórne hasło</Password>
      </div>

      <Submit className={`neumorphizm is-button ${classes.button}`}>
        Zarejestruj
      </Submit>
    </Tab>
  </Form>
)
