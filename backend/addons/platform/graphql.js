import mongoose from "mongoose"
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from "graphql"

const getFilteredObjByKeys = (obj, keys) =>
  Object.fromEntries( Object.entries( obj ).filter( ([ key ]) => keys.includes( key ) ) )

/**
 *
 */
export default ({ isMailValid }, { PlatformType, PlatformModel }) => ({
  /** @type {import("graphql").GraphQLFieldConfigMap} */
  queryObj: {
    platform: {
      type: PlatformType,
      args: { id:{ type:GraphQLID } },
      resolve: (parent, args) => PlatformModel.findById( args.id ),
    },

    platforms: {
      type: GraphQLList( PlatformType ),
      resolve: () => PlatformModel.find({}),
    },
  },

  /** @type {import("graphql").GraphQLFieldConfigMap} */
  mutationObj: {
    assignUsers: {
      type: PlatformType,
      args: {
        userIds: { type:new GraphQLNonNull(new GraphQLList(GraphQLID)) },
        targetPlatform: { type:new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => PlatformModel.findOneAndUpdate(
        { _id:args.targetPlatform },
        { $push:{ $each:{ membersIds:args.userIds } } },
        { new:true },
      ),
    },

    addPlatform: {
      type: PlatformType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        owner: {
          type: new GraphQLNonNull(GraphQLID),
        },
        created: {
          type: GraphQLInt, defaultValue: Date.now(),
        },
        administrator: {
          type: new GraphQLNonNull(GraphQLID),
        },
        membersIds: {
          type: GraphQLList( GraphQLID ),
          defaultValue: [],
        },
        assignedGroups: { type:GraphQLList( GraphQLID ), defaultValue:[] },
      },
      resolve: (parent, args) => new PlatformModel({
        name: args.name,
        owner: args.owner,
        created: Date.now().valueOf(),
        administrator: args.administrator,
        membersIds: args.owner === args.administrator
          ? [ args.owner ]
          : [ args.owner, args.administrator ],
        assignedGroups: args.assignedGroups || [],
      }).save(),
    },
  },
})
