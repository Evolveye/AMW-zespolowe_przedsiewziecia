import React, { useEffect, useRef } from "react"
// import io from "socket.io-client";
import ws from "../../utils/webSocket"
import Peer from "simple-peer"
import styled from "styled-components"
import { isBrowser } from "../../utils/functions"
//import { getUser } from "../../utils/auth"

import "font-awesome/css/font-awesome.min.css"
import "./style.css"
/** @typedef {Peer.Instance & { id:string }} BetterPeer */

const StyledVideo = styled.video``

const Video = ({ peer }) => {
  const ref = useRef()

  useEffect(() => {
    peer.on("stream", stream => (ref.current.srcObject = stream))
  }, [peer])

  return <StyledVideo ref={ref} playsInline autoPlay />
}

let myVideoStream = ""
let chatInputBox = ""
let all_messages = ""
let main__chat__window = ""
const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
    <span class="unmute">Unmute</span>`
  document.getElementById("muteButton").innerHTML = html
}
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
    <span>Mute</span>`
  document.getElementById("muteButton").innerHTML = html
}
const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`
  document.getElementById("playPauseVideo").innerHTML = html
}

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`
  document.getElementById("playPauseVideo").innerHTML = html
}

const firstUpperLetter = text => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const createFullName = (name, surname) => {
  return firstUpperLetter(name) + " " + firstUpperLetter(surname)
}

let editedMessage = false
let editedMessageId = ""

export default class extends React.Component {
  componentDidMount() {
    chatInputBox = document.getElementById("chat_message")
    all_messages = document.getElementById("all_messages")
    main__chat__window = document.getElementById("main__chat__window")
  }

  roomId = new URL(
    isBrowser() ? window.location.href : "http://www.google.pl"
  ).searchParams.get("roomID")

  state = {
    /** @type {BetterPeer[]} */
    peers: [],
  }

  videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2,
  }

  /** @return {BetterPeer} */
  createPeer(id, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.id = id
    peer.on("signal", signal =>
      ws.emit("sending signal", { userToSignal: id, callerID, signal })
    )

    return peer
  }

  /** @return {BetterPeer} */
  addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    peer.id = callerID
    peer.on("signal", signal =>
      ws.emit("returning signal", { signal, callerID })
    )
    peer.signal(incomingSignal)

    return peer
  }

  /** @param {StyledVideo} video */
  handleVideoRef = async video => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: this.videoConstraints,
      audio: true,
    })
    myVideoStream = stream
    video.srcObject = stream

    ws.emit("join room", this.roomId)

    ws.on("all users", socketsIds => {
      const peers = socketsIds.map(id => this.createPeer(id, ws.id, stream))

      this.setState({ peers })
    })

    ws.on("user joined", payload => {
      const peer = this.addPeer(payload.signal, payload.callerID, stream)

      this.setState(({ peers }) => ({ peers: [...peers, peer] }))
    })

    ws.on("receiving returned signal", payload => {
      const peer = this.state.peers.find(({ id }) => id === payload.id)

      if (peer) peer.signal(payload.signal)
      else console.error(`receiving returned signal, wrong payload ID`)
    })

    document.addEventListener("keydown", e => {
      if (e.which === 13 && chatInputBox.value !== "") {
        if (editedMessage === false) {
          let data = {
            roomId: this.roomId,
            content: chatInputBox.value,
          }
          ws.emit("chat message", data)
          console.log("wysłane: ", data)
          chatInputBox.value = ""
        }else{
          let tempMsg = chatInputBox.value + "- edytowane"
          let data = {
            roomId: this.roomId,
            content: tempMsg,
            messageId: editedMessageId,
          }
          ws.emit(`edit message`, data)
          editedMessage = false
          editedMessageId = ""
          
        }
      }
    })

    ws.on("new message", msgData => {
      console.log(msgData)
      let message =
        createFullName(msgData.author.name, msgData.author.surname) +
        " napisał: " +
        msgData.content
      console.log("message: ", message)
      let li = document.createElement("li")
      li.id = msgData.messageId

      //div new_message
      let div_new_message = document.createElement("div")
      div_new_message.className = "new_message"
      //span author
      let span_author = document.createElement("span")
      span_author.className = "new_message_author"
      span_author.innerHTML =
        createFullName(msgData.author.name, msgData.author.surname) + ":"
      //span content
      let span_content = document.createElement("span")
      span_content.className = "new_message_content"
      span_content.innerHTML = msgData.content
      //div new_message_actions
      let div_new_message_actions = document.createElement("div")
      div_new_message_actions.className = "new_message_actions"
      //span delete
      let span_delete = document.createElement("span")
      span_delete.onclick = () => this.remoteMessageById(msgData.messageId)
      span_delete.innerHTML = "Usuń"
      //span edit
      let span_edit = document.createElement("span")
      span_edit.onclick = () =>
        this.editMessageById(msgData.messageId, msgData.content)
      span_edit.innerHTML = "Edytuj"

      //div new_message_actions -> {span_delete , span_edit}
      div_new_message_actions.appendChild(span_delete)
      div_new_message_actions.appendChild(span_edit)
      //div new_message -> {span_author, span_content, div_new_message_actions}
      div_new_message.appendChild(span_author)
      div_new_message.appendChild(span_content)
      div_new_message.appendChild(div_new_message_actions)

      let newMessage = div_new_message
      li.appendChild(newMessage)
      all_messages.append(li)
      main__chat__window.scrollTop = main__chat__window.scrollHeight
    })
  }

  editMessageById = (id, content) => {
    alert("Tekst do edycji\npojawił się w polu\ndo wpisywania wiadomości")
    chatInputBox.value = content
    editedMessageId = id;
    editedMessage = true;
  }

  remoteMessageById = id => {
    alert("kliknales usuń")
    const msg = {
      messageId: id,
      roomId: this.roomId,
    }
    ws.emit(`delete message`, msg)
    const elem = document.getElementById(id)
    elem.parentNode.removeChild(elem)
  }

  muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false
      setUnmuteButton()
    } else {
      setMuteButton()
      myVideoStream.getAudioTracks()[0].enabled = true
    }
  }

  playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true
    }
  }

  shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
      ws.emit("join room", this.roomId)
      ws.on("user joined", payload => {
        const peer = this.addPeer(payload.signal, payload.callerID, stream)

        this.setState(({ peers }) => ({ peers: [...peers, peer] }))
      })

      ws.on("receiving returned signal", payload => {
        const peer = this.state.peers.find(({ id }) => id === payload.id)

        if (peer) peer.signal(payload.signal)
        else console.error(`receiving returned signal, wrong payload ID`)
      })
    })
  }

  render = () => {
    // const mapa = new Map()
    // mapa.set( id, <StyledVideo ref={this.handleVideoRef} muted autoPlay playsInline data-peer-id={ws.id} /> )

    // inneVidelo.forEach( v => mapa.set( v.id, v ) )

    // return (
    //   <>
    //     {mapa} ALBO {Array.from(mapa)}

    //     {inneVideło.get( aktywneId )}
    //   </>
    // )

    return (
      <div className="main">
        <div className="main__left">
          <div className="main__videos">
            <div className="main__video__left">
              <div id="video-grid">
                <StyledVideo
                  ref={this.handleVideoRef}
                  muted
                  autoPlay
                  playsInline
                  data-peer-id={ws.id}
                />
                {this.state.peers.map((peer, index) => (
                  <Video key={index} peer={peer} />
                ))}
              </div>
            </div>
            <div className="main__video__right" id="video-right">
              <div className="center_the_item_wrapper">
                <span className="center_the_item">
                  Kliknij w wideło po lewej aby wyświetlić tutaj
                </span>
              </div>
            </div>
          </div>
          <div className="main__controls">
            <div className="main__controls_block">
              <div
                role="button"
                className="main__controls_button"
                id="muteButton"
                tabIndex={0}
                onClick={this.muteUnmute}
                onKeyDown={this.muteUnmute}
              >
                <i className="fa fa-microphone"></i>
                <span>Mikrofon</span>
              </div>
              <div
                role="button"
                className="main__controls_button"
                id="playPauseVideo"
                tabIndex={-1}
                onClick={this.playStop}
                onKeyDown={this.playStop}
              >
                <i className="fa fa-video-camera"></i>
                <span>Wideo</span>
              </div>
            </div>

            <div className="main__controls_block">
              <div
                role="button"
                className="main__controls_button"
                tabIndex={-2}
                onClick={this.shareScreen}
                onKeyDown={this.shareScreen}
              >
                <i className="fa fa-desktop"></i>
                <span>Udostępnij ekran</span>
              </div>
              <div className="main__controls_button">
                <i className="fa fa-users"></i>
                <span>Członkowie</span>
              </div>
              <div
                role="button"
                className="main__controls_button"
                tabIndex={-3}
              >
                <i className="fa fa-comment"></i>
                <span>Chat</span>
              </div>
            </div>

            <div className="main__controls_block">
              <div
                className="main__controls_button leaveMeeting"
                id="leave-meeting"
              >
                <i className="fa fa-times"></i>
                <span className="">Opuść spotkanie</span>
              </div>
            </div>
          </div>
        </div>
        <div className="main__right" id="chatBox">
          <div className="main__header">
            <h6>Chat</h6>
          </div>
          <div className="main__chat__window" id="main__chat__window">
            <ul className="messages" id="all_messages"></ul>
          </div>
          <div className="main__message_container">
            <input type="text" id="chat_message" placeholder="Pisz tutaj.." />
          </div>
        </div>
      </div>
    )
  }
}
