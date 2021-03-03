import mongoose from "mongoose"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
} from "graphql"

import { GraphQLTypeDate } from "../graphql.js"
import { isEmailValid } from "../../priv/src/utils.js"

/** @typedef {import("../addon.js").default} Addon */


// const PermAbility = mongoose.model( ``, new mongoose.Schema(
//   {
//     AbilityName: { type:String },
//     Value: { type:Boolean },
//   } ) )



/** @param {Addon} param0 */
export default ({ baseCollectionName }) => {
  const UserModel = mongoose.model( `User`, new mongoose.Schema(
    {
      name: { type:String, minLength:2, maxLength:15, trim:true },
      surname: { type:String, minLength:2, maxLength:15, trim:true },
      email: {
        type: String,
        validate: [
          {
            validator: value => isEmailValid( value ),
            message: `Email validation failed`,
          },
          {
            validator: async value => !(await UserModel.findOne({ email:value })),
            message: `Email already in use.`,
          },
        ],
      },
      avatar: { type:String },
      activated: { type:Boolean },
      login: { type:String },
      password: { type:String },
      createdDateTime: { type:Number },
    },
    { collection:baseCollectionName },
  ) )

  return {
    UserModel,
    UserType: new GraphQLObjectType({
      name: `User`,
      fields: () => ({
        id: { type:GraphQLID },
        name: { type:GraphQLString },
        surname: { type:GraphQLString },
        login: { type:GraphQLString },
        email: { type:GraphQLString },
        avatar: { type:GraphQLString },
        createdDateTime: { type:GraphQLTypeDate },
        activated: { type:GraphQLBoolean },
        password: { type:GraphQLString },
      }),
      description: `User object.`,
    }),
  }


}
