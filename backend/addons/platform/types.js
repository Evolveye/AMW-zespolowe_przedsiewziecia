import mongoose from "mongoose"
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLInputObjectType,
} from "graphql"

const getFilteredObjByKeys = (obj, keys) =>
  Object.fromEntries( Object.entries( obj ).filter( ([ key ]) => keys.includes( key ) ) )

/**
 *
 */
export default ({ isMailValid }, { PlatformType, PlatformModel, PermissionWithUserConnectorModel, PermissionModel, PlatformPermissionType, PlatformUserPermissionType }) => ({
  /** @type {import("graphql").GraphQLFieldConfigMap} */
  queryObj: {

    // platformUserPermission: {
    //   type: PlatformPermissionType,
    //   args: {
    //     permissionId: { type:GraphQLID  },
    //     userId: { type:GraphQLID  },
    //   },
    //   resolve( parent, args )
    //   {
    //     return PermissionModel.findById( args.permissionId )
    //   },
    // },

    // permissionTemplate: {
    //   type: PlatformPermissionType,
    //   args: {
    //     id: { type:GraphQLID },
    //     platformId: { type:GraphQLID },
    //     name: { type:GraphQLString },
    //   },
    //   resolve( parent, args ) {

    //     if  (mongoose.Types.ObjectId.isValid( args.id ) && args.id)
    //       return  PermissionModel.findById( args.id )

    //     if (mongoose.Types.ObjectId.isValid( args.platformId ) && args.platformId && args.name)
    //       return PermissionModel.findOne({ name:args.name, platformId:args.platformId })
    //   },
    // },


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

    // userPlatformPermission: {
    //   type: PlatformUserPermissionType,
    //   args: {
    //     permissionId: { type:GraphQLID },
    //     userId: { type:GraphQLID },
    //   },
    //   resolve( parent, args ) {
    //     return PermissionWithUserConnectorModel( args ).save()
    //   },
    // }
    // ,

    permissionTemplate: {
      type: PlatformPermissionType,
      args: {
        platformId: { type:GraphQLID  },
        name: { type:GraphQLString },
        abilities: {
          type: new GraphQLInputObjectType({ name: `Abilities`, fields: () => ({
            canManageUsers: { type:GraphQLBoolean },
            canManageGroups: { type:GraphQLBoolean },
          }) }),
        },
        color: { type:GraphQLString },
        importance: { type:GraphQLInt },
      },
      resolve( parent, args )
      {
        args.abilities = JSON.parse( JSON.stringify( args.abilities ) )
        return new PermissionModel(args).save()
      },
    },


    deleteUsersFromPlatform: {
      type: PlatformType,
      args: {
        userIds: { type:new GraphQLNonNull(new GraphQLList(GraphQLID)) },
        targetPlatform: { type:new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) =>
        PlatformModel.findOneAndUpdate(
          { _id:args.targetPlatform },
          { $pull:{ membersIds:{ $in:args.userIds } } },
          { new:true },
        ),
    },

    deletePlatform: {
      type: PlatformType,
      args: {
        id: { type:new GraphQLNonNull(GraphQLID) },
      },
      resolve( parent, args ) {
        if (!mongoose.isValidObjectId( args.id )) return `Bad request.`
        return PlatformModel.findOneAndDelete({ _id:args.id })
      },
    },

    assignUsers: {
      type: PlatformType,
      args: {
        userIds: { type:new GraphQLNonNull(new GraphQLList(GraphQLID)) },
        targetPlatform: { type:new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) =>
        PlatformModel.findOneAndUpdate(
          { _id:args.targetPlatform },
          { $push:{ membersIds:{ $each:args.userIds } } },
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
