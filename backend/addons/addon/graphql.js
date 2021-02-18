import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";
import {
  Book,
  BookType,
  Author,
  AuthorType,
  userModule,
  UserType,
  platformModule,
  PlatformType,
  groupModule,
  GroupType,
  note,
  NoteType,
  PlatformPerms,
  PlatformPermsType,
} from "./models.js";
import mongoose from "mongoose";

const getFilteredObjByKeys = (obj, keys) => Object.fromEntries(
  Object.entries( obj ).filter( ([key]) => keys.includes( key ) )
)

export const RootQuery = {
    platformPermsTemplate: {
      type: PlatformPermsType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        referenceId: { type: GraphQLID },
      },
      resolve(parent, args) {
        if (args.id) return PlatformPerms.findById(args.id);

        if (args.name && args.referenceId)
          return PlatformPerms.findOne({
            referenceId: args.referenceId,
            name: args.name,
          });

        return null;
      },
    },

    note: {
      type: NoteType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return mongoose.Types.ObjectId.isValid(args.id)
          ? note.findById(args.id)
          : null;
      },
    },


    notes: {
      type: GraphQLList(NoteType),
      resolve(parent, args) {
        return note.find({});
      },
    },

    group: {
      type: GroupType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return mongoose.Types.ObjectId.isValid(args.id)
          ? groupModule.findById(args.id)
          : null;
      },
    },

    groups: {
      type: GraphQLList(GroupType),
      resolve(parent, args) {
        return groupModule.find({});
      },
    },

    user: {
      type: UserType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        surname: { type: GraphQLString },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        if (mongoose.Types.ObjectId.isValid(args.id))
          return userModule.findById(args.id);
        if (args.name && args.surname)
          return userModule.find({ name: args.name, surname: args.surname });
        return "";
      },
    },

    users: {
      type: GraphQLList(UserType),
      args: {},
      resolve({ parent, args }) {
        //console.log({ parent, args });
        return userModule.find({});
      },
    },

    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //console.log({ parent, args });
        return Book.findById(args.id);
      },
    },

    books: {
      type: GraphQLList(BookType),
      resolve(parent, args) {
        //console.log({ parent, args });
        return Book.find({});
      },
    },

    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //console.log({ parent, args });
        return Author.findById(args.id);
      },
    },

    authors: {
      type: GraphQLList(AuthorType),
      resolve(parent, args) {
        //console.log({ parent, args });
        return Author.find({});
      },
    },

    platform: {
      type: PlatformType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //console.log({ parent, args });
        return platformModule.findById(args.id);
      },
    },

    platforms: {
      type: GraphQLList(PlatformType),
      resolve(parent, args) {
        //console.log({ parent, args });
        return platformModule.find({});
      },
    },
  };

