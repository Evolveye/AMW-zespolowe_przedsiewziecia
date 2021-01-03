//#region imports
import express from "express";
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import dbManager from "./src/dbManager.js";
import CONSTANTS from "./src/constants/serverConstants.js"
import { createServer } from 'http'

//#endregion

//#region  settings
console.log(`SERVER ROOT DIR: `, CONSTANTS['APP_ROOT_DIR']);
//#endregion

// ENDPOINTS
// api/authenticate --> RES "token : xyz"
// register
// registered
// activatedAccount
// /app/profile
// /app/settings
// /app/myGrades
// /app/platformSettings

/**@typeof {Express} */
const app = express();

/**@type {((socket:import("socket.io").Socket)=>void)[]} */
const socketConfigs = [];




app.use(express.json());
app.use("/public", express.static("./public"));

const modules = Promise.all([
  import("./modules/user/index.js")
])
  .then((modules) => modules.map((mod) => mod.default))
  .then((classes) => classes.map((Class) => new Class(dbManager)))
  .then((modules) =>
    modules.forEach((mod) => {
      mod.configure(app);
      socketConfigs.push(mod.socketConfigurator);
      console.log(`LOADED MODULE: `, mod.toString())
    })
  );

//TODO: correct .
app.get("/", (req, res) => {
  var path = CONSTANTS.APP_ROOT_DIR + '/public/index.html';
  res.sendFile(path);
});

const server = app.listen(CONSTANTS.PORT, () => {
  console.log(`SERVER INFO: Working localhost:${CONSTANTS.PORT}`);
});


const wss = new Server(server);

wss.on(`connection`, (socket) => {
  socketConfigs.forEach((fn) => fn(socket));
});
