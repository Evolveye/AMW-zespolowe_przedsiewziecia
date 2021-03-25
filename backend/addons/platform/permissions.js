import { v4 } from 'uuid'
import createPermissions from '../premissions.js'

// console.log( createPermissions( `Platform Permissions Model`, [ `canManageUsers`, `canManageGroups`  ] ).Permission )
export const { Permission, PermissionModel, PermissionWithUserConnectorModel } =
  createPermissions( `Platform Permissions Model`, [ `canManageUsers`, `canManageGroups`  ] ) // templates

class PlatformPerms extends Permission {
  constructor( platformId, ...data ) {
    super( ...data )
    this.platformId = platformId
  }
}

// const student = new PlatformPerms(v4(), `student`, 10, 0xffffff, { canManageUsers:true } ) // plaitformId
// const admin = new PlatformPerms(v4(), `admin`, 20, 0xffffff, { canManageUsers:true } )
// const owner = new PlatformPerms(v4(), `owner`, 30, 0xffffff, { canManageUsers:true } )

// ------------------------------------------------------------------
// 2 kolekcja templateId - userId,
// znajdz template dla usera, search by {name + platformId} ?

// console.log( student )


