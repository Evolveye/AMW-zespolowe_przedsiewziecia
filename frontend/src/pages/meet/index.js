import React, { useContext, useEffect, useState } from "react"

import Layout from "../../layouts/platform.js"
import { AuthContext } from "../../utils/auth.js"
import { fetchOrGet } from "../../utils/functions.js"

export default () => (
  <Layout title="Grupa" showMeets={true}>
    <Pgae />
  </Layout>
)

function Pgae() {
  const { meet } = useContext( AuthContext )
  const [ participants, setParticipants ] = useState([])

  useEffect( () => {
    fetchOrGet( `fake://platformUsers`, setParticipants )
  }, [] )

  return (
    <>
      <h1 className="h1">
        <span className="tag">Spotkanie</span>
        {` `}
        {meet?.description}
      </h1>

      <ul>
        {participants.map( ({ id, name, surname }) => (
          <li key={id} className="participants">
            {name}
            {` `}
            {surname}
          </li>
        ) )}
      </ul>
    </>
  )
}
