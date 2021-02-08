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