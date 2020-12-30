/**
 * @typedef {object[]} DataBase
 * @property {string[]} fields
 * @property {object[]} collection
 */
/** @type {DataBase} */
const DB = [{}];

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
        throw new Error('Collection not exist.')
  }

  insertObject(collectionName, obj) {
    this.collectionExist(collectionName);

    const requiredFields = DB[collectionName].fields.slice(0);

    for (const prop in obj) {
      if (!requiredFields.includes(prop)) throw new Error(`Wrong object field`);
      else requiredFields.splice(requiredFields.indexOf(prop), 1);
    }

    if (requiredFields.length) throw new Error(`Required more fields`);

    DB[collectionName].collection.push(obj);
  }
}

export default new DatabaseManager();

// TODO: czy kolleckja istnieje
