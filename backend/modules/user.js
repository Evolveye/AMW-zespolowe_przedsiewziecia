import Module from "./module.js"

/** @typedef {import('express').Express} Express */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */


const userManager = [];

// zarejestrowani -> DB
// zalogowani -> ?
const userLoggedin = [];


export default class User extends Module {
  static EXPIRE_TIME_IN_MINUTES = 1
  #login = ``
  #password = ``

  #tokens = [
    { token:`qwertyuio`, lastActivity:12345 }
  ]

  constructor(login, password) {
    super()

    this.#login = login;
    this.#password = password;

    setInterval( () => {
      this.#tokens = this.#tokens.filter( ({ lastActivity }) =>
        lastActivity < Date.now() - 1000 * 60 * User.EXPIRE_TIME_IN_MINUTES
      )
    }, 1000 * 60 * 1 )
  }

  /**
   * @param {Express} app
   */
  configure(app) {
    // path should be user/
    app.post('register',this.registerMiddleware)
    app.post('login',this.loginMiddleware)
    app.get('createaccount',this.createAccountMiddleware)
    app.get('/api/me',this.whoamiMiddleware)

    // registered
    // activatedAccount
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  whoamiMiddleware(req,res,next){
    const authentication = req.header( "Authentication" )
    const token = authentication.match( /Bearer (.*)/ )[ 1 ]

    console.log( token )
  }

  createAccountMiddleware(req,res,next){

  }


  loginMiddleware(req,res,next){
    // W celu zalogowania się na stronie musi podać login i hasło.
    const user = {
      login: req.body.login,
      password: req.body.password,
    };

    const userobj = new User(user.login, user.password);

    var userFind = userManager.find((arg, idx, arr) => {
      //TODO

    });

    if (userFind === null) {

    }
  }




  registerMiddleware(req,res,next)
  {// imię, nazwisko, email, hasło i powtórnie hasło.
    const user = {
      name: req.body.name,
      surname:req.body.surname,
      email:req.body.email,
      password1: req.body.password1,
      password2: req.body.password2,
    };

    if(user.password1 != req.password2)
        res.status(400).send("Password doesn't match.");

     this.userManager.push(user);
  }


  display() {
    console.log(this.#login + " " + this.#password);
  }
}