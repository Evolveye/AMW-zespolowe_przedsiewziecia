import { randomString } from "../priv/src/utils.js"
import { v4 } from 'uuid'

export default fieldsNames => class {
  // id = randomString( 48, 12 )
  abilities = fieldsNames.reduce(
    (obj, ability) => ({ [ ability ]:false, ...obj }), {},
  )

  /**
   * @param {string} name
   * @param {number} color
   * @param {number} importance
   * @param {{ name:string value:Boolean }[]} abilities
   */
  constructor( name, importance = 10, color, abilities ) {
    this.importance = importance
    this.name = name
    this.color = color
    console.log( abilities )

    Object.entries( abilities ).filter( ([ ability ]) => ability in this.abilities )
      .forEach( ([ ability, value ]) => this.abilities[ ability ] = value )
  }
}
