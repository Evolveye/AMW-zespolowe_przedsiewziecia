import DB_ERROR from './constants/dbErrors.js'

/**
 * @typedef {object[]} DataBase
 * @property {string[]} fields Columns
 * @property {object[]} collection An array of object descirbed by fields.
 */
/** @type {DataBase} */
const DB = [];

class DatabaseManager {

  /**
   * 
   * @param {string} name name of collection
   * @param {string[]} fields fields in collection (field = columns)
   */
  createCollection(name, fields) {
    DB[name] = { fields, collection: [] };
  }

  /**
   * 
   * @param {string} name Name of collection
   * @returns {string[], object[]}
   */
  getCollection(name) {
    //TODO, Opis do funkcji.
    return DB[name];
  }

  /**
 * 
 * @param {string} collectionName 
 * @param {function} predicate 
 * @returns {object} 
 */
  findObject(collectionName, predicate) {
    return DB[collectionName].collection.find(predicate);
  }

  /**
   * 
   * @param {string} collectionName Name of collection.
   * @returns {boolean|Error} 
   */
  collectionExist(collectionName)
  {
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
  insertObject(collectionName, obj) {
    this.collectionExist(collectionName);

    const requiredFields = DB[collectionName].fields.slice(0);

    for (const prop in obj) {
      if (!requiredFields.includes(prop)) throw new Error(DB_ERROR.FIELD_NOT_EXIST);
      else requiredFields.splice(requiredFields.indexOf(prop), 1);
    }

    //TODO: WHAT DOES LINE MEAN.
    if (requiredFields.length) throw new Error(DB_ERROR.COLLECTION_FIELD_COUNT);

    DB[collectionName].collection.push(obj);
  }
}

export default new DatabaseManager();

