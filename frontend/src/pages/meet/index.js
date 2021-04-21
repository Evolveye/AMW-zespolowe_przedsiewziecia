import React, { useContext, useEffect, useState } from "react"

import Layout from "../../layouts/platform.js"
import { AuthContext } from "../../utils/auth.js"
import { fetchOrGet, getWebsiteContext } from "../../utils/functions.js"

export default () => {
  const { meet } = getWebsiteContext()
  const [ participants, setParticipants ] = useState([])

  useEffect( () => {
    fetchOrGet( `fake://platformUsers`, setParticipants )
  }, [] )

  return (
    <Layout title="Grupa" showMeets={true}>
      <h1 className="h1 tag">
        Szczegóły spotkania
      </h1>

      <p>{meet.description}</p>

      <ul>
        {participants.map( ({ id, name, surname }) => (
          <li key={id} className="participants">
            {name}
            {` `}
            {surname}
          </li>
        ) )}
      </ul>
    </Layout>
  )
}
