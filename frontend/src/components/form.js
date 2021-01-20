import React from "react"

import Sygnet from "../models/sygnet.js"

import classes from "./form.module.css"

import svgUser from "../svg/user.svg"

export default ({ title=``, fields = [] }) => {
  const fieldsElements = fields.map(({ type = `text`, name }) => (
    <label className={classes.label}>
      <img className={classes.icon} src={svgUser} />
      <input key={name} className={classes.input} type={type} placeholder={name} />
    </label>
  ))

  return (
    <form className={classes.form}>
      <header className={classes.header}>
        <Sygnet size={50} />

        <h3 className={classes.title}>{title}</h3>
      </header>

      <article className={classes.main}>
        {fieldsElements}
      </article>
    </form>
  )
}
