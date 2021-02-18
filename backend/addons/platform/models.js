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


/** @typedef {import("../addon.js").default} Addon */


const { model, Schema } = mongoosePkg;
const GraphQLTypeDate = new GraphQLScalarType({
  name: "DateType",
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

/** @param {Addon} addon */
export default (addon) => {
  const {UserModel,UserType} = addon.getReqAddon( `user` ).graphQlModels

  return {
    PlatformModel: model(
      "Platform",
      new Schema(
        {
          owner: {
            type: Schema.Types.ObjectId,
            // ref: "UserModel",
            validate: [
              {
                validator: async function (value) {
                  return (await UserModel.findById(value)) ? true : false;
                },
                message: "Platform owner, cannot find user with provided id.",
              },
              {
                validator: async function (value) {
                  //console.log((await platformModule.find({owner:value})) ?false:true)
                  const isOwner = !(await PlatformModel.exists({ owner: value }));
                  console.log("Create PE -> ", { canMakePE: isOwner });
                  return isOwner;
                },
                message:
                  "Platform limit, cannot create new platfrom because limit is 1 platform per user.",
              },
            ],
          },
          created: { type: Number },
          administrator: {
            type: Schema.Types.ObjectId,
            // ref: "UserModel",
            validate: [
              {
                validator: async function (value) {
                  return (await UserModel.findById(value)) ? true : false;
                },
                message:
                  "Platform administartor, cannot find user with provided id.",
              },
            ],
          },
          name: { type: String },
          membersIds: { type: [Schema.Types.ObjectId] },
          assignedGroups: { type: [Schema.Types.ObjectId] },
        },
        { collection: "platformModule" }
      )
    ),

    PlatformType: new GraphQLObjectType({
      name: "Platform",
      fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        owner: { type: GraphQLID },
        created: { type: GraphQLTypeDate },
        administrator: { type: GraphQLID },
        membersIds: {
          type: GraphQLList(GraphQLID),
        },
        membersObj: {
          type: GraphQLList(UserType),
          resolve(parent, args) {
            return UserModel.find({ _id: { $in: parent.membersIds } });
          },
        },
        assignedGroups: {
          type: GraphQLList(GraphQLID),
        },
        administratorObject: {
          type: UserType,
          resolve(parent, args) {
            return UserModel.findById(parent.administrator);
          },
        },
        ownerObject: {
          type: UserType,
          resolve(parent, args) {
            return UserModel.findById(parent.owner);
          },
        },
      }),
      description: "Platform object",
    })


  }
}

