import Logger, { logUnderControl as logUnderCtrl, addNextLineToLog as addNextLn } from "./Logger.js"



export const addNextLineToLog = addNextLn
export const logUnderControl = logUnderCtrl
export const DEBUG = false
export const PASSWORD_HASH = true
export const LOG_PAGES_ROUTE = true
export const LOG_WS_EVENTS = true
export const CLEAR_CONSOLE = false



/** @param {string} str */
export const capitalize = str => str[ 0 ].toUpperCase() + str.slice( 1 )
/** @param {number} min @param {number} max */
export const random = (min, max) => Math.floor( Math.random() * (max - min + 1) ) + min



/** @param {import("express").Request} req */
export const isRequestPageRoute = req => !req.url.match( /\.[^.]+$/ )
export const doWsLogShouldBePrinted = () => CLEAR_CONSOLE || !LOG_WS_EVENTS ? false : true
/** @param {import("express").Request} req */
export const doHttpLogShouldBePrinted = req => CLEAR_CONSOLE
  ? false
  : (LOG_PAGES_ROUTE ? isRequestPageRoute( req ) : true)

export const LOGGERS = {
  newRequest: new Logger( [
    { align:`left`,   color:`white`,   value:`[{hh}:{mm}:{ss}]   ` },
    { align:`center`, color:`magenta`, length:4 },
    { align:`center`, color:`white`,   value:`   --> ` },
    { align:`right`,  color:`blue` },
    { align:`center`, color:`white`,   value:` :: ` },
    { align:`left`,   color:`yellow` },
  ], { separated:false } ),
  server: new Logger( [
    { align:`left`,   color:`white`,   value:`[{hh}:{mm}:{ss}]` },
    { align:`right`,  color:`magenta`, value:`  SERVER INFO` },
    { align:`center`, color:`white`,   value:`: ` },
    { align:`left`,   color:`white` },
  ], { separated:false } ),
  module: new Logger( [
    { align:`left`,   color:`white`,   value:`[{hh}:{mm}:{ss}]` },
    { align:`right`,  color:`blue`,    value:`  MODULE INFO` },
    { align:`center`, color:`white`,   value:`: ` },
    { align:`right`,  color:`yellow`,  length:13 },
    { align:`center`, color:`white`,   value:`: ` },
    { align:`left`,   color:`white`,   firstSplitLen:50, splitLen:80 },
  ], { separated:false, separateBreakBlock:true } ),
}



/** @param {"L"|"l"|"s"|"d"|number} pattern */
export function generateString( pattern ) {
  const chooseFrom = str => str[ random( 0, str.length - 1 ) ]
  const alphabet = `abcdefghijklmnoprstuvwxyz`
  const specials = `!@#$%^&*`
  const digits = `0123456789`

  if (typeof pattern === `number`) {
    pattern = Array.from( { length:pattern }, () => chooseFrom( `Llsd` ) )
  }

  return pattern.split( `` ).map( char => {
    switch (char) {
      case `l`: return chooseFrom( alphabet )
      case `L`: return chooseFrom( alphabet ).toUpperCase()
      case `d`: return chooseFrom( digits )
      case `s`: return chooseFrom( specials )
    }
  } ).join( `` )
}
