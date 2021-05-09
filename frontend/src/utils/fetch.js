/**
 * @typedef {object} ExternalFunctions
 * @property {(headers:Object<string,string>) => void} getHeaders
 * @property {(error:{ status:number error:any }) => void} processError
 */



export default class Fetcher {
  headers = { "Content-Type":`application/json` }


  /** @param {RequestInit & ExternalFunctions} [init] */
  constructor( init = {} ) {
    this.init = init

    Object.assign( this.headers, init.headers ?? {} )
  }


  /**
   * @param {RequestInfo} input
   * @param {RequestInit} [init]
   */
  _fetch( input, init = {} ) {
    /** @param {{ type:string status:number data:any }} err */
    const erhandleError = err => this.init.processError( err )

    if (!init.headers) init.headers = {}
    Object.assign( init.headers, this.init.getHeaders?.( this.headers ) ?? this.headers )

    return fetch( input, init )
      .catch( erhandleError )
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
  }


  /**
   * @param {string} address
   * @param {Object<string,any>} data
   * @param {RequestInit} headers
   */
  post( address, data, headers ) {
    return this._fetch( address, { method:`POST`, headers, body:JSON.stringify( data ) } )
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
    return this._fetch( address, { method:`PUT`, headers, data:JSON.stringify( data ) } )
  }


  /**
   * @param {string} address
   * @param {RequestInit} headers
   */
  delete( address, headers ) {
    return this._fetch( address, { method:`DELETE`, headers } )
  }
}
