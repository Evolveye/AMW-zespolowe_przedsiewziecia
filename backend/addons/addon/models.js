import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
  GraphQLScalarType,
  GraphQLNonNull,
  Kind
} from "graphql";
import mongoosePkg from "mongoose";

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

export const Book = model(
  `Book`,
  new Schema({
    name: String,
    pages: Number,
    authorID: String,
  })
);

export const Author = model(
  `Autor`,
  new Schema({ name: String, age: { type: Number, min: 0, max: 150 } })
);

export const PlatformPerms = model(
  `PlatformPerms`,
  new Schema(
    {
      name: { type: String },
      referenceId: { type: Schema.Types.ObjectId },
      isMaster: { type: Boolean },
      isPersonel: { type: Boolean },
      canTeach: { type: Boolean },
      canEditDetails: { type: Boolean },
      canManageUsers: { type: Boolean },
      canManageRoles: { type: Boolean },
      canManageGroups: { type: Boolean },
      canManageCalendar: { type: Boolean },
    },
    { collection: "platformModule.permissions" }
  )
);

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

export const meetModule = model(
  `Meet`,
  new Schema(
    {
      created: { type: Number },
      dateStart: { type: Number },
      dateEnd: { type: Number },
      lecturer: { type: Schema.Types.ObjectId },
      description: { type: String },
      platformId: { type: Schema.Types.ObjectId },
      externalUrl: {
        type: String,
        validate: [
          {
            validator: (value) =>
              [`http`, `https`].some((prefix) => value.startsWith(prefix)),
            message: "External URL does not startsWith [http,https]",
          },
        ],
      },
      membersIds: { type: [Schema.Types.ObjectId] },
      groupId: { type: Schema.Types.ObjectId },
      url: { type: String },
      historyId: { type: Schema.Types.ObjectId },
      public: { type: Boolean },
    },
    { collection: `meetModule` }
  )
);

export const userModule = model(
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
            validator: (value) =>
              new Promise(async (res, rej) => {
                const user = await userModule.findOne({ email: value });
                //console.log("emailValidation - found by email:", { user });
                res(user ? false : true);
              }),
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
);

export const platformModule = model(
  "Platform",
  new Schema(
    {
      owner: {
        type: Schema.Types.ObjectId,
        ref: "userModule",
        validate: [
          {
            validator: async function (value) {
              // console.log({arg:this});
              return (await userModule.findById(value)) ? true : false;
            },
            message: "Platform owner, cannot find user with provided id.",
          },
          {
            validator: async function (value) {
              //console.log((await platformModule.find({owner:value})) ?false:true)
              const isOwner = !(await platformModule.exists({ owner: value }));
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
        ref: "userModule",
        validate: [
          {
            validator: async function (value) {
              return (await userModule.findById(value)) ? true : false;
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

export const PlatformPermsType = new GraphQLObjectType({
  name: `PlatformPerms`,
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    referenceId: { type: GraphQLID },
    isMaster: { type: GraphQLBoolean, default:false },
    // isPersonel: { type: GraphQLBoolean, default:false  },
    // canTeach: { type: GraphQLBoolean, default:false },
    // canEditDetails: { type: GraphQLBoolean, default:false },
    // canManageUsers: { type: GraphQLBoolean, default:false },
    // canManageRoles: { type: GraphQLBoolean, default:false },
    // canManageGroups: { type: GraphQLBoolean, default:false },
    // canManageCalendar: { type: GraphQLBoolean, default:false },
    referenceObj: { type: PlatformType,
       resolve(parent, args) {
        return platformModule.findById(parent.referenceId)
    } },
  }),
});

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

export const PlatformType = new GraphQLObjectType({
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
        return userModule.find({ _id: { $in: parent.membersIds } });
      },
    },
    assignedGroups: {
      type: GraphQLList(GraphQLID),
    },
    assignedGroupsObj: {
      type: GraphQLList(GroupType),
      resolve(parent, args) {
        return groupModule.find({ _id: { $in: parent.assignedGroups } });
      },
    },
    administratorObject: {
      type: UserType,
      resolve(parent, args) {
        return userModule.findById(parent.administrator);
      },
    },
    ownerObject: {
      type: UserType,
      resolve(parent, args) {
        return userModule.findById(parent.owner);
      },
    },
  }),
  description: "Platform object",
});

export const UserType = new GraphQLObjectType({
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
});

export const BookType = new GraphQLObjectType({
  name: `Book`,
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    pages: { type: GraphQLInt },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        return Author.findById(parent.authorID);
      },
    },
  }),
  description: "Book from shop.",
});

export const AuthorType = new GraphQLObjectType({
  name: `Author`,
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    book: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return Author.find({ authorID: parent.id });
      },
    },
  }),
  description: "Author of book.",
});

//#endregion
