import express from "express"
import { Server } from "socket.io"
import cors from 'cors'

import WSS from "./src/ws.js"
import dbManager from "./src/dbManager.js"
import { DEBUG, APP_ROOT_DIR, PORT, LOGGERS } from "./consts.js" // LOGGERS
import {
  doHttpLogShouldBePrinted as doHttpLog,
  doWsLogShouldBePrinted as doWsLog,
  logUnderControl as log,
} from "./src/utils.js"



/**@typeof {Express} */
const app = express()

const moduleLogger = modName => string => log(LOGGERS.module, modName, string)

/** @type {import("./modules/module.js").default[]} */
const modules = []
const importedModules = await Promise.all([
  import(`./modules/user/index.js`),
  import(`./modules/platform/index.js`),
  import(`./modules/group/index.js`),
]).then(mods => mods.map(({default:d}) => d).map( Class => {
  const requiredModules = {}
  let doInstallation = true

  for (const requiredModule of Class.requiredModules) {
    const req = modules.find( m => m.toString() === requiredModule )

    if (req) {
      const moduleString = req.toString()

      requiredModules[ moduleString.charAt( 0 ).toLowerCase() + moduleString.slice( 1 ) ] = req
    } else {
      doInstallation = false
      break
    }
  }

  if (doInstallation) {
    modules.push( new Class(moduleLogger(Class.toString()), dbManager, requiredModules) )
  }
}))

const server = app.listen(PORT, () => log(LOGGERS.server, `Working localhost:${PORT}`))
const wss = new WSS({ server })



app.use((req, _, next) => next( //logging middleware
  doHttpLog(req) ? log(LOGGERS.newRequest, `HTTP`, req.method, req.url) : undefined
))

app.use("/", express.static(DEBUG ? "./public" : "../frontend"))
app.use("/media", express.static("./media"))

app.use(cors())
app.use(express.json())

modules.forEach((mod) => {
  log(LOGGERS.server, `[fgYellow]LOADED MODULE[] ${mod.toString()}`)
  mod.configure(app)
})

wss.on(`connection`, (ws) => {
  const socket = wss.reshapeWebSocket(ws)

  log( LOGGERS.newRequest, `WS`, `[fgGreen]New socket[]`, socket.id )

  socket.addMiddleware( (event, data) => {
    if (!doWsLog()) return

    const dataStr = data === event || !data
      ? `[[fgWhite]no data[]]`
      : typeof data === `string` || Array.isArray( data )
      ? data
      : Object.keys( data )

    log( LOGGERS.newRequest, `WS`, event, dataStr )
  } )
  socket.on(`disconnect`, () =>
    doWsLog() && log( LOGGERS.newRequest, `WS`, `[fgGreen]Socket left[]`, socket.id )
  )

  modules.forEach(mod => mod.socketConfigurator(socket))
})
