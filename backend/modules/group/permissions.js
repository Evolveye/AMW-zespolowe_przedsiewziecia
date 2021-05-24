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
  constructor( groupId, permissionName, perms = {} ) {
    super( groupId, permissionName, perms )

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
  constructor( groupId, userId, permissionName, perms ) {
    super( groupId, permissionName, perms )

    this.userId = userId
  }

  static createStudentPerm( groupId, userId ) {
    return new GroupUserPermission(groupId, userId, `student`)
  }

  static createOwnerPerm( groupId, userId ) {
    return new GroupUserPermission(
      groupId,
      userId,
      `lecturer`,
      GroupPermission.getOwnerPerm())
  }
}

export class GroupPermissions {
  constructor( groupId, name, color, importance, abilities ) {


    this.id = `${Date.now()}t${Math.random().toString().slice( 2 )}r`
    this.groupId = groupId
    if (!name)
      throw new Error(`name is not provided`)
    this.name = name
    this.color = color ??  null
    this.importance = importance || 5
    this.abilities = abilities || new GroupAbilities()
  }
  static getOwnerPerm = groupId =>
    new GroupPermissions(groupId, `Prowadzący`, 0xF64118, 5, GroupAbilities.getOwnerAbilities())

  static getStudentPerm = groupId =>
    new GroupPermissions(groupId, `Student`, 0x000000, 5, GroupAbilities.getStudentAbilities())

}

export class GroupAbilities {
  constructor( canEditDetails, canDelete, canManageUsers, canManageNotes, canManageMeets, canManageRoles, canManageMaterials, canManageTasks ) {
    this.canEditDetails = canEditDetails  || false
    this.canDelete = canDelete  || false
    this.canManageUsers = canManageUsers  || false
    this.canManageNotes = canManageNotes  || false
    this.canManageMeets = canManageMeets  || false
    this.canManageRoles = canManageRoles  || false
    this.canManageMaterials = canManageMaterials || false
    this.canManageTasks = canManageTasks || false
  }

  static getOwnerAbilities = () => new GroupAbilities(true, true, true, true, true, true, true, true)

  static getStudentAbilities = () => new GroupAbilities()

}

export class ConnectorGroupPermissionToUser {
  constructor( groupId, userId, permissionTemplateId )
  {
    this.id = `${Date.now()}t${Math.random().toString().slice( 2 )}r`
    this.groupId = groupId
    this.userId = userId
    this.permissionTemplateId = permissionTemplateId
  }
}
