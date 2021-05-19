import React, { useEffect, useState } from "react"

import Layout from "../../layouts/platform.js"
import EventsCalendar from "../../containers/eventsCalendar.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { getDate, isDataLoading } from "../../utils/functions.js"
import GroupSettings from "../../containers/groupSettings.js"

import classes from "../../css/page.module.css"
import { authFetcher } from "../../utils/auth.js"
import URLS, { ORIGIN } from "../../utils/urls.js"
import TableList, { Td, Tr } from "../../components/tableList.js"

export default () => {
  const ctx = getWebsiteContext()
  const [ materials, setMaterials ] = useState( null )
  const [ tasks, setTasks ] = useState( null )

  const { platform, group } = ctx

  useEffect( () => {
    if (isDataLoading( group )) return () => {}

    authFetcher.get( URLS.GROUPS$ID_MATERIALS_GET( group.id ) ).then( r => r && setMaterials( r.materials ) )
    authFetcher.get( URLS.GROUPS$ID_TASKS_GET( group.id ) ).then( r => r && setTasks( r.tasks ) )
  }, [ group?.id ] )

  return isDataLoading( group ) || isDataLoading( platform ) || !platform ? <Layout title="Grupa" showMeets={true} /> : (
    <Layout title="Grupa" showMeets={true}>
      <GroupSettings className={classes.groupSettingsSwitch} platformId={platform.id} group={group} />

      <h1 className="h1">
        <span className="tag">Grupa</span>
        {` `}
        {group?.name}
      </h1>

      <EventsCalendar />

      <article>
        <section>
          {materials?.length ? <h2>Materiały do pobrania</h2> : null}

          <TableList>
            {materials?.map( ({ id, path, name, description }) => (
              <Tr key={id}>
                <Td>
                  <a className="is-highlightable" download href={`${ORIGIN}/${path}`}>{name.match( /\d+-(.*)/ )[ 1 ]}</a>
                </Td>
                <Td>
                  <span>{description}</span>
                </Td>
              </Tr>
            ) )}
          </TableList>
        </section>
        <section>
          {tasks?.length ? <h2>Zadania do wykonania</h2> : null}

          <TableList>
            {tasks?.map( ({ id, expire, title, description }) => (
              <Tr key={id}>
                <Td>{title}</Td>
                <Td>{getDate( expire )}</Td>
                <Td>{description}</Td>
              </Tr>
            ) )}
          </TableList>
        </section>
      </article>
    </Layout>
  )
}
