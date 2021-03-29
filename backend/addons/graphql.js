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
      return new gql.GraphQLList( this[ type ] )
    },
    shapeOf( { name, key }, shape ) {
      console.log( shape )
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
    if (!(type in types)) throw new Error( `Wrong type` )
    return [ `arrayOf`, types[ type ] ]
  },
  SHAPE( shape ) {
    return [ `shapeOf`, JSON.stringify( shape ) ]
  },
}


/** @param {string} name */
export const createModels = (name, obj, config = {}) => {
  const modelObjsWithSources = [
    {
      source: `mongoose`,
      buildModel: obj => {
        console.log( `M`, obj )
        return mongoose.model( name, obj, config.collection  )
      },
      setKeyValue( specifiedType, setup, key ) {
        if (key == `id`) return null
        return { type:specifiedType, ...setup }
      },
    },
    {
      source: `graphql`,
      buildModel: obj => {
        console.log( `G`, obj )
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

        finalValue = setKeyValue?.( specifiedType, setup, key ) ?? { type:specifiedType }
      }


      if (finalValue) {
        if (!(source in builtModels)) builtModels[ source ] = {}
        builtModels[ source ][ key ] = finalValue
      }
    } )
  } )

  return builtModels
}
