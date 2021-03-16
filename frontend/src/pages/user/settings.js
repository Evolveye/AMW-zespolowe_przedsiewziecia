import React from "react"

import { AuthorizedContent, getUser } from "../../utils/auth.js"
import { getToken } from "../../utils/auth.js"
import Layout from "../../components/layout.js"
import Form from "../../components/formSettings.js"
import URLS from "../../utils/urls.js"
import ERRORS, { DEFAULT_ERROR } from "../../utils/errorList.js"

import classes from "./user.module.css"

export default class Settings extends React.Component {
  state = { error: null,
        name: '',
        surname: '',
        email: '',
        login: '',

    }

  fieldsPersonal = [{ title: `Imię`, name: `name` },{title: `Nazwisko`,name: `surname`,},]
  fieldsLogin = [{ title: `Login`, name: `login` },]
  fieldsPassword = [{ title: `Nowe hasło`, name: `password1`, type:`password`,  },{title: `Powtórz hasło`,name: `password2`,type:`password`,},]
  fieldsEmail = [{ title: `E-mail`, name: `email` },]
  componentDidMount(){
      getUser().then(person =>{
         this.setState(person)
      })
  }

  render = () => (
    <AuthorizedContent>
      
      <Layout className="main_wrapper-splited">
        <article className={classes.leftColumn}>
          <h2>Twoje dane:</h2>
          <ul className="list">
            <li>Imię: {this.state.name}</li>
            <li>Nazwisko: {this.state.surname}</li>
            <li>E-mail: {this.state.email}</li>
            <li>Login: {this.state.login}</li>
          </ul>
        </article>

        <article className={classes.rightColumnWithOverFlow}>
          <h1 className={classes.sectionTitle}>Ustawienia</h1>
          <h1>Dane personalne</h1>
          <Form
            fields={this.fieldsPersonal}
            submitName="Zmień"
            method="PUT"
            headers={{
              Authentication: `Bearer ${getToken()}`,
              "Content-Type": `application/json`,
            }}
            address={URLS.USER_ME_PUT}
            onError={({ code }) =>
              this.setState({ error: ERRORS[code] || DEFAULT_ERROR })
            }
          />
          {this.state.error && (
            <article className="errorBox">{this.state.error}</article>
          )}
          <hr className={classes.hrWidth}/>
            
          <h1>Login</h1>
          <Form
            fields={this.fieldsLogin}
            submitName="Zmień"
            method="PUT"
            headers={{
              Authentication: `Bearer ${getToken()}`,
              "Content-Type": `application/json`,
            }}
            address={URLS.USER_ME_PUT}
            onError={({ code }) =>
              this.setState({ error: ERRORS[code] || DEFAULT_ERROR })
            }
          />
          {this.state.error && (
            <article className="errorBox">{this.state.error}</article>
          )}
          <hr className={classes.hrWidth}/>

          <h1>Hasło</h1>
          <Form
            fields={this.fieldsPassword}
            submitName="Zmień"
            method="PUT"
            headers={{
              Authentication: `Bearer ${getToken()}`,
              "Content-Type": `application/json`,
            }}
            address={URLS.USER_ME_PUT}
            onError={({ code }) =>
              this.setState({ error: ERRORS[code] || DEFAULT_ERROR })
            }
          />
          {this.state.error && (
            <article className="errorBox">{this.state.error}</article>
          )}
          
          <hr className={classes.hrWidth}/>
          {/*
          <h1>E-mail</h1>
          <Form
            fields={this.fieldsEmail}
            submitName="Zmień"
            method="PUT"
            headers={{
              Authentication: `Bearer ${getToken()}`,
              "Content-Type": `application/json`,
            }}
            address={URLS.USER_ME_PUT}
            onError={({ code }) =>
              this.setState({ error: ERRORS[code] || DEFAULT_ERROR })
            }
          />
          {this.state.error && (
            <article className="errorBox">{this.state.error}</article>
          )}
          */}
          

        </article>
      </Layout>
    </AuthorizedContent>
  )
}
