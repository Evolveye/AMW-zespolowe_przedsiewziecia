import Permissions from "../permissions.js"

/**
 * @typedef {object} PermissionsFields
 * @property {boolean} isMaster
 * @property {boolean} canManageUsers
 * @property {boolean} canManageNotes
 * @property {boolean} canManageMeets
 */

export default class GroupPermission extends Permissions {
  /**
   * @param {string} userId
   * @param {string} permissionName
   * @param {PermissionsFields} perms
   */
  constructor(groupId, permissionName, perms = {}) {
    super(groupId, permissionName, perms)

 
    this.canManageUsers = perms.canManageUsers ?? false
    this.canManageNotes = perms.canManageNotes ?? false
    this.canManageMeets = perms.canManageMeets ?? false
  }

  static getOwnerPerm()
  {
    return {
      isMaster:true,
      canManageUsers:true,
      canManageMeets:true,
      canManageNotes:true,
    }
  }
}

export class GroupUserPermission extends GroupPermission {
  /**
   * @param {string} userId
   * @param {string} permissionName
   * @param {PermissionsFields} perms
   */
  constructor(groupId, userId, permissionName, perms) {
    super(groupId, permissionName, perms)

    this.userId = userId
  }

  static createStudentPerm(groupId, userId) {
    return new GroupUserPermission(groupId, userId, `student`)
  }




  static createOwnerPerm(groupId, userId) {
   

    return new GroupUserPermission(
      groupId, 
      userId, 
      `lecturer`, 
      GroupPermission.getOwnerPerm())
  }

}