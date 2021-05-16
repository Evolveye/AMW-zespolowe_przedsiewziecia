import React, { useEffect, useState } from "react"

import Layout from "../../layouts/base.js"
import { isDataLoading } from "../../utils/functions.js"

import Paint from "../../containers/paint.js"
import SwitchBox, { Tab } from "../../components/switchBox.js"

import classes from "../../css/meet.module.css"
import URLS from "../../utils/urls.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { authFetcher, getUser } from "../../utils/auth.js"
import ws from "../../utils/ws.js"

let lastUpdate = Date.now()
const updatePaintStorage = {}

const highlightStyle = `color:#62a01b;font-weight:bold`
const log = string => console.log( `  [WS] ${string}`, highlightStyle )
const updatePaint = (data, roomId, setPaintData) => {
  if (lastUpdate > Date.now() - 100) {
    if (!(roomId in updatePaintStorage)) updatePaintStorage[ roomId ] = []

    updatePaintStorage[ roomId ].push( data )

    return
  }

  lastUpdate = Date.now()

  // setPaintData?.( data )

  ws.emit( `paint data`, { roomId, data } )
  updatePaintStorage[ roomId ] = []
}

const sendChatMessage = (form, roomId) => {
  const content = form[ `chat-message` ].value

  if (content) ws.emit( `chat message`, { content, roomId } )
}


const Message = ({ author, content, onDelete, onChange }) => {
  const [ isEditingMode, setEditingMode ] = useState( false )
  const user = getUser()
  console.log( user )
  const onEdit = e => {
    e.preventDefault()
    setEditingMode( false )
    onChange?.( e.target[ `message` ].value )
  }

  return (
    <li className={classes.chatMessage}>
      <span className={classes.chatMessageAuthor}>
        {author.name}
        {` `}
        {author.surname}
      </span>

      {isEditingMode ? (
        <form onSubmit={onEdit}>
          <input name="message" defaultValue={content} />
        </form>
      ) : (
        <>
          <p className={classes.chatMessageContent}>{content}</p>

          <ol className={classes.chatMenu}>
            {(user.id == author.id || author.livePermissions.canKickUser) && <li><button onClick={onDelete} children="Usuń" /></li>}
            {user.id == author.id && <li><button onClick={() => setEditingMode( true )} children="Edytuj" /></li>}
          </ol>
        </>
      )}

    </li>
  )
}


export default () => {
  const ctx = getWebsiteContext()
  const [ participants, setParticipants ] = useState([])
  const [ messages, setMessages ] = useState([])
  const [ paintData, setPaintData ] = useState([])

  const roomId = ctx.meet?.id

  useEffect( () => {
    if (isDataLoading( ctx.meet )) return () => {}

    authFetcher.get( URLS.MEET$ID_USERS_GET( ctx.meet.id ) ).then( r => r && setParticipants( r.participants ) )
  }, [ ctx.meet?.id ] )

  useEffect( () => {
    if (isDataLoading( ctx.meet )) return () => {}

    log( `Joined to room %c${roomId}` )

    ws.emit( `join room`, roomId )
    ws.on( `member joined`, ({ name, surname }) => log( `member joined %c${name} ${surname}` ) )
    ws.on( `new message`, msg => setMessages( msgs => [ ...msgs, msg ] ) )
    ws.on( `delete message`, id => setMessages( msgs => msgs.filter( m => m.id != id ) ) )
    ws.on( `edit message`, ({ messageId, content }) => setMessages( msgs => {
      const msgIndex = msgs.findIndex( m => m.id == messageId )
      const newMessages = [
        ...msgs.slice( 0, msgIndex ),
        { ...msgs[ msgIndex ], content },
        ...msgs.slice( msgIndex + 1 ),
      ]

      return newMessages
    } ) )

    ws.on( `paint data`, ({ emiterId, data }) => {
      if (emiterId != ws.id) setPaintData( data )
    } )
  }, [ ctx.meet?.id ] )

  if (isDataLoading( ctx.meet ) || !ctx.meet) return <Layout className={classes.layout} title="Grupa" />
  else if (ctx.meet.externalUrl) {
    return (
      <Layout className={`is-centered ${classes.layout}`} title="Grupa">
        <a className="link" href={ctx.meet.externalUrl}>
          Link do spotkania:
          {` `}
          {ctx.meet.externalUrl.match( /https?:\/\/.*?\// )[ 0 ]}
        </a>
      </Layout>
    )
  } else return (
    <Layout className={classes.layout} title="Grupa">
      <SwitchBox
        classNames={{
          it: classes.screen,
          switches: `${classes.nav} ${classes.mainNav}`,
          switch: `neumorphizm is-button`,
        }}
      >
        <Tab className={classes.tab} name="Tablica">
          <Paint
            classNames={{
              it: classes.tabContent,
              nav: classes.nav,
              tool: classes.tool,
            }}
            onUpdate={data => updatePaint( data, roomId, setPaintData )}
            operationsHistory={paintData}
          />
        </Tab>

        <Tab className={classes.tab} name="Ekran">

        </Tab>
      </SwitchBox>

      <SwitchBox
        key={Math.random()}
        classNames={{
          it: classes.column,
          switches: classes.buttons,
          switch: `neumorphizm is-button`,
        }}
      >
        <Tab name="Czat" className={classes.chat}>
          <ol>
            {messages.map( msg => (
              <Message
                key={msg.id}
                {...msg}
                onDelete={() => ws.emit( `delete message`, { roomId, messageId:msg.id } )}
                onChange={content => ws.emit( `edit message`, { roomId, messageId:msg.id, content } )}
              />
            ) )}
          </ol>

          <form onSubmit={e => { e.preventDefault();sendChatMessage( e.target, roomId ) }}>
            <input name="chat-message" />
          </form>
        </Tab>

        <Tab name="Użytkownicy">
          <h2>Lista uczestników</h2>

          <ul className={classes.users}>
            {
              participants.map( ({ id, name, surname }) => (
                <li key={id} className={classes.user}>
                  {name}
                  {` `}
                  {surname}
                </li>
              ) ).sort()
            }
          </ul>
        </Tab>
      </SwitchBox>
    </Layout>
  )
}
