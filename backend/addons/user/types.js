import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql"
// import { userModule, UserType } from "./models.js";
import mongoose from "mongoose"

export default ({ isMailValid }, { UserModel, UserType }) => ({
  /** @type {import("graphql").GraphQLFieldConfigMap} */
  queryObj: {
    user: {
      type: UserType,
      args: {
        id: { type:GraphQLID },
        name: { type:GraphQLString },
        surname: { type:GraphQLString },
      },
      resolve( parent, args ) {
        if (mongoose.Types.ObjectId.isValid( args.id ))
          return UserModel.findById( args.id )
        if (args.name && args.surname)
          return UserModel.find({ name:args.name, surname:args.surname })
        return ``
      },
    },

    users: {
      type: GraphQLList( UserType ),
      args: {},
      resolve: () => UserModel.find({}),
    },
  },

  /** @type {import("graphql").GraphQLFieldConfigMap} */
  mutationObj: {
    addUser: {
      type: UserType,
      args: {
        name: { type:new GraphQLNonNull(GraphQLString) },
        surname: { type:new GraphQLNonNull(GraphQLString) },
        login: { type:new GraphQLNonNull(GraphQLString) },
        password: { type:new GraphQLNonNull(GraphQLString) },
        email: { type:new GraphQLNonNull(GraphQLString) },
        activated: { defaultValue:false, type:GraphQLBoolean },
        avatar: {
          defaultValue: `/media/image/avatarDefault.jpg`,
          type: GraphQLString,
        },
        createdDatetime: {
          defaultValue: Date.now().valueOf(),
          type: GraphQLInt,
        },
      },
      resolve( parent, args ) {
        // console.log({ parent, args });
        let user = new UserModel({
          name: args.name,
          surname: args.surname,
          login: args.login,
          password: args.password,
          activated: args.activated,
          email: args.email,
          avatar: args.avatar,
          createdDatetime: args.createdDatetime,
        })
        // console.log(user)
        return user.save()
      },
    },

    deleteUser: {
      type: UserType,
      args: {
        id: { type:new GraphQLNonNull(GraphQLID) },
      },
      resolve( parent, args ) {
        if (!mongoose.isValidObjectId( args.id )) return `Bad request.`
        return UserModel.findOneAndDelete({ _id:args.id })
      },
    },
  },
})
