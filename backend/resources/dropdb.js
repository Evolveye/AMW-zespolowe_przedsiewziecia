import mongoDb from 'mongodb'
import { DB_CONN_STRING } from './../src/constants/dbConsts.js'



const client = await mongoDb.connect(DB_CONN_STRING, { useUnifiedTopology: true })

const dblist =await client.db(`SassPE`).listCollections().toArray()
const list = []
dblist.forEach(async collection => {
    list.push( client.db(`SassPE`).dropCollection(collection.name))
    console.log(collection.name)
});
await Promise.all(list)
client.close()


