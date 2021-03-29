import mongoose from "mongoose"
import { v4 } from 'uuid'

import { randomString } from "../priv/src/utils.js"
import { createModels, types } from "./graphql.js"


export const { mongoose:RoleWithUserConnectorModel, graphql:RoleWithUserConnectorType } =
  createModels( `RoleWithUserConnector`, {
    permissionId: types.ID,
    userId: types.ID,
  } )


export default (modelName, fieldsNames) => {
  const makeObjectFromFields = defaultValue => fieldsNames.reduce(
    (obj, ability) => ({ [ ability ]:defaultValue, ...obj }), {},
  )

  const { mongoose:RoleModel, graphql:RoleType } = createModels( modelName, {
    id: types.ID,
    platformId: types.ID,
    abilities: types.SHAPE( makeObjectFromFields( types.BOOLEAN ) ),
    name: types.STRING,
    color: types.INT,
    importance: types.INT,
  } )

  return {
    RoleModel,
    RoleType,
    Permission: class {
      // id = randomString( 48, 12 )
      abilities = makeObjectFromFields( false )

      /**
       * @param {string} name
       * @param {number} color
       * @param {number} importance
       * @param {{ name:string value:Boolean }[]} abilities
       */
      constructor( name, importance, color, abilities ) {
        this.importance = importance
        this.name = name
        this.color = color

        Object.entries( abilities ).filter( ([ ability ]) => ability in this.abilities )
          .forEach( ([ ability, value ]) => this.abilities[ ability ] = value )
      }
    },
  }
}
