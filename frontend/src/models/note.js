import React from "react"

import classes from "./note.module.css"

export default class Note extends React.Component {
  constructor(props) {
    super(props)

    const { lecturer, date, value, description } = props.note
    const options = {
      year: `numeric`,
      month: "2-digit",
      day: "2-digit",
      hour: `2-digit`,
      minute: `2-digit`,
    }
    const [
      { value: DD },
      ,
      { value: MM },
      ,
      { value: YYYY },
      ,
      { value: hh },
      ,
      { value: mm },
    ] = new Intl.DateTimeFormat(`pl`, options).formatToParts(date)

    this.createDate = `${YYYY}.${MM}.${DD} ${hh}:${mm}`
    this.lecturerName = `${lecturer.name} ${lecturer.surname}`
    this.description = description
    this.value = value
  }

  setDetails = (hover = false) =>
    this.props.detailsSetter(
      <>
        <div className={`${classes.note} ${this.props.className || ""}`}>{this.value}</div>

        <dl>
          <dt className={classes.title}>Wystawiający</dt>
          <dd className={classes.value}>{this.lecturerName}</dd>

          <dt className={classes.title}>Data wystawienia</dt>
          <dd className={classes.value}>{this.createDate}</dd>

          <dt className={classes.title}>Opis</dt>
          <dd className={classes.value}>{this.description}</dd>
        </dl>
      </>,
      hover
    )

  removeHoverDetails = () => this.props.detailsSetter(null, true)

  render = () => (
    <button
      className={this.props.className || ``}
      onClick={() => this.setDetails(false)}
      onPointerEnter={() => this.setDetails(true)}
      onPointerLeave={this.removeHoverDetails}
    >
      {this.props.note.value}
    </button>
  )
}
