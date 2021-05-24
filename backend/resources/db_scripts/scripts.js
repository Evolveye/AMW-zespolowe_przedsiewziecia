import mongoDb from 'mongodb'
import { DB_CONN_STRING, DB_NAME } from '../../src/constants/dbConsts.js'


const dbname = `meets`


const client = await mongoDb.connect(DB_CONN_STRING, { useUnifiedTopology: true })

const db = client.db(`SassPE`)

const count = await db.collection(dbname).find({}).count()
const notes_with_user = await db.collection(dbname).ag


console.log(count)

client.close();
