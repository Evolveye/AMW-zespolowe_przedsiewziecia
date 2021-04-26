import React from "react"
import { Link } from "gatsby"

export default class extends React.Component {
  operationsHistory = new History()

  state = {
    currentTool: `brush`,
  }

  defaults = {
    color: `#ffffff`,
    lineWidth: 2,
  }

  toolbar = {
    color: null,
    brush: null,
    pipette: null,
  }


  /** @param {HTMLCanvasElement} canvas */
  start = canvas => {
    this.ctx = canvas.getContext( `2d` )

    this.onResize()
  }


  setToolbarNodeRef = (refName, ref) => {
    this.toolbar[ refName ] = ref
  }


  changeTool = ({ target }) => {
    this.setState({ currentTool:target.value })
  }


  switchToolTo = toolName => {
    this.changeTool({ target:this.toolbar[ toolName ] })
  }


  undo = () => {
    const { ctx, operationsHistory } = this
    const operations = operationsHistory.getOperations()

    if (!operations.length) return

    operationsHistory.undo()

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    operations.forEach( ({ color, coords }) => {
      ctx.beginPath()
      ctx.moveTo( operations[ 0 ].coords.x, operations[ 0 ].coords.y )

      coords.forEach( ({ x, y }) => ctx.lineTo( x, y ) )

      ctx.strokeStyle = color
      ctx.stroke()
    } )
  }


  /* EVENTS */


  /** @param {React.PointerEvent} e */
  onPointerDown = e => {
    const { layerX:x, layerY:y } = e.nativeEvent
    const { ctx } = this

    console.log( `clickerd coords:`, { x, y } )

    switch (this.state.currentTool) {
      case `brush`: {
        ctx.strokeStyle = this.toolbar.color.value
        ctx.lineWidth = this.defaults.lineWidth

        this.operationsHistory.add( x, y, this.toolbar.color.value )
        break
      }

      case `pipette`: {
        const { data } = ctx.getImageData( x, y, 1, 1 )
        const hexColor = (data[ 0 ] << 16 | data[ 1 ] << 8 | data[ 2 ]).toString( 16 )

        this.toolbar.color.value = `#${hexColor}`
        this.switchToolTo( `brush` )
        break
      }
    }

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
        {[
          { label:`Pędzel`, name:`brush` },
          { label:`Pipeta`, name:`pipette` },
        ].map( ({ label, name }) => (
          <label key={name}>
            {label}
            :
            <input
              ref={ref => this.setToolbarNodeRef( name, ref )}
              type="radio"
              name="tool"
              onChange={this.changeTool}
              value={name}
              checked={this.state.currentTool == name}
            />
          </label>
        ) )}

        <input
          ref={ref => this.setToolbarNodeRef( `color`, ref )}
          type="color"
          defaultValue={this.defaults.color}
        />

        <button onClick={this.undo}>&lt;-</button>
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
  data = []


  add( x, y, color ) {
    this.data.push( new Operation( x, y, color ) )
  }


  undo() {
    this.data.splice( -1 )
  }


  getCurrent() {
    const lastOperation = this.data[ this.data.length - 1 ]

    return lastOperation?.state === Operation.states.CREATING ? lastOperation : null
  }


  getOperations() {
    return this.data
  }
}


class Operation {
  static states = { CREATING:0, DONE:1 }

  state = Operation.states.CREATING
  /** @type {{ x:number y:number }[]}*/
  coords = []

  constructor( initialX, initialY, color ) {
    this.color = color
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