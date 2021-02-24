import { capitalize, LOGGERS } from "../src/utils.js"
import { logUnderControl } from "../src/Logger.js"

/** @typedef {import("mongoose").Model} Model */
/** @typedef {import("mongoose").Document} Document */

/**
 * @typedef {object} Globals
 * @property {string} name
 * @property {string} collectionName
 * @property {(log:string) => void} logger
 * @property {DatabaseManager} dbManager
 * @property {Object<string,Addon>} requiredModules
 */

export default class Addon {
  /** @deprecated */
  static additionalModules = []
  static requiredModules = []

  /** @type {Promise<null>} */
  #asyncConstructing = null
  #name = ``

  /** @type {Object<string,Addon>} */
  additionalModules = {}
  /** @type {Object<string,Model} */
  graphQlModels = {}
  /** @type {Object<string,string} */
  subcollections = {}


  get name() {
    return this.#name
  }


  /** @param {Globals} param0 */
  constructor({ name, requiredModules }) {
    this.#name = name

    this.logger = string => logUnderControl( LOGGERS.module, name, string ),
    this.requiredModules = requiredModules
    this.baseCollectionName = `addon.${name.toLowerCase()}`

    // this.#asyncConstructing = new Promise( resolve => setTimeout( async() => {
    //   this.baseCollectionName = `addon.${name.toLowerCase()}`

    //   const createCollectionIfNotExists = async collectionName =>
    //     !(await dbManager.collectionExist( collectionName )) && dbManager.createCollection( collectionName )

    //   await createCollectionIfNotExists( this.baseCollectionName )

    //   for (const prop in this.subcollections) {
    //     const subcollectionName = this.subcollections[ prop ]
    //     const collectionFullname = `${this.baseCollectionName}.${subcollectionName}`

    //     this.subcollections[ prop ] = collectionFullname

    //     await createCollectionIfNotExists( collectionFullname )
    //   }

    //   this.asyncConstructor().then( () => resolve() )
    // }, 0 ))
  }


  async asyncConstructor() {}


  waitToBeReady() {
    return new Promise( r => r() ) // this.#asyncConstructing
  }


  /** @param {string} name */
  getReqAddon( name ) {
    const addon = this.requiredModules[ capitalize( name ) ]

    if (!addon) throw new Error(`This addon (${name}) doesn't exists`)

    return addon
  }


  getModel( name ) {
    return this.graphQlModels[ name ]
  }


  /** @param {Addon} mod */
  addAdditionalModule = mod => {
    const moduleName = mod.name
    this.additionalModules[ moduleName.charAt( 0 ).toLowerCase() + moduleName.slice( 1 ) ] = mod
  }


  toString() {
    return this.name
  }
}
