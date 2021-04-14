/** @typedef {import("./index.js").MiddlewareParameters} MiddlewareParameters */
import { Grade, Group, Task, File, TaskDone, Scale } from "./models.js";
import dbManager from "../../src/dbManager.js";
import { ANSWERS, MAX_LEN_GROUP_NAME, MAX_LEN_NOTE_DESCRIPTION } from "./consts.js";
import GroupPermission, { ConnectorGroupPermissionToUser, GroupAbilities, GroupPermissions, GroupUserPermission } from "./permissions.js";
import multer from "multer"
import { generateId,isDigit } from "../../src/utils.js";
import filesystem from 'fs/promises'

import { APP_ROOT_DIR } from '../../consts.js'


let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/materials')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

let upload = multer({ storage: storage }).single("myFile");

export async function httpHandleMyPermission({ mod, req, res }) {
  const client = req.user;
  const groupId = req.body.groupId || req.query.groupId || req.params.groupId;
  if (!groupId)
    return res.status(400).send(ANSWERS.MY_PERMISSIONS_NOT_GROUP_ID);

  const groupObj = await mod.getGroupObject(groupId);

  const isMember = mod.isUserAssigned(client.id, groupObj);
  const isOwner = await mod.requiredModules.platformModule.checkUserOwner(
    client.id,
    groupObj.platformId
  );
  if (!isMember && !isOwner)
    return res.status(400).send(ANSWERS.MY_PERMISSIONS_NOT_MEMBER);

  let value = null;
  if (isMember) value = await mod.getGroupPermissions(client.id, groupId);
  else
    value = new GroupUserPermission(
      groupObj.id,
      client.id,
      `platform owner`,
      GroupPermission.getOwnerPerm()
    );

  if (!value) return res.status(400).send(ANSWERS.MY_PERMISSIONS_NOT_FOUND);

  const newPermissions = await mod.getNewGroupPermission(client.id,groupId)

  delete value["_id"];

  return res.json({ permissions: value, newPermissions:newPermissions });
}

export async function httpHandleNoteUpdate({ mod, req, res }) {
  // Edycja oceny /api/groups/notes/:noteId

  if (!req.user.groupPerms.canManageNotes || !req.user.platformPerms.isMaster)
    return req.status(400).json(ANSWERS.NOTE_UPDATE_ROLE_NOT_ALLOWED);

  const noteId = req.params.noteId;
  const { value, description } = req.body;
  const client = req.user;

  if (!value) return res.status(400).json(ANSWERS.NOTE_UPDATE_NOT_VALUE);

  const targetNote = await mod.dbManager.findObject(mod.subcollections.notes, {
    id: { $eq: noteId },
  });

  if (!targetNote)
    return res.status(400).json(ANSWERS.NOTE_UPDATE_NOTE_NOT_EXISTS);

  const group = await mod.getGroupObject(targetNote.groupId);

  const platformId = group.platformId;
  const isAdmin = await mod.requiredModules.platformModule.checkUserOwner(
    client.id,
    platformId
  );

  if (targetNote.lecturer.id != client.id && !isAdmin)
    return res.status(400).json(ANSWERS.NOTE_UPDATE_NOT_ALLOWED);

  if (!description)
    await mod.dbManager.updateObject(
      mod.subcollections.notes,
      { id: { $eq: noteId } },
      { value: value }
    );
  else
    await mod.dbManager.updateObject(
      mod.subcollections.notes,
      { id: { $eq: noteId } },
      { $set: { value: value, description: description } }
    );

  return res.json(ANSWERS.NOTE_UPDATE_SUCCESS);
}

