/** @typedef {import('../src/dbManager').default} DatabaseManager */

export default class Module {
  static requiredModules = []

  /**
   * @param {string} collectionName
   * @param {(log:string) => void} logger
   * @param {DatabaseManager} dbManager
   * @param {Module[]} collectionName
   */
  constructor( collectionName, logger, dbManager, requiredModules ) {
    this.collectionName = collectionName
    this.requiredModules = requiredModules
    this.logger = logger
    this.dbManager = dbManager

    new Promise( async res => {
      if (!(await dbManager.collectionExist( collectionName )))
        await dbManager.createCollection( collectionName )

      res()
    } )
  }

  logWs   = string => this.logger( `[  [fgGreen]WS[]  ] ${string}` )
  logHttp = string => this.logger( `[ [fgGreen]HTTP[] ] ${string}` )

  /** @param {import('express').Express} app */
  configure(app) {
    throw new Error( `You have to override me!` )
  }

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket){
    throw new Error( `You have to override me!` )
  }

  toString() {
    throw new Error( `You have to override me!` )
  }

  static toString() {
    throw new Error( `You have to override me!` )
  }
}