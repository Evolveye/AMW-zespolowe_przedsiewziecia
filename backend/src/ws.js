import WebSocket from "ws"

export default class WebSocketServer extends WebSocket.Server {
  /** @type {WS[]} */
  #clients = [];

  getClients() {
    return this.#clients
  }

  getSocketsFromRoom( roomID ) {
    const socketsInRoom = this.#clients.map( s => s.getRooms().some( rID => rID === roomID ) && s.id )
      .filter( Boolean )

    return socketsInRoom
  }

  /** @param {WebSocket} webSocket */
  reshapeWebSocket( webSocket ) {
    const ws = new WS(webSocket, this)

    this.#clients.push( ws )

    ws.on( `disconnect`, () =>
      this.#clients.splice( this.#clients.indexOf( ws ), 1 ),
    )

    return ws
  }
}

export class WS {
  #id = `ws${Date.now()}#${Math.random().toString().slice( 2 )}`;
  #commands = new Map();
  #middlewares = [];
  #defaultListener = () => {};
  #rooms = [];

  /** @type {WebSocketServer} */
  #server = null;

  /**
   * @param {WebSocket} ws
   * @param {WebSocketServer} server
   */
  constructor( ws, server ) {
    this.ws = ws
    this.ws.addEventListener( `message`, this.onmessage )
    this.emit( `__init`, this.id )
    this.#server = server
  }

  get id() {
    return this.#id
  }

  /**
   * @param {string} event
   * @param {*} data
   */
  emit( event, data ) {
    // console.log("emit to: ", this.id)
    const msg = data ? { event, data } : event
    const send = () => this.ws.send( JSON.stringify( msg ) )

    // console.log( `TEST`, this.#id, this.ws.readyState, msg )

    if (this.ws.readyState !== 1) {
      this.ws.addEventListener( `open`, send )
    } else {
      send()
    }
  }
  /**
   * @param {(ws:WS) => boolean} predicate
   * @param {string} event
   * @param {*} data
   */
  emitTo( predicate, event, data ) {
    this.#server
      .getClients()
      .filter( predicate )
      .forEach( s => s.emit( event, data ) )
  }
  /**
   * @param {string} event
   * @param {*} data
   */
  broadcast( event, data ) {
    this.#server.getClients().forEach( s => s.emit( event, data ) )
  }

  /**
   * @param {string} event
   * @param {(data:any) => void} listener
   */
  on( event, listener ) {
    if (event === `disconnect`) this.ws.on( `close`, listener )
    else this.#commands.set( event, listener )
  }


  /**
   * @param {string} room
   * @param {string} event
   * @param {(data:any) => void} listener
   */

  onInRoom( room, event, listener ) {
    this.on( event, data => this.#rooms.includes( room ) && listener( data ) )
  }

  // onmessage = data => console.log( data )
  onmessage = ({ data }) => {
    let jsonData
    // console.log("[WS MESS]",data)
    try {
      jsonData = JSON.parse( data )
    } catch {
      jsonData = data
    }

    //   console.log( {"Commands": this.#commands,
    //   "has": this.#commands.has( jsonData ) ,
    //   "typeof":typeof jsonData === `string`

    // })

    if (typeof jsonData === `object` &&
      `event` in jsonData &&
      `data` in jsonData) {
      const { event, data } = jsonData

      this.#middlewares.forEach( fn => fn( event, data ) )

      if (this.#commands.has( event )) this.#commands.get( event )(data)
      else console.warn( `Unhandled event: ${event}` )
    } else if (typeof jsonData === `string` && this.#commands.has( jsonData )) {
      this.#middlewares.forEach( fn => fn( jsonData, jsonData ) )
      this.#commands.get( jsonData )(jsonData)
    } else {
      this.#middlewares.forEach( fn => fn( jsonData, jsonData ) )
      this.#defaultListener( jsonData )
    }
  };

  /**
   * @param {string} room
   * @param {string} event
   * @param {*} data
   */
  emitToSocket( socketId, event, data ) {
    // console.log({ socketId, event })
    this.#server.getClients().find( ({ id }) => id === socketId )?.emit( event, data )
  }

  /**
   * @param {string} room
   * @param {string} event
   * @param {*} data
   */
  emitToRoom( room, event, data ) {
    this.#server
      .getClients()
      .filter( s => s.isInRoom( room ) )
      .forEach( s => s.emit( event, data ) )
  }

  /** @param {string} room */
  joinToRoom( room ) {
    this.#rooms.push( room )
  }

  /** @param {string} room */
  isInRoom( room ) {
    // console.log(this.#rooms)
    return this.#rooms.some( r => r === room )
  }

  getRooms() {
    return [ ...this.#rooms ]
  }

  /** @param {string} room */
  leaveRoom( room ) {
    const roomIndex = this.#rooms.indexOf( room )

    if (roomIndex < 0) return

    this.#rooms.splice( roomIndex, 1 )
  }

  /** @param {Function} listener */
  setDefaultListener( listener ) {
    if (typeof listener != `function`)
      throw new Error(`Listener should be the function type`)

    this.#defaultListener = listener
  }

  addMiddleware( fn ) {
    this.#middlewares.push( fn )
  }

  getServer() {
    return this.#server
  }
}
