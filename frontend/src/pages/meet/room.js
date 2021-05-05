import React, { useEffect, useRef } from "react";
// import io from "socket.io-client";
import ws from "../../utils/webSocket";
import Peer from "simple-peer";
import styled from "styled-components";
import { isBrowser } from "../../utils/functions";
import {getUser} from "../../utils/auth";

/** @typedef {Peer.Instance & { id:string }} BetterPeer */

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`


const Video = ({ peer }) => {
  const ref = useRef()

  useEffect(() => {
    peer.on("stream", stream => ref.current.srcObject = stream )
  }, [ peer ])

  return <StyledVideo ref={ref} playsInline autoPlay />
}


export default class extends React.Component {
  roomId = new URL( isBrowser() ? window.location.href : "http://www.google.pl" ).searchParams.get("roomID")

  state = {
    /** @type {BetterPeer[]} */
    peers: [],
  }

  videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
  }


  /** @return {BetterPeer} */
  createPeer(id, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.id = id
    peer.on("signal", signal => ws.emit("sending signal", { userToSignal:id, callerID, signal }) )

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
    peer.on("signal", signal => ws.emit("returning signal", { signal, callerID }) )
    peer.signal( incomingSignal )

    return peer
  }


  /** @param {StyledVideo} video */
  handleVideoRef = async video => {
    const stream = await navigator.mediaDevices.getUserMedia({ video:this.videoConstraints, audio:true })

    video.srcObject = stream

    ws.emit( "join room", this.roomId )

    ws.on("all users", socketsIds => {
      const peers = socketsIds.map( id => this.createPeer(id, ws.id, stream) )

      this.setState({ peers })
    })

    ws.on("user joined", payload => {
      const peer = this.addPeer( payload.signal, payload.callerID, stream )

      this.setState( ({ peers }) => ({ peers:[ ...peers, peer ] }) )
    })

    ws.on("receiving returned signal", payload => {
      const peer = this.state.peers.find( ({ id }) => id === payload.id )

      if (peer) peer.signal( payload.signal )
      else console.error( `receiving returned signal, wrong payload ID` )
    })
  }

  render = () => (
    <Container>
        <StyledVideo ref={this.handleVideoRef} muted autoPlay playsInline data-peer-id={ws.id} />

        {this.state.peers.map((peer, index) => <Video key={index} peer={peer} /> )}
    </Container>
  )
}



















// import React from "react"
// //import css
// import io from "socket.io-client"
// import "font-awesome/css/font-awesome.min.css"
// import { isBrowser } from "../../utils/functions"
// import "./style.css"


// const chatInputBox = isBrowser()
//   ? document.querySelector("#chat_message")
//   : null
// const all_messages = isBrowser()
//   ? document.querySelector("#all_messages")
//   : null
// const main__chat__window = isBrowser()
//   ? document.querySelector("#main__chat__window")
//   : null
// const videoGrid = isBrowser() ? document.querySelector("#video-grid") : null
// const myVideo = isBrowser() ? document.createElement("video") : null
// let myVideoStream = null
// let checboxCheck = true






// const url_string = isBrowser() ?window.location.href: "http://www.google.pl"
// const url = new URL(url_string)
// const ROOM_ID = url.searchParams.get("roomId")




// export default class Room extends React.Component {
//   nodes = {
//     videoGrid: React.createRef(),
//   }




//   componentDidMount() {
//     console.log(this.nodes)
//     const videoGrid = this.nodes.videoGrid.current
//     console.log("urlsearchparm:", ROOM_ID)
//     console.log("location; ", window.location.hostname)

//   }

//   render = () => (
//     <div className="main">
//       <div className="main__left">
//         <div className="main__videos">
//           <div id="video-grid" ref={this.nodes.videoGrid}></div>
//         </div>
//         <div className="main__controls">
//           <div className="main__controls_block">
//             <div
//               role="button"
//               className="main__controls_button"
//               id="muteButton"
//               tabIndex={0}
//             >
//               <i className="fa fa-microphone"></i>
//               <span>Mikrofon</span>
//             </div>
//             <div
//               role="button"
//               className="main__controls_button"
//               id="playPauseVideo"
//               tabIndex={-1}
//             >
//               <i className="fa fa-video-camera"></i>
//               <span>Wideo</span>
//             </div>
//           </div>

//           <div className="main__controls_block">
//             <div role="button" className="main__controls_button" tabIndex={-2}>
//               <i className="fa fa-desktop"></i>
//               <span>Udostępnij ekran</span>
//             </div>
//             <div className="main__controls_button">
//               <i className="fa fa-users"></i>
//               <span>Członkowie</span>
//             </div>
//             <div role="button" className="main__controls_button" tabIndex={-3}>
//               <i className="fa fa-comment"></i>
//               <span>Chat</span>
//             </div>
//           </div>

//           <div className="main__controls_block">
//             <div
//               className="main__controls_button leaveMeeting"
//               id="leave-meeting"
//             >
//               <i className="fa fa-times"></i>
//               <span className="">Opuść spotkanie</span>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="main__right" id="chatBox">
//         <div className="main__header">
//           <h6>Chat</h6>
//         </div>
//         <div className="main__chat__window" id="main__chat__window">
//           <ul className="messages" id="all_messages"></ul>
//         </div>
//         <div className="main__message_container">
//           <input type="text" id="chat_message" placeholder="Pisz tutaj.." />
//         </div>
//       </div>
//     </div>
//   )
// }

// /*
//     <div className={classes.main}>
//       <div className={classes.main__left}>
//         <div className={classes.main__videos}>
//           <div id={classes.video_grid}></div>
//         </div>
//         <div className={classes.main__controls}>
//           <div className={classes.main__controls_block}>
//             <div
//               className={classes.main__controls_button}
//               id="muteButton"
//               onclick="muteUnmute()"
//             >
//               <i className="fa fa-microphone"></i>
//               <span>Mikrofon</span>
//             </div>
//             <div
//               className={classes.main__controls_button}
//               id="playPauseVideo"
//               onclick="playStop()"
//             >
//               <i className="fa fa-video-camera"></i>
//               <span>Wideo</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//       */
