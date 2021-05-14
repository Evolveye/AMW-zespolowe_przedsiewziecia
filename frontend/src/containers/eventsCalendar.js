import React, { useEffect, useState } from "react"

import Calendar, { Info } from "../components/calendar.js"
import { authFetcher } from "../utils/auth.js"
import { getDate, getUrnQuery } from "../utils/functions.js"
import URLS from "../utils/urls.js"

import classes from "./eventsCalendar.module.css"

export default ({ className = `` }) => {
  const { p:platformId, g:groupId } = getUrnQuery()
  const queryParts = [ platformId ? `platformId=${platformId}` : ``, groupId ? `groupId=${groupId}` : `` ].filter( Boolean )
  const [ events, setEvents ] = useState([])

  useEffect( () => {
    authFetcher.get( URLS.MEET_GET() + `?` + queryParts.join( `&` ) ).then( r => {
      r && setEvents( r.meets )
    } )
  }, [ platformId, groupId ] )

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
        events.map( ({ id, platformId, groupId, dateStart, description }) => {
          const date = new Date( dateStart )
          return (
            <Info
              key={id}
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
