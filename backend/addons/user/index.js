import Addon from "../addon.js"

import getGraphQlTypes from "./types.js"
import getGraphQlModels from "./models.js"

export default class extends Addon {
  graphQlModels = getGraphQlModels( this )
  graphQlTypes = getGraphQlTypes( this, this.graphQlModels )

  // async asyncConstructor() {
  //   this.graphQlModels = getGraphQlModels( this )
  //   this.graphQlTypes = getGraphQlTypes( this, this.graphQlModels )
  // }

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
