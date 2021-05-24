import React, { useEffect, useState } from "react"
import TableList, { Tr, Td } from "../components/tableList.js"
import QueryLink from "../components/link.js"

import classes from "./groupsList.module.css"
import { authFetcher } from "../utils/auth.js"
import URLS from "../utils/urls.js"
import { getUrnQuery } from "../utils/functions.js"
// import GroupSettings from "./groupSettings.js"

export default ({ className = `` }) => {
  const { p } = getUrnQuery()
  const [ groups, setGroups ] = useState([])

  useEffect( () => {
    authFetcher.get( URLS.GROUP_FROM_PLATFORM$ID_GET( p ) ).then( r => r && setGroups( r.groups ) )
  }, [ p ] )

  return (
    <article className={className}>
      <h2>Grupy</h2>

      <TableList className={classes.list}>
        {
          groups?.map( ({ id }) => (
            <Tr key={id} className={classes.field}>
              <Td>
                {/* <GroupSettings platformId={p} groupId={id} /> */}
              </Td>

              <Td>
                <QueryLink
                  className={`is-highlightable ${classes.link}`}
                  to="/group"
                  requiredParams={[ `p` ]}
                  params={[ { name:`g`, value:id } ]}
                  children={groups.find( g => g.id == id ).name}
                />
              </Td>
            </Tr>
          ) )
        }
      </TableList>
    </article>
  )
}
