import express from "express"
import { graphqlHTTP } from "express-graphql"
import mongose from "mongoose"
import cors from "cors"
import { GraphQLSchema, GraphQLObjectType } from "graphql"

import WSS from "./priv/src/ws.js"
// import dbManager from "./src/dbManager.js"
// import { DEBUG, PORT, LOGGERS, CLEAR_CONSOLE } from "./priv/consts.js"
import {
  LOGGERS,
  DEBUG,
  doHttpLogShouldBePrinted as doHttpLog,
  logUnderControl as log,
  capitalize,
  CLEAR_CONSOLE,
} from "./src/utils.js"

/** @typedef {import("./addons/addon.js").Globals} ModuleGlobals */
/** @typedef {import("./addons/addon.js").default} Module */



/*\
 *   Variables
\*/



export const PUBLIC_LOCATION = `../frontend`
export const UPLOADS_LOCATION = `./uploads`
export const PORT = 3000
export const HOST = `http://localhost:3000`
export const DB_NAME = `SassPE`
export const HTTP_API_PATH = `/api`
export const GRAPHQL_ENDPOINT = `/graphql`
const DB_CONN_STRING = `mongodb://127.0.0.1:27017/${DB_NAME}`

await mongose.connect( DB_CONN_STRING, {
  autoIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
} )

const app = express()
const modulesClasses = await makeModulesClasses( `user`, `platform` )
const modulesInstances = await makeModulesInstances( modulesClasses )
const server = app.listen( PORT, () => !CLEAR_CONSOLE && log( LOGGERS.server, `Working ${HOST}` ) )
const wss = new WSS({ server })

export default server



/*\
 *   Configuration
\*/



app.use( (req, _, next) => next(
  doHttpLog( req ) && log( LOGGERS.newRequest, `HTTP`, req.method, req.url ) ),
)

app.use( `/`, express.static( DEBUG ? `./public` : PUBLIC_LOCATION ) )
app.use( `/media`, express.static( `./media` ) )

app.use( cors() )
app.use( express.json() )

app.use( HTTP_API_PATH + GRAPHQL_ENDPOINT, getModulesGraphQlConfig( modulesInstances ) )

app.use( (_, res) => res.status( 404 ).json({ code:0, error:`Endpoint not found` }) )



/*\
 *   Functions
\*/



/**
 * @param {string[]} addonsNames
 * @return {Promise<Map<string,Module>>}
 */
async function makeModulesClasses( ...addonsNames ) {
  return new Map(
    await Promise.all( addonsNames.map( name => import(`./addons/${name}/index.js`) ) )
      // .then( (mods, i) => mods.map( console.log ) ),
      .then( mods => mods.map( ({ default:d }, i) => {
        const name = addonsNames[ i ]

        return [ capitalize( name ), d ]
      } ) ),
  )
}


/**
 * @param {Map<string,Module>} modulesClasses Constructor of Module
 * @return {Map<string,Module>}
 */
async function makeModulesInstances( modulesClasses ) {
  const modulesInstances = new Map()

  for (const [ modName, Class ] of modulesClasses.entries()) {
    const requiredModules = {}
    let doInstallation = true

    for (const requiredModule of Class.requiredModules.map( capitalize )) {
      if (modulesInstances.has( requiredModule )) {
        requiredModules[ requiredModule ] = modulesInstances.get( requiredModule )
      } else {
        doInstallation = false
        break
      }
    }

    if (doInstallation && !modulesInstances.has( modName )) {
      /** @type {ModuleGlobals} */
      const config = {
        name: modName,
        requiredModules,
      }

      const module = new Class( config )

      await module.waitToBeReady()

      modulesInstances.set( modName, module )
    }
  }

  return modulesInstances
}


/**
 * @param {*} modulesClasses Constructor of Module
 * @param {Module[]} modulesInstances
 */
function setModulesAdditionalModules( modulesClasses, modulesInstances ) { // eslint-disable-line
  modulesInstances.forEach( (instance, modName) =>
    /** @type {string[]} */ (modulesClasses.get( modName ).additionalModules)
      .filter( optModName => modulesInstances.has( optModName ) )
      .map( optModName => modulesInstances.get( optModName ) )
      .forEach( instance.addAdditionalModule ),
  )
}


/**
 * @param {Module[]} modulesInstances
 * @return {Map<string,Module>}
 */
function getModulesGraphQlConfig( modulesInstances ) {
  const queryObj = {}
  const mutationObj = {}

  modulesInstances.forEach( mod => {
    if (!CLEAR_CONSOLE) log( LOGGERS.server, `[fgYellow]LOADING MODULE[] ${mod.name}` )

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
