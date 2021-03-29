import Addon from "../addon.js"

import getGraphQlTypes from "./types.js"
import getGraphQlModels from "./models.js"

export default class extends Addon {
  static requiredModules = [ `user` ]

  graphQlModels = getGraphQlModels( this )
  graphQlTypes = getGraphQlTypes( this.graphQlModels, this )

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
