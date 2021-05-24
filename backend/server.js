import express from "express"
import cors from 'cors'
import https from 'https'
import fs from 'fs'

import WSS from "./src/ws.js"
import dbManager from "./src/dbManager.js"
import { DEBUG, PORT, LOGGERS } from "./consts.js" // LOGGERS
import {
  doHttpLogShouldBePrinted as doHttpLog,
  doWsLogShouldBePrinted as doWsLog,
  logUnderControl as log,
  addNextLineToLog as logLine,
  buildRestFromNestedObj,
} from "./src/utils.js"

/** @typedef {import("./modules/module.js").default[]} Module */



/* *
 *  Variables
 */



/** @type {express.Express} */
const app = express()

const moduleLogger = modName => string => log( LOGGERS.module, modName, string )

/** @type {Map<string,Module>} */
const modulesClasses = new Map(
  await Promise.all([
    import(`./modules/user/index.js`),
    import(`./modules/platform/index.js`),
    import(`./modules/group/index.js`),
    import(`./modules/meet/index.js`),
  ]).then( mods => mods.map( ({ default:d }) => [ d.toString(), d ] ) ),
)
/** @type {Map<string,Module>} */
const modulesInstances = new Map()

const httpsOptions = {
  key: fs.existsSync( `./security/cert.key` ) ? fs.readFileSync( `./security/cert.key` ) : null,
  cert: fs.existsSync( `./security/cert.pem` ) ? fs.readFileSync( `./security/cert.pem` ) : null,
}

const isHttps = typeof httpsOptions !== `undefined` && httpsOptions.key && httpsOptions.cert
const server = (isHttps ? https.createServer( httpsOptions, app ) : app)
  .listen( PORT, () => setTimeout( () => log( LOGGERS.server, `Working http${isHttps ? `s` : ``}://localhost:${PORT}` ), 0 ) )

const wss = new WSS({ server })



/* *
 *  Configuration
 */


modulesClasses.forEach( (Class, modName) => {
  const requiredModules = {}
  let doInstallation = true

  for (const requiredModule of Class.requiredModules) {
    if (modulesInstances.has( requiredModule )) {
      const modName = requiredModule.charAt( 0 ).toLowerCase() + requiredModule.slice( 1 )

      requiredModules[ modName ] = modulesInstances.get( requiredModule )
    } else {
      doInstallation = false
      break
    }
  }

  if (doInstallation) {
    modulesInstances.set( modName, new Class(moduleLogger( modName ), dbManager, requiredModules) )
  }
} )

modulesInstances.forEach( (instance, modName) =>
  (/** @type {string[]} */ (modulesClasses.get( modName ).additionalModules))
    .filter( optModName => modulesInstances.has( optModName ) )
    .map( optModName => modulesInstances.get( optModName ) )
    .forEach( instance.addAdditionalModule ),
)

app.use( (req, _, next) => next( // logging middleware
  doHttpLog( req ) ? log( LOGGERS.newRequest, `HTTP`, req.method, req.url ) : undefined,
) )


app.use( `/media`, express.static( `./media` ) )
app.use( `/uploads`, express.static( `./uploads` ) )
app.use( `/`, express.static( DEBUG ? `./public` : `./public` ) )

app.use( cors() )
app.use( express.json() )

// let storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'test/materials')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname)
//   }
// })

// let upload = multer({ storage: storage }).single("myFile");

// app.post( `/api2/materials`, upload, (req, res) => {
//   console.log( req.file, req.files )
// } )

modulesInstances.forEach( mod => {
  log( LOGGERS.server, `[fgYellow]LOADING MODULE[] ${mod.toString()}` )
  buildRestFromNestedObj( app, mod.getApi(), ``, logLine )
} )

app.use( (_, res) => res.status( 404 ).json({ code:0, error:`Endpoint not found` }) )

wss.on( `connection`, ws => {
  const socket = wss.reshapeWebSocket( ws )

  log( LOGGERS.newRequest, `WS`, `[fgGreen]New socket[]`, socket.id )

  socket.addMiddleware( (event, data) => {
    if (!doWsLog()) return

    const dataStr = data === event || !data
      ? `[[fgWhite]no data[]]`
      : typeof data === `string` || Array.isArray( data )
        ? data
        : Object.keys( data )

    // log( LOGGERS.newRequest, `WS`, event, dataStr )
  } )
  socket.on( `disconnect`, () =>
    doWsLog() && log( LOGGERS.newRequest, `WS`, `[fgGreen]Socket left[]`, socket.id ),
  )

  modulesInstances.forEach( mod => mod.socketConfigurator( socket ) )
} )
