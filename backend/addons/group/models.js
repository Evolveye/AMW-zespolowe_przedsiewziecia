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
// import { isEmailValid } from "../../priv/src/utils.js";

const { model, Schema } = mongoosePkg;

//#region  GrapQL Scalar Types

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

//#endregion

//#region Mongoose Models
export const note = model(
  `Note`,
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId },
      lecturer: { type: Schema.Types.ObjectId },
      date: { type: Number },
      description: { type: String },
      value: { type: String },
      groupId: { type: Schema.Types.ObjectId },
    },
    { collection: `groupModule.notes` }
  )
);

export const groupModule = model(
  "Group",
  new Schema(
    {
      lecturer: { type: Schema.Types.ObjectId },
      created: { type: Number },
      name: {
        type: String,
        validate: [
          {
            validator: async function (value) {
              // wszystko git gdy grupa o tej samej nazwie NIE istnieje jeszcze w pe
              const isDuplicate = await groupModule.exists({
                name: value,
                platformId: this.platformId,
              });
              return !isDuplicate;
            },
            message:
              "Group duplication, target platform contains already group with provided name.",
          },
        ],
      },
      platformId: {
        type: Schema.Types.ObjectId,
      },
      membersIds: { type: [Schema.Types.ObjectId] },
    },
    { collection: "groupModule" }
  )
);

//#endregion

//#region GrapQL Types


export const NoteType = new GraphQLObjectType({
  name: `Note`,
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    lecturer: { type: GraphQLID },
    date: { type: GraphQLTypeDate },
    description: { type: GraphQLString },
    value: { type: GraphQLString },
    groupId: { type: GraphQLID },
    userObj: {
      type: UserType,
      resolve(parent, args) {
        return userModule.findById(parent.userId);
      },
    },
    groupObj: {
      type: GroupType,
      resolve(parent, args) {
        return groupModule.findById(parent.groupId);
      },
    },
    lecturerObj: {
      type: UserType,
      resolve(parent, args) {
        return userModule.findById(parent.lecturer);
      },
    },
  }),
});

export const GroupType = new GraphQLObjectType({
  name: "Group",
  fields: () => ({
    id: { type: GraphQLID },
    lecturer: { type: GraphQLID },
    created: { type: GraphQLTypeDate },
    name: { type: GraphQLString },
    platformId: { type: GraphQLID },
    membersIds: { type: GraphQLList(GraphQLID) },
    membersObj: {
      type: GraphQLList(UserType),
      resolve(parent, args) {
        return userModule.find({ _id: { $in: parent.membersIds } });
      },
    },
    lecturerObj: {
      type: UserType,
      resolve(parent, args) {
        // console.log("lecturer id"+parent.lecturer)
        return userModule.findById(parent.lecturer);
      },
    },
  }),
  description: "Group Object",
});

//#endregion
