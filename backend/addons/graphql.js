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


const typesModificators = [
  { regex: /^\w+\[\]$/, resolver( typeWithModificator ) {
    return [ `arrayOf`, typeWithModificator.match( /\w+/ )[ 0 ] ]
  } },
]

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
  },
  graphql: {
    id: gql.GraphQLID,
    date: GraphQLTypeDate,
    string: gql.GraphQLString,
    int: gql.GraphQLInt,
    float: gql.GraphQLFloat,
    boolean: gql.GraphQLBoolean,
    arrayOf( type ) {
      return gql.GraphQLList( this[ type ] )
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
    return `arrayOf ${types[ type ]}`
  },
  SHAPE( shape ) {
    console.log( shape )

    throw ``
  },
}


/**
 * @param {string} name
 */
export const createModels = (name, obj, config = {}) => {
  const modelObjsWithSources = [
    {
      source: `mongoose`,
      modelObj: {},
      buildModel: obj => mongoose.model( name, obj, config.collection  ),
      setKeyValue( specifiedType, setup, key ) {
        if (key == `id`) return null
        return { type:specifiedType, ...(setup || {}) }
      },
    },
    {
      source: `graphql`,
      modelObj: {},
      buildModel: obj => {
        console.log( obj, gql.GraphQLID )
        return new gql.GraphQLObjectType({
          name,
          fields: obj,
          description: config.description,
        })
      },
    },
  ]

  Object.entries( obj ).forEach( ([ key, typeOrSetup ]) => {
    const type = typeof typeOrSetup === `object`
      ? typeOrSetup.type
      : typeOrSetup

    const [ resolvedType, ...params ] = typesModificators
      .find( ({ regex }) => regex.test( type ) )
      ?.resolver( type, key, typeOrSetup ) || [ type ]

    modelObjsWithSources.forEach( ({ source, modelObj, setKeyValue }) => {
      const ts = typesAliases[ source ] // if "ts[ resolvedType ]" is a function, it cannot lose "this"
      const isItFunction = true
        && typeof ts[ resolvedType ] == `function`
        && /[a-z]/.test( ts[ resolvedType ].name[ 0 ] )

      const specifiedType = isItFunction ? ts[ resolvedType ]( ...params ) : ts[ resolvedType ]
      const finalValue = setKeyValue
        ? setKeyValue( specifiedType, typeOrSetup, key )
        : { type:specifiedType }

      if (finalValue) modelObj[ key ] = finalValue
    } )
  } )

  return modelObjsWithSources.reduce(
    (obj, { source, modelObj, buildModel }) => ({ [ source ]:buildModel( modelObj ), ...obj }),
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





