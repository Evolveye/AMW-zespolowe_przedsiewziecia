import mongoose from "mongoose"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInt,
} from "graphql"

import { GraphQLTypeDate } from "../graphql.js"
import { PermissionModel, PermissionWithUserConnectorModel } from "./permissions.js"

const { Schema, model } = mongoose


/** @typedef {import("../addon.js").default} Addon */


/** @param {Addon} addon */
export default addon => {
  const { UserModel, UserType } = addon.getReqAddon( `user` ).graphQlModels

  const PlatformAbilityType = new GraphQLObjectType({
    name: `Ability`,
    fields: () => ({
      canManageUsers: { type:GraphQLBoolean },
      canManageGroups: { type:GraphQLBoolean },
    }),
    description: `An ability type.`,
  })

  const PlatformPermissionType = new GraphQLObjectType({
    name: `PlatformPermission`,
    fields: () => ({
      id: { type:GraphQLID },
      name: { type:GraphQLString },
      abilities: { type:PlatformAbilityType  },
      platformId: { type:GraphQLID },
      color: { type:GraphQLString },
      importance: { type:GraphQLInt },
    }),
    description: `Template for permissions.`,
  })


  const PlatformUserPermissionType =  new GraphQLObjectType({
    name: `PlatformUserPermission`,
    fields: () => ({
      id: { type:GraphQLID },
      permissionId: { type:GraphQLID },
      userId: { type:GraphQLID },
      user: { type: UserType, resolve( parent, args, context, info ) {
        if (Array.isArray( parent ))
          parent = parent[ 0 ]

        parent.user.id =  mongoose.Types.ObjectId( parent.user._id )
        console.log( parent.user )
        return parent.user
      } },
      platfromId: { type:GraphQLID },
      permissionTemplate: {
        type: PlatformPermissionType,
        resolve( parent, args, context, info ) {
          if (Array.isArray( parent ))
            parent = parent[ 0 ]
          // info jest ussless. przechowuje informacje o typach itd.
          // context posiada w sobie serwer  - socket hedersy url body
          // console.log({ parent, args })
          // w kazdym z resolve poprostu wyciagnać dane z parent
          // np. tutaj parent.permissionTempleta
          console.log( `gotowe`, typeof parent.permissionTemplate._id )
          parent.permissionTemplate.id = mongoose.Types.ObjectId( parent.permissionTemplate._id )
          return  parent.permissionTemplate

        } },
    }),
    description: `Permission assigned to user in specyfic platform`,
  })


  const PlatformModel = model( `Platform`, new Schema(
    {
      owner: {
        type: Schema.Types.ObjectId,
        validate: [
          {
            validator: async value => !!(await UserModel.findById( value )),
            message: `Platform owner, cannot find user with provided id.`,
          },
          {
            validator: async value => !(await PlatformModel.exists({ owner:value })),
            message: `Platform limit, cannot create new platfrom because limit is 1 platform per user.`,
          },
        ],
      },
      created: { type:Number },
      administrator: {
        type: Schema.Types.ObjectId,
        validate: [
          {
            validator: async value => !!(await UserModel.findById( value )),
            message: `Platform administartor, cannot find user with provided id.`,
          },
        ],
      },
      name: { type:String },
      membersIds: { type:[ Schema.Types.ObjectId ] },
      assignedGroups: { type:[ Schema.Types.ObjectId ] },
    },
    { collection:addon.baseCollectionName },
  ) )


  const PlatformType = new GraphQLObjectType({
    name: `Platform`,
    fields: () => ({
      id: { type:GraphQLID },
      name: { type:GraphQLString },
      owner: { type:GraphQLID },
      created: { type:GraphQLTypeDate },
      administrator: { type:GraphQLID },
      membersIds: { type:GraphQLList( GraphQLID ) },
      assignedGroups: { type:GraphQLList( GraphQLID ) },
      membersObj: {
        type: new GraphQLList( UserType ),
        resolve: parent => UserModel.find({ _id:{ $in:parent.membersIds } }),
      },
      administratorObject: {
        type: UserType,
        resolve: parent => UserModel.findById( parent.administrator ),
      },
      ownerObject: {
        type: UserType,
        resolve: parent => UserModel.findById( parent.owner ),
      },
    }),
    description: `Platform object`,
  })


  return {
    PlatformUserPermissionType,
    PlatformPermissionType,
    PlatformModel,
    PlatformType,
    PermissionModel,
    PermissionWithUserConnectorModel,
  }
}

