import React from "react"
import { Link } from "gatsby"

export default class extends React.Component {
  operationsHistory = new History()
  defaults = {
    color: `#ffffff`,
    lineWidth: 2,
  }

  toolbar = {
    color: null,
  }

  /** @param {HTMLCanvasElement} canvas */
  start = canvas => {
    this.ctx = canvas.getContext( `2d` )

    this.onResize()

    // canvas.addEventListener( `pointerdown`, this.onPointerDown )
    // canvas.addEventListener( `pointerup` )
  }


  componentWillUnmount = () => {
    clearInterval( this.interval )
  }


  setToolbarNodeRef = (refName, ref) => {
    this.toolbar[ refName ] = ref
  }


  /* EVENTS */


  /** @param {React.PointerEvent} e */
  onPointerDown = e => {
    const { layerX:x, layerY:y } = e.nativeEvent

    console.log( `clickerd coords:`, { x, y } )

    this.ctx.strokeStyle = this.toolbar.color.value
    this.ctx.lineWidth = this.defaults.lineWidth

    this.operationsHistory.add( x, y )
  }


  onPointerUp = () => {
    this.operationsHistory.getCurrent()?.setDone()
  }


  onPointerMove = e => {
    const { layerX:x, layerY:y } = e.nativeEvent
    const operation = this.operationsHistory.getCurrent()

    if (!operation) return

    operation.addStep( x, y )

    const { from, to } = operation.getLastStep()

    if (!from || !to) return

    this.ctx.beginPath()
    this.ctx.moveTo( from.x, from.y )
    this.ctx.lineTo( to.x, to.y )
    this.ctx.stroke()
  }


  onPointerLeave = () => {
    this.operationsHistory.getCurrent()?.setDone()
  }


  onResize = () => {
    const { canvas } = this.ctx

    console.log( canvas.clientWidth, canvas.clientHeight )

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  }


  /* RENDER */


  render = () => (
    <article className={this.props.className || ``}>
      <section>
        <input
          ref={ref => this.setToolbarNodeRef( `color`, ref )}
          type="color"
          defaultValue={this.defaults.color}
        />
      </section>

      <canvas
        ref={this.start}
        style={{ width:`100%`, height:`100%` }}
        onPointerDown={this.onPointerDown}
        onPointerUp={this.onPointerUp}
        onPointerLeave={this.onPointerLeave}
        onPointerMove={this.onPointerMove}
      />
    </article>
  )
}


class History {
  /** @type {Operation[]} */
  memory = []


  add( x, y ) {
    this.memory.push( new Operation( x, y ) )
  }


  getCurrent() {
    const lastOperation = this.memory[ this.memory.length - 1 ]

    return lastOperation?.state === Operation.states.CREATING ? lastOperation : null
  }
}


class Operation {
  static states = { CREATING:0, DONE:1 }

  state = Operation.states.CREATING
  coords = []

  constructor( initialX, initialY ) {
    this.coords.push({ x:initialX, y:initialY })
  }


  setDone() {
    this.state = Operation.states.DONE
  }


  addStep( x, y ) {
    this.coords.push({ x, y })
  }


  getLastStep() {
    const [ from, to ] = this.coords.slice( -2 )

    return { from, to }
  }
}
