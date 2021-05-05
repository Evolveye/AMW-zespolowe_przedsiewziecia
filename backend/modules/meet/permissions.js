import { generateId } from "../../src/utils.js";
import Permissions from "../permissions.js";

/**
 * @typedef {object} PermissionsFields
 * @property {boolean} isMaster
 * @property {boolean} canManageUsers
 * @property {boolean} canEditDetails
 */

export class MeetPermission extends Permissions {
  /**
   * @param {string} permissionName
   * @param {PermissionsFields} perms
   */
  constructor(meetId, permissionName, perms = {}) {
    super(meetId, permissionName, perms);
    this.canManageUsers = perms.canManageUsers ?? false;
    this.canEditDetails = perms.canEditDetails ?? false;
  }
  static  createOwnerTemplate = (meetId) =>
    new MeetPermission(meetId, `owner`, {
      isMaster: true,
      isPersonel: true,
      canManageUsers: true,
      canEditDetails:true,
    });

 static createStudentTemplate = (meetId) => new MeetPermission(meetId, `student`);
}

export class MeetUserPermission extends MeetPermission {
  /**
   * @param {string} userId
   * @param {string} permissionName
   * @param {PermissionsFields} perms
   */
  constructor(userId, meetId, permissionName, perms) {
    super(meetId, permissionName, perms);

    this.userId = userId;
  }

 static createOwnerPerms = (userId, meetId) =>
    new MeetUserPermission(userId, meetId, `owner`, {
      isMaster: true,
      isPersonel: true,
      canManageUsers: true,
      canEditDetails:true,
    });

 static createStudentPerms = (userId, meetId) =>
    new MeetUserPermission(userId, meetId, `student`);
}


  /**
   * @param {string} userId
   * @param {string} meetId
   * @param {LiveAbilities} abilities
   * @param {LivePermissions} perms
   */
export class LivePermissions{
  constructor(userId,meetId,abilities)
  {
    this.id = generateId()
    this.userId = userId
    this.abilities = (abilities) instanceof LiveAbilities ? abilities : new Error(`Abilities failed.`)
    this.meetId = meetId
  }
}

export class LiveAbilities{
  constructor(canReadChat,canWriteOnChat,canSpeak,canShareVideo,canPaint,canMuteUser,canKickUser)
  {
      this.canReadChat = canReadChat || false
      this.canWriteOnChat = canWriteOnChat || false
      this.canSpeak = canSpeak || false
      this.canShareVideo = canShareVideo || false
      this.canPaint = canPaint || false
      this.canMuteUser = canMuteUser || false
      this.canKickUser = canKickUser || false
  }

  static getLecturerAbilities(){
    return new LiveAbilities(true,true,true,true,true,true,true)
  }

  static getPrezenterAbilities(){
      return new LiveAbilities(true,true,true,true,true,false,false)
  }

  static getStudentAbilities(){
      return new LiveAbilities(true,true,true,true,false,false,false)
  }
}

