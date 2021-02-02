/** @typedef {import('express').Express} Express */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/** @typedef {import('../src/dbManager').default} DatabaseManager */

export default class Module {
  static requiredModules = []
  static additionalModules = []

  /** @type {Object<string,Module>} */
  additionalModules = {}

  /** @type {Object<String,string>} */
  subcollections = {}

  basecollectionName = ``

  /**
   * @param {string} collectionName
   * @param {(log:string) => void} logger
   * @param {DatabaseManager} dbManager
   * @param {Object<string,Module>} requiredModules
   */
  constructor(logger, dbManager, requiredModules) {
    this.requiredModules = requiredModules
    this.logger = logger
    this.dbManager = dbManager

    setTimeout(async () => {
      this.basecollectionName = this.toString().charAt(0).toLowerCase() + this.toString().slice(1)

      const createCollectionIfNotExists = async collectionName =>
        !(await dbManager.collectionExist(collectionName)) && await dbManager.createCollection(collectionName)

      await createCollectionIfNotExists(this.basecollectionName)

      for (const prop in this.subcollections) {
        const subcollectionName = this.subcollections[prop]
        const collectionFullname = `${this.basecollectionName}.${subcollectionName}`

        this.subcollections[prop] = collectionFullname

        await createCollectionIfNotExists(collectionFullname)
      }
    }, 0)
  }

  logWs = string => this.logger(`[  [fgGreen]WS[]  ] ${string}`)
  logHttp = string => this.logger(`[ [fgGreen]HTTP[] ] ${string}`)

  /** @param {Module} mod */
  addAdditionalModule = mod => {
    const moduleName = mod.toString()

    this.additionalModules[moduleName.charAt(0).toLowerCase() + moduleName.slice(1)] = mod
  }

  /**
   * @param {(data:{req:Request res:Response next:NextFunction mod:Module}) => void} cb
   * @return {(req:Request res:Response next:NextFunction) => void|Response }
   */
  runMid = cb => (req, res, next) => cb( { req, res, next, mod:this } )

  /**
   * @returns {Map<string,{ post:function get:function put:function delete:function }}
   */
  getApi() {
    return new Map()
  }

  /** @param {Express} app */
  configure(app) {
    throw new Error(`You have to override me!`)
  }

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {
    throw new Error(`You have to override me!`)
  }

  toString() {
    throw new Error(`You have to override me!`)
  }

  static toString() {
    throw new Error(`You have to override me!`)
  }
}