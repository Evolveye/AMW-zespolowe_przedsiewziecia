import React from "react"

export default class extends React.Component {
  operationsHistory = new History()

  defaults = {
    color: `#ffffff`,
    lineWidth: 2,
    maxBrushSize: 30,
  }

  state = {
    currentTool: `brush`,
    lineWidth: this.defaults.lineWidth,
  }

  toolbar = {
    color: null,
    brush: null,
    pipette: null,
  }

  /** @type {CanvasRenderingContext2D} */
  ctx = null


  componentDidUpdate() {
    const { operationsHistory } = this.props
    const { ctx } = this

    if (operationsHistory) {
      this.operationsHistory.mergeHistory( operationsHistory )

      operationsHistory.forEach( ({ tool, size, color, coords }) => {
        this.setToolEffect( tool, { brushSize:size, color } )

        ctx.beginPath()
        ctx.moveTo( operationsHistory[ 0 ].coords.x, operationsHistory[ 0 ].coords.y )

        coords.forEach( ({ x, y }) => ctx.lineTo( x, y ) )

        ctx.stroke()
      } )
    }
  }


  /** @param {HTMLCanvasElement} canvas */
  start = canvas => {
    if (!canvas) return console.log( `no canvas` )

    this.ctx = canvas.getContext( `2d` )
    this.onResize()

    const { operationsHistory } = this.props
    const { ctx } = this

    operationsHistory.forEach( ({ tool, size, color, coords }) => {
      this.setToolEffect( tool, { brushSize:size, color } )

      ctx.beginPath()
      ctx.moveTo( operationsHistory[ 0 ].coords.x, operationsHistory[ 0 ].coords.y )

      coords.forEach( ({ x, y }) => ctx.lineTo( x, y ) )

      ctx.stroke()
    } )
  }


  setToolbarNodeRef = (refName, ref) => {
    this.toolbar[ refName ] = ref
  }


  setBrushSize = size => {
    this.setState({ lineWidth:size })
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

    operations.forEach( ({ size, color, coords }) => {
      ctx.beginPath()
      ctx.moveTo( operations[ 0 ].coords.x, operations[ 0 ].coords.y )

      coords.forEach( ({ x, y }) => ctx.lineTo( x, y ) )

      ctx.lineWidth = size
      ctx.strokeStyle = color
      ctx.stroke()
    } )
  }


  redo = () => {
    const { ctx, operationsHistory } = this
    const restoredOperation = operationsHistory.redo()

    if (!restoredOperation) return

    ctx.beginPath()
    ctx.moveTo( restoredOperation.coords.x, restoredOperation.coords.y )

    restoredOperation.coords.forEach( ({ x, y }) => ctx.lineTo( x, y ) )

    ctx.strokeStyle = restoredOperation.color
    ctx.stroke()
  }


  download = () => {
    const link = document.createElement( `a` )

    link.download = `canvas.png`
    link.href = this.ctx.canvas.toDataURL( `image/png` )
    link.click()
  }


  sendOperationsUpdate() {
    this.props.onUpdate?.( this.operationsHistory.getOperations() )
  }


  setToolEffect( tool, { brushSize, color } = {} ) {
    const { ctx } = this

    switch (tool) {
      case `brush`: {
        ctx.globalCompositeOperation = `source-over`
        ctx.strokeStyle = color ?? this.toolbar.color.value
        ctx.lineWidth = brushSize ?? this.state.lineWidth
        break
      }

      case `rubber`: {
        ctx.globalCompositeOperation = `destination-out`
        ctx.lineWidth = brushSize ?? this.state.lineWidth
        break
      }
    }
  }


  /* EVENTS */


  /** @param {React.PointerEvent} e */
  onPointerDown = e => {
    const { layerX:x, layerY:y } = e.nativeEvent
    const { ctx } = this
    const tool = this.state.currentTool

    console.log( `clickerd coords:`, { x, y } )

    switch (tool) {
      case `brush`: {
        const color = this.toolbar.color.value
        const brushSize = this.state.lineWidth

        this.operationsHistory.add( x, y, color, brushSize, tool )
        this.sendOperationsUpdate()
        break
      }

      case `pipette`: {
        const { data } = ctx.getImageData( x, y, 1, 1 )
        const hexColor = (data[ 0 ] << 16 | data[ 1 ] << 8 | data[ 2 ]).toString( 16 ).padStart( 6, 0 )

        this.toolbar.color.value = `#${hexColor}`
        this.switchToolTo( `brush` )
        break
      }

      case `rubber`: {
        this.operationsHistory.add( x, y, `transparent`, this.state.lineWidth, tool )
        this.sendOperationsUpdate()
        break
      }
    }
  }


