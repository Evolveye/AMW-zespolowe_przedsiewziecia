import React, { useEffect, useState, useRef } from "react"
//import css
import io from "socket.io-client"
import Peer from "simple-peer"
import 'font-awesome/css/font-awesome.min.css';
import classes from "./room.module.css"
import './style.css'

export default class Room extends React.Component {
  render = () => (
      <div className="main">
      <div className="main__left">
        <div className="main__videos">
          <div id="video-grid"></div>
        </div>
        <div className="main__controls">
          <div className="main__controls_block">
            <div
              role = "button"
              className="main__controls_button"
              id="muteButton"
              
              tabIndex={0}
            >
              <i className="fa fa-microphone"></i>
              <span>Mikrofon</span>
            </div>
            <div
              role = "button"
              className="main__controls_button"
              id="playPauseVideo"
              
              tabIndex={-1}
            >
              <i className="fa fa-video-camera"></i>
              <span>Wideo</span>
            </div>
          </div>

          <div className="main__controls_block">
            <div role = "button" className="main__controls_button"  tabIndex={-2}>
              <i className="fa fa-desktop"></i>
              <span>Udostępnij ekran</span>
            </div>
            <div
             className="main__controls_button">
              <i className="fa fa-users"></i>
              <span>Członkowie</span>
            </div>
            <div
             role = "button"
             className="main__controls_button"
             tabIndex={-3}
            >
              <i className="fa fa-comment"></i>
              <span>Chat</span>
            </div>
          </div>

          <div className="main__controls_block">
            <div className="main__controls_button leaveMeeting" id="leave-meeting">
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
          <input
            type="text"
            id="chat_message"
            placeholder="Pisz tutaj.."
          />
        </div>
      </div>
    </div>
  )
}

{/*
    <div className={classes.main}>
      <div className={classes.main__left}>
        <div className={classes.main__videos}>
          <div id={classes.video_grid}></div>
        </div>
        <div className={classes.main__controls}>
          <div className={classes.main__controls_block}>
            <div
              className={classes.main__controls_button}
              id="muteButton"
              onclick="muteUnmute()"
            >
              <i className="fa fa-microphone"></i>
              <span>Mikrofon</span>
            </div>
            <div
              className={classes.main__controls_button}
              id="playPauseVideo"
              onclick="playStop()"
            >
              <i className="fa fa-video-camera"></i>
              <span>Wideo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
      */}
