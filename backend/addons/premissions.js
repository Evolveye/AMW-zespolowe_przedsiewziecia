import { randomString } from "../priv/src/utils.js"

export default fieldsNames => class {
  id = randomString( 48, 12 )
  abilities = fieldsNames.reduce(
    (obj, ability) => ({ [ ability ]:false, ...obj }), {},
  )

  /**
   * @param {string} name
   * @param {number} color
   * @param {number} importance
   * @param {{ name:string value:Boolean }[]} abilities
   */
  constructor( name, importance, color, abilities ) {
    this.importance = 10
    this.name = name
    this.color = color

    Object.entries( abilities ).filter( ability => ability in this.abilities )
      .forEach( (ability, value) => this.abilities[ ability ] = value )
  }
}

export class UserPermissions {
  constructor() {
    this.schemaUuid = 1234
    this.userUuid = 1234
  }
}
