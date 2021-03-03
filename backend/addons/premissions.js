import mongoose from "mongoose"
import { v4 } from 'uuid'

import { randomString } from "../priv/src/utils.js"

export default (modelName, fieldsNames) => {
  const makeObjectFromFields = defaultValue => fieldsNames.reduce(
    (obj, ability) => ({ [ ability ]:defaultValue, ...obj }), {},
  )

  return {
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

    PermissionModel: mongoose.model( modelName, new mongoose.Schema({
      name: { type:String },
      abilities: { canManageUsers:{ type:Boolean }, canManageGroups:{ type:Boolean } }, // makeObjectFromFields( Boolean )
      platformId: { type:mongoose.Schema.Types.ObjectId },
      color: { type:String },
      importance: { type:Number },
    }) ),

    PermissionWithUserConnectorModel: mongoose.model( `Permissions with user connector`, new mongoose.Schema({
      permissionId: { type:mongoose.Schema.Types.ObjectId },
      userId: { type:mongoose.Schema.Types.ObjectId },
    }) ),
  }
}
