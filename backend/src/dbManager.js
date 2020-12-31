import DB_ERROR from '../constants/dbErrors.js'

/**
 * @typedef {object[]} DataBase
 * @property {string[]} fields
 * @property {object[]} collection
 */
/** @type {DataBase} */
const DB = [];

class DatabaseManager {
  createCollection(name, fields) {
    DB[name] = { fields, collection: [] };
  }

  getCollection(name) {
    return DB[name];
  }

  findObject(collectionName, predicate) {
    return DB[collectionName].collection.find(predicate);
  }

  collectionExist(collectionName)
  {
    if (DB[collectionName] != null)
       return true;
    else
        throw new Error(DB_ERROR.COLLECTION_NOT_EXIST)
  }

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

