import React from "react"

import Sygnet from "../models/sygnet.js"
import Input from "../models/input.js"

import classes from "./form.module.css"

export default class Form extends React.Component {
  state = {
    fields: [],
  }

  constructor(props) {
    super(props)

    this.state.fields = props.fields.map(inputData => (
      <Input key={inputData.title} classes={classes} data={inputData} />
    ))
  }

  handleSubmit = e => {
    e.preventDefault()

    const { address, method: methodNotUppered = `GET`, headers } = this.props
    const method = methodNotUppered.toUpperCase()
    const fields = Array.from(e.target.elements).filter(({ name }) => name)
    const dataTosend = fields.reduce(
      (obj, field) => ({
        [field.name]: field.value,
        ...obj,
      }),
      {}
    )
    const body = [`GET`, `HEAD`].includes(method)
      ? null
      : JSON.stringify(dataTosend)

    if ([`GET`].includes(method))
      throw new Error(`Metoda nie jest jeszcze wspeirana w tym komponencie`)

   console.log({ address, method, headers, body })
    fetch(address, {
      method,
      headers,
      body,
    })
      .then(res => res.text())
      .then(response => {
        /** @type {{error:string}|Object<string,*>} */
        let json = null

        try {
          json = JSON.parse(response)
        } catch (err) {
          const { onUnknownResponse } = this.props

          console.error(
            `ERROR: Nieoczekiwana odpowiedź serwera, Błąd parsowania odpowiedzi\n` +
              `Powód błędu: ${err}\n` +
              `Wiadomość z serwera: ${response}`
          )

          return onUnknownResponse ? onUnknownResponse(err, response) : null
        }

        if (json.error) {
          const { onError } = this.props
          const error = JSON.parse(response)

          console.error(`ERROR: Odpowiedź serwera:`, error)

          return onError ? onError(error) : null
        }

        if (this.props.onOk) this.props.onOk(JSON.parse(response))
      })
      .catch(() => {})
  }

  render = () => (
    <form
      className={classes.form}
      method={this.props.method || "GET"}
      onSubmit={this.handleSubmit}
    >
      <header className={classes.header}>
        <Sygnet size={50} />

        <h3 className={classes.title}>{this.props.title}</h3>
      </header>

      <article className={classes.main}>
        {this.state.fields}

        <button type="submit" className={classes.submit}>
          {this.props.submitName}
        </button>
      </article>
    </form>
  )
}
