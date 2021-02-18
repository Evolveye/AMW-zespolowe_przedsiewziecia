import { GraphQLSchema } from "graphql";

import Addon from "../addon.js";
import getGraphQlTypes from "./graphql.js";
import getGraphQlModels from "./models.js";

export default class UserAddon extends Addon {
  graphQlModels = getGraphQlModels( this )
  graphQlTypes = getGraphQlTypes( this, this.graphQlModels )

  getApi() {
    const { queryObj, mutationObj } = this.graphQlTypes

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
  static toString = () => "UserAddon";
}
