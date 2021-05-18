import React, { useEffect, useRef } from "react"
// import io from "socket.io-client";
import ws from "../../utils/webSocket"
import Peer from "simple-peer"
import { isBrowser } from "../../utils/functions"
//import { getUser } from "../../utils/auth"

import "font-awesome/css/font-awesome.min.css"
import "./style.css"

import dane from "../../../cypress/integration/PlatformaEdukacyjna/Dane/dane.js"


/** @typedef {Peer.Instance & { id:string }} BetterPeer */

const Video = ({ peer }) => {
  const ref = useRef()

  useEffect(() => {
    peer.on("stream", stream => (ref.current.srcObject = stream))
  }, [peer])

  return (
    <video ref={ref} playsInline autoPlay data-peer-id={peer.id}>
      <track kind="captions" />
    </video>
  )
}

let myVideoStream = ""
let chatInputBox = ""
let myVideo = null
//let all_messages = ""
//let main__chat__window = ""

const setSharingScreenPlayButton = () => {
  const html = `<i class="sharing fa fa-desktop"></i>
  <span class="sharing">W trakcje udostępniania</span>`
  const btn = document.getElementById("screenSharing")
  btn.innerHTML = html
  btn.className ="main__controls_button disable"
}
const setSharingScreenStopButton = () => {
  const html = `<i class="fa fa-desktop"></i>
  <span>Udostępnij ekran</span>`
  const btn = document.getElementById("screenSharing")
  btn.innerHTML = html
  btn.className ="main__controls_button"
}

const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
    <span class="unmute">Mikrofon</span>`
  document.getElementById("muteButton").innerHTML = html
}
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
    <span>Mikrofon</span>`
  document.getElementById("muteButton").innerHTML = html
}
const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Wideo</span>`
  document.getElementById("playPauseVideo").innerHTML = html
}

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Wideo</span>`
  document.getElementById("playPauseVideo").innerHTML = html
}

const firstUpperLetter = text => {
  //alert(text)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const createFullName = (name, surname) => {
  return firstUpperLetter(name) + " " + firstUpperLetter(surname)
}

let editedMessage = false
let editedMessageId = ""
let toCompare = ""

export default class extends React.Component {
  roomId = new URL(
    isBrowser() ? window.location.href : "http://www.google.pl"
  ).searchParams.get("roomID")

  state = {
    activeVideo: null,
    /** @type {BetterPeer[]} */
    peers: [],
    /** @type {ReactElement[]} */
    messages: [],
    /** @type {Peer} */
    myPeer: null,
    screenSharing: null,
    idPeerToRemove: null,
  }

  videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2,
  }

  chatWindow = null
  videoStream = null
  initialized = false

  componentDidMount() {
    chatInputBox = document.getElementById("chat_message")
  }

  /** @return {BetterPeer} */
  createPeer(id, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.id = id
    peer.once("signal", signal => {
      console.log(`sending signal`, { signal })
      ws.emit("sending signal", { userToSignal: id, callerID, signal })
    })

    return peer
  }

  /** @return {BetterPeer} */
  addPeer(incomingSignal, callerID, stream) {
    console.log("stream addpeer: ", stream)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    peer.id = callerID
    peer.once("signal", signal =>
      ws.emit("returning signal", { signal, callerID })
    )
    peer.signal(incomingSignal)

    return peer
  }

  /** @param {StyledVideo} video */
  handleMainVideoRef = async video => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: this.videoConstraints,
      audio: true,
    })

    this.videoStream = stream
    myVideoStream = stream

    if (!this.initialized) {
      video.srcObject = stream
      this.init()
    }
  }

  init = () => {
    this.initialized = true

    ws.emit("join room", this.roomId)

    // // TODO
    // // ws.on("join", ({ messages }) => messages.forEach( message => this.addMessageToChat( messsage ))

    ws.on("all users", socketsIds => {
      const peers = socketsIds.map(id =>
        this.createPeer(id, ws.id, this.videoStream)
      )
      console.log({ peers })
      this.setState({ peers })
    })


    ws.on(`user screen sharing`, ({tekst, idToRemove}) => {
      this.setState({idPeerToRemove: idToRemove})
      console.log("idToRemove: ", idToRemove)
      this.removeDisconnectedPeer(idToRemove)

    })

    ws.on("user joined", payload => {
      const peer = this.addPeer(
        payload.signal,
        payload.callerID,
        this.videoStream
      )

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
        } else {
          if (toCompare !== chatInputBox.value && chatInputBox.value !== "") {
            let tempMsg = chatInputBox.value + "- edytowane"
            let data = {
              roomId: this.roomId,
              content: tempMsg,
              messageId: editedMessageId,
            }
            ws.emit(`edit message`, data)
          }
          editedMessage = false
          editedMessageId = ""
          chatInputBox.value = ""
        }
      }
    })

    ws.on(`leave meeting`, leave => {
      this.removeDisconnectedPeer(leave)
    })
    const stream = myVideoStream
    ws.on(`my peer`, myPeer => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      })

      peer.id = myPeer
      this.setState({ myPeer: peer })
      console.log("mypeer: ", this.state.myPeer)
    })

    ws.on("new message", this.addMessageToChat)
    ws.on("remove message", this.removeMessageFromChat)
    ws.on(`update message`, ({ messageId, content }) => {
      //alert("nowa wiadomosc: " + content)
      let changedMessage = document.querySelectorAll(
        `[data-key="${messageId}"]`
      )[0]
      console.log("changedMessage:", changedMessage)
      let editedMessage = changedMessage.getElementsByClassName(
        "new_message_content"
      )[0]
      console.log("editedMessage:", editedMessage)
      editedMessage.innerHTML = content
    })
  }

  addMessageToChat = ({ author, content, messageId }) => {
    const message = (
      <li key={messageId} data-key={messageId} className="new_message">
        <span className="new_message_author">
          {createFullName(author.name, author.surname)}:
        </span>
        <span className="new_message_content">{content}</span>
        <div className="new_message_actions">
          <button onClick={() => this.removeMessageById(messageId)}>
            Usuń
          </button>
          <button onClick={() => this.editMessageById(messageId, content)}>
            Edytuj
          </button>
        </div>
      </li>
    )

    this.setState(({ messages }) => ({ messages: [...messages, message] }))
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight
  }

  removeDisconnectedPeer = id => {
    const elem = document.querySelectorAll(`[data-peer-id="${id}"]`)[0]
    console.log("elem: ", elem)
    return elem.parentNode.removeChild(elem)
  }

  removeMessageFromChat = messageId => {
    const { messages } = this.state
    const updatedMessages = messages.filter(
      ele => ele.props[`data-key`] !== messageId
    )

    this.setState(({ messages }) => ({ messages: updatedMessages }))
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight
  }

  removeMPeerFromRoom = messageId => {
    const { messages } = this.state
    const updatedMessages = messages.filter(
      ele => ele.props[`data-key`] !== messageId
    )

    this.setState(({ messages }) => ({ messages: updatedMessages }))
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight
  }

  editMessageById = (id, content) => {
    alert("Tekst do edycji\npojawił się w polu\ndo wpisywania wiadomości")
    toCompare = content
    chatInputBox.value = content
    editedMessageId = id
    editedMessage = true
  }

  removeMessageById = id => {
    

    const msg = {
      messageId: id,
      roomId: this.roomId,
    }

    ws.emit(`delete message`, msg)
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

  leaveMeeting = () => {
    window.opener = null
    window.open("", "_self")
    window.close()
  }
  isScreenSharing = false
  shareScreen = async () => {
    // this.isScreenSharing = !this.isScreenSharing
    // myVideo = document.querySelectorAll(`[data-peer-id="${ws.id}"]`)[0]
    // let videoGrid = document.querySelector('#video-grid')
    // console.log(videoGrid)
    // if (this.isScreenSharing) {
    //   this.initialized = false
    //   let newVideo = document.createElement('video')
    //   newVideo.srcObject = mediaStream
    //   newVideo.play()
    //   //videoGrid.appendChild(newVideo)
    //   this.oldVideoTrack = myVideo.srcObject
    //   myVideo.srcObject = mediaStream
    //   this.oldVideoTrack = this.videoStream
    //   this.videoStream = mediaStream
    //   this.setState({ screenSharing: mediaStream })
    //   this.init()
    //   setSharingScreenPlayButton()
    // }else{
    //   setSharingScreenStopButton()
    //   myVideo.srcObject = this.oldVideoTrack
    //   myVideoStream = this.oldVideoTrack
    //   this.oldVideoTrack = null
      
    // }
    console.log("dane: ", dane)
    this.isScreenSharing = !this.isScreenSharing
    let videoGrid = document.querySelector('#video-grid')
    let myScreenSharing = document.createElement('video')
    if (this.isScreenSharing) {
      ws.emit(`screen sharing`, ws.id)
      
      let mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })
      const mediaStreamVideo = mediaStream.getTracks()[0];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const streamAudio= stream.getTracks()[0];
      console.log("streamAudio: ", streamAudio)

      const newMediaStream = new MediaStream([mediaStreamVideo,streamAudio])


      console.log("mediaStream.getTracks()[0]: ", mediaStream.getTracks()[0])
      this.videoStream = newMediaStream
      this.setState({ screenSharing: mediaStream })
      this.init()
      setSharingScreenPlayButton()
      myScreenSharing.srcObject = newMediaStream
      myScreenSharing.autoplay = true;
      myScreenSharing.playsInline = true;
      myScreenSharing.dataset.peerId = ws.id
      //videoGrid.appendChild(myScreenSharing)
      videoGrid.prepend(myScreenSharing)
    }else{
      ws.emit(`screen sharing`, ws.id)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: this.videoConstraints,
        audio: true,
      })
  
      this.videoStream = stream
      this.setState({ screenSharing: null })
      this.init()
      myScreenSharing.srcObject = stream
      myScreenSharing.autoplay = true;
      myScreenSharing.playsInline = true;
      myScreenSharing.dataset.peerId = ws.id
      videoGrid.prepend(myScreenSharing)
      
    }
    
  }

  setActiveVideo = id => {
    this.setState({ activeVideo: id })
  }

  

  render = () => {
    const videosObjects = []

    videosObjects.push({
      id: ws.id,
      video: (
        <video
          ref={this.handleMainVideoRef}
          muted
          autoPlay
          playsInline
          data-peer-id={ws.id}
        />
      ),
    })

    this.state.peers.forEach((peer, index) =>
      videosObjects.push({ id: peer.id, video: <Video peer={peer} /> })
    )

    const activeVideo = this.state.activeVideo
      ? videosObjects.find(({ id }) => id === this.state.activeVideo)?.video
      : null

    const clickableVideos = videosObjects
      .filter(({ id, video }) => (activeVideo ? activeVideo === video : true))
      .map(({ id, video }) => (
        <button key={id} onClick={() => this.setActiveVideo(id)}>
          {video}
        </button>
      ))

    // myVideoStream.getVideoTracks()[0].onended = () => {
    //   alert("wylaczyles udostepnianie")
    // }
    if (this.state.screenSharing != null)
      this.state.screenSharing.getVideoTracks()[0].onended = () => {
        setSharingScreenStopButton()
        //this.isScreenSharing = false
        this.shareScreen()

      }

    console.log("peers: ", this.state.peers)

    return (
      <div className="main">
        <div className="main__left">
          <div className="main__videos">
            <div className="main__video__left">
              <div id="video-grid">
                {videosObjects.map(({ video }) => video)}
                {/* {clickableVideos} */}
              </div>
            </div>
            <div className="main__video__right" id="video-right">
              <div className="center_the_item_wrapper">
                <div className="center_the_item">
                  {/* {activeVideo || `Kliknij w wideło po lewej aby wyświetlić tutaj`} */}
                </div>
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
                id="screenSharing"
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
                role="button"
                className="main__controls_button leaveMeeting"
                id="leave-meeting"
                tabIndex={-3}
                onClick={this.leaveMeeting}
                onKeyDown={this.leaveMeeting}
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
          <div
            className="main__chat__window"
            ref={ele => (this.chatWindow = ele)}
          >
            <ul className="messages" id="all_messages">
              {this.state.messages}
            </ul>
          </div>
          <div className="main__message_container">
            <input type="text" id="chat_message" placeholder="Pisz tutaj.." />
          </div>
        </div>
      </div>
    )
  }
}