export const Mutation = {
    addPlatformPermissionsTemplate: {
      type: PlatformPermsType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        referenceId: { type: new GraphQLNonNull(GraphQLID) },
        isMaster: { type: GraphQLBoolean, defaultValue: false },
        isPersonel: { type: GraphQLBoolean, defaultValue: false },
        canTeach: { type: GraphQLBoolean, defaultValue: false },
        canEditDetails: { type: GraphQLBoolean, defaultValue: false },
        canManageUsers: { type: GraphQLBoolean, defaultValue: false },
        canManageRoles: { type: GraphQLBoolean, defaultValue: false },
        canManageGroups: { type: GraphQLBoolean, defaultValue: false },
        canManageCalendar: { type: GraphQLBoolean, defaultValue: false },
      },
      resolve(parent, args) {
        const newPerms = new PlatformPerms({
          name: args.name,
          referenceId: args.referenceId,
          isMaster: args.isMaster,
          isPersonel: args.isPersonel,
          canTeach: args.canTeach,
          canEditDetails: args.canEditDetails,
          canManageUsers: args.canManageUsers,
          canManageGroups: args.canManageGroups,
          canManageRoles: args.canManageRoles,
          canManageCalendar: args.canManageCalendar,
        });
        return newPerms.save();
      },
    },

    addNote: {
      type: NoteType,
      args: {
        groupId: { type: new GraphQLNonNull(GraphQLID), ref: groupModule },
        userId: { type: new GraphQLNonNull(GraphQLID), ref: userModule },
        lecturer: { type: new GraphQLNonNull(GraphQLID), ref: userModule },
        value: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
      },
      resolve(parent, args) {
        const newNote = new note({
          userId: args.userId,
          lecturer: args.lecturer,
          groupId: args.groupId,
          date: Date.now().valueOf(),
          description: args.description ?? ``,
          value: args.value,
        });
        return newNote.save();
      },
    },

    deleteNote: {
      type: NoteType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return note.findOneAndDelete({ _id: args.id });
      },
    },

    addGroup: {
      type: GroupType,
      args: {
        lecturer: { type: new GraphQLNonNull(GraphQLID), ref: userModule },
        name: { type: new GraphQLNonNull(GraphQLString) },
        platformId: {
          type: new GraphQLNonNull(GraphQLID),
          ref: platformModule,
        },
        membersIds: {
          type: new GraphQLList(GraphQLID),
          defaultValue: [],
        },
      },
      resolve(parent, args) {
        const group = new groupModule({
          name: args.name,
          lecturer: args.lecturer,
          platformId: args.platformId,
          membersIds: args.membersIds
            ? args.membersIds.every((id) => id != args.lecturer)
              ? args.membersIds.concat(args.lecturer)
              : args.membersIds
            : args.lecturer,
        });
        return group.save();
      },
    },

    deleteGroup: {
      type: GroupType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return groupModule.findOneAndDelete({ _id: args.id });
      },
    },

    addPlatform: {
      type: PlatformType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        owner: { type: new GraphQLNonNull(GraphQLID), ref: "userModule" },
        created: { type: GraphQLInt, defaultValue: Date.now() },
        administrator: {
          type: new GraphQLNonNull(GraphQLID),
          ref: "userModule",
        },
        membersIds: {
          type: GraphQLList(GraphQLID),
          defaultValue: [],
        },
        assignedGroups: { type: GraphQLList(GraphQLID), defaultValue: [] },
      },
      resolve(parent, args) {
        const pe = new platformModule({
          name: args.name,
          owner: args.owner,
          created: Date.now().valueOf(),
          administrator: args.administrator,
          name: args.name,
          membersIds:
            args.owner === args.administrator
              ? [args.owner]
              : [args.owner, args.administrator],
          assignedGroups: args.assignedGroups || [],
        });
        // console.log({pe})
        return pe.save();
      },
    },

    deletePlatform: {
      type: PlatformType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return platformModule.findOneAndDelete({ _id: args.id });
      },
    },

    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        surname: { type: new GraphQLNonNull(GraphQLString) },
        login: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        activated: { defaultValue: false, type: GraphQLBoolean },
        avatar: {
          defaultValue: "/media/image/avatarDefault.jpg",
          type: GraphQLString,
        },
        createdDatetime: {
          defaultValue: Date.now().valueOf(),
          type: GraphQLInt,
        },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        let user = new userModule({
          name: args.name,
          surname: args.surname,
          login: args.login,
          password: args.password,
          activated: args.activated,
          email: args.email,
          avatar: args.avatar,
          createdDatetime: args.createdDatetime,
        });
        //console.log(user)
        return user.save();
      },
    },

    deletePlatform: {
      type: PlatformType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        return platformModule.findOneAndDelete({ _id: args.id });
      },
    },

    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        if (!mongoose.isValidObjectId(args.id)) return `Bad request.`;
        return userModule.findOneAndDelete({ _id: args.id });
      },
    },

    addAuthor: {
      type: AuthorType,
      args: {
        //GraphQLNonNull make these field required
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        let author = new Author({
          name: args.name,
          age: args.age,
        });
        return author.save();
      },
    },

    updateAuthor: {
      type: AuthorType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        if (!mongoose.isValidObjectId(args.id)) return `Bad request.`;

        return Author.findOneAndUpdate(
          { _id: args.id },
          getFilteredObjByKeys(args, [`name`, `age`]),
          { new: true }
        ); // new makes first update and after returns an obj
      },
    },

    deleteAuthor: {
      type: AuthorType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        if (!mongoose.isValidObjectId(args.id)) return `Bad request.`;
        return Author.findByIdAndDelete(args.id);
      },
    },

    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        pages: { type: new GraphQLNonNull(GraphQLInt) },
        authorID: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        //console.log({ parent, args });
        let book = new Book({
          name: args.name,
          pages: args.pages,
          authorID: args.authorID,
        });
        return book.save();
      },
    },
  }
