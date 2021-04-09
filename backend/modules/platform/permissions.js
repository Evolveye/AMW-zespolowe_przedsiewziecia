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


export class PlatformPermissions{
  constructor(name,color,importance,abilities)
  {
      this.name = name ||"Anonymous"
      this.color = color || 0xFFFFFF
      this.importance = importance || 0
      this.abilities = abilities || new PlatformAbilities()
  }

  static getOwnerPermissions(){
      return new PlatformPermissions(`Owner`,0xFFD700,9999,PlatformAbilities.getOwnerAbilities())
  }
  static getLecturerPermissions(){
      return new PlatformPermissions(`Lecturer`,0x808080 ,100,PlatformAbilities.getLecturerAbilities())
  }
  static getStudentPermissions(){
      return new PlatformPermissions(`Student`,0x808080 ,10,PlatformAbilities.getStudentAbilities())
  }
}


export class PlatformAbilities{
  constructor(canCreateUsers,canDeleteUsers,canDeletePlatform,canEditPlatform,canCreateGroups,canDeleteGroups)
  {
      this.canCreateUsers = canCreateUsers || false
      this.canDeleteUsers =canDeleteUsers || false
      this.canDeletePlatform =canDeletePlatform || false
      this.canEditPlatform =canEditPlatform || false
      this.canCreateGroups = canCreateGroups || false
      this.canDeleteGroups = canDeleteGroups || false
  }
  static getOwnerAbilities(){
      return new PlatformAbilities(true,true,true,true,true,true)
  }
  static getLecturerAbilities(){
      return new PlatformAbilities()
  }
  static getStudentAbilities(){
      return new PlatformAbilities()
  }
}
