import React from "react"

import Calendar, { Info } from "../components/calendar.js"
import { fetchOrGet, getUrnQuery } from "../utils/functions.js"

import classes from "./eventsCalendar.module.css"

export default ({ className = `` }) => {
  const { p, g } = getUrnQuery()
  const queryParts = [ p ? `platformId=${p}` : ``, g ? `groupId=${g}` : `` ].filter( Boolean )
  const events = fetchOrGet( `fake://meets?${queryParts.join( `&` )}` )

  console.log( events, `fake://meets?${queryParts.join( `&` )}` )

  return (
    <Calendar classNames={{ it:className, day:classes.day, today:classes.today }}>
      {
        events.map( ({ startDate, description }) => {
          const date = new Date( startDate )
          return (
            <Info
              key={startDate}
              year={date.getFullYear()}
              month={date.getMonth()}
              day={date.getDate()}
              children={description}
            />
          )
        } )
      }
    </Calendar>
  )
}
