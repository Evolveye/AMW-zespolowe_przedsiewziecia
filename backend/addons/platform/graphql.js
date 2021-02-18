import mongoose from "mongoose";
import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";

const getFilteredObjByKeys = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));

/**
 * 
 */
export default ({ isMailValid }, { PlatformType, PlatformModel }) => ({
  /** @type {import("graphql").GraphQLFieldConfigMap} */
  queryObj: {
    platform: {
      type: PlatformType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return PlatformModel.findById(args.id);
      },
    },

    platforms: {
      type: GraphQLList(PlatformType),
      resolve(parent, args) {
        return PlatformModel.find({});
      },
    },
  },

  /** @type {import("graphql").GraphQLFieldConfigMap} */
  mutationObj: {

    assignUsers:{
      type:PlatformType,
      args:{
        userIds:{type: new GraphQLNonNull(new GraphQLList(GraphQLID))},
        targetPlatform:{type: new GraphQLNonNull(GraphQLID)},
      },
      resolve(parent,args)
      {
        return PlatformModel.findOneAndUpdate({_id:args.targetPlatform},{$push:{$each:{membersIds:args.userIds}}},{new:true})
      }
    },

    addPlatform: {
      type: PlatformType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        owner: { type: new GraphQLNonNull(GraphQLID)  }, //ref: "userModule"
        created: { type: GraphQLInt, defaultValue: Date.now() },
        administrator: {
          type: new GraphQLNonNull(GraphQLID),
          //ref: "userModule",
        },
        membersIds: {
          type: GraphQLList(GraphQLID),
          defaultValue: [],
        },
        assignedGroups: { type: GraphQLList(GraphQLID), defaultValue: [] },
      },
      resolve(parent, args) {
        const pe = new PlatformModel({
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
  },
});