  onPointerUp = () => {
    this.operationsHistory.getCurrent()?.setDone()
  }


  /** @param {React.PointerEvent} e */
  onPointerMove = e => {
    const { layerX:x, layerY:y } = e.nativeEvent
    const operation = this.operationsHistory.getCurrent()

    if (!operation) return

    operation.addStep( x, y )
    this.sendOperationsUpdate()

    const { from, to } = operation.getLastStep()

    if (!from || !to) return

    this.setToolEffect( operation.tool )
    // this.ctx.lineWidth = operation.size
    // this.ctx.strokeStyle = operation.color
    this.ctx.beginPath()
    this.ctx.moveTo( from.x, from.y )
    this.ctx.lineTo( to.x, to.y )
    this.ctx.stroke()
  }


  onPointerLeave = () => {
    this.operationsHistory.getCurrent()?.setDone()
  }


  /** @param {React.KeyboardEvent} e */
  onKeyDown = e => {
    if (e.ctrlKey && e.key === `z`) return this.undo()
    if (e.ctrlKey && e.key === `y`) return this.redo()
  }


  onResize = () => {
    const { canvas } = this.ctx

    console.log( `resize` )

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  }


  /* RENDER */


  render = () => (
    <article className={this.props.classNames?.it || ``}>
      <section className={this.props.classNames?.nav || ``} style={{ position:`absolute` }}>
        {[
          { label:`Pędzel`, name:`brush` },
          { label:`Pipeta`, name:`pipette` },
          { label:`Gumka`,  name:`rubber` },
        ].map( ({ label, name }) => (
          <label key={name} className={this.props.classNames?.tool || ``}>
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
          className={this.props.classNames?.tool || ``}
          type="color"
          defaultValue={this.defaults.color}
        />

        <input
          type="number"
          className={this.props.classNames?.tool || ``}
          value={this.state.lineWidth}
          min={1}
          max={this.defaults.maxBrushSize}
          onChange={({ target }) => this.setBrushSize( target.value )}
        />

        <button className={this.props.classNames?.tool || ``} onClick={this.undo}>&lt;-</button>
        <button className={this.props.classNames?.tool || ``} onClick={this.redo}>-&gt;</button>
        <button className={this.props.classNames?.tool || ``} onClick={this.download}>v</button>
      </section>

      <canvas
        ref={this.start}
        tabIndex={0}
        style={{ width:`100%`, height:`100%` }}
        onPointerDown={this.onPointerDown}
        onPointerUp={this.onPointerUp}
        onPointerLeave={this.onPointerLeave}
        onPointerMove={this.onPointerMove}
        onKeyDown={this.onKeyDown}
      />
    </article>
  )
}


class History {
  /** @type {Operation[]} */
  data = []
  /** @type {Operation[]} */
  reversedHistory = []


  add( x, y, color, size, tool ) {
    if (this.reversedHistory.length) this.reversedHistory.splice( 0 )

    this.data.push( new Operation( x, y, color, size, tool ) )
  }


  undo() {
    const operation = this.data.splice( -1 )[ 0 ]

    if (operation) this.reversedHistory.push( operation )
  }


  redo() {
    const operation = this.reversedHistory.splice( -1 )[ 0 ]

    if (!operation) return null

    this.data.push( operation )

    return operation
  }


  getCurrent() {
    const lastOperation = this.data[ this.data.length - 1 ]

    return lastOperation?.state === Operation.states.CREATING ? lastOperation : null
  }


  getOperations() {
    return this.data
  }


  mergeHistory( operationsHistoryData ) {
    const curentOperation = this.getCurrent()
    const newOperations = operationsHistoryData.map( op => {
      const operation = new Operation( op.x, op.y, op.color, op.size, op.tool )

      operation.setDone()

      return operation
    } )

    this.data = [ ...this.data, ...newOperations ]

    if (curentOperation) this.data.push( curentOperation )
  }
}


class Operation {
  static states = { CREATING:0, DONE:1 }

  state = Operation.states.CREATING
  /** @type {{ x:number y:number }[]}*/
  coords = []

  constructor( initialX, initialY, color, size, tool ) {
    this.tool = tool
    this.size = size
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
