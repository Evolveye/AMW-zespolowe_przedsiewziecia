import React from "react"

import EventsCalendar from "../containers/eventsCalendar.js"
import Form, { Tab, Text, Password, Submit } from "../components/form.js"
import Layout from "../layouts/main.js"
import { useUser, fakeLogin } from "../utils/auth.js"

import boxClasses from "../css/box.module.css"
import classes from "../css/page.module.css"

export default () => {
  const isLogged = !!useUser()

  return (
    <Layout className={`${classes.content} is-centered`} title="Strona główna">
      <article className={`${classes.section} ${classes.isCenteredAndSplited}`}>
        <section className="is-centered">
          <h1 className="h1">Platforma edukacyjna</h1>
          <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
        </section>

        {
          !isLogged && (
            <section className="is-centered">
              <Form
                classNames={{
                  it: boxClasses.smallWrapper,
                  switch: `neumorphizm is-button ${boxClasses.tabsSwitch}`,
                  switches: boxClasses.tabsSwitches,
                  activeSwitch: `is-active`,
                }}
              >
                <Tab className={boxClasses.tab} name="Logowanie">
                  <Text className={boxClasses.input} name="login" validator={() => true}>Login</Text>
                  <Password className={boxClasses.input} name="password" validator={() => true}>Hasło</Password>

                  <Submit className={`neumorphizm is-button ${boxClasses.button}`} handler={fakeLogin}>Zaloguj</Submit>
                </Tab>

                <Tab className={boxClasses.tab} name="Rejestracja">
                  <Text className={boxClasses.input} name="name" validator={() => true}>Imię</Text>
                  <Text className={boxClasses.input} name="surname" validator={() => true}>Nazwisko</Text>
                  <Text className={boxClasses.input} name="email" validator={() => true}>email</Text>

                  <div>
                    <Password className={boxClasses.input} name="password1" validator={() => true}>Hasło</Password>
                    <Password className={boxClasses.input} name="password2" validator={() => true}>Powtórne hasło</Password>
                  </div>

                  <Submit className={`neumorphizm is-button ${boxClasses.button}`}>Zarejestruj</Submit>
                </Tab>
              </Form>
            </section>
          )
        }
      </article>

      {isLogged && <EventsCalendar className={classes.section} />}
    </Layout>
  )
}
