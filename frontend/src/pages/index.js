import React from "react"

import NotLoggedForm from "../containers/notLoggedForm.js"
import Layout from "../layouts/main.js"
import { useUser } from "../utils/auth.js"

export default () => {
  return (
    <Layout title="Strona główna">
      <article className="is-centered">
        <h1 className="h1">
          Platforma edukacyjna
        </h1>
        <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
      </article>
      {
        !useUser() && (
          <article className="is-centered">
            <NotLoggedForm />
            {/* <Form tabs={
              [
                {
                  name: `Logowanie`,
                  fields: [
                    { type:`text`,      name:`login`,     label:`Login`, validator:v => true },
                    { type:`password`,  name:`password`,  label:`Hasło`, validator:v => true },
                  ],
                  summary: { label:`Zaloguj`, onSubmit:fields => forceUpdate( fakeLogin() ) },
                },
                {
                  name: `Rejestracja`,
                  fields: [
                    { type:`text`,      name:`name`,      label:`Imię`,     validator:v => true },
                    { type:`text`,      name:`surname`,   label:`Nazwisko`, validator:v => true },
                    { type:`password`,  name:`password1`, label:`Hasło`,    validator:v => true },
                    { type:`password`,  name:`password2`, label:`Powtórzone hasło`, validator:v => true },
                  ],
                  summary: { label:`Zarejestruj`, onSubmit:fields => console.log( fields ) },
                },
              ]
            }
            >
              <Tab name="Logowanie">
                <Field type="text" name="login" label="Login" validator={v => true} />
                <Field type="password" name="password" label="Hasło" validator={v => true} />
                <Submit>Zaloguj</Submit>
              </Tab>

              <Tab name="Rejestracja">
                <Submit>Zarejestruj</Submit>
              </Tab>
            </Form> */}
          </article>
        )
      }
    </Layout>
  )
}
