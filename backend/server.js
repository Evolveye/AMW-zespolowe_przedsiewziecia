//#region imports
import express from "express";
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import dbManager from "./src/dbManager.js";
import {APP_ROOT_DIR,PORT} from "./src/constants/serverConsts.js"

//#endregion

//#region  settings
console.log(`SERVER ROOT DIR: `, APP_ROOT_DIR);
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
app.use((req, res, next) => { //Logging middleware.
  console.log(`NEW REQUEST --> ${req.method} ${req.url}`,);
  next();
});

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
  var path = APP_ROOT_DIR + '/public/index.html';
  //console.log(dbManager.getCollection('users'));
  res.sendFile(path);
});





const server = app.listen(PORT, () => {
  console.log(`SERVER INFO: Working localhost:${PORT}`);
});


const wss = new Server(server);

wss.on(`connection`, (socket) => {
  socketConfigs.forEach((fn) => fn(socket));
  
});


