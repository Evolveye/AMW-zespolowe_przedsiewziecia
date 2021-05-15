import React, { useEffect, useState } from "react"

import Layout from "../../layouts/base.js"
import { isDataLoading } from "../../utils/functions.js"

import Paint from "../../containers/paint.js"
import SwitchBox, { Tab } from "../../components/switchBox.js"

import classes from "../../css/meet.module.css"
import URLS from "../../utils/urls.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { authFetcher } from "../../utils/auth.js"
import ws from "../../utils/ws.js"

const highlightStyle = `color:#62a01b;font-weight:bold`
const log = string => console.log( `  [WS] ${string}`, highlightStyle )

const sendChatMessage = (form, roomId) => ws.emit( `chat message`, {
  content: form[ `chat-message` ].value,
  roomId,
} )


const Message = ({ author, content, onDelete, onChange }) => {
  const [ isEditingMode, setEditingMode ] = useState( false )
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
            <li><button onClick={onDelete} children="Usuń" /></li>
            <li><button onClick={() => setEditingMode( true )} children="Edytuj" /></li>
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
  }, [ ctx.meet?.id ] )

  if (isDataLoading( ctx.meet )) return <Layout className={classes.layout} title="Grupa" />
  else return (
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
