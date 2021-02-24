import express from "express"
import { graphqlHTTP } from "express-graphql"
import mongose from "mongoose"
import cors from "cors"
import { GraphQLSchema, GraphQLObjectType } from "graphql"

import WSS from "./priv/src/ws.js"
import dbManager from "./priv/src/dbManager.js"
import { DEBUG, PORT, LOGGERS } from "./priv/consts.js"
import {
  doHttpLogShouldBePrinted as doHttpLog,
  // doWsLogShouldBePrinted as doWsLog,
  logUnderControl as log,
  // addNextLineToLog as logLine,
} from "./priv/src/utils.js"

/** @typedef {import("./modules/module.js").default[]} Module */



/*\
 *   Variables
\*/



const DB_NAME = `SassPE`
const DB_CONN_STRING = `mongodb://127.0.0.1:27017/${DB_NAME}`

await mongose.connect( DB_CONN_STRING, {
  autoIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
} )

const app = express()
const modulesClasses = await makeModulesClasses( `user`, `platform` )
const modulesInstances = makeModulesInstances( modulesClasses )
const server = app.listen( PORT, () => log( LOGGERS.server, `Working localhost:${PORT}` ) )
const wss = new WSS({ server })



/*\
 *   Configuration
\*/



app.use( (req, _, next) => next(
  doHttpLog( req ) && log( LOGGERS.newRequest, `HTTP`, req.method, req.url ) ),
)

app.use( `/`, express.static( DEBUG ? `./public` : `../frontend` ) )
app.use( `/media`, express.static( `./media` ) )

app.use( cors() )
app.use( express.json() )

app.use( `/api/graphql`, getModulesGraphQlConfig( modulesInstances ) )

app.use( (_, res) => res.status( 404 ).json({ code:0, error:`Endpoint not found` }) )



/*\
 *   Functions
\*/



/** @return {Promise<Map<string,Module>>} */
async function makeModulesClasses( ...addonsNames ) {
  return new Map(
    await Promise.all( addonsNames.map( name => import(`./addons/${name}/index.js`) ) )
      .then( mods => mods.map( ({ default:d }) => [ d.toString(), d ] ) ),
  )
}



/** @return {Map<string,Module>} */
function makeModulesInstances( modulesClasses ) {
  const moduleLogger = modName => string => log( LOGGERS.module, modName, string )
  const modulesInstances = new Map()

  modulesClasses.forEach( (Class, modName) => {
    const requiredModules = {}
    let doInstallation = true

    for (const requiredModule of Class.requiredModules) {
      if (modulesInstances.has( requiredModule )) {
        requiredModules[ requiredModule ] = modulesInstances.get( requiredModule )
      } else {
        doInstallation = false
        break
      }
    }

    if (doInstallation && !modulesInstances.has( modName )) {
      modulesInstances.set(
        modName,
        new Class(moduleLogger( modName ), dbManager, requiredModules),
      )
    }
  } )

  return modulesInstances
}



function setModulesAdditionalModules( modulesInstances ) { // eslint-disable-line
  modulesInstances.forEach( (instance, modName) =>
    /** @type {string[]} */ (modulesClasses.get( modName ).additionalModules)
      .filter( optModName => modulesInstances.has( optModName ) )
      .map( optModName => modulesInstances.get( optModName ) )
      .forEach( instance.addAdditionalModule ),
  )
}


function getModulesGraphQlConfig( modulesInstances ) {
  const queryObj = {}
  const mutationObj = {}

  modulesInstances.forEach( mod => {
    log( LOGGERS.server, `[fgYellow]LOADING MODULE[] ${mod.toString()}` )

    const { graphQl } = mod.getApi()

    Object.assign( queryObj, graphQl.queryObj )
    Object.assign( mutationObj, graphQl.mutationObj )
  } )

  const query = new GraphQLObjectType({
    name: `QUERY`,
    fields: queryObj,
  })

  const mutation = new GraphQLObjectType({
    name: `MUTATION`,
    fields: mutationObj,
  })

  return graphqlHTTP({
    schema: new GraphQLSchema({ query, mutation }),
    graphiql: true,
  })
}



/*\
 *   Unused
\*/




// mod.getApi().forEach((methods, path) => {
//   path = path.match( /\/?(?:api)?\/?(.+)/ )[ 1 ]

//   if (typeof methods === `function`) {
//     logLine( `[fgYellow]/api/${path}[] :: GET`)

//     return app.get(`/api/${path}`, methods )
//   }

//   const includedMethods = Object.keys(methods)
//     .filter(method => method in app)
//     .filter(method => typeof methods[method] === `function`)
//     .map(method => {
//       app[method](`/api/${path}`, methods[method] )

//       return method.toUpperCase()
//     })

//   logLine( `[fgYellow]/api/${path}[] :: ${includedMethods.join( ` ` )}`)
// })



wss.on( `connection`, () => {
  // const socket = wss.reshapeWebSocket(ws);

  // log(LOGGERS.newRequest, `WS`, `[fgGreen]New socket[]`, socket.id);

  // socket.addMiddleware((event, data) => {
  //   if (!doWsLog()) return;

  //   const dataStr =
  //     data === event || !data
  //       ? `[[fgWhite]no data[]]`
  //       : typeof data === `string` || Array.isArray(data)
  //       ? data
  //       : Object.keys(data);

  //   log(LOGGERS.newRequest, `WS`, event, dataStr);
  // });
  // socket.on(
  //   `disconnect`,
  //   () =>
  //     doWsLog() &&
  //     log(LOGGERS.newRequest, `WS`, `[fgGreen]Socket left[]`, socket.id)
  // );

  // modulesInstances.forEach((mod) => mod.socketConfigurator(socket));
} )
