import Permissions from "../permissions.js"

/**
 * @typedef {object} PermissionsFields
 * @property {boolean} isMaster
 * @property {boolean} isPersonel
 * @property {boolean} canEditDetails
 * @property {boolean} canManageUsers
 * @property {boolean} canManageRoles
 * @property {boolean} canManageGroups
 * @property {boolean} canManageCalendar
 */

export default class PlatformPermission extends Permissions {
  /**
   * @param {string} userId
   * @param {string} permissionName
   * @param {PermissionsFields} perms
   */
  constructor( platformId, permissionName, perms={} ) {
    super( platformId, permissionName, perms )

    this.isPersonel = perms.isPersonel ?? false
    this.canTeach = perms.canTeach ?? false
    this.canEditDetails = perms.canEditDetails ?? false
    this.canManageUsers = perms.canManageUsers ?? false
    this.canManageRoles = perms.canManageRoles ?? false
    this.canManageGroups = perms.canManageGroups ?? false
    this.canManageCalendar = perms.canManageCalendar ?? false
  }


}

export class PlatformUserPermission extends PlatformPermission {
  /**
   * @param {string} userId
   * @param {string} permissionName
   * @param {PermissionsFields} perms
   */
  constructor( userId, platformId, permissionName, perms ) {
    super( platformId, permissionName, perms )

    this.userId = userId
  }
}


export class PlatformPermissions {
  constructor(name,color,importance,abilities,platformId)
  {
      this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
      this.name = name || "Anonymous"
      this.color = color || 0x000000
      this.importance = importance || 0
      if(!abilities)
        this.abilities = new PlatformAbilities()
      else
        this.abilities = new PlatformAbilities(
          abilities.canManageRoles, abilities.canTeach,
          abilities.canManageUsers, abilities.canDeletePlatform,
          abilities.canEditDetails, abilities.canManageGroups
        )

      this.platformId = platformId || null
  }

  static getOwnerPermissions(platformId){
      return new PlatformPermissions(`Właściciel`,0xFFD700,9999,PlatformAbilities.getOwnerAbilities(),platformId)
  }
  static getLecturerPermissions(platformId){
      return new PlatformPermissions(`Prowadzący`,0x00ff00 ,100,PlatformAbilities.getLecturerAbilities(),platformId)
  }
  static getStudentPermissions(platformId){
      return new PlatformPermissions(`Student`,0x808080 ,10,PlatformAbilities.getStudentAbilities(),platformId)
  }
}


export class PlatformAbilities{
  constructor(canManageRoles,canTeach,canManageUsers,canDeletePlatform,canEditDetails,canManageGroups)
  {
      this.canManageRoles = canManageRoles || false
      this.canTeach = canTeach || false
      this.canEditDetails = canEditDetails || false
      this.canDeletePlatform = canDeletePlatform || false
      this.canManageGroups = canManageGroups || false
      this.canManageUsers = canManageUsers || false
  }
  static getOwnerAbilities(){
      return new PlatformAbilities(true,true,true,true,true,true)
  }
  static getLecturerAbilities(){
      return new PlatformAbilities(false,true,false,false,false,false)
  }
  static getStudentAbilities(){
      return new PlatformAbilities()
  }
}

export class ConnectorPlatformPermissionToUser{
  constructor(platformId,userId,permissionId)
  {
    this.id = `${Date.now()}t${Math.random().toString().slice(2)}r`
    this.platformId = platformId
    this.userId = userId
    this.permissionId = permissionId
  }
}