import express from "express";
import { Server } from "socket.io";
import dbManager from "./src/dbManager.js";
import { APP_ROOT_DIR, PORT, LOGGERS } from "./src/constants/serverConsts.js"
import { doRequestLogShouldBePrinted, logUnderControl } from "./src/utils.js"
import WSS from "./src/ws.js";
import cors from 'cors'


/**@typeof {Express} */
const app = express();

const modules = await Promise.all([
  import("./modules/user/index.js")
])
  .then((modules) => modules.map((mod) => mod.default))
  .then((classes) => {
    const moduleLogger = modName =>
      string => logUnderControl( LOGGERS.module, modName, string )

    return classes.map((Class) =>
      new Class(moduleLogger( Class.toString() ), dbManager))
  })
const server = app.listen(PORT, () => {
  logUnderControl( LOGGERS.server, `Working localhost:${PORT}` )
});

const wss = new WSS({ server })

app.use((req, res, next) => { //Logging middleware.
  if (doRequestLogShouldBePrinted( req )) {
    logUnderControl( LOGGERS.routes, req.method, req.url )
  }
  next();
});

app.use(cors())
app.use(express.json());

app.use("/", express.static("./public"));
app.use("/media", express.static("./media"));

modules.forEach( (mod) => {
  logUnderControl( LOGGERS.server, `[fgYellow]LOADED MODULE[] ${mod.toString()}` )

  mod.configure(app);
} )

wss.on(`connection`, (ws) => {
  const socket = wss.reshapeWebSocket(ws)

  modules.forEach(mod => mod.socketConfigurator(socket));
});



loggerMiddleware = (req,res,next) =>
{
  (req, res, next) => { //Logging middleware.
    if (doRequestLogShouldBePrinted( req )) {
      logUnderControl( LOGGERS.routes, req.method, req.url )
    }
    next();
  }
}