import React, { useEffect, useMemo, useRef, useState } from "react"
import Peer from "simple-peer"

import Layout from "../../layouts/base.js"
import { getDate, isDataLoading } from "../../utils/functions.js"

import SwitchBox, { Tab } from "../../components/switchBox.js"
import Paint from "../../components/paint.js"

import classes from "../../css/meet.module.css"
import URLS from "../../utils/urls.js"
import getWebsiteContext from "../../utils/websiteContext.js"
import { authFetcher, getUser, authorizeWs } from "../../utils/auth.js"
import { createWS } from "../../utils/ws.js"

let lastUpdate = Date.now()
const updatePaintStorage = {}

const highlightStyle = `color:#62a01b;font-weight:bold`
const log = string => console.log( `  [WS] ${string}`, highlightStyle )
const updatePaint = (ws, data, roomId, setPaintData) => {
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

const sendChatMessage = (ws, form, roomId) => {
  const content = form[ `chat-message` ].value?.trim()

  if (content && content?.length <= 255) ws.emit( `chat message`, { content, roomId } )
}


const Message = ({ userPerms, author, content, onDelete, onChange }) => {
  const [ isEditingMode, setEditingMode ] = useState( false )
  const user = getUser()
  const onEdit = e => {
    e.preventDefault()
    setEditingMode( false )
    onChange?.( e.target[ `message` ].value )
  }

  const processedContent = content
    .replace( /https?:\/\/[^ ]+/, match => `<a class="link" href="${match}">${match}</a>` )

  return !author || !author.livePermissions ? null : (
    <li className={classes.chatMessage}>
      <span className={classes.chatMessageAuthor}>
        {author.name}
        {` `}
        {author.surname}
        {` - `}
        {getDate( Date.now(), `hh:mm` )}
      </span>

      {isEditingMode ? (
        <form onSubmit={onEdit}>
          <input name="message" defaultValue={content} />
        </form>
      ) : (
        <>
          <p className={classes.chatMessageContent} dangerouslySetInnerHTML={{ __html:processedContent }} />

          <ol className={classes.chatMenu}>
            {(user.id == author.id || userPerms.canKickUser) && <li><button onClick={onDelete} children="Usuń" /></li>}
            {user.id == author.id && <li><button onClick={() => setEditingMode( true )} children="Edytuj" /></li>}
          </ol>
        </>
      )}

    </li>
  )
}



const Video = ({ peer }) => {
  const ref = useRef()

  useEffect( () => {
    peer.on( `stream`, stream => (ref.current.srcObject = stream) )
  }, [ peer ] )

  return (
    <video ref={ref} className={classes.video} playsInline autoPlay data-peer-id={peer.id}>
      <track kind="captions" />
    </video>
  )
}

const CustomVideo = ({ srcObject, ...props }) => {
  const refVideo = useRef( null )

  useEffect( () => {
    if (!refVideo.current) return
    refVideo.current.srcObject = srcObject
  }, [ srcObject ] )

  return <video ref={refVideo} {...props} />
}

const ws = createWS()

export default () => {
  // const wsRef = useRef( createWS() )
  // const ws = wsRef.current
  const ctx = getWebsiteContext()

  const [ participants, setParticipants ] = useState([])
  const [ messages, setMessages ] = useState([])
  const [ paintData, setPaintData ] = useState([])

  const [ videoGridElements, setVideoGridElements ] = useState([])

  const [ activeVideo, setActiveVideo ] = useState( null )
  const [ peers, setPeers ] = useState([])
  const peersArr = useRef([])
  const [ myPeer, setMyPeer ] = useState( null )
  const [ screenSharing, setScreenSharing ] = useState( null )
  const screenSharingRef = useRef( null )
  const [ idPeerToRemove, setIdPeerToRemove ] = useState( null )
  const [ myMeetPerms, setMyMeetPerms ] = useState( null )

  const videoConstraints = useRef({
    height: 400,
    width: 400,
  })

  const videoStream = useRef( null )
  const initialized = useRef( false )
  const myVideoStream = useRef( null )
  const isScreenSharing = useRef( false )

  const roomId = ctx.meet?.id

  peersArr.current = peers
  screenSharingRef.current = screenSharing

  const handleMainVideoRef = async video => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints.current,
      audio: true,
    })

    // console.log({ handleMainVideoRef:1, stream })
    videoStream.current = stream
    myVideoStream.current = stream

    if (!initialized.current) {
      video.srcObject = stream
      init()
    }
  }


  const init = () => {
    // console.log({ init:2 })
    ws.emit( `join room`, roomId )
    initialized.current = true
    // const stream = myVideoStream
  }


  const muteUnmute = () => {
    const isEnabled = myVideoStream.current.getAudioTracks()[ 0 ].enabled

    // if (enabled) {
    myVideoStream.current.getAudioTracks()[ 0 ].enabled = !isEnabled
    //   // setUnmuteButton()
    // } else {
    //   // setMuteButton()
    //   myVideoStream.current.getAudioTracks()[ 0 ].enabled = true
    // }
  }


  const playStop = () => {
    ws.emit( `setPlayStop`, { roomId, id:ws.id } )
    // const isEnabled = myVideoStream.current.getVideoTracks()[ 0 ].enabled

    // if (enabled) {
    // myVideoStream.current.getVideoTracks()[ 0 ].enabled = !isEnabled
    //   // setPlayVideo()
    // } else {
    //   // setStopVideo()
    //   myVideoStream.current.getVideoTracks()[ 0 ].enabled = true
    // }
  }


  const shareScreen = async() => {
    isScreenSharing.current = !isScreenSharing.current

    // const videoGrid = document.querySelector('#video-grid')

    if (isScreenSharing.current) {
      // console.log( `test` )
      ws.emit( `screen sharing`, { roomId, id:ws.id } )

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video:true })
      const mediaStreamVideo = mediaStream.getTracks()[ 0 ]

      // const stream = await navigator.mediaDevices.getUserMedia({ audio:true })
      // const streamAudio = stream.getTracks()[ 0 ]

      const newMediaStream = new MediaStream([ mediaStreamVideo ])

      videoStream.current = newMediaStream
      setScreenSharing( mediaStream )
      init()
      // setSharingScreenPlayButton()

      const myScreenSharing = {
        id: ws.id,
        video: (
          <CustomVideo
            key={Math.random()}
            srcObject={newMediaStream}
            autoPlay
            playsInline
            className={classes.video}
            data-peer-id={ws.id}
          />
        ),
      }

      setVideoGridElements( eles => [ ...eles, myScreenSharing ] )
      // videoGrid.appendChild(myScreenSharing)
      // videoGrid.prepend(myScreenSharing)
    } else {
      ws.emit( `screen sharing`, { roomId, id:ws.id } )

      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: videoConstraints.current,
      //   audio: true,
      // })

      videoStream.current = null
      setScreenSharing( null )
      init()

      // const myScreenSharing = {
      //   id: ws.id,
      //   video: (
      //     <CustomVideo
      //       key={Math.random()}
      //       srcObject={stream}
      //       autoPlay
      //       playsInline
      //       className={classes.video}
      //       data-peer-id={ws.id}
      //     />
      //   ),
      // }

      // setVideoGridElements( eles => [ ...eles, myScreenSharing ] )
      setVideoGridElements( eles => eles.filter( p => p.id != ws.id ) )
    }
  }


  const showMajFacjata = async() => {
    isScreenSharing.current = !isScreenSharing.current

    // const videoGrid = document.querySelector('#video-grid')


    if (isScreenSharing.current) {
      ws.emit( `screen sharing`, { roomId, id:ws.id } )

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints.current,
        audio: true,
      })

      // console.log({ handleMainVideoRef:1, stream })
      videoStream.current = stream
      // myVideoStream.current = stream
      // const newMediaStream = new MediaStream([ stream ])

      // videoStream.current = newMediaStream
      setScreenSharing( stream )
      init()
      // setSharingScreenPlayButton()

      const myScreenSharing = {
        id: ws.id,
        video: (
          <CustomVideo
            key={Math.random()}
            srcObject={stream}
            autoPlay
            playsInline
            className={classes.video}
            data-peer-id={ws.id}
          />
        ),
      }

      setVideoGridElements( eles => [ ...eles, myScreenSharing ] )
    } else {
      ws.emit( `screen sharing`, { roomId, id:ws.id } )

      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: videoConstraints.current,
      //   audio: true,
      // })

      videoStream.current = null
      setScreenSharing( null )
      init()

      // const myScreenSharing = {
      //   id: ws.id,
      //   video: (
      //     <CustomVideo
      //       key={Math.random()}
      //       srcObject={stream}
      //       autoPlay
      //       playsInline
      //       className={classes.video}
      //       data-peer-id={ws.id}
      //     />
      //   ),
      // }

      // setVideoGridElements( eles => [ ...eles, myScreenSharing ] )
      setVideoGridElements( eles => eles.filter( p => p.id != ws.id ) )
    }
  }



  useEffect( () => {
    authorizeWs( ws )

    ws.on( `other peers`, socketsIds => {
      // console.log({ other:3, videoStream:videoStream.current })
      const peers = socketsIds.map( id => createPeer( ws, id, ws.id, videoStream.current ) )
      log( `other peers -- ids: %c${socketsIds.join( `, ` )}` )
      setPeers( peers )
    } )

    ws.on( `screen sharing`, id => {
      // setIdPeerToRemove( id )
      log( `screen sharing -- id to remove: %c${id}` )
      // console.log({ current:peersArr.current })
      // setPeers( peers => peers.filter( p => p.id != id ) )
      setVideoGridElements( eles => eles.filter( p => p.id != id ) )
    } )

    ws.on( `user joined`, ({ signal, callerID }) => {
      const peer = addPeer( ws, signal, callerID, videoStream.current )
      log( `user joined -- caller id: %c${callerID}` )
      setPeers( peers => [ ...peers, peer ] )
    } )

    ws.on( `receiving returned signal`, payload => {
      const peer = peersArr.current.find( ({ id }) => id === payload.id )
      log( `receiving returned signal -- payload id: %c${payload.id}` )

      if (peer) peer.signal( payload.signal )
      else console.error( `receiving returned signal, wrong payload ID` )
    } )

    ws.on( `leave meeting`, id => {
      log( `leave meeting -- id: %c${id}` )
      setPeers( peers => peers.filter( p => p.id != id ) )
    } )

    ws.on( `setPlayStop`, id => {
      const myVideo = document.querySelectorAll( `[data-peer-id="${id}"]` )[ 0 ]
      const enabled = myVideo.srcObject.getAudioTracks()[ 0 ].enabled

      // console.log({ enabled })

      myVideo.srcObject.getVideoTracks()[ 0 ].enabled = !enabled

      // console.log({ enabled:myVideo.srcObject.getAudioTracks()[ 0 ].enabled })
    } )
  }, [] )

  useEffect( () => {
    if (isDataLoading( ctx.meet )) return () => {}

    authFetcher.get( URLS.MEET$ID_USERS_GET( ctx.meet.id ) ).then( r => r && setParticipants( r.participants ) )
    authFetcher.get( URLS.MEET$ID_GET( ctx.meet.id ) ).then( r => r && setMyMeetPerms( r.meet.myRole.abilities ) )
  }, [ ctx.meet?.id ] )

  useEffect( () => {
    if (isDataLoading( ctx.meet )) return () => {}

    log( `Joined to room %c${roomId}` )
    log( `My socket id is %c${ws.id}` )

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
    
    return () => {
      console.log( `leave`, roomId )
      ws.emit( `leave meet`, roomId )
    }
  }, [ ctx.meet?.id ] )

  if (isDataLoading( ctx.meet ) || !ctx.meet || !ws) {
    return <Layout className={classes.layout} title="Grupa" />
  }

  // console.log({ videoGridElements, current:peersArr.current })
  const videosObjects = [
    ...videoGridElements,
    ...peersArr.current.map( peer => ({ id:peer.id, video:<Video key={peer.id} peer={peer} /> }) ),
  ].map( ({ video }) => video )

  // const vid = (
  //   <video
  //     key={ws.id}
  //     ref={handleMainVideoRef}
  //     className={classes.video}
  //     muted
  //     autoPlay
  //     playsInline
  //     data-peer-id={ws.id}
  //   />
  // )
  // {videoGridElements}
  // {videosObjects.map( ({ video }) => video )}
  // videosObjects.push({
  //   id: ws.id,
  //   video: <Video key={peer.id} peer={peer} />
  //   // video: (
  //   //   <video
  //   //     key={ws.id}
  //   //     ref={handleMainVideoRef}
  //   //     className={classes.video}
  //   //     muted
  //   //     autoPlay
  //   //     playsInline
  //   //     data-peer-id={ws.id}
  //   //   />
  //   // ),
  // })

  // console.log({ peers, peersArr:peersArr.current, videoGridElements })
  // peers.forEach( peer =>
  //   videosObjects.push({ id:peer.id, video:<Video key={peer.id} peer={peer} /> }),
  // )


  if (screenSharing != null) screenSharing.getVideoTracks()[ 0 ].onended = () => {
    // setSharingScreenStopButton()
    // isScreenSharing.current = false
    shareScreen()
  }


  if (ctx.meet.externalUrl) {
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
      {/* {console.log( ctx.meet.myRole.abilities )} */}
      {/* <SwitchBox
            classNames={{
              it: classes.screen,
              switches: `${classes.nav} ${classes.mainNav}`,
              switch: `neumorphizm is-button`,
            }}
          >
            <Tab className={classes.tab} name="Ekran"> */}
      <article className={classes.screen}>
        <ul className={classes.nav}>
          {ctx.meet.myRole.abilities.canShareVideo && (
            <li>
              <button
                className="neumorphizm is-button"
                // onClick={() => shareScreen( componentData )}
                onClick={shareScreen}
                children="Udostępnij ekran"
              />
            </li>
          )}
          {/* {ctx.meet.myRole.abilities.canSpeak && (
              <li>
                <button
                  className="neumorphizm is-button"
                  // onClick={() => shareScreen( componentData )}
                  onClick={muteUnmute}
                  children="Mikrofon"
                />
              </li>
            )} */}
          {ctx.meet.myRole.abilities.canSpeak && (
            <li>
              <button
                className="neumorphizm is-button"
                // onClick={() => shareScreen( componentData )}
                // onClick={playStop}
                onClick={showMajFacjata}
                children="Kamerka z mikrofonem"
              />
            </li>
          )}
        </ul>

        <section id="video-grid" className={classes.videos}>
          {/* {videoGridElements}
            {videosObjects.map( ({ video }) => video )} */}
          {videosObjects}
        </section>

        <Paint
          classNames={{
            it: classes.tabContent,
            nav: `${classes.nav} ${classes.isBottom}`,
            tool: classes.tool,
          }}
          onUpdate={data => updatePaint( ws, data, roomId, setPaintData )}
          operationsHistory={paintData}
        />
      </article>
      <SwitchBox
        key={Math.random()}
        classNames={{
          it: classes.column,
          switches: classes.buttons,
          switch: `neumorphizm is-button`,
        }}
      >
        <Tab name="Czat" className={classes.chat}>
          <ol className={classes.chatMessages}>
            {messages.map( msg => (
              <Message
                key={msg.id}
                {...msg}
                userPerms={myMeetPerms}
                onDelete={() => ws.emit( `delete message`, { roomId, messageId:msg.id } )}
                onChange={content => ws.emit( `edit message`, { roomId, messageId:msg.id, content } )}
              />
            ) )}
          </ol>

          <form onSubmit={e => { e.preventDefault();sendChatMessage( ws, e.target, roomId ) }}>
            <input name="chat-message" />
            <button className="neumorphizm is-button" type="submit">Wyślij</button>
          </form>
        </Tab>

        <Tab name="Użytkownicy">
          <h2>Lista uczestników</h2>

          <ul className={classes.users}>
            {
              participants?.map( ({ id, name, surname }) => (
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


function addPeer( ws, incomingSignal, callerID, stream ) {
  console.log( `stream addpeer: `, stream )
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
  })

  peer.id = callerID
  peer.once( `signal`, signal => ws.emit( `returning signal`, { signal, callerID } ) )
  peer.signal( incomingSignal )

  return peer
}

function createPeer( ws, id, callerID, stream ) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
  })

  peer.id = id
  peer.once( `signal`, signal => {
    log( `sending signal -- new peer id: %c${id}` )
    ws.emit( `sending signal`, { userToSignal:id, callerID, signal } )
  } )

  return peer
}
