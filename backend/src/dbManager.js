import { DB_CONN_STRING, DB_NAME, ERRORS } from './constants/dbConsts.js'
import mongoDb from 'mongodb'

// /**
//  * @typedef {object[]} DataBase
//  * @property {string[]} fields Columns
//  * @property {object[]} collection An array of object descirbed by fields.
//  */
// /** @type {DataBase} */
// const DB = [];

class DatabaseManager {
  /**
   * @type {mongoDb.Db}
   */
  #db = null;



  constructor() {
    this.useInMemory = true;

    mongoDb.connect(DB_CONN_STRING, {}, (error, mgClient) => {
      if (error)
        console.error(error)
      this.#db = mgClient.db(DB_NAME);
      // console.log( this.collectionExist("some")) ;
      //this.#db.collection(`users`).find().toArray().then(console.log);
      // this.#db.collection(`users`).insertOne({ name: "Adam", login: "Secret123" });
      // this.#db.collection(`users`).find().toArray().then(console.log);

    });
  }

  /**
   * 
   * @param {string} name name of collection
   * @param {string[]} fields fields in collection (field = columns)
   * @deprecated No longer needed after switch to MongoDB
   */
  createCollection(name, fields) {

    // DB[name] = { fields, collection: [] };
  }

  /**
   * 
   * @param {string} collectionName Name of collection
   * @returns {string[], object[]}
   */
  async getCollection(collectionName) {
    //TODO, Opis do funkcji.
    // if(this.collectionExist(name))
    if(await this.collectionExist(collectionName))
      return await this.#db.collection(collectionName).find().toArray()
    //   return DB[name];

  }

  /**
 * 
 * @param {string} collectionName 
 * @param {function} predicate 
 * @returns {object} 
 */
  async findObject(collectionName, predicate) {
    if (await this.collectionExist(collectionName)) {
      const arrayData = await this.#db.collection(collectionName).find().toArray()
     // console.log("Found --> ", arrayData.find(predicate));

      return arrayData.find(predicate);
    }
    // return DB[collectionName].collection.find(predicate);

  }


  async updateObject(collectionName, findPattern, newValues) {
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).updateOne((findPattern), (newValues))
  }


  /**
   * 
   * @param {string} collectionName Name of collection.
   * @returns {boolean|Error} 
   */
  async collectionExist(collectionName) {

    const collectionArray = await this.#db.listCollections().toArray();
    return await collectionArray.some((collection) => collection.name == collectionName && collection.type == 'collection');

    if (DB[collectionName] != null)
      return true;
    else
      throw new Error(DB_ERROR.COLLECTION_NOT_EXIST)
  }

  /**
   * 
   * @param {string} collectionName Name of collection that item will be inserted
   * @param {object} obj An item to insert.
   */
  async insertObject(collectionName, obj) {
    // if(this.collectionExist(collectionName))
    if (await this.collectionExist(collectionName))
      await this.#db.collection(collectionName).insertOne(obj);

    // this.collectionExist(collectionName);

    // const requiredFields = DB[collectionName].fields.slice(0);

    // for (const prop in obj) {
    //   if (!requiredFields.includes(prop)) throw new Error(DB_ERROR.FIELD_NOT_EXIST);
    //   else requiredFields.splice(requiredFields.indexOf(prop), 1);
    // }

    // //TODO: WHAT DOES LINE MEAN.
    // if (requiredFields.length) throw new Error(DB_ERROR.COLLECTION_FIELD_COUNT);

    // DB[collectionName].collection.push(obj);
  }
}

export default new DatabaseManager();

