/**
 * @typedef {object} ExternalFunctions
 * @property {(headers:Object<string,string>) => void} getHeaders
 * @property {(error:{ status:number error:any }) => void} processError
 */



export default class Fetcher {
  headers = {}


  /** @param {RequestInit & ExternalFunctions} [init] */
  constructor( init = {} ) {
    this.init = init

    Object.assign( this.headers, init.headers ?? {} )
  }


  getHeaders() {
    return { ...this.init.headers ?? {} }
  }


  /**
   * @param {RequestInfo} input
   * @param {RequestInit} [init]
   */
  _fetch( input, init = {} ) {
    /** @param {{ type:string status:number data:any }} err */
    const handleError = err => this.init.processError?.( err )

    if (!init.headers) init.headers = {}
    Object.assign( init.headers, this.init.getHeaders?.( this.headers ) ?? this.headers )

    if (input.includes( `undefined` )) {
      return new Promise( r => r( console.warn( `URL cannot contain "undefined" word (${input})` ) ) )
    }

    return fetch( input, init )
      .then( async res => {
        let data = await res.text()

        try {
          data = JSON.parse( data )
        } catch {
          throw { type:`noJson`, status:res.status, data }
        }

        if (Math.floor( res.status / 100 ) == 4) {
          console.info(
            ` ^-- Status codes 4xx are not "real" errors. It is %c ok %c.`,
            `background-color:green; font-weight:bold;`,
            ``,
          )

          throw { type:`4xx`, status:res.status, data }
        }

        return data
      } )
      .catch( handleError )
  }


  /**
   * @param {string} address
   * @param {Object<string,any>} data
   * @param {RequestInit} headers
   */
  post( address, data, headers ) {
    return this._fetch( address, {
      method: `POST`,
      headers: data instanceof FormData ? headers : { "Content-Type":`application/json`, ...headers },
      body: data instanceof FormData ? data : JSON.stringify( data ),
    } )
  }


  /**
   * @param {string} address
   * @param {RequestInit} headers
   */
  get( address, headers ) {
    return this._fetch( address, { method:`GET`, headers } )
  }


  /**
   * @param {string} address
   * @param {Object<string,any>} data
   * @param {RequestInit} headers
   */
  put( address, data, headers ) {
    return this._fetch( address, {
      method: `PUT`,
      headers: data instanceof FormData ? headers : { "Content-Type":`application/json`, ...headers },
      body: data instanceof FormData ? data : JSON.stringify( data ),
    } )
  }


  /**
   * @param {string} address
   * @param {RequestInit} headers
   */
  delete( address, data, headers ) {
    return this._fetch( address, {
      method: `DELETE`,
      headers: { "Content-Type":`application/json`, ...headers },
      body: JSON.stringify( data ),
    } )
  }
}
