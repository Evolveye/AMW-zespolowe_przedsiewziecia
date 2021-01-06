import { DB_CONN_STRING, DB_NAME, ERRORS } from './constants/dbConsts.js'
import mongoDb from 'mongodb'


class DatabaseManager {
  /**
   * @type {mongoDb.Db}
   */
  #db = null;

  constructor() {

    mongoDb.connect(DB_CONN_STRING, {}, (error, mgClient) => {
      if (error)
        console.error(error)
      this.#db = mgClient.db(DB_NAME);

    });
  }


  /**
   *
   * @param {string} collectionName Name of collection
   * @returns {object[]}
   */
  async getCollection(collectionName) {
    if(await this.collectionExist(collectionName))
      return await this.#db.collection(collectionName).find().toArray()
  }

  /**
 *
 * @param {string} collectionName
 * @param {} findSchema unique {key:value}
 * @returns {object}
 */
  async findObject(collectionName, findSchema) {
    if (await this.collectionExist(collectionName)) {
      return await this.#db.collection(collectionName).findOne(findSchema);
    }
  }

/**
 * updates object, find by specyfied unique {key:value} object,
 * new values of document are passed in {key:value} object
 *
 * @param {string} collectionName select the collection
 * @param {object} findPattern an object {key:value}, unique values that document in db can be identyfied.
 * @param {object} newValues an object {key:value}, updates keys by specyfied values
 */
  async updateObject(collectionName, findPattern, newValues) {
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).updateOne((findPattern), (newValues))
  }


  /**
   *
   * @param {string} collectionName Name of collection.
   * @returns {boolean}
   */
  async collectionExist(collectionName) {
    const collectionArray = await this.#db.listCollections().toArray();
    return await collectionArray.some((collection) => collection.name == collectionName && collection.type == 'collection');
  }

  /**
   *
   * @param {string} collectionName Name of collection that item will be inserted
   * @param {object} obj An item to insert.
   */
  async insertObject(collectionName, obj) {
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).insertOne(obj);

  }
}

export default new DatabaseManager();

