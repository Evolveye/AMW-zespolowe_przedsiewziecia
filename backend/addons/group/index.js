import Addon from "../addon.js"

import getGraphQlTypes from "./graphql.js"
import getGraphQlModels from "./models.js"

export default class extends Addon {
  static requiredModules = [ `user`, `platform` ]

  graphQlModels = getGraphQlModels( this )
  graphQlTypes = getGraphQlTypes( this, this.graphQlModels )

  getApi() {
    const { queryObj, mutationObj } = this.graphQlTypes

    return {
      graphQl: {
        queryObj,
        mutationObj,
      },
    }
  }
}
