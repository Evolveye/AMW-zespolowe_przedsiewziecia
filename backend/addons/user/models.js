import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
  GraphQLScalarType,
  GraphQLNonNull,
} from "graphql";
import mongoosePkg from "mongoose";
import { isEmailValid } from "../../priv/src/utils.js";

const { model, Schema } = mongoosePkg;
const GraphQLTypeDate = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    //console.log({Date: value})
    return value; // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10); // Convert hard-coded AST string to type expected by parseValue
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

export default () => ({
  UserModel: model(
    "User",
    new Schema(
      {
        name: { type: String, minLength: 2, maxLength: 15, trim: true },
        surname: { type: String, minLength: 2, maxLength: 15, trim: true },
        email: {
          type: String,
          validate: [
            {
              validator: (value) => isEmailValid(value),
              message: "Email validation failed",
            },
            {
              validator: async function (value) {
                // TODO: REFACTOR.  jak mam się odwolać do db gdy UserModel jest opakowany w default ?
                // const user = await UserModel.findOne({ email: value });
                
                return user ? false : true;
              },
              // new Promise(async (res, rej) => {
              //   console.log(this)
              //   const user = await UserModel.findOne({ email: value });
              //   //console.log("emailValidation - found by email:", { user });
              //   res(user ? false : true);
              // }),
              message: "Email already in use.",
            },
          ],
        },
        avatar: { type: String },
        activated: { type: Boolean },
        login: { type: String },
        password: { type: String },
        createdDateTime: { type: Number },
      },
      { collection: "userModule" }
    )
  ),

  UserType: new GraphQLObjectType({
    name: "User",
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      surname: { type: GraphQLString },
      email: { type: GraphQLString },
      avatar: { type: GraphQLString },
      createdDateTime: { type: GraphQLTypeDate },
      activated: { type: GraphQLBoolean },
      password: { type: GraphQLString },
    }),
    description: "User object.",
  }),
});
