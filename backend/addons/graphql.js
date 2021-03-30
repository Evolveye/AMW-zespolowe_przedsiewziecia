import gql from "graphql"
import mongoose from "mongoose"

const { Schema } = mongoose

export const GraphQLTypeDate = new gql.GraphQLScalarType({
  name: `Date`,
  description: `Date custom scalar type`,
  serialize: value => value,
  parseValue: value => new Date(value),
  parseLiteral: ast => ast.kind === gql.Kind.INT ? parseInt( ast.value, 10 ) : null,
})

const typesAliases = {
  mongoose: {
    id: Schema.Types.ObjectId,
    date: Number,
    int: Number,
    float: Number,
    string: String,
    boolean: Boolean,
    arrayOf( type ) {
      return [ this[ type ] ]
    },
    // shapeOf( shape ) {
    //   console.log( `mongoose`, shape )
    // },
  },
  graphql: {
    id: gql.GraphQLID,
    date: GraphQLTypeDate,
    string: gql.GraphQLString,
    int: gql.GraphQLInt,
    float: gql.GraphQLFloat,
    boolean: gql.GraphQLBoolean,
    arrayOf( type ) {
      console.log( type )
      return new gql.GraphQLList( this[ type ] )
    },
    shapeOf( { name, key }, shape ) {
      return new gql.GraphQLObjectType( {
        name: `${name}_${key}`,
        fields: shape,
      } )
    },
  },
}

export const types = {
  ID: `id`,
  DATE: `date`,
  STRING: `string`,
  INT: `int`,
  FLOAT: `float`,
  BOOLEAN: `boolean`,
  ARRAY_OF( type ) {
    if (!Object.values( types ).includes( type )) throw new Error( `Wrong type (${type})` )
    return [ `arrayOf`, type ]
  },
  SHAPE( shape ) {
    return [ `shapeOf`, JSON.stringify( shape ) ]
  },
}


/**
 * @param {string} name
 * @returns {{mongoose:mongoose.Model graphql:gql.GraphQLObjectType
 */
export const createModels = (name, obj, config = {}) => {
  const modelObjsWithSources = [
    {
      source: `mongoose`,
      buildModel: obj => {
        const schema = new mongoose.Schema( obj )

        schema.set( `toJSON`, { virtuals:true } )
        schema.virtual( `id` ).get( function() {
          return this._id.toHexString()
        } )

        return mongoose.model( name, schema, config.collection  )
      },
      setKeyValue( specifiedType, setup, key ) {
        if (key == `id`) return null
        return { ...(Array.isArray( setup ) ? {} : setup), type:specifiedType }
      },
    },
    {
      source: `graphql`,
      buildModel: obj => {
        return new gql.GraphQLObjectType({
          name,
          fields: () => obj,
          description: config.description,
        })
      },
    },
  ]

  const models = modelsCreatorhelper( { name, modelObjsWithSources }, obj )

  return modelObjsWithSources.reduce(
    (obj, { source, buildModel }) => ({ [ source ]:buildModel( models[ source ] ), ...obj }),
    {},
  )
}

export const processArgs = argsObj => {
  const args = {}

  Object.entries( argsObj ).forEach( ([ name, setup ]) =>
    args[ name ] = setup.constructor.name === `Object` ? setup : { type:setup },
  )

  return args
}

function modelsCreatorhelper( data, obj ) {
  const { modelObjsWithSources } = data
  const builtModels = {}

  Object.entries( obj ).forEach( ([ key, typeOrSetup ]) => {
    const setup = typeof typeOrSetup === `object` ? typeOrSetup : {}
    const [ resolvedType, ...params ] = typeof typeOrSetup === `object`
      ? (Array.isArray( typeOrSetup ) ? typeOrSetup : [ typeOrSetup.type ])
      : [ typeOrSetup ]

    // console.log( typeOrSetup, typeof typeOrSetup === `object`, resolvedType )
    const shape = resolvedType === `shapeOf`
      ? modelsCreatorhelper( data, JSON.parse( params[ 0 ] ) )
      : null

    modelObjsWithSources.forEach( ({ source, setKeyValue }) => {
      const ts = typesAliases[ source ] // if "ts[ resolvedType ]" is a function, it cannot lose "this"

      let finalValue

      if (resolvedType === `shapeOf`) {
        const type = ts[ `shapeOf` ]?.( { key, ...data }, shape[ source ] ) ?? shape[ source ]
        finalValue = { type }
      } else {
        const isItFunction = true
          && typeof ts[ resolvedType ] == `function`
          && /[a-z]/.test( ts[ resolvedType ].name[ 0 ] )
        const specifiedType = isItFunction ? ts[ resolvedType ]( ...params ) : ts[ resolvedType ]

        finalValue = setKeyValue
          ? setKeyValue( specifiedType, setup, key )
          : { type:specifiedType }
        // console.log( { specifiedType, setup, key, finalValue }, ts[ resolvedType ] )
      }


      if (finalValue) {
        if (!(source in builtModels)) builtModels[ source ] = {}
        builtModels[ source ][ key ] = finalValue
      }
    } )
  } )

  return builtModels
}