export async function httpHandleMyGroups({ req, res }) {
  // GET Lista grup usera - wszystkie do które należy.
  // /api/groups  // header { "authenthication": "string" }
  const client = req.user;

  const clientGroups = await this.dbManager.findManyObjects(
    this.basecollectionName,
    { membersIds: client.id }
  );

  return res.json({ groups: clientGroups });
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleGroupPerms({ mod, req, res }) {
  const client = req.user;
  const groupId = req.body.groupId || req.query.groupId || req.params.groupId;
  if (!groupId)
    return res.status(400).send(ANSWERS.GET_GROUP_PERMS_NO_GROUP_ID);

  const platformOwnerOfGroup = (
    await dbManager.findOne(
      mod.requiredModules.platformModule.basecollectionName,
      { assignedGroups: groupId }
    )
  ).owner;

  if (platformOwnerOfGroup.id === client.id)
    return res.json({
      permissions: new GroupUserPermission(
        groupId,
        client.id,
        `platform owner`,
        GroupPermission.getOwnerPerm()
      ),
    });

  const isMember = await mod.checkIsUserAssigned(client.id, groupId);
  if (!isMember)
    return res.status(400).send(ANSWERS.GET_GROUP_PERMS_NO_ASSIGNED);

  const value = await mod.getGroupPermissions(client.id, groupId);

  if (!value) return res.status(400).send(ANSWERS.GET_GROUP_PERMS_NOT_FOUND);

  return res.json({ permissions: value });
}

export async function httpHandleAllUsersInGroup({ mod, req, res }) {
  // get all users of group
  // Pobieranie listy użytkowników z grupy /api/groups/:groupId/users
  // GET // header { "authenthication": "string"}
  // body { "users": [  "<User>", ] }

  const groupId = req.params.groupId;
  const client = req.user;
  const targetGroup = await mod.getGroupObject(groupId);

  // if (!client.groupPerms)
  //   return res.status(400).json({ code: 315, error: "You are not allowed to see all users of target group." })

  if (!targetGroup)
    return res.status(400).json(ANSWERS.GET_ALL_GROUP_GROUP_NOT_EXISTS);

  const isMember = mod.isUserAssigned(client.id, targetGroup);

  // // await this.requiredModules.platformModule.checkIsOwner(client.id, targetGroup.platformId)
  await mod.requiredModules.platformModule.includePermsIntoReq(
    req,
    res,
    targetGroup.platformId
  );
  const isAdmin = client.platformPerms.target.isMaster;

  if (!isMember && !isAdmin)
    return res.status(400).json(ANSWERS.GET_ALL_GROUP_NOT_ALLOWED);

  let allUsers = await mod.dbManager.findManyObjects(`userModule`, {
    id: { $in: targetGroup.membersIds },
  });
  allUsers.map(user => { delete user['password'] })

  const allPerms = await mod.dbManager.findManyObjects(
    `groupModule.permissions.users`,
    {
      $and: [
        { referenceId: { $eq: groupId } },
        { userId: { $in: targetGroup.membersIds } },
      ],
    }
  );

  allUsers.forEach(user => user.perms = allPerms.find(perm => perm.userId === user.id))

  return res.json({ users: allUsers });
}

export async function httpHandleDeleteUserFromGroup({ mod, req, res }) {
  // // kasowanie usera z grupy api/groups/:groupId/users/:userId
  // // delete auth

  if (!req.user.groupPerms.canManageUsers)
    return res.status(400).json(ANSWERS.DELETE_USER_NOT_ALLOWED);

  let { groupId, userId } = req.params;
  groupId = req.query.groupId;
  const groupObj = await mod.getGroupObject(groupId);
  const client = req.user;

  if (!groupObj)
    return res.status(400).json(ANSWERS.DELETE_USER_GROUP_NOT_EXISTS);

  if (!mod.isUserAssigned(userId, groupObj))
    return res.status(400).json(ANSWERS.DELETE_USER_GROUP_NOT_MEMBER);

  const platformId = groupObj.platformId;
  const isAdmin = await mod.requiredModules.platformModule.checkUserOwner(
    client.id,
    platformId
  );

  // if (groupObj.lecturer.id != client.id && !isAdmin)
  //   return res.status(400).json({ code: 309, error: "Only Lecturer or Admin can delete a member of group" })

  await mod.dbManager.updateObject(
    mod.basecollectionName,
    { id: { $eq: groupId } },
    { $pull: { membersIds: userId } }
  );

  return res.json(ANSWERS.DELETE_USER_SUCCESS);
}

export async function httpHandleDeleteNote({ mod, req, res }) {
  // Skasowanie oceny /api/groups/notes/:noteId
  // { "authenthication": "string" } // header

  const noteId = req.params.noteId;
  if (!noteId) return res.status(400).json(ANSWERS.DELETE_NOTE_NOTE_ID_MISS);

  const targetNote = await mod.dbManager.findObject(mod.subcollections.notes, {
    id: noteId,
  });

  if (!targetNote) return res.status(400).json(ANSWERS.DELETE_NOTE_NOT_EXISTS);

  const group = await mod.getGroupObject(targetNote.groupId);

  req.params.groupId = group.id;
  // await this.httpAddPermissionsToRequest(req, res)
  // admin nie ma wpisu w groupPermissions.
  if (!req.user.groupPerms.canManageNotes && !req.user.platformPerms.isMaster)
    return res.status(400).json(ANSWERS.DELETE_NOTE_NOT_ALLOWED);

  mod.dbManager.deleteObject(mod.subcollections.notes, { id: { $eq: noteId } });

  res.json(ANSWERS.DELETE_NOTE_SUCCESS);
}

async function httpHandleNotesFromGroupPrivilagesVersion({ mod, req, res }) {
  // wiemy ze user ma manageNotes
  const clinet = req.user;

  const groupId = req.params.groupId;
  const targetGroup = await mod.getGroupObject(groupId);

  if (!targetGroup)
    return res.status(400).json(ANSWERS.GET_NOTES_FROM_GROUP_VER_PRIVILAGES_BAD_GROUP_ID);

  const allNotesFromGroup = await mod.dbManager
    .aggregate(mod.subcollections.notes, {
      pipeline: [
        { $match: { groupId: { $eq: groupId } } },
        {
          $lookup: {
            from: "userModule",
            localField: "userId",
            foreignField: "id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $unset: ["_id", "user._id"] },
      ],
    })
    .toArray();

  return res.status(200).json({ notes: allNotesFromGroup });
}

export async function httpHandleNotesFromGroup({ mod, req, res }) {
  // Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
  //  this.canManageNotes?
  // jesli takn wszystkie noty wszyskitch userów z tej grupy.
  // jenis nie otrzmyna swoje oceny.
  // GET Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
  // { "authenthication": "string" } // header
  // /api/groups/:groupId/notes

  const clinet = req.user;
  const groupId = req.params.groupId;

  if (!groupId)
    return res
      .status(400)
      .json(ANSWERS.GET_NOTES_FROM_GROUP_MISS_GROUP_IDe);

  if (req.user.groupPerms.canManageNotes)
    return await httpHandleNotesFromGroupPrivilagesVersion({ mod, req, res });

  const targetGroup = await mod.getGroupObject(groupId);

  if (!targetGroup)
    return res.status(400).json(ANSWERS.GET_GROUP_NOTES_GROUP_NOT_EXISTS);

  // platformid= targetGroup.platformId
  // const isOwner = req.user.platformPerms.isMaster
  // await this.requiredModules.platformModule.checkUserOwner(clinet.id, targetGroup.platformId)
  const isMember = mod.isUserAssigned(clinet.id, targetGroup);
  // const isLecturer = this.isLecturer(clinet.id, targetGroup)

  if (!isMember)
    return res.status(400).json(ANSWERS.GET_GROUP_NOTES_NOT_ASSIGNED);

  const allNotesFromGroup = await mod.dbManager
    .aggregate(mod.subcollections.notes, {
      pipeline: [
        {
          $match: {
            $and: [
              { groupId: { $eq: groupId } },
              { userId: { $eq: clinet.id } },
            ],
          },
        },
        {
          $lookup: {
            from: "userModule",
            localField: "userId",
            foreignField: "id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $unset: ["_id", "user._id"] },
      ],
    })
    .toArray();

  // wszysztkie oceny które sa przypisane do grupy.
  // const allNotes = await mod.dbManager.findManyObjects(
  //   mod.subcollections.notes,
  //   { groupId: groupId })

  // const users = new Map()
  // const usersIds = new Set()
  // const notes = allNotes.filter(
  //   note => note.userId === clinet.id
  // )

  // notes.forEach(({ userId }) => usersIds.add(userId))

  // for (const id of usersIds) {
  //   const userObj = await mod.requiredModules.userModule.getUserById(id)
  //   users.set(userObj.id, userObj)
  // }

  // const notesWithUsers = notes.map(note => {
  //   const newNote = {
  //     user: users.get(note.userId),
  //     ...note
  //   }

  //   delete newNote.userId

  //   return newNote
  // })

  //const notes = await this.getAllUserNotesInGroup(groupId, clinet.id).then(cursor => cursor.toArray())

  return res.json({ notes: allNotesFromGroup });
}

export async function httpCreateNote({ mod, req, res }) {
  // Stworzenie oceny /api/groups/:groupId/notes/
  // POST { "authenthication": "string" } // header
  // { "value": "string","description": "string" }

  if (!req.user.groupPerms.canManageNotes && !req.user.platformPerms.isMaster)
    return res.status(400).json(ANSWERS.CREATE_NOTE_NOT_ALLOWED);

  const groupId = req.params.groupId;
  const { value, description, userId } = req.body;

  if (!value || !userId)
    return res.status(400).json(ANSWERS.CREATE_NOTE_DATA_NOT_PROVIDED)

  if (description > MAX_LEN_NOTE_DESCRIPTION)
    return res.status(400).json(ANSWERS.CREATE_NOTE_BAD_DESCRIPTION_LEN)

  if (isNaN(Number(value)))
    return res.status(400).json(ANSWERS.CREATE_NOTE_VALUE_NOT_NUMBER)



  const client = req.user;

  delete client.groupPerms;
  delete client.platformPerms;

  /**@type {Grade} */
  const note = new Grade(userId, client, value, groupId, { description });

  const targetGroup = await mod.getGroupObject(groupId);

  if (!targetGroup)
    return res.status(400).json(ANSWERS.CREATE_NOTE_GROUP_NOT_EXISTS);

  if (!mod.isUserAssigned(userId, targetGroup))
    return res.status(400).json(ANSWERS.CREATE_NOTE_NOT_MEMBER);

  // const isAdmin = await this.requiredModules.platformModule.checkUserOwner(lecturer.id, targetGroup.platformId)

  // if (!(this.isLecturer(lecturer.id, targetGroup) || isAdmin))
  //   return res.status(400).json({ code: 304, error: "Only lecturer or Admin can create an new notes." })

  if (targetGroup.lecturer.id === userId)
    return res.status(400).json(ANSWERS.CREATE_NOTE_CANT_FOR_TEACHER);

  await mod.saveNote(note);
  note.user = await mod.requiredModules.userModule.getUserById(userId)
  delete note['userId']
  delete note.user['password']

  return res.json({ note });
}

export async function httpGetAllMyNotes({ mod, req, res }) {
  // TODO this.canManageNotes?
  // GET Pobranie WSZYSTKICH ocen użytkownika
  // { "authenthication": "string" } // header
  // /api/groups/notes { "authenthication": "string" } // header

  // nie ma roli -> oceny usera
  // mam -> wszyskie user + te co wystawilem.

  const client = req.user;

  const groupsInPlatforms = {};
  const notesInGroups = {};

  const userPlatforms = await mod.requiredModules.platformModule.getAllUserPlatforms(
    client.id
  );

  /** @type {Group[]} */
  const userGroups = await mod.getAllUserGroups(client.id);

  let data = null;

  //if (req.user.groupPerms.canManageNotes || req.user.platform.isMaster) {
  // let masterNotes = client.groupPerms.canManageNotes ?
  //  await mod.getAllNotesFromPlatform(group.id)

  let userNotes = await mod.dbManager
    .find(
      // wszystkie oceny z lecturerId or userId.
      mod.subcollections.notes,
      {
        $or: [{ "lecturer.id": client.id }, { userId: client.id }],
      }
    )
    .toArray();

  //const userNotes = await this.getAllUserNotes(client.id).then(cur => cur.toArray())

  userPlatforms.forEach(
    (platform) =>
    (groupsInPlatforms[platform.id] = {
      platform,
      groups: [],
    })
  );

  userGroups.forEach(
    (group) =>
    (notesInGroups[group.id] = {
      group,
      notes: [],
    })
  );

  for (const note of userNotes) {
    note.user = await mod.requiredModules.userModule.getUserById(note.userId);
    delete note.userId;
  }

  userNotes.forEach((note) => notesInGroups[note.groupId].notes.push(note));

  Object.values(notesInGroups).forEach((value) => {
    groupsInPlatforms[value.group.platformId].groups.push(value);
  });

  data = Object.values(groupsInPlatforms);

  return res.json({ data, userId: client.id });
}

export async function httpHandleAllGroupsInPlatform({ mod, req, res }) {
  const user = req.user;
  const isMaster = user.platformPerms.isMaster;
  const targetPlatform = req.params.platformId;
  const platformObj = await mod.requiredModules.platformModule.getPlatform(
    targetPlatform
  );

  if (!platformObj)
    return res
      .status(400)
      .json(ANSWERS.GET_ALL_PLATFORM_GROUPS_PLATFORM_NOT_EXISTS);

  const isMember = platformObj.membersIds.some((id) => id == user.id);

  if (!isMaster && !isMember)
    return res.status(400).json(ANSWERS.GET_ALL_PLATFORM_GROUPS_NOT_ALLOWED);

  // console.log(`groups`, isMaster, targetPlatform, user);
  // const isOwner = this.requiredModules.platformModule.isPlatformOwner(user.id, platformObj)

  let groups = null;
  //   isOwner ? await this.getAllGroupsFromPlatform(targetPlatform)
  //     : await this.getAllGroupsFromPlatformWithMemberId(user.id, targetPlatform)

  groups = isMaster
    ? await mod.getAllGroupsFromPlatform(targetPlatform)
    : await mod.getAllGroupsFromPlatformWithMemberId(user.id, targetPlatform);

  return res.json({ groups });
}

export async function httpDeleteGroup({ mod, req, res }) {
  // DELETE Kasowanie grupy /api/groups/:groupId   { "authenthication": "string" } // header

  // oceny, spotkania ,permisje template/users

  if (!req.user.platformPerms.canManageGroups)
    return res.status(200).json(ANSWERS.DELETE_GROUP_NOT_ALLOWED);

  // /** @type {import("../user/index.js").default} */
  // const userMod = this.requiredModules.userModule
  // /** @type {import("../platform/index.js").default} */
  // const platformMod = this.requiredModules.platformModule

  const { groupId } = req.params;

  if (!(await mod.groupExist(groupId)))
    return res.status(400).json(ANSWERS.DELETE_GROUP_GROUP_NOT_EXISTS);

  // if (!(await platformMod.checkUserOwner(req.user.id, platformId)))
  //   return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })

  await mod.dbManager.deleteObject(mod.basecollectionName, {
    id: { $eq: groupId },
  });
  await mod.dbManager.deleteMany(mod.subcollections.notes, {
    groupId: { $eq: groupId },
  });
  await mod.dbManager.deleteMany(mod.subcollections.templatePermissions, {
    referenceId: { $eq: groupId },
  });
  await mod.dbManager.deleteMany(mod.subcollections.userPermissions, {
    referenceId: { $eq: groupId },
  });

  return res.json(ANSWERS.DELETE_GROUP_SUCCESS);
}

export async function httpAddGroupMember({ mod, req, res }) {
  // TODO: Permisje name

  /** @type {import("../user/index.js").default} */
  const userMod = mod.requiredModules.userModule;
  /** @type {import("../platform/index.js").default} */
  const platformMod = mod.requiredModules.platformModule;

  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

  // let usersIds = req.body.usersIds
  let usersIds = req.body.usersIds ?? req.body.userId;

  if (!Array.isArray(usersIds)) usersIds = [usersIds];

  if (!req.user.groupPerms.canManageUsers)
    return res.status(400).json(ANSWERS.ADD_GROUP_MEMBER_NOT_ALLOWED);

  const groupObj = await mod.getGroupObject(groupId);

  if (!groupObj)
    return res.status(400).json(ANSWERS.ADD_GROUP_MEMBER_GROUP_NOT_EXISTS);

  const platformObj = await mod.requiredModules.platformModule.getPlatform(
    groupObj.platformId
  );

  // const platformOwner = platformMod.isPlatformOwner(req.user.id, platformObj);
  // const groupLecturer = groupObj.lecturer.id == req.user.id;

  // if (!platformOwner && !groupLecturer)
  //   return res.status(400).json(ANSWERS.ADD_GROUP_MEMBER_NOT_LECTURER_OWNER);

  let positiveIds = usersIds.filter((id) =>
    platformObj.membersIds.some((member) => member === id)
  );
  positiveIds = positiveIds.filter((id) =>
    groupObj.membersIds.every((memberId) => memberId !== id)
  ); // przefiltruj wszystkich którzy sa juz dopisani.

  if (positiveIds.length <= 0)
    return res.json(ANSWERS.ADD_GROUP_MEMBER_ALREADY_ADDED);

  const updateTask = mod.dbManager.updateObject(
    mod.basecollectionName,
    { id: { $eq: groupId } },
    { $push: { membersIds: { $each: positiveIds } } }
  );

  const tasks = [];
  tasks.push(updateTask);

  positiveIds.forEach((id) => {
    //BUG: 2 permisje zapisuje ?
    const userPerm = GroupUserPermission.createStudentPerm(groupId, id);
    tasks.push(mod.saveGroupPermissions(userPerm));
  });

  await Promise.all(tasks);
  const asssignedUsers = await Promise.all(
    positiveIds.map((id) => mod.requiredModules.userModule.getUserById(id))
  );


  const connector = new ConnectorGroupPermissionToUser(groupId,req.body.userId,req.body.permissionId)
  await mod.saveNewGroupPermissionConnector(connector)

  const success = ANSWERS.ADD_GROUP_MEMBER_SUCCESS;
  const returndata = { data: asssignedUsers, ...success };

  if (positiveIds.length !== usersIds.length)
    return res.json(ANSWERS.ADD_GROUP_MEMBER_PARTLY_SUCCESS);

  return res.json(returndata);
}

export async function httpCreateGroup({ mod, req, res }) {
  if (!req.user.platformPerms.canManageGroups)
    return res.status(400).json(ANSWERS.CREATE_GROUP_NOT_ALLOWED);

  /** @type {import("../user/index.js").default} */
  const userMod = mod.requiredModules.userModule;
  /** @type {import("../platform/index.js").default} */
  const platformMod = mod.requiredModules.platformModule;

  const { name, lecturerId, platformId } = req.body;
  const client = req.user;

  if (!name || !lecturerId || !platformId)
    return res.status(400).json(ANSWERS.CREATE_GROUP_DATA_MISS);

  if (name.length > MAX_LEN_GROUP_NAME)
    return res.status(400).json(ANSWERS.CREATE_GROUP_BAD_NAME_LEN)

  if (!(await platformMod.platformExist(platformId)))
    return res
      .status(400)
      .json(ANSWERS.CREATE_GROUP_PLATFROM_NOT_EXISTS);

  if (await mod.checkIsGroupDuplicate(platformId, name))
    return res.status(400).json(ANSWERS.CREATE_GROUP_DUPLICATE);

  const { password, login, activated, avatar, createdDatetime, ...lecturerObj } = await userMod.getUserById(lecturerId);


  const oldPerms = await platformMod.getPermissions(platformId, lecturerId);
  if (oldPerms.name === `student`) {
    // tylko studentowi zmieniamy permissje.
    await mod.requiredModules.platformModule.updatePlatformPermissions(
      { referenceId: { $eq: platformId }, userId: { $eq: lecturerId } },
      { $set: { name: "lecturer", isPersonel: true } }
    );
  }

  let group = new Group(name, lecturerObj, platformId);
  group.membersIds.push(lecturerObj.id);

  const ownerPerms = GroupUserPermission.createOwnerPerm(
    group.id,
    lecturerObj.id
  );

  const studentTemplate = new GroupPermission(group.id, `student`);
  const ownerTemplate = new GroupPermission(
    group.id,
    `lecturer`,
    GroupPermission.getOwnerPerm()
  );

  await mod.dbManager.insertObject(
    mod.subcollections.userPermissions,
    ownerPerms
  );
  await mod.dbManager.insertObject(
    mod.subcollections.templatePermissions,
    studentTemplate
  );
  await mod.dbManager.insertObject(
    mod.subcollections.templatePermissions,
    ownerTemplate
  );

  const groupScale = new Scale(group.id,[1,2,3,4,5])
  await mod.dbManager.insertObject(mod.subcollections.scale,groupScale)

  await mod.saveGroup(group);

  await platformMod.updatePlatform(
    { id: { $eq: platformId } },
    { $push: { assignedGroups: group.id } }
  );

  const newOwnerPerms = GroupPermissions.getOwnerPerm(group.id)
  const newStudentPerms = GroupPermissions.getStudentPerm(group.id)
  const connectorForOwner = new ConnectorGroupPermissionToUser(group.id,req.user.id,newOwnerPerms.id)

  await mod.saveNewGroupPermissionTemplate(newOwnerPerms)
  await mod.saveNewGroupPermissionTemplate(newStudentPerms)
  await mod.saveNewGroupPermissionConnector(connectorForOwner)

  return res.status(200).json({ group });
}

export async function httpGetTemplatePermissions({ mod, req, res }) {
  const client = req.user;
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

  console.log({groupId})

  if (!groupId)
    return res
      .status(400)
      .json(ANSWERS.GET_TEMPLATE_PERMS_MISS_GROUP_ID);

  const groupObj = await mod.getGroupObject(groupId);
  const member = mod.isUserAssigned(client.id, groupObj);

  //tutaj dodac platform perms aby spr czy Master.
  await mod.requiredModules.platformModule.includePermsIntoReq(
    req,
    res,
    groupObj.platformId
  );

  //await mod.requiredModules.platformModule.perms( req, res ,"group id" )

  if (!client.platformPerms.isMaster && !member)
    return res.status(400).json(ANSWERS.GET_TEMPLATE_PERMS_NOT_ALLOWED);

  const permissionList = await mod.getAllTemplatePerms(groupId);
  const newperms = await mod.getAllPermissionsTemplateFromGroup(groupId);
  console.log({ permissions: newperms, oldPerms:permissionList })

  // TODO: NOWE PERMISJE + STARE PERMISJE
  return res.json({ permissions: newperms, oldPerms:permissionList });
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleDeleteFile({ mod, req, res }) {
  // where will be file name/ file path
  const fileToDelete = req.params.materialId || req.body.materialId || req.query.materialId;

  console.log({ fileToDelete })
  // fileDoc = await mod.dbManager.findOne(`materials`,{id:{$eq:fileToDelete}});
  const fileDoc = await mod.dbManager.findOneAndDelete(`materials`, { id: { $eq: fileToDelete } });

  console.log({ path: fileDoc.value.path })
  let fileExists = true;
  // fs.access(fileToDelete,(err)=>{
  //   console.log(err);
  //   fileExists=false;
  // })

  const fullFilePath = APP_ROOT_DIR + `/` + fileDoc.value.path

  console.log({ fullFilePath })
  fileExists = await new Promise(async (resolve, reject) => {
    try {
      await filesystem.access(fullFilePath)
      console.log(`access OK`)
      resolve(true)
    }
    catch (exception) {
      console.log(`access ERR`)
      reject(exception)
    }
  })
  console.log(`EXISTS`, { fileExists })
  if (!fileExists)
    res.json({ code: 88888, error: `File ${fullFilePath} not found` })

  await filesystem.unlink(fullFilePath)

  console.log(`Succesfuly deleted file`);
  return res.json({ code: 99999, success: `file ${fullFilePath} has been deleted` });

}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleAllFilesInGroup({ mod, req, res }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const colllectionOfFiles = await dbManager.findManyObjects(`materials`, { groupId: { $eq: groupId } })
  // <button url src = colllectionOfFiles[0].path> kiliknij aby pobrac </buittpon>

  // colllectionOfFiles.forEach( f => f.filePath = `/materials/${f.filePath}`)
  // console.log({colllectionOfFiles})

  return res.json({ fileDataset: (colllectionOfFiles || []) });
}

/** @param {MiddlewareParameters} param0 */
export async function httpAddFile({ mod, req, res, next }) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) console.log(`Please upload a file: ${err}`)
    else if (err) console.log(`Unknown error: ${err}`)

    const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
    const file = req.file;
    //console.log(req.file, req.files);

    console.log(file)

    const { mimetype, filename, path } = req.file

    let finalFile = new File(mimetype, filename, path, req.body.description, groupId, req.user)
    // finalFile = {
    //   contentType: req.file.mimetype,
    //   name: req.file.filename,
    //   path: req.file.path,
    //   dateUpload: Date.now(),
    //   description: req.body.description,
    //   groupId: groupId,
    //   user: req.user,
    //   id: generateId(),
    // };
    mod.dbManager.insertObject(mod.subcollections.materials, finalFile).then((res, rej) => {  // BUG:
      //console.log(res);

      if (rej) return console.log(rej);

      console.log("saved to database"); //
    })

    res.json({ fileData: finalFile })
  });
}


/** @param {MiddlewareParameters} param0 */
export async function httpCreateTask({ mod, req, res, next }) {
  // 2 tabele ?
  // 1 na zadania  idgryop/ idzad /
  // 2 oddane prace id / idzad / osoba / data oddania /

  // if(!req.user.platformPerms.canTeach)
  // return res.json({code:420,error:"Create task require canTeach-platform-permission"})

  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

  const { title, description, expireDate, type, mandatory } = req.body

  const t = new Task(title, description, groupId, expireDate, req.user, type, mandatory)

  await mod.dbManager.insertObject(mod.subcollections.tasks, t)


  return res.json({ task: t, ...ANSWERS.TASK_CREATE_SUCCESS })
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetAllGroupTasks({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

  const t = await mod.dbManager.findManyObjects(mod.subcollections.tasks, { groupId: { $eq: groupId } })
  return res.json({ tasks: (t || []) })
}

/** @param {MiddlewareParameters} param0 */
export async function httpDoneTask({ mod, req, res, next }) {
  // tutaj będzie upload pliku jakiegos.
  // zdobadz id pliku
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const taskId = req.params.taskId || req.body.taskId || req.query.taskId;
  const file = req.file;

  upload(req, res, async function(err){
    if(err instanceof multer.MulterError) console.log(`Please upload a file ${err}`)
    else if (err) console.log(`Unknow error : ${err}`)

    const { mimetype, filename, path } = req.file
    //console.log(req.file, req.files)
    const finalFile = new File(mimetype, filename, path, req.body.description, groupId, req.user)
    const td = new TaskDone(taskId, req.user, finalFile.path,finalFile.description, req.file.filename, finalFile.id)

    await mod.dbManager.insertObject(mod.subcollections.materials, finalFile)
    await mod.dbManager.insertObject(mod.subcollections.tasksDone, td)
    return res.json({ task: td, fileData: finalFile, ...ANSWERS.TASK_DONE_SUCCESS })
  });
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetAllTasksDone({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const taskId = req.params.taskId || req.body.taskId || req.query.taskId;

  const tasksArr = await mod.dbManager.findManyObjects(mod.subcollections.tasksDone, { taskId: { $eq: taskId } })
  console.log(tasksArr)
  return res.json({ tasks: (tasksArr || []) })
}


/** @param {MiddlewareParameters} param0 */
export async function HttpHandleDeleteTask({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const taskId = req.params.taskId || req.body.taskId || req.query.taskId;

  const doneTasks = await mod.dbManager.findManyObjects(mod.subcollections.tasksDone, { taskId: { $eq: taskId } })

  const filesPath = doneTasks.map(task => task.filepath)

  const fullFilePath = (relpath) => APP_ROOT_DIR + `/` + relpath

  filesPath.map(path => filesystem.unlink(fullFilePath(path))) // delete from drive

  const promises = [
    mod.dbManager.deleteMany(mod.subcollections.tasksDone, { taskId: { $eq: taskId } }), // from  tasks in db
    mod.dbManager.deleteMany(mod.subcollections.materials, { path: { $in: filesPath } }), // from files in db
    mod.dbManager.deleteObject(mod.subcollections.tasks, { id: { $eq: taskId } })
  ]

  await Promise.all(promises)

  //const tasksArr = await mod.dbManager.findManyObjects(mod.subcollections.tasksDone,{taskId:{$eq:taskId}})
  return res.json(ANSWERS.TASK_DELETE_SUCCESS)
}

/** @param {MiddlewareParameters} param0 */
export async function httpChangeScale({ mod, req, res, next }){
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  /** @type {string} */
  let newScale = req.body.gradingScale

  /** @type {string[]} */
  let grades = newScale.split(`,`)
  if(!grades.every(item=> isDigit(item)))
  return res.status(400).json(ANSWERS.GRADES_NOT_INT)

  grades = grades.map(item=> parseInt(item))
  newScale = new Scale(groupId,grades)

  await mod.dbManager.updateObject(mod.subcollections.scale,{groupId:{$eq:groupId}},{ $set: {grades:grades}})
  return res.json(ANSWERS.GRADES_UPDATED_SUCCESS)
}

export async function httpGetGroupScale({ mod, req, res, next })
{
  if(!req.user.canTeach)
  return res.status(400).json(ANSWERS.GET_GRADES_NOT_ALLOWED)

  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

  const scale = await mod.dbManager.findObject(mod.subcollections.scale,{groupId:{$eq:groupId}})

  return res.json({...ANSWERS.GET_GRADES_SUCCESS,scale:scale.grades})
}


export function httpGetGroupPermissionAbilities({ mod, req, res, next }) {
  return res.json(new GroupAbilities())
}

export async function httpCreateGroupPermissions({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const permissionObject = req.body
  const newPerms = new GroupPermissions(groupId,permissionObject.name,permissionObject.color,
    permissionObject.importance,permissionObject.abilities)

  await mod.saveNewGroupPermissionTemplate(newPerms)

  return res.status(200).json({...ANSWERS.CREATE_GROUP_PERMISSION_SUCCESS,perms:newPerms})
}

export async function httpGetNewTemplatePermissions({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

  const permissions =  await mod.getAllPermissionsTemplateFromGroup(groupId)

  return res.status(200).json({perms:permissions})
}

export async function httpAssignUserToPermission({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const userId = req.body.userId
  const permissionId = req.body.permissionId

  const connector = new ConnectorGroupPermissionToUser(groupId,userId,permissionId)

  await mod.saveNewGroupPermissionConnector(connector)

  return res.status(200).json(ANSWERS.ASSIGN_PERMISSION_TO_USER_SUCCESS)
}


export async function httpUpdateGroupPermissions({ mod, req, res })
{
  console.log("httpUpdateGroupPermissions --> ")
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  const arrayOfPermissions = req.body.array

  const updateTasks = arrayOfPermissions.map(perms => {
    const abilities = Object.entries( perms.abilities )
      .map( ([ability, bool]) => ({ field:`abilities.${ability}`, value:bool }) )
      .reduce( (obj, { field,value }) => ({ [field]:value, ...obj }), {} )

    return mod.updateGroupPermissions(perms.name,groupId,abilities).then( ({ value }) => value )
   } )

  const newPerms = await Promise.all(updateTasks)

  return res.json({...ANSWERS.UPDATE_PERMISSIONS_SUCCESS,perms:newPerms})
}

// export async function ({mod,req,res,next}){
//   const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
//   const permsName = req.body.name
//   const newAbs = req.body.abilities

//   await mod.updateGroupPermissions(permsName,groupId,newAbs)

// }