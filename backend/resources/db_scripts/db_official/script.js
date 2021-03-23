import mongoDb from 'mongodb'
import { DB_CONN_STRING, DB_NAME } from '../../../src/constants/dbConsts.js'
import fs from 'fs'




const collections = [`users`, `usersSessions`, `platforms`, `groups`, `groupsNotes`]




let indexer = 0
const client = await mongoDb.connect(DB_CONN_STRING, { useUnifiedTopology: true })

let con = []

const x = collections.map(async collection => {
  const file = `./${collections[indexer++]}.json`
  client.db(`SassPE`).collection(collection).deleteMany({})

  if (!fs.existsSync(file))
    return

  const bufffer = fs.readFileSync(file)
  //console.log( typeof bufffer, bufffer instanceof Buffer)
  const jsonarr = JSON.parse(bufffer)
  
  const tasks = jsonarr.map(async doc => {
    delete doc._id
    await client.db(`SassPE`).collection(collection).insertOne(doc)
  });
  await Promise.all(tasks)

});

await Promise.all(x)

client.close()


// mongoDb.connect(DB_CONN_STRING, { useUnifiedTopology: true }, (error, mgClient) => {
//   if (error)
//     console.error(error)


//   /**
//      * @type {mongoDb.Db}
//      */
//   const db = mgClient.db(DB_NAME)


//   collections.forEach(collection => {

//     const file = `./${collection}.json`
//     console.log(fs.existsSync(file))
//     db.collection(collection).deleteMany({})
//     if (fs.existsSync(file)) {

//       fs.readFile(file, ((err, data) => {
//         const jsonObj = JSON.parse(data)

//         jsonObj.forEach(obj => {
//           delete obj._id
//          db.collection(collection).insertOne(obj)
//         })


//       }))

//     }

//   });

// //   //  new Promise((resolve)=>{
// //   //    collections.forEach(collection => {
// //   //      console.log(fs.exists(`./${collection}.json`))
// //   //    });
// //   //    resolve()
// //   //  })



// // });

