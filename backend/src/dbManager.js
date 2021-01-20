import { DB_CONN_STRING, DB_NAME, ERRORS } from './constants/dbConsts.js'
import mongoDb from 'mongodb'




class DatabaseManager {
  /**
   * @type {mongoDb.Db}
   */
  #db = null

  constructor() {
    mongoDb.connect(DB_CONN_STRING, { useUnifiedTopology: true }, (error, mgClient) => {
      if (error)
        console.error(error)
      this.#db = mgClient.db(DB_NAME)

    })
  }

  /**
   * @param {string} collectionName Name of collection
   * @returns {object[]}
   */
  async getCollection(collectionName) {
    if (await this.collectionExist(collectionName)) {
      const objs = await this.#db.collection(collectionName).find().toArray()

      objs.forEach(obj => Object.keys(obj)
        .filter(k => k[0] === `_`).forEach(k => delete obj[k])
      )

      return objs
    }
  }

  /**
  * @param {string} collectionName
  * @param {Object<string,any>} findSchema unique {key:value}
  */
  async findObject(collectionName, findSchema) {
    if (await this.collectionExist(collectionName)) {
      const obj = await this.#db.collection(collectionName).findOne(findSchema)

      if (!obj) return null

      Object.keys(obj).filter(k => k[0] === `_`).forEach(k => delete obj[k])

      return obj
    }
  }

  async findManyObjects(collectionName, findSchema) {
    if (await this.collectionExist(collectionName)) {
      const obj = await this.#db.collection(collectionName).find(findSchema)
      if (!obj) return null

      Object.keys(obj).filter(k => k[0] === `_`).forEach(k => delete obj[k])

      return obj
    }
  }

  /**
   * updates object, find by specyfied unique {key:value} object,
   * new values of document are passed in {key:value} object
   *
   * @param {string} collectionName select the collection
   * @param {Object<string,any>} findPattern an object {key:value}, unique values that document in db can be identyfied.
   * @param {Object<string,any>} newValues an object {key:value}, updates keys by specyfied values
   */
  async updateObject(collectionName, findPattern, newValues) {
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).updateOne((findPattern), (newValues))
  }


 // findOneAndUpdate(
  //   <filter>,
  //   <update document or aggregation pipeline>,
  //  { $push: { <field1>: { <modifier1>: <value1>, ... }, ... } }
  findOneAndUpdate(collectionName, findPattern, update) {
    return this.#db.collection(collectionName).findOneAndUpdate(findPattern, update)
  }


  /**
  * @param {string} collectionName select the collection
  * @param {Object<string,any>} filter unique {key:value}
  */
  async deleteObjectsInCollection(collectionName, filter) {
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).deleteMany(filter)
  }

  /**
  * @param {string} collectionName select the collection
  * @param {Object} query unique {key:value}
  */
  async deleteObject(collectionName, query) {
    if (await this.collectionExist(collectionName)) {
      await this.#db.collection(collectionName).deleteOne(query)
    }
  }

  /**
  * @param {string} collectionName  name of colleciton.
  */
  createCollection(collectionName) {
    return this.#db.createCollection(collectionName)
  }

  find(collectionName,query) {
    return this.#db.collection(collectionName).find(query)
  }


  /**
   * @param {string} collectionName  name of colleciton.
   * @param {mongoDb.FilterQuery} query an unique key:value
   * @returns {boolean} true if found atleast 1 element, otherwise false.
   */
  async objectExist(collectionName, query) {
    const count = await this.#db.collection(collectionName).find(query).count()

    return count >= 1 ? true : false
  }

  /**
   * @param {string} collectionName Name of collection.
   * @returns {boolean}
   * @deprecated
   */
  async collectionExist(collectionName) { // TODO to remove
    const collectionArray = await this.#db.listCollections().toArray()
    return collectionArray.some((collection) => collection.name == collectionName && collection.type == 'collection')
  }

  /**
   * @param {string} collectionName Name of collection that item will be inserted
   * @param {object} obj An item to insert.
   */
  insertObject(collectionName, obj) {
    return this.#db.collection(collectionName).insertOne(obj)
  }
}

export default new DatabaseManager()

