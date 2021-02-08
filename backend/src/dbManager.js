import { DB_CONN_STRING, DB_NAME, ERRORS } from './constants/dbConsts.js'
import mongoDb from 'mongodb'


<<<<<<< HEAD
=======

>>>>>>> origin/dev-backend-node
class DatabaseManager {
  /**
   * @type {mongoDb.Db}
   */
<<<<<<< HEAD
  #db = null;
=======
  #db = null
>>>>>>> origin/dev-backend-node

  constructor() {
    mongoDb.connect(DB_CONN_STRING, { useUnifiedTopology: true }, (error, mgClient) => {
      if (error)
        console.error(error)
<<<<<<< HEAD
      this.#db = mgClient.db(DB_NAME);

    });
  }

  /**
   *
=======
      this.#db = mgClient.db(DB_NAME)

    })
  }


  #removeUnderscoredFields(obj) {
    Object.keys(obj).filter(k => k[0] === `_`).forEach(k => delete obj[k])

    return obj
  }

  /**
>>>>>>> origin/dev-backend-node
   * @param {string} collectionName Name of collection
   * @returns {object[]}
   */
  async getCollection(collectionName) {
<<<<<<< HEAD
    if (await this.collectionExist(collectionName))
      return await this.#db.collection(collectionName).find().toArray()
  }

  /**
 *
 * @param {string} collectionName
 * @param {} findSchema unique {key:value}
 * @returns {object}
 */
  async findObject(collectionName, findSchema) {
   // console.log( "Schema ==>",findSchema)
    if (await this.collectionExist(collectionName)) {
      //console.log("FOUND ==>",await this.#db.collection(collectionName).findOne(findSchema))
      return await this.#db.collection(collectionName).findOne(findSchema);
    }
  }

  /**
=======
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
      const objs = await this.#db.collection(collectionName)
        .find(findSchema)
        .toArray()

      if (!objs.length) return objs

      objs.forEach(
        (obj) => Object.keys(obj)
          .filter(k => k[0] === `_`)
          .forEach(k => delete obj[k])
      )

      return objs
    }
  }

  /** {imie:"12",nazwisko:'12'}
>>>>>>> origin/dev-backend-node
   * updates object, find by specyfied unique {key:value} object,
   * new values of document are passed in {key:value} object
   *
   * @param {string} collectionName select the collection
<<<<<<< HEAD
   * @param {object} findPattern an object {key:value}, unique values that document in db can be identyfied.
   * @param {object} newValues an object {key:value}, updates keys by specyfied values
   */
  async updateObject(collectionName, findPattern, newValues) {
=======
   * @param {Object<string,any>} findPattern an object {key:value}, unique values that document in db can be identyfied.
   * @param {Object<string,any>} newValues an object {key:value}, updates keys by specyfied values
   */
  async updateObject(collectionName, findPattern, newValues) {
    this.#removeUnderscoredFields(newValues)

>>>>>>> origin/dev-backend-node
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).updateOne((findPattern), (newValues))
  }

<<<<<<< HEAD
  async deleteObjectsInCollection(collectionName, filter) {
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).deleteMany(filter);
  }


  async deleteObject(collectionName, query) {
    if (await this.collectionExist(collectionName)) {
      await this.#db.collection(collectionName).deleteOne(query);
    }
  }


  /**
   * 
=======

  aggregate = (collectionName, { pipeline, options, cb }) =>
    this.#db.collection(collectionName).aggregate(pipeline, options, cb)

  findOne = (collectionName, filter) => this.#db.collection(collectionName).findOne(filter)

  deleteMany = (collectionName, filter) => this.#db.collection(collectionName).deleteMany(filter)

  deleteOne = (collectionName, filter) => this.#db.collection(collectionName).deleteOne(filter)

  findOneAndDelete = (collectionName, filter) => this.#db.collection(collectionName).findOneAndDelete(filter)
  // findOneAndUpdate(
  //   <filter>,
  //   <update document or aggregation pipeline>,
  //  { $push: { <field1>: { <modifier1>: <value1>, ... }, ... } }
  findOneAndUpdate(collectionName, findPattern, update) {
    return this.#db.collection(collectionName).findOneAndUpdate(findPattern, update)
  }

  /**
   *
   * @param {string} collectionName
   * @param {object[]} values
   */
  insetMany(collectionName, values) {
    values.forEach(obj => this.#removeUnderscoredFields(obj))

    this.#db.collection(collectionName).insertMany(values)
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

   find(collectionName, query) {
    return this.#db.collection(collectionName).find(query)
  }


  /**
>>>>>>> origin/dev-backend-node
   * @param {string} collectionName  name of colleciton.
   * @param {mongoDb.FilterQuery} query an unique key:value
   * @returns {boolean} true if found atleast 1 element, otherwise false.
   */
  async objectExist(collectionName, query) {
    const count = await this.#db.collection(collectionName).find(query).count()
<<<<<<< HEAD
=======

>>>>>>> origin/dev-backend-node
    return count >= 1 ? true : false
  }

  /**
<<<<<<< HEAD
   *
   * @param {string} collectionName Name of collection.
   * @returns {boolean}
   */
  async collectionExist(collectionName) {
    const collectionArray = await this.#db.listCollections().toArray();
    return collectionArray.some((collection) => collection.name == collectionName && collection.type == 'collection');
  }

  /**
   *
   * @param {string} collectionName Name of collection that item will be inserted
   * @param {object} obj An item to insert.
   */
  async insertObject(collectionName, obj) {
    await this.#db.collection(collectionName).insertOne(obj);

  }
}

export default new DatabaseManager();
=======
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
    obj = this.#removeUnderscoredFields(obj)

    return this.#db.collection(collectionName).insertOne(obj)
  }
}

export default new DatabaseManager()
>>>>>>> origin/dev-backend-node

