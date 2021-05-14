import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import classes from "./calendar.module.css"

const daysInMonth = (year, month) => 32 - new Date( year, month, 32 ).getDate()
const firstDayInMonth = (year, month) => (new Date( year, month )).getDay()

const today = new Date()
const month = today.getMonth()
const year = today.getFullYear()


const firstDay = firstDayInMonth( 2021, 3 ) - 1


export const Info = () => null
Info.type = (<Info year={0} month={0} day={0} />).type
Info.propTypes = {
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  day: PropTypes.number.isRequired,
  children: PropTypes.any,
}


export default function Calendar({ classNames, children }) {
  const dayInfo = React.Children.map( children, ({ props }) => props )
    .map( ({ children, ...props }) => ({ info:children, ...props }) )

  const rows = []
  let date = 1

  for (let i = 0;  i < 6;  i++) {
    const tds = []

    for (let j = 0;  j < 7;  j++) {
      const tdProps = { key:j, className:`${classes.td} ${classNames?.day} ` }

      if (i === 0 && j < firstDay) tds.push( <td {...tdProps} /> )
      else if (date > daysInMonth( month, year )) tds.push( <td {...tdProps} /> )
      else {
        const currentDayInfo = dayInfo.filter( info => date === info.day && info.month === month && info.year === year ) ?? {}
        const isToday = date === today.getDate() && year === today.getFullYear() && month === today.getMonth()

        const events = currentDayInfo.map( ({ link, title, info }) => !title ? null :  (
          <div key={link} className={classes.event}>
            {
              link
                ? <Link className={`${classes.title} ${classNames?.activeEventTitle}`} to={link}>{title}</Link>
                : <span className={`${classes.title} ${classNames?.eventTitle}`}>{title}</span>
            }
            <p className={`${classes.eventDescription} ${classNames?.eventDescription}`}>{info}</p>
          </div>
        ) )

        if (isToday) tdProps.className += classNames?.today

        tds.push(
          <td {...tdProps}>
            <span>{date}</span>
            {events}
          </td>,
        )

        date++
      }
    }

    rows.push( <tr key={i}>{tds}</tr> )
  }

  return (
    <table className={classNames?.it} style={{ tableLayout:`fixed`, width:`100%` }}>
      <tbody>
        {rows}
      </tbody>
    </table>
  )
}

