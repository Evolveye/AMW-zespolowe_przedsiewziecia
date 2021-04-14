import React from "react"
import PropTypes from "prop-types"

const months = [ `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec` ]

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
    .map( ({ year, month, day, children }) => ({ year, month, day, info:children }) )

  const rows = []
  let date = 1

  for (let i = 0;  i < 6;  i++) {
    const tds = []

    for (let j = 0;  j < 7;  j++) {
      const tdProps = { style:{ flexGrow:1, flexBasis:0, flexShrink:0 }, className:classNames?.day, key:j }

      if (i === 0 && j < firstDay) tds.push( <td {...tdProps} /> )
      else if (date > daysInMonth( month, year )) tds.push( <td {...tdProps} /> )
      else {
        const { info } = dayInfo.find( info => date === info.day && info.month === month && info.year === year ) ?? {}
        const isToday = date === today.getDate() && year === today.getFullYear() && month === today.getMonth()

        tds.push(
          <td {...tdProps} className={isToday ? `${classNames?.day} ${classNames?.today}` : classNames?.day}>
            {date}
            <br />
            {info}
          </td>,
        )

        date++
      }
    }

    rows.push( <tr key={i} style={{ display:`flex` }}>{tds}</tr> )
  }

  return (
    <table className={classNames?.it}>
      <tbody>
        {rows}
      </tbody>
    </table>
  )
}

