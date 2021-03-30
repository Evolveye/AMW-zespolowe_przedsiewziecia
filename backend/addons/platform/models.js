import { createModels, types } from "../graphql.js"
import { RoleWithUserConnectorModel, RoleWithUserConnectorType, RoleModel, RoleType } from "./permissions.js"



/** @typedef {import("../addon.js").default} Addon */


/** @param {Addon} addon */
export default addon => {
  const { UserModel } = addon.getReqAddon( `user` ).graphQlModels

  const { mongoose:PlatformModel, graphql:PlatformType } = createModels( `Platform`, {
    id: types.ID,
    owner: {
      type: types.ID,
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
    created: types.INT,
    administrator: {
      type: types.ID,
      validate: [
        {
          validator: async value => !!(await UserModel.findById( value )),
          message: `Platform administartor, cannot find user with provided id.`,
        },
      ],
    },
    name: types.STRING,
    membersIds: types.ARRAY_OF( types.ID ),
    assignedGroups: types.ARRAY_OF( types.ID ),
  }, { collection:addon.baseCollectionName } )

  return {
    PlatformModel,
    PlatformType,

    RoleModel,
    RoleType,
    RoleWithUserConnectorModel,
    RoleWithUserConnectorType,
  }
}


// const PlatformModel = model( `Platform`, new Schema( {
//   owner: {
//     type: Schema.Types.ObjectId,
//     validate: [
//       {
//         validator: async value => !!(await UserModel.findById( value )),
//         message: `Platform owner, cannot find user with provided id.`,
//       },
//       {
//         validator: async value => !(await PlatformModel.exists({ owner:value })),
//         message: `Platform limit, cannot create new platfrom because limit is 1 platform per user.`,
//       },
//     ],
//   },
//   created: { type:Number },
//   administrator: {
//     type: Schema.Types.ObjectId,
//     validate: [
//       {
//         validator: async value => !!(await UserModel.findById( value )),
//         message: `Platform administartor, cannot find user with provided id.`,
//       },
//     ],
//   },
//   name: { type:String },
//   membersIds: { type:[ Schema.Types.ObjectId ] },
//   assignedGroups: { type:[ Schema.Types.ObjectId ] },
// }, { collection:addon.baseCollectionName } ) )


// const PlatformType = new GraphQLObjectType({
//   name: `Platform`,
//   fields: () => ({
//     id: { type:GraphQLID },
//     name: { type:GraphQLString },
//     owner: { type:GraphQLID },
//     created: { type:GraphQLString },
//     administrator: { type:GraphQLID },
//     membersIds: { type:GraphQLList( GraphQLID ) },
//     assignedGroups: { type:GraphQLList( GraphQLID ) },
//     membersObj: {
//       type: new GraphQLList( UserType ),
//       resolve: parent => UserModel.find({ _id:{ $in:parent.membersIds } }),
//     },
//     administratorObject: {
//       type: UserType,
//       resolve: parent => UserModel.findById( parent.administrator ),
//     },
//     ownerObject: {
//       type: UserType,
//       resolve: parent => UserModel.findById( parent.owner ),
//     },
//   }),
//   description: `Platform object`,
// })
