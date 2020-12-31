//#region imports
import express from "express";
import * as sio from "socket.io";
import bodyParser from 'body-parser';
import dbManagaer from "./src/dbManager.js";
import CONSTANTS from "./constants/serverConstants.js"

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

const app = express();
app.use(express.json());


app.use("/public", express.static("./public"));

const modules = Promise.all([
  import("./modules/user/index.js")
  ])
  .then((modules) => modules.map((mod) => mod.default))
  .then((classes) => classes.map((Class) => new Class( dbManagaer )))
  .then((modules) =>
    modules.forEach((mod) => {
      mod.configure(app);
      console.log(`LOADED MODULE: `,mod.toString())
    })
  );

app.listen(CONSTANTS.PORT, () => {
  console.log(`SERVER INFO: Working localhost:${CONSTANTS.PORT}`);
});


app.get("/", (req, res) => {
  var path = CONSTANTS.APP_ROOT_DIR  +'/public/index.html';
  res.sendFile(path);
});


//log i token.