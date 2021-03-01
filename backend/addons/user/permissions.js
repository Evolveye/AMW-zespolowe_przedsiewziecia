import { v4 } from 'uuid'
import createPermissions from './../premissions.js'


const Perms = createPermissions([ `canManageUsers` ]) // templates

class PlatformPerms extends Perms {
  constructor( platformId, ...data ) {
    super( ...data )
    this.platformId = platformId
  }
}

const student = new PlatformPerms(v4(), `student`, 10, 0xffffff, { canManageUsers:true } ) // plaitformId
const admin = new PlatformPerms(v4(), `admin`, 20, 0xffffff, { canManageUsers:true } )
const owner = new PlatformPerms(v4(), `owner`, 30, 0xffffff, { canManageUsers:true } )

// ------------------------------------------------------------------
// 2 kolekcja templateId - userId,
// znajdz template dla usera, search by {name + platformId} ?

console.log( student )


