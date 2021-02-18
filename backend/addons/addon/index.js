import Addon from "../addon.js"
import { Mutation, RootQuery } from "./graphql.js";
import { GraphQLSchema } from 'graphql'

export default class Schema extends Addon {
    graphQlConfig() {
        return { queryObj: RootQuery, mutationObj: Mutation }
    }
}