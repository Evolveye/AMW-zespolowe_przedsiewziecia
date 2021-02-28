import chai from 'chai'
import { describe,it } from 'mocha'
import fetch from "node-fetch"

import {
  HOST,
  DB_NAME,
  HTTP_API_PATH,
  GRAPHQL_ENDPOINT,
  PUBLIC_LOCATION,
  UPLOADS_LOCATION,
} from "../index.js"

const { assert,should } = chai



/*\
 *   Tests
\*/


describe( `General`, () => {
  describe( `Appropriate consts`, () => {
    it( `Appropriate host`, eq( HOST, `http://localhost:3000` ) )
    it( `Appropriate database name`, eq( DB_NAME, `SassPE` ) )
    it( `Appropriate API endpoint`, eq( HTTP_API_PATH, `/api` ) )
    it( `Appropriate GraphQL endpoint`, eq( GRAPHQL_ENDPOINT, `/graphql` ) )
    it( `Appropriate public/frontend files location`, eq( PUBLIC_LOCATION, `../frontend` ) )
    it( `Appropriate uploads location`, eq( UPLOADS_LOCATION, `./uploads` ) )
  } )

  describe( `Basic server tests`, () => {
    it( `Server is listening`, () => get( `/` ) )
    it( `GraphQL page is working`, eqGetResFields( `/api/graphql`, { status:400 } ) )
    it( `Wrong endpoint page`, eqGetResFields( `/${Math.random()}`, { status:404 } ) )
    it( `Wrong endpoint page`, eqGetJson( `/${Math.random()}`, { code:0, error:`Endpoint not found` } ) )
  } )
} )

describe( `User module`, () => {
  it( `Empty users`, () => eqGetQl( `users { id }`, { users:[] } ) )
} )



/*\
 *   Functions
\*/



function eq( a, b ) {
  return async() => {
    if (a instanceof Promise) a = await a
    if (b instanceof Promise) b = await b

    assert.equal( JSON.stringify( a ), JSON.stringify( b ) )
  }
}
function eqObjFields( obj, objWithValues ) {
  return async() => {
    if (obj instanceof Promise) obj = await obj
    if (objWithValues instanceof Promise) objWithValues = await objWithValues

    const keyValue = Object.entries( objWithValues ).find(
      ([ key, value ]) => obj[ key ] !== value,
    )

    if (keyValue) assert.equal( obj[ keyValue[ 0 ] ], objWithValues[ keyValue[ 0 ] ] )
  }
}


function get( endpoint ) {
  return fetch( `${HOST}${endpoint}`, { method:`get` } )
}
function eqGetJson( endpoint, obj ) {
  return eq( get( endpoint ).then( res => res.json() ), obj )
}
function eqGetResFields( endpoint, obj ) {
  return eqObjFields( get( endpoint ), obj )
}
function eqGetQl( query, data ) {
  return eq( get( `${GRAPHQL_ENDPOINT}?query={${query}}` )
    .then( res => res.json() ), data )
}


function printMethods( obj ) {
  let indexer = 0
  const methods = Object.entries( obj )
    .map( ([ k, v ]) => `${indexer++}. ${k}: ${v.toString().split( /function|{\n/ )[ 1 ]}` )

  for (let i = 0;  i < methods.length;  i += 20) console.log( methods.slice( i, i + 20 ) )
}
