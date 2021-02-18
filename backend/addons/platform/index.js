import Addon from "../addon.js";
import { GraphQLSchema } from "graphql";

import getGraphQlTypes from "./graphql.js";
import getGraphQlModels from "./models.js";

export default class PlatformAddon extends Addon {
  static requiredModules = [`UserAddon`];

  constructor(...params) {
    super(...params)

    this.graphQlModels = getGraphQlModels( this )
    this.graphQlTypes = getGraphQlTypes( this, this.graphQlModels )
  }


  getApi() {
    const { queryObj, mutationObj } = this.graphQlTypes

    return {
      graphQl: {
        queryObj,
        mutationObj,
      },
    };
  }

  /**@returns {string}  Name of class */
  toString = () => this.constructor.toString();

  /**@returns {string}  Name of class */
  static toString = () => "PlatformAddon";
}
