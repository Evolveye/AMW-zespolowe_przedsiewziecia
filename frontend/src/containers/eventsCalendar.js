import React from "react"

import Calendar, { Info } from "../components/calendar.js"
import { fetchOrGet, getDate, getUrnQuery } from "../utils/functions.js"

import classes from "./eventsCalendar.module.css"

export default ({ className = `` }) => {
  const { p:platformId, g:groupId } = getUrnQuery()
  const queryParts = [ platformId ? `platformId=${platformId}` : ``, groupId ? `groupId=${groupId}` : `` ].filter( Boolean )
  const events = fetchOrGet( `fake://meets?${queryParts.join( `&` )}` )

  return (
    <Calendar
      classNames={{
        it: className,
        day: classes.day,
        today: classes.today,
        activeEventTitle: `neumorphizm is-button ${classes.eventTitle}`,
        eventDescription: classes.eventDescription,
      }}
    >
      {
        events.map( ({ id, platformId, groupId, startDate, description }) => {
          const date = new Date( startDate )
          return (
            <Info
              key={startDate}
              year={date.getFullYear()}
              month={date.getMonth()}
              day={date.getDate()}
              title={getDate( date, `hh:mm` )}
              link={`/meet?p=${platformId}${groupId ? `&g=${groupId}` : ``}&m=${id}`}
              children={description}
            />
          )
        } )
      }
    </Calendar>
  )
}
