//#region imports
import express from "express";
import * as sio from "socket.io";
import bodyParser from 'body-parser';
import dbManagaer from "./src/dbManager.js";
//#endregion

//#region  settings
const __DIRNAME = import.meta.url.match(/(.*)\//)[1].substr(8);
const PORT = 3000;
//#endregion


// TODO:
// 1. wysiwtl pliki z frotntedn.
// 2. adresy musza sie zgadzac.
// 3. token adres <-> adres backned

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

// app.use(bodyParser);
app.use("/public", express.static("./public"));

const modules = Promise.all([
  import("./modules/user.js"),
  import("./modules/api.js")])
  .then((modules) => modules.map((mod) => mod.default))
  .then((classes) => classes.map((Class) => new Class( dbManagaer )))
  .then((modules) =>
    modules.forEach((mod) => {
      mod.configure(app);
    })
  );

app.listen(PORT, () => {
  console.log(`Server up: localhost:${PORT}`);
});


app.get("/", (req, res) => {
  var path = __DIRNAME  +'/public/index.html';
  res.sendFile(path);
});


//log i token.