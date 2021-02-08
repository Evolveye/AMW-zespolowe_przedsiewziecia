<<<<<<< HEAD
import { Logger } from 'mongodb'
import Module from '../baseModule.js'

/**
 * @typedef {Object} Group
 * @property {string} boss
 * @property {string} name
 */
export default class groupModule extends Module {

    /**
     * 
     * @param {string} name new Group name
     * @param {string} headId 
     */

    getGroups()
    {
        // /api/platforms/id:number/groups

        idPlatform = id;
        groups = db.find('platforms',id)
        return groups
    }


    createGroup(name,headId)
    {
        


        throw new Error("create group not defined yet.")
    }

    getGroup(groupId)
    {
        throw new Error("get group not defined yet.")
    }

    getUsers(groupId) {
        throw new Error("get users group not defined yet.")
    }


    /**
     * @param {string} userId an  User Id of new group member.
     */
    addUser(groupId, userId) {/* make db collection */
        throw new Error("add user group not defined yet.")
    }

    /**
     * @param {string} userId an id of wanted user
     */
    containUser(groupId, userId) {
        throw new Error("contain user group not defined yet.")
        return this.#users.some(u => u.id == userId)
    }

    /**
     * @param {string} groupId an id of group
     * @param {string} userId an id of specyfic user
     */
    deleteUser(groupId, userId) {
        throw new Error("delete user group not defined yet.")
        this.#users = this.#users.filter(u => u.id != userId)
    }

    /**
     * 
     * @param {string} groupId an id of group
     */
    deleteGroup(groupId) { throw new Error("Cannot delete group yet.") }

}
=======
import Module from "../module.js";

import GroupPermission, { GroupUserPermission } from "./permissions.js";

import * as middlewares from "./middlewares.js";

/**
 * @typedef {object} MiddlewareParameters
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 * @property {GroupModule} mod
 */

export default class GroupModule extends Module {
  static requiredModules = [`UserModule`, `PlatformModule`];
  subcollections = {
    notes: `notes`,
    templatePermissions: `permissions`,
    userPermissions: `permissions.users`,
  };

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {}
  getApi() {
    /** @type {import("../user/index.js").default} */
    const userModule = this.requiredModules.userModule;
    const auth = userModule.auth;
    const pPerms = this.requiredModules.platformModule.perms;
    const m = middlewares;

    return new Map([
      [
        `/groups`,
        {
          get: auth(this.runMid(m.httpHandleMyGroups)),
          post: auth(pPerms(this.runMid(m.httpCreateGroup))),
        },
      ],

      [
        `/groups/notes`,
        {
          get: auth(this.runMid(m.httpGetAllMyNotes)),
        },
      ],

      [
        `/groups/platform/:platformId`,
        {
          get: auth(pPerms(this.runMid(m.httpHandleAllGroupsInPlatform))),
        },
      ],

      [
        `/groups/:groupId/users`,
        {
          get: auth(this.perms(this.runMid(m.httpHandleAllUsersInGroup))),
          post: auth(pPerms(this.perms(this.runMid(m.httpAddGroupMember)))),
        },
      ],

      [
        `/groups/:groupId/users/:userId`,
        {
          delete: auth(
            this.perms(this.runMid(m.httpHandleDeleteUserFromGroup))
          ),
        },
      ],

      [
        `/api/groups/:groupId`,
        {
          delete: auth(pPerms(this.perms(this.runMid(m.httpDeleteGroup)))),
        },
      ],

      [
        `/groups/:groupId/notes`,
        {
          get: auth(this.perms(this.runMid(m.httpHandleNotesFromGroup))),
          post: auth(pPerms(this.perms(this.runMid(m.httpCreateNote)))),
        },
      ],

      [
        `/groups/notes/:noteId`,
        {
          delete: auth(this.perms(this.runMid(m.httpHandleDeleteNote))),
          put: auth(this.perms(this.runMid(m.httpHandleNoteUpdate))),
        },
      ],

      [
        `/groups/permissions`,
        {
          get: auth(this.runMid(m.httpHandleGroupPerms)),
        },
      ],

      [
        `/groups/:groupId/permissions/my`,
        {
          get: auth(this.runMid(m.httpHandleMyPermission)),
        },
      ],

      [
        `/groups/:groupId/permissions/:permissionId`,
        {
          delete: auth(this.runMid(m.httpDeletePermission)), // TODO this.httpDeletePermission
          put: auth(this.runMid(m.httpEditPermission)), // TODO this.httpEditPermission
        },
      ],

      [
        `/groups/:groupId/permissions`,
        {
          get: auth(this.perms(this.runMid(m.httpGetTemplatePermissions))),
          post: auth(this.runMid(m.httpCreatePermissions)), // TODO this.httpCreatePermissions
        },
      ],
    ]);
  }

  


  perms = (cb) => async (req, res, next) => {
    const groupId =
      (req.query.groupId || req.params.groupId || req.body.groupId) ?? null;

    if (!groupId)
      return res
        .status(400)
        .json({
          code: 311,
          error: `Cannot assign your role in PE system, because groupId is not provided.`,
        });

    const perms = await this.dbManager.findOne(
      this.subcollections.userPermissions,
      {
        $and: [
          { userId: { $eq: req.user.id } },
          { referenceId: { $eq: groupId } },
        ],
      }
    );

    if (!perms) {
      const groupMember = await this.checkIsUserAssigned(req.user.id, groupId);

      let isPlatformOwner = false;
      if (!groupMember) {
        // pobrac permisje ownera z platformy tej grupy.
        const plat = await this.requiredModules.platformModule.getPlatformByGroupId(
          groupId
        );

        if (plat.owner.id == req.user.id) isPlatformOwner = true;
        else
          return res
            .status(400)
            .json({
              code: 314,
              error: `You are not a member of target group, Cannot create/assign permissions.`,
            });
      }

      // TODO: FIX, double position in
      const permissions = isPlatformOwner
        ? new GroupPermission(groupId, `lecturer`, {
            isMaster: true,
          }).getProxy()
        : new GroupPermission(groupId, `student`).getProxy();

      req.user.groupPerms = permissions;
      req.user.groupPerms.groupId = groupId;
      const obj = permissions.target;

      if (!isPlatformOwner)
        await this.dbManager.insertObject(
          this.subcollections.userPermissions,
          obj
        );
    } else {
      req.user.groupPerms = new GroupPermission(
        groupId,
        perms.name,
        perms
      ).getProxy()
    }
    cb(req, res, next)
  }


  saveGroupPermissionsArr = (arrayOfPerms) => {
    const tasks = []
    arrayOfPerms.forEach((permission) => {
      tasks.push(this.saveGroupPermissions(permission))
    });
    return Promise.all(tasks)
  }


  saveGroupPermissions = (perm) => {
    if (perm instanceof GroupUserPermission)
      return this.dbManager.insertObject(
        this.subcollections.userPermissions,
        perm
      );
    else if (perm instanceof GroupPermission)
      return this.dbManager.insertObject(
        this.subcollections.templatePermissions,
        perm
      )
    else throw new Error(`permission save refused.`)
  }


  saveGroup = (group) =>
    this.dbManager.insertObject(this.basecollectionName, group)


  saveNote = (note) =>
    this.dbManager.insertObject(this.subcollections.notes, note)


  groupExist = (groupId) =>
    this.dbManager.objectExist(this.basecollectionName, {
      id: { $eq: groupId },
    });


  isLecturer = (userId, groupObj) => groupObj.lecturer.id === userId;


  getAllUserGroups = (userId) =>
    this.dbManager.findManyObjects(this.basecollectionName, {
      membersIds: { $in: [userId] },
    });


  getGroupObject = (groupId) =>
    this.dbManager.findObject(this.basecollectionName, {
      id: { $eq: groupId },
    });


  getAllPlatformGroups = (platformId) =>
    this.dbManager.findManyObjects(this.basecollectionName, {
      platformId: { $eq: platformId },
    });


  getAllUserNotes = (userId) =>
    this.dbManager.findManyObjects(this.subcollections.notes, {
      userId: { $eq: userId },
    });


  getAllUserNotesInGroup = (groupId, userId) =>
    this.dbManager.findManyObjects(this.subcollections.notes, {
      userId: { $eq: userId },
      groupId: { $eq: groupId },
    });

  isUserAssigned = (userId, groupObj) =>
    groupObj.membersIds.some((id) => id === userId);

  checkIsUserAssigned = async (userId, groupId) => {
    const groupObj = await this.getGroupObject(groupId);
    return this.isUserAssigned(userId, groupObj);
  };

  checkIsGroupDuplicate =async (platformId,groupName)=>
  {
   const groups= await this.getAllGroupsFromPlatform(platformId)
   return groups.some(group => group.name === groupName)
  }

  getAllTemplatePerms = (groupId) =>
    this.dbManager.findManyObjects(this.subcollections.templatePermissions, {
      referenceId: { $eq: groupId },
    });

  getAllGroupsFromPlatform = async (platformId) =>
    await this.dbManager.findManyObjects(this.basecollectionName, {
      platformId: { $eq: platformId },
    });

  getGroupPermissions = (userId, groupId) => {
    return this.dbManager.findOne(this.subcollections.userPermissions, {
      referenceId: { $eq: groupId },
      userId: { $eq: userId },
    });
  };

  getAllGroupsFromPlatformWithMemberId = async (memberId, platformId) =>
    await this.dbManager.findManyObjects(this.basecollectionName, {
      $and: [
        { platformId: { $eq: platformId } },
        { membersIds: { $in: [memberId] } },
      ],
    });

  toString() {
    return "GroupModule";
  }

  static toString() {
    return "GroupModule";
  }
}
>>>>>>> origin/dev-backend-node
