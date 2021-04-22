import React, { useEffect, useState } from "react"
import List from "../../containers/list.js"

import Layout from "../../layouts/platform.js"
import { fetchOrGet } from "../../utils/functions.js"

export default () => {
  const [ participants, setParticipants ] = useState([])

  useEffect( () => {
    fetchOrGet( `fake://platformUsers`, setParticipants )
  }, [] )

  return (
    <Layout title="Grupa" showMeets={true}>
      <h1 className="h1 tag">Szczegóły spotkania</h1>

      <h2>Lista uczestników</h2>
      <List array={participants.map( ({ name, surname }) => `${name} ${surname}` )} />
    </Layout>
  )
}
