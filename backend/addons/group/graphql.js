import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";
import { groupModule, GroupType } from "./models.js";
import mongoose from "mongoose";

const getFilteredObjByKeys = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));

export default ({ isMailValid }) => ({
  /** @type {import("graphql").GraphQLFieldConfigMap} */
  queryObj: {

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
  },

  /** @type {import("graphql").GraphQLFieldConfigMap} */
  mutationObj: {
    addGroup: {
      type: GroupType,
      args: {
        lecturer: { type: new GraphQLNonNull(GraphQLID) }, //TODO: ref: userModule
        name: { type: new GraphQLNonNull(GraphQLString) },
        platformId: {
          type: new GraphQLNonNull(GraphQLID),
          //TODO:  ref: platformModule,
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
});
