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

export class GroupPermissions{
  constructor(name,color,importance,abilities) {
    this.name = name || `Anonymous`
    this.color = color ||  0xFFFFFF
    this.importance = importance || 0
    this.abilities = abilities || new GroupAbilities()
  }
}

export class GroupAbilities {
  constructor(canEditDetails,canDelete,canManageUsers,canManageNotes,canManageMeets,canManageRoles){
    this.canEditDetails = canEditDetails  || false
    this.canDelete = canDelete  || false
    this.canManageUsers = canManageUsers  || false
    this.canManageNotes = canManageNotes  || false
    this.canManageMeets = canManageMeets  || false
    this.canManageRoles = canManageRoles  || false
  }
}