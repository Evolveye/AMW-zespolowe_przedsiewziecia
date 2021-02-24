/** @typedef {import("mongoose").Model} Model */
/** @typedef {import("mongoose").Document} Document */


export default class Addon {
  static requiredModules = []
  static additionalModules = []

  /** @type {Object<string,Module>} */
  additionalModules = {}
  /** @type {Object<string,Model} */
  graphQlModels = {}


  /**
   * @param {string} collectionName
   * @param {(log:string) => void} logger
   * @param {DatabaseManager} dbManager
   * @param {Object<string,Addon>} requiredModules
   */
  constructor(logger, dbManager, requiredModules) {
    this.requiredModules = requiredModules
    this.logger = logger
    this.dbManager = dbManager

    console.log(1)
    setTimeout(async () => {
      debugger;
      console.log(2)
      console.log(this.toString)
      this.basecollectionName = this.toString().charAt(0).toLowerCase() + this.toString().slice(1)

      console.log(this.basecollectionName)
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


  /** @param {string} name */
  getReqAddon( name ) {
    const addonName = name[ 0 ].toUpperCase() + name.slice( 1 ).toLowerCase() + `Addon`
    const addon = this.requiredModules[ addonName ]

    if (!addon) throw new Error(`This addon (${name}) doesn't exists`)

    return addon
  }


  getModel( name ) {
    return this.graphQlModels[ name ]
  }


  /** @param {Module} mod */
  addAdditionalModule = mod => {
    const moduleName = mod.toString()
    this.additionalModules[moduleName.charAt(0).toLowerCase() + moduleName.slice(1)] = mod
  }


  toString() {
    throw new Error(`You have to override me!`)
  }


  static toString() {
    throw new Error(`You have to override me!`)
  }
}