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

const types = {
  mongoose: {
    id: Schema.Types.ObjectId,
    date: Number,
    int: Number,
    float: Number,
    string: String,
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
    arrayOf( type ) {
      return gql.GraphQLList( this[ type ] )
    },
  },
}


export const createModels = (name, obj) => {
  const modelObjsWithSources = [
    { source:`mongoose`, modelObj:{}, buildModel:obj =>  mongoose.model( name, obj ) },
    { source:`graphql`, modelObj:{}, buildModel:obj =>  new gql.GraphQLObjectType({ name, fields:obj }) },
  ]

  Object.entries( obj ).forEach( ([ key, type ]) => {
    const [ resolvedType, ...params ] = typesModificators
      .find( ({ regex }) => regex.test( type ) )
      ?.resolver( type ) || [ type ]

    modelObjsWithSources.forEach( ({ source, modelObj }) => {
      const ts = types[ source ] // if "ts[ resolvedType ]" is a function, it cannot lose "this"
      const isItFunction = true
        && typeof ts[ resolvedType ] == `function`
        && /[a-z]/.test( ts[ resolvedType ].name[ 0 ] )

      modelObj[ key ] = isItFunction ? ts[ resolvedType ]( ...params ) : ts[ resolvedType ]
    } )
  } )

  return modelObjsWithSources.reduce(
    (obj, { source, modelObj, buildModel }) => ({ [ source ]:buildModel( modelObj ), ...obj }),
    {},
  )
}







