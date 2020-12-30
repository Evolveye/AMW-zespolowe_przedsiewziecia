import Module from "./module.js"

export default class Api extends Module {
  /**
   * @param {import('express').Express} app
   */
  configure(app) {
   // app.get("/api/me", this.userMiddleware);
   // app.post('/api/authenticate',this.apiAuthneticateMiddleware)
  }


  userMiddleware(req, res, next) {

    //
    res.send("Some user.");
  }

  apiAuthneticateMiddleware(req,res,next)
  {
    res.send('token: xyz');
  }

}