import { DEBUG } from "../config.js"

/**
 * @param {string} url
 * @param {string} method
 * @param {Object<string,string>} headers
 * @param {Object<string,*>} body
 */
export async function exchangeFormWithServer( url, method, headers, body ) {
  console.log( {url, method, headers, body} )
  const response = await fetch( url, {
    method: method.toUpperCase(),
    headers,
    body: [`GET`, `HEAD`].includes( method.toUpperCase() ) ? null : JSON.stringify( body )
  } ).then( res => res.text() )

  /** @type {{error:string}|Object<string,*>} */
  let json = null

  try {
    json = JSON.parse( response )
  } catch (err) {
    return { isError:true, reason:err, response }
  }

  if (DEBUG) console.log( json )
  if (json.error) return { isError:true, reason:null, response:json }

  return { isError:false, reason:null, response:json }
}

/**
 * @param {string} url
 * @param {string} method
 * @param {Object<string,string>} headers
 * @param {Object<string,*>} body
 * @param {object} param4
 * @param {(reason:string, response:*) => void} param4.serverErrCb
 * @param {(response:*) => void} param4.dataErrCb
 * @param {(response:*) => void} param4.okCb
 */
export async function handleForm( url, method, headers, body, { serverErrCb, dataErrCb, okCb } ) {
  const { isError, reason, response } = await exchangeFormWithServer( url, method, headers, body )

  if (isError) {
    if (reason) {
      console.error( ``
        + `ERROR: Nieoczekiwana odpowiedź serwera\n`
        + `Powód błędu: ${reason}\n`
        + `Wiadomość z serwera: ${JSON.stringify( response )}`
      )
      if (serverErrCb) return serverErrCb( reason, response )
    } else {
      console.error( `ERROR: Odpowiedź serwera: ${JSON.stringify( response )}` )
      if (dataErrCb) return dataErrCb( response )
    }

    return false
  } else if (okCb) return okCb( response )
}