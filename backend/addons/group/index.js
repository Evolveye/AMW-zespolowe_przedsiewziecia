import Addon from "../addon.js";
import { GraphQLSchema } from "graphql";

import getGraphQlTypes from "./graphql.js";

export default class GroupAddon extends Addon {
  getApi() {
    const { queryObj, mutationObj } = getGraphQlTypes( this )

    return {
      graphQl: {
        queryObj,
        mutationObj,
      }
    };
  }

  /**@returns {string}  Name of class */
  toString = () => this.constructor.toString();

  /**@returns {string}  Name of class */
  static toString = () => "GroupAddon";
}
