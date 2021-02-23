import React from "react"

import Form from "../components/form.js"
import Layout from "../layouts/main.js"
import { fakeLogin, isLogged } from "../utils/auth.js"
import { useForceUpdate } from "../utils/functions.js"

export default () => {
  const forceUpdate = useForceUpdate()

  return (
    <Layout title="Strona główna">
      <article className="is-centered">
        <h1 className="h1">
          Platforma edukacyjna
        </h1>
        <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
      </article>
      {
        !isLogged() && (
          <article className="is-centered">
            <Form tabs={
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
            />
          </article>
        )
      }
    </Layout>
  )
}
