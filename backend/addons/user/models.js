import mongoose from "mongoose"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
} from "graphql"

import { GraphQLTypeDate } from "../graphql.js"
import { isEmailValid } from "../../priv/src/utils.js"

/** @typedef {import("../addon.js").default} Addon */

/** @param {Addon} addon */
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
