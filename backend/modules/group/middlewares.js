/** @typedef {import("./index.js").MiddlewareParameters} MiddlewareParameters */
import { Grade, Group, Task, File, TaskDone, Scale } from "./models.js"
import dbManager from "../../src/dbManager.js"
import { ANSWERS, MAX_LEN_GROUP_NAME, MAX_LEN_NOTE_DESCRIPTION, MAX_LEN_TASK_DESCRIPTION } from "./consts.js"
import GroupPermission, { ConnectorGroupPermissionToUser, GroupAbilities, GroupPermissions, GroupUserPermission } from "./permissions.js"
import multer from "multer"
import { generateId, isDigit } from "../../src/utils.js"
import fs from 'fs'

import { APP_ROOT_DIR } from '../../consts.js'


let storage = multer.diskStorage({
  destination( req, file, cb ) {
    cb( null, `uploads/materials` )
  },
  filename( req, file, cb ) {
    cb( null, Date.now() + `-` + file.originalname )
  },
})

let upload = multer({ storage:storage }).single( `document` )

/** @param {MiddlewareParameters} param0 */
export async function httpHandleMyPermission({ mod, req, res }) {
  const client = req.user
  const groupId = req.body.groupId || req.query.groupId || req.params.groupId
  if (!groupId)
    return res.status( 400 ).send( ANSWERS.MY_PERMISSIONS_NOT_GROUP_ID )

  const groupObj = await mod.getGroupObject( groupId )

  const isMember = mod.isUserAssigned( client.id, groupObj )
  const isOwner = await mod.requiredModules.platformModule.checkUserOwner(
    client.id,
    groupObj.platformId,
  )
  if (!isMember && !isOwner)
    return res.status( 400 ).send( ANSWERS.MY_PERMISSIONS_NOT_MEMBER )

  let value = null
  if (isMember) value = await mod.getGroupPermissions( client.id, groupId )
  else
    value = new GroupUserPermission(
      groupObj.id,
      client.id,
      `platform owner`,
      GroupPermission.getOwnerPerm(),
    )

  if (!value) return res.status( 400 ).send( ANSWERS.MY_PERMISSIONS_NOT_FOUND )

  const newPermissions = await mod.getNewGroupPermission( client.id, groupId )

  delete value[ `_id` ]

  return res.json({ permissions:value, newPermissions:newPermissions })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleNoteUpdate({ mod, req, res }) {
  // Edycja oceny /api/groups/notes/:noteId

  if (!req.user.groupPerms.canManageNotes || !req.user.platformPerms.isMaster)
    return req.status( 400 ).json( ANSWERS.NOTE_UPDATE_ROLE_NOT_ALLOWED )

  const noteId = req.params.noteId
  const { value, description } = req.body
  const client = req.user

  if (!value) return res.status( 400 ).json( ANSWERS.NOTE_UPDATE_NOT_VALUE )

  const targetNote = await mod.dbManager.findObject( mod.subcollections.notes, {
    id: { $eq:noteId },
  } )

  if (!targetNote)
    return res.status( 400 ).json( ANSWERS.NOTE_UPDATE_NOTE_NOT_EXISTS )

  const group = await mod.getGroupObject( targetNote.groupId )

  const platformId = group.platformId
  const isAdmin = await mod.requiredModules.platformModule.checkUserOwner(
    client.id,
    platformId,
  )

  if (targetNote.lecturer.id != client.id && !isAdmin)
    return res.status( 400 ).json( ANSWERS.NOTE_UPDATE_NOT_ALLOWED )

  if (!description)
    await mod.dbManager.updateObject(
      mod.subcollections.notes,
      { id:{ $eq:noteId } },
      { value:value },
    )
  else
    await mod.dbManager.updateObject(
      mod.subcollections.notes,
      { id:{ $eq:noteId } },
      { $set:{ value:value, description:description } },
    )

  return res.json( ANSWERS.NOTE_UPDATE_SUCCESS )
}

/** @param {MiddlewareParameters} param0 */
export async function httpGetTargetGroup({ mod, req, res }) {
  const groupId =  req.body.groupId || req.params.groupId || req.query.groupId

  if (!groupId) throw new Error(`groupId not privided`)

  const targetGroup = await mod.getTargetGroup( groupId )

  if (!targetGroup) return res.status( 400 ).json( ANSWERS.GET_TARGET_GROUP_MISS )


  targetGroup.myRole = req.user.newGroupPerms.perms
  // BUG1
  // console.log( JSON.stringify( targetGroup, null, 2 ) )

  return res.json({ group:targetGroup })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleMyGroups({ req, res, mod }) {
  // GET Lista grup usera - wszystkie do które należy.
  // /api/groups  // header { "authenthication": "string" }

  const client = req.user
  const { platformId } = req.query

  let platformPermissions = platformId
    ? await mod.requiredModules.platformModule.getNewPermissionsByPlatfromIdAndUserId( platformId, client.id )
    : null



  // console.log({ROLE:JSON.stringify(platformPermissions,null,2)})

  let groups = await mod.dbManager.findManyObjects(
    mod.basecollectionName,
    platformPermissions?.role.abilities.canManageGroups
      ? { platformId:platformId }
      : { membersIds:client.id },
  )

  // console.log({groups})
  if (platformId)
    groups = groups.filter( group => group.platformId == platformId )

  // console.log({clientID: client.id  , groupsARR:groups })

  return res.json({ groups })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleGroupPerms({ mod, req, res }) {
  const client = req.user
  const groupId = req.body.groupId || req.query.groupId || req.params.groupId
  if (!groupId)
    return res.status( 400 ).send( ANSWERS.GET_GROUP_PERMS_NO_GROUP_ID )

  const platformOwnerOfGroup = (
    await dbManager.findOne(
      mod.requiredModules.platformModule.basecollectionName,
      { assignedGroups:groupId },
    )
  ).owner

  if (platformOwnerOfGroup.id === client.id)
    return res.json({
      permissions: new GroupUserPermission(
        groupId,
        client.id,
        `platform owner`,
        GroupPermission.getOwnerPerm(),
      ),
    })

  const isMember = await mod.checkIsUserAssigned( client.id, groupId )
  if (!isMember)
    return res.status( 400 ).send( ANSWERS.GET_GROUP_PERMS_NO_ASSIGNED )

  const value = await mod.getGroupPermissions( client.id, groupId )

  if (!value) return res.status( 400 ).send( ANSWERS.GET_GROUP_PERMS_NOT_FOUND )

  return res.json({ permissions:value })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleAllUsersInGroup({ mod, req, res }) {
  // JUMP
  // Pobieranie listy użytkowników z grupy /api/groups/:groupId/users

  // console.log("TUTAJ")

  const groupId = req.params.groupId
  const client = req.user
  const targetGroup = await mod.getGroupObject( groupId )

  // console.log({groupId,client,targetGroup})

  if (!targetGroup)
    return res.status( 400 ).json( ANSWERS.GET_ALL_GROUP_GROUP_NOT_EXISTS )

  const platformId = targetGroup.platformId

  await mod.requiredModules.platformModule.includePermsIntoReq(
    req, res, platformId,
  )

  const isMember = mod.isUserAssigned( client.id, targetGroup )
  // console.log({USER_LIST: JSON.stringify(client.newPlatformPerms,null,2)})

  if (!client.newPlatformPerms.perms.abilities.canManageGroups && !isMember)
    return res.status( 400 ).json( ANSWERS.GET_ALL_GROUP_NOT_ALLOWED )

  // do listy userów dodac role grupy.
  const listOfUsers = await mod.getUsersOfGroupAssignedRoles( targetGroup )

  // console.log({targetGroup,listOfUsers})

  return res.json({ users:listOfUsers })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleDeleteUserFromGroup({ mod, req, res }) {
  // // kasowanie usera z grupy api/groups/:groupId/users/:userId
  // // delete auth
  const client = req.user

  mod.showRole( req )

  if (!req.user.newGroupPerms.perms.abilities.canManageUsers)
    return res.status( 400 ).json( ANSWERS.DELETE_USER_NOT_ALLOWED )

  const { groupId, userId }  = req.params

  const { value } = await mod.removeUserFromGroupMembers( userId, groupId )

  if (!value)
    return res.status( 400 ).json( ANSWERS.DELETE_USER_GROUP_NOT_EXISTS )

  await mod.deleteConnectorGroupRolesToUser( groupId, userId )
  // if (!mod.isUserAssigned(userId, groupObj))
  //   return res.status(400).json(ANSWERS.DELETE_USER_GROUP_NOT_MEMBER);

  // const platformId = groupObj.platformId;
  // const isAdmin = await mod.requiredModules.platformModule.checkUserOwner(
  //   client.id,
  //   platformId
  // );

  // if (groupObj.lecturer.id != client.id && !isAdmin)
  //   return res.status(400).json({ code: 309, error: "Only Lecturer or Admin can delete a member of group" })

  return res.json( ANSWERS.DELETE_USER_SUCCESS )
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleDeleteNote({ mod, req, res }) {
  // Skasowanie oceny /api/groups/notes/:noteId
  // { "authenthication": "string" } // header
  // console.log(1)

  const noteId = req.params.noteId
  if (!noteId) return res.status( 400 ).json( ANSWERS.DELETE_NOTE_NOTE_ID_MISS )

  const targetNote = await mod.dbManager.findObject( mod.subcollections.notes, {
    id: noteId,
  } )

  if (!targetNote) return res.status( 400 ).json( ANSWERS.DELETE_NOTE_NOT_EXISTS )

  const group = await mod.getGroupObject( targetNote.groupId )

  req.params.groupId = group.id

  if (!req.user.newGroupPerms.perms.abilities.canManageNotes)
    return res.status( 400 ).json( ANSWERS.DELETE_NOTE_NOT_ALLOWED )

  await mod.dbManager.deleteObject( mod.subcollections.notes, { id:{ $eq:noteId } } )

  res.json( ANSWERS.DELETE_NOTE_SUCCESS )
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleNotesFromGroupPrivilagesVersion({ mod, req, res }) {
  // wiemy ze user ma manageNotes
  const clinet = req.user

  const groupId = req.params.groupId
  const targetGroup = await mod.getGroupObject( groupId )

  if (!targetGroup)
    return res.status( 400 ).json( ANSWERS.GET_NOTES_FROM_GROUP_VER_PRIVILAGES_BAD_GROUP_ID )

  const allNotesFromGroup = await mod.dbManager
    .aggregate( mod.subcollections.notes, {
      pipeline: [
        { $match:{ groupId:{ $eq:groupId } } },
        {
          $lookup: {
            from: `userModule`,
            localField: `userId`,
            foreignField: `id`,
            as: `user`,
          },
        },
        { $unwind:{ path:`$user`, preserveNullAndEmptyArrays:true } },
        { $unset:[ `_id`, `user._id` ] },
      ],
    } )
    .toArray()

  return res.status( 200 ).json({ notes:allNotesFromGroup })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleNotesFromGroup({ mod, req, res }) {
  // Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
  //  this.canManageNotes?
  // jesli takn wszystkie noty wszyskitch userów z tej grupy.
  // jenis nie otrzmyna swoje oceny.
  // GET Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
  // { "authenthication": "string" } // header
  // /api/groups/:groupId/notes

  const clinet = req.user
  const groupId = req.params.groupId

  if (!groupId)
    return res
      .status( 400 )
      .json( ANSWERS.GET_NOTES_FROM_GROUP_MISS_GROUP_IDe )

  if (req.user.groupPerms.canManageNotes)
    return httpHandleNotesFromGroupPrivilagesVersion({ mod, req, res })

  const targetGroup = await mod.getGroupObject( groupId )

  if (!targetGroup)
    return res.status( 400 ).json( ANSWERS.GET_GROUP_NOTES_GROUP_NOT_EXISTS )

  // platformid= targetGroup.platformId
  // const isOwner = req.user.platformPerms.isMaster
  // await this.requiredModules.platformModule.checkUserOwner(clinet.id, targetGroup.platformId)
  const isMember = mod.isUserAssigned( clinet.id, targetGroup )
  // const isLecturer = this.isLecturer(clinet.id, targetGroup)

  if (!isMember)
    return res.status( 400 ).json( ANSWERS.GET_GROUP_NOTES_NOT_ASSIGNED )

  const allNotesFromGroup = await mod.dbManager
    .aggregate( mod.subcollections.notes, {
      pipeline: [
        {
          $match: {
            $and: [
              { groupId:{ $eq:groupId } },
              { userId:{ $eq:clinet.id } },
            ],
          },
        },
        {
          $lookup: {
            from: `userModule`,
            localField: `userId`,
            foreignField: `id`,
            as: `user`,
          },
        },
        { $unwind:{ path:`$user`, preserveNullAndEmptyArrays:true } },
        { $unset:[ `_id`, `user._id` ] },
      ],
    } )
    .toArray()

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

  // const notes = await this.getAllUserNotesInGroup(groupId, clinet.id).then(cursor => cursor.toArray())

  return res.json({ notes:allNotesFromGroup })
}

/** @param {MiddlewareParameters} param0 */
export async function httpCreateNote({ mod, req, res }) {
  // Stworzenie oceny /api/groups/:groupId/notes/
  // POST { "authenthication": "string" } // header
  // { "value": "string","description": "string" }

  if (!req.user.newGroupPerms.perms.abilities.canManageNotes)
    return res.status( 400 ).json( ANSWERS.CREATE_NOTE_NOT_ALLOWED )

  const groupId = req.params.groupId
  const { value:gradeValueStr, description, userId } = req.body

  if (!gradeValueStr || !userId)
    return res.status( 400 ).json( ANSWERS.CREATE_NOTE_DATA_NOT_PROVIDED )

  if (description && description.length > MAX_LEN_NOTE_DESCRIPTION)
    return res.status( 400 ).json( ANSWERS.CREATE_NOTE_BAD_DESCRIPTION_LEN )

  const gradeValue = Number( gradeValueStr )

  if (isNaN( gradeValue ))
    return res.status( 400 ).json( ANSWERS.CREATE_NOTE_VALUE_NOT_NUMBER )

  const targetUser = await mod.getUserWithRoleByUserIdAndGroupId( userId, groupId )

  if (targetUser.role.name == `Prowadzący`)
    return res.status( 400 ).json( ANSWERS.CREATE_NOTE_ASSIGN_TO_TEACHER )

  const scale = await mod.getGradesScale( groupId )

  if (!scale.grades.includes( gradeValue )) return res.status( 400 ).json( ANSWERS.GRADE_IS_NOT_IN_SCALE )

  const note = new Grade(userId, req.user, gradeValueStr, groupId, { description })
  const targetGroup = await mod.getGroupObject( groupId )

  if (!targetGroup) return res.status( 400 ).json( ANSWERS.CREATE_NOTE_GROUP_NOT_EXISTS )

  // if (!mod.isUserAssigned(userId, targetGroup))
  //   return res.status(400).json(ANSWERS.CREATE_NOTE_NOT_MEMBER);

  // const isAdmin = await this.requiredModules.platformModule.checkUserOwner(lecturer.id, targetGroup.platformId)

  // if (!(this.isLecturer(lecturer.id, targetGroup) || isAdmin))
  //   return res.status(400).json({ code: 304, error: "Only lecturer or Admin can create an new notes." })

  if (targetGroup.lecturer.id === userId)
    return res.status( 400 ).json( ANSWERS.CREATE_NOTE_CANT_FOR_TEACHER )

  await mod.saveNote( note )

  note.user = await mod.requiredModules.userModule.getUserById( userId )
  delete note.user[ `password` ]


  return res.json({ note, ...ANSWERS.CREATE_NOTE_SUCCESS })
}


export async function httpGetAllMyNotes({ mod, req, res }) {
  const groupId = req.params.groupId
  const client = req.user
  // console.log("ogień w szopie")
  // console.log({groupId,client})

  const arrayOfNotes =  await mod.getAllNotesFromGroup( groupId )



  // console.log(arrayOfNotes)
  return res.json({ notes:arrayOfNotes })
}


export async function httpGetAllMyNotesFull({ mod, req, res }) {
  // TODO this.canManageNotes?
  // GET Pobranie WSZYSTKICH ocen użytkownika

  const client = req.user
  // console.log({client})
  const groupsInPlatforms = {}
  const notesInGroups = {}

  const userPlatforms = await mod.requiredModules.platformModule.getAllUserPlatforms(
    client.id,
  )

  // console.log({userPlatforms})
  /** @type {Group[]} */
  const userGroups = await mod.getAllUserGroups( client.id )

  // console.log({userGroups})
  let data = null

  // FIX
  let userNotes = await mod.dbManager
    .find(
      // wszystkie oceny z lecturerId or userId.
      mod.subcollections.notes,
      { userId:client.id },
    ).toArray()

  // console.log({userNotes})
  // const userNotes = await this.getAllUserNotes(client.id).then(cur => cur.toArray())

  userPlatforms.forEach(
    platform =>
      (groupsInPlatforms[ platform.id ] = {
        platform,
        groups: [],
      }),
  )

  userGroups.forEach(
    group =>
      (notesInGroups[ group.id ] = {
        group,
        notes: [],
      }),
  )

  for (const note of userNotes) {
    note.user = await mod.requiredModules.userModule.getUserById( note.userId )
    delete note.userId
  }

  userNotes.filter( ({ groupId }) => groupId in notesInGroups ).forEach( note => notesInGroups[ note.groupId ].notes.push( note ) )

  Object.values( notesInGroups ).forEach( value => {
    groupsInPlatforms[ value.group.platformId ].groups.push( value )
  } )

  data = Object.values( groupsInPlatforms )
  // console.log(JSON.stringify(data,null,2))
  return res.json({ data, userId:client.id })
}

export async function httpHandleAllGroupsInPlatform({ mod, req, res }) {

  const user = req.user
  const targetPlatform = req.params.platformId

  const platformObj = await mod.requiredModules.platformModule.getPlatform(
    targetPlatform,
  )

  if (!platformObj)
    return res
      .status( 400 )
      .json( ANSWERS.GET_ALL_PLATFORM_GROUPS_PLATFORM_NOT_EXISTS )

  const isMember = platformObj.membersIds.some( id => id == user.id )

  if (!isMember)
    return res.status( 400 ).json( ANSWERS.GET_ALL_PLATFORM_GROUPS_NOT_ALLOWED )

  // console.log(`groups`, isMaster, targetPlatform, user);
  // const isOwner = this.requiredModules.platformModule.isPlatformOwner(user.id, platformObj)

  let groups = null
  //   isOwner ? await this.getAllGroupsFromPlatform(targetPlatform)
  //     : await this.getAllGroupsFromPlatformWithMemberId(user.id, targetPlatform)

  // console.log({ role_PE : req.user.newPlatformPerms})

  groups = req.user.newPlatformPerms.perms.abilities.canManageGroups
    ? await mod.getAllGroupsFromPlatform( targetPlatform )
    : await mod.getAllGroupsFromPlatformWithMemberId( user.id, targetPlatform )

  // const rolesPrimises = groups.map( group => mod.getNewGroupPermission(req.user.id,group.id)  )
  // const roles = await Promise.all( rolesPrimises )
  // console.log({roles})
  // groups = groups.map(group => {
  //   const myRole = roles.find(r => r.groupId = group.id)
  //   return group.myRole = myRole
  // })

  // console.log(JSON.stringify(groups,null,2))

  return res.json({ groups })
}

export async function httpDeleteGroup({ mod, req, res }) {
  // DELETE Kasowanie grupy /api/groups/:groupId   { "authenthication": "string" } // header

  // oceny, spotkania ,permisje template/users

  if (!req.user.newPlatformPerms.perms.abilities.canManageGroups)
    return res.status( 400 ).json( ANSWERS.DELETE_GROUP_NOT_ALLOWED )

  // /** @type {import("../user/index.js").default} */
  // const userMod = this.requiredModules.userModule
  // /** @type {import("../platform/index.js").default} */
  // const platformMod = this.requiredModules.platformModule

  const { groupId } = req.params

  if (!(await mod.groupExist( groupId )))
    return res.status( 400 ).json( ANSWERS.DELETE_GROUP_GROUP_NOT_EXISTS )

  // if (!(await platformMod.checkUserOwner(req.user.id, platformId)))
  //   return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })

  await mod.dbManager.deleteObject( mod.basecollectionName, {
    id: { $eq:groupId },
  } )
  await mod.dbManager.deleteMany( mod.subcollections.notes, {
    groupId: { $eq:groupId },
  } )
  await mod.dbManager.deleteMany( mod.subcollections.templatePermissions, {
    referenceId: { $eq:groupId },
  } )
  await mod.dbManager.deleteMany( mod.subcollections.userPermissions, {
    referenceId: { $eq:groupId },
  } )

  return res.json( ANSWERS.DELETE_GROUP_SUCCESS )
}

export async function httpAddGroupMember({ mod, req, res }) {
  // TODO: Permisje name
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  let newUserId = req.body.userId
  let roleId = req.body.roleId

  if (!newUserId || !roleId) return res.status( 400 ).json( ANSWERS.NOT_ALL_DATA_WAS_PROVIDED )

  if (!req.user.newGroupPerms.perms.abilities.canManageUsers)
    return res.status( 400 ).json( ANSWERS.ADD_GROUP_MEMBER_NOT_ALLOWED )

  const groupObj = await mod.addUserToGroupMembers( newUserId, groupId )

  if (!groupObj)
    return res.status( 400 ).json( ANSWERS.ADD_GROUP_MEMBER_GROUP_NOT_EXISTS )

  const connector = new ConnectorGroupPermissionToUser(groupId, newUserId, roleId)
  await  mod.saveNewGroupPermissionConnector( connector )

  let userObj = await mod.getUserWithRoleByUserIdAndGroupId( newUserId, groupId )


  if (!userObj?.user) return res.status( 400 ).json( ANSWERS.ADD_GROUP_MEMBER_USER_MISS )

  // const platformObj = await mod.requiredModules.platformModule.getPlatform(
  //   groupObj.platformId
  // );

  // const platformOwner = platformMod.isPlatformOwner(req.user.id, platformObj);
  // const groupLecturer = groupObj.lecturer.id == req.user.id;

  // if (!platformOwner && !groupLecturer)
  //   return res.status(400).json(ANSWERS.ADD_GROUP_MEMBER_NOT_LECTURER_OWNER);

  // let positiveIds = usersIds.filter((id) =>
  //   platformObj.membersIds.some((member) => member === id)
  // );

  // positiveIds = positiveIds.filter((id) =>
  //   groupObj.membersIds.every((memberId) => memberId !== id)
  // ); // przefiltruj wszystkich którzy sa juz dopisani.

  // if (groupObj.membersIds.some(id=> id == newUserId))
  //   return res.json(ANSWERS.ADD_GROUP_MEMBER_ALREADY_ADDED);

  let data = userObj.user
  data.role = userObj.role


  return res.json({ ...ANSWERS.ADD_GROUP_MEMBER_SUCCESS, user:data })
}

export async function httpCreateGroup({ mod, req, res }) {
  if (!req.user.newPlatformPerms.perms.abilities.canManageGroups)
    return res.status( 400 ).json( ANSWERS.CREATE_GROUP_NOT_ALLOWED )

  /** @type {import("../user/index.js").default} */
  const userMod = mod.requiredModules.userModule
  /** @type {import("../platform/index.js").default} */
  const platformMod = mod.requiredModules.platformModule

  const { name:notTrimedName, lecturerId, platformId } = req.body
  const name = notTrimedName?.trim()

  if (!name || !lecturerId || !platformId)
    return res.status( 400 ).json( ANSWERS.CREATE_GROUP_DATA_MISS )

  if (name.length > MAX_LEN_GROUP_NAME)
    return res.status( 400 ).json( ANSWERS.CREATE_GROUP_BAD_NAME_LEN )

  if (!(await platformMod.platformExist( platformId )))
    return res
      .status( 400 )
      .json( ANSWERS.CREATE_GROUP_PLATFROM_NOT_EXISTS )

  if (await mod.checkIsGroupDuplicate( platformId, name ))
    return res.status( 400 ).json( ANSWERS.CREATE_GROUP_DUPLICATE )

  const { password, login, activated, avatar, createdDatetime, ...lecturerObj } = await userMod.getUserById( lecturerId )

  // todo: query from connector get permissions

  const newPerms = await platformMod.getNewPermissionsByPlatfromIdAndUserId( platformId, lecturerId )
  // const oldPerms = await platformMod.getPermissions(platformId, lecturerId);
  // if (oldPerms.name === `student`) {
  //   // tylko studentowi zmieniamy permissje.
  //   await mod.requiredModules.platformModule.updatePlatformPermissions(
  //     { referenceId: { $eq: platformId }, userId: { $eq: lecturerId } },
  //     { $set: { name: "lecturer", isPersonel: true } }
  //   );
  // }

  //  console.log({ newPerms }) //abilities:[object]

  if (newPerms.role.abilities.canTeach == false)
    return res.status( 400 ).json( ANSWERS.CREATE_GROUP_CAN_TEACH_FALSE )


  let group = new Group(name, lecturerObj, platformId)
  group.membersIds.push( lecturerObj.id )
  // PO ma byc

  // const ownerPerms = GroupUserPermission.createOwnerPerm(
  //   group.id,
  //   lecturerObj.id
  // );

  // groupId,name,color,importance,abilities
  // await mod.dbManager.insertObject( // stare perms
  //   mod.subcollections.userPermissions,
  //   ownerPerms
  // );
  // await mod.dbManager.insertObject(
  //   mod.subcollections.templatePermissions,
  //   studentTemplate
  // );
  // await mod.dbManager.insertObject(
  //   mod.subcollections.templatePermissions,
  //   ownerTemplate
  // );

  const groupScale = new Scale(group.id, [ 1, 2, 3, 4, 5 ])

  await mod.dbManager.insertObject( mod.subcollections.scale, groupScale )

  await mod.saveGroup( group )

  await platformMod.updatePlatform(
    { id:{ $eq:platformId } },
    { $push:{ assignedGroups:group.id } },
  )

  const newOwnerPerms = GroupPermissions.getOwnerPerm( group.id )
  const newStudentPerms = GroupPermissions.getStudentPerm( group.id )
  // console.log({newOwnerPerms,newStudentPerms})

  const connectorForOwner = new ConnectorGroupPermissionToUser(group.id, lecturerId, newOwnerPerms.id)

  // console.log({ newOwnerPerms, connectorForOwner })

  await mod.saveNewGroupPermissionTemplate( newOwnerPerms )
  await mod.saveNewGroupPermissionTemplate( newStudentPerms )
  await mod.saveNewGroupPermissionConnector( connectorForOwner )

  return res.status( 200 ).json({ group })
}

export async function httpGetTemplatePermissions({ mod, req, res }) {
  const client = req.user
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  // console.log({groupId})

  if (!groupId)
    return res
      .status( 400 )
      .json( ANSWERS.GET_TEMPLATE_PERMS_MISS_GROUP_ID )

  const groupObj = await mod.getGroupObject( groupId )
  const member = mod.isUserAssigned( client.id, groupObj )

  // tutaj dodac platform perms aby spr czy Master.
  await mod.requiredModules.platformModule.includePermsIntoReq(
    req,
    res,
    groupObj.platformId,
  )

  // await mod.requiredModules.platformModule.perms( req, res ,"group id" )

  if (!client.platformPerms.isMaster && !member)
    return res.status( 400 ).json( ANSWERS.GET_TEMPLATE_PERMS_NOT_ALLOWED )

  const permissionList = await mod.getAllTemplatePerms( groupId )
  const newperms = await mod.getAllPermissionsTemplateFromGroup( groupId )
  // console.log({ permissions: newperms, oldPerms:permissionList })

  // TODO: NOWE PERMISJE + STARE PERMISJE
  return res.json({ permissions:newperms, oldPerms:permissionList })
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleDeleteFile({ mod, req, res }) {
  // where will be file name/ file path
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  const documentId = req.params.materialId || req.body.materialId || req.query.materialId

  // console.log({documentId})

  const fileDoc = ( await mod.deleteDocumentFromGroup( documentId )).value

  if (!fileDoc)
    return res.status( 400 ).json( ANSWERS.DELETE_DOCUMENT_FROM_GROUP_NOT_EXISTS )

  // console.log({ document: fileDoc })

  const fullFilePath = APP_ROOT_DIR + `/` + fileDoc.path
  const fileExists = await fs.promises.stat( fullFilePath ).catch( () => false )

  // console.log({fileExists})
  if (!fileExists)
    return res.status( 400 ).json( ANSWERS.DELETE_FILE_FROM_GROUP_NOT_EXISTS )

  await fs.promises.unlink( fullFilePath )

  // console.log(`FILE -> has been deleted`);
  return res.json( ANSWERS.DELETE_FILE_SUCCESS )
}

/** @param {MiddlewareParameters} param0 */
export async function httpHandleAllFilesInGroup({ mod, req, res }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  const colllectionOfFiles = await mod.getAllMaterialsAssignedToGroup( groupId )

  return res.json({ materials:colllectionOfFiles || [] })
}

/** @param {MiddlewareParameters} param0 */
export async function httpAddFile({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  const platformObj = await mod.requiredModules.platformModule.getPlatformByGroupId( groupId )

  await mod.requiredModules.platformModule.includePermsIntoReq( req, res, platformObj.id )

  if (!req.user.newGroupPerms.perms.abilities.canEditDetails &&
     !req.user.newPlatformPerms.perms.abilities.canTeach)
    return res.status( 400 ).json( ANSWERS.POST_MATERIALS_NOT_ALLOWED )

  upload( req, res, async function( err ) {
    if (err instanceof multer.MulterError) console.log( `Please upload a file: ${err}` )
    else if (err) console.log( `Unknown error: ${err}` )

    if (!req.file)
      return res.status( 400 ).json( ANSWERS.POST_MATERIALS_FILE_MISS )

    // console.log({UPLOADED_FILE:req.file});

    const { mimetype, filename, path } = req.file

    let finalFile = new File(mimetype, filename, path, req.body.description, groupId, req.user)

    await mod.dbManager.insertObject( mod.subcollections.materials, finalFile )
    // console.log("FILE -> saved to database");

    return res.json({ file:finalFile, ...ANSWERS.UPLOAD_FILE_SUCCESS })
  } )
}


/** @param {MiddlewareParameters} param0 */
export async function httpCreateTask({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  const toTimestamp = strDate => {
    var datum = Date.parse( strDate )
    return datum / 1000
  }

  let { title, description, dateExpire, dateStart } = req.body

  // if(!dateExpire)
  //   return res.status(400).json(ANSWERS.TASK_EXPIRE_DATE_MISS)

  const platfromObj = await mod.requiredModules.platformModule.getPlatformByGroupId( groupId )

  await mod.requiredModules.platformModule.includePermsIntoReq( req, res, platfromObj.id )

  if (!req.user.newPlatformPerms.perms.abilities.canTeach)
    return res.status( 400 ).json( ANSWERS.TASK_CREATE_NOT_ALLOWED )

  if (description?.length > 255)
    return res.status( 400 ).json( ANSWERS.TASK_DESCRIPTION_OVER_LEN )

  if (!title)
    return res.status( 400 ).json( ANSWERS.TASK_NO_TITLE )

  if (await mod.doesTaskAlreadyExists( title, groupId ))
    return res.status( 400 ).json( ANSWERS.TASK_CREATE_NAME_EXISTS )

  // if(typeof expire == `string`)
  //     expire = toTimestamp(expire)

  // console.log({dateExpire})
  const t = new Task(title, description, groupId, req.user, dateStart, dateExpire)
  // console.log({t})
  await mod.saveTaskInDb( t )
  // console.log("TASK HAS BEEN CREATED")
  return res.json({ task:t, ...ANSWERS.TASK_CREATE_SUCCESS })
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetAllGroupTasks({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  const t = await mod.dbManager.findManyObjects( mod.subcollections.tasks, { groupId:{ $eq:groupId } } )
  return res.json({ tasks:(t || []) })
}

/** @param {MiddlewareParameters} param0 */
export async function httpDoneTask({ mod, req, res, next }) {
  // tutaj będzie upload pliku jakiegos.
  // zdobadz id pliku
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  const taskId = req.params.taskId || req.body.taskId || req.query.taskId
  const file = req.file

  upload( req, res, async function( err ) {
    if (err instanceof multer.MulterError) console.log( `Please upload a file ${err}` )
    else if (err) console.log( `Unknow error : ${err}` )

    const { mimetype, filename, path } = req.file
    // console.log(req.file, req.files)
    const finalFile = new File(mimetype, filename, path, req.body.description, groupId, req.user)
    const td = new TaskDone(taskId, req.user, finalFile.path, finalFile.description, req.file.filename, finalFile.id)

    await mod.dbManager.insertObject( mod.subcollections.materials, finalFile )
    await mod.dbManager.insertObject( mod.subcollections.tasksDone, td )
    return res.json({ task:td, fileData:finalFile, ...ANSWERS.TASK_DONE_SUCCESS })
  } )
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetAllTasksDone({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  const taskId = req.params.taskId || req.body.taskId || req.query.taskId

  const tasksArr = await mod.dbManager.findManyObjects( mod.subcollections.tasksDone, { taskId:{ $eq:taskId } } )
  // console.log(tasksArr)
  return res.json({ tasks:(tasksArr || []) })
}


/** @param {MiddlewareParameters} param0 */
export async function HttpHandleDeleteTask({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  const taskId = req.params.taskId || req.body.taskId || req.query.taskId

  const doneTasks = await mod.dbManager.findManyObjects( mod.subcollections.tasksDone, { taskId:{ $eq:taskId } } )

  const filesPath = doneTasks.map( task => task.filepath )

  const fullFilePath = relpath => APP_ROOT_DIR + `/` + relpath

  filesPath.map( path => fs.unlink( fullFilePath( path ) ) ) // delete from drive

  const promises = [
    mod.dbManager.deleteMany( mod.subcollections.tasksDone, { taskId:{ $eq:taskId } } ), // from  tasks in db
    mod.dbManager.deleteMany( mod.subcollections.materials, { path:{ $in:filesPath } } ), // from files in db
    mod.dbManager.deleteObject( mod.subcollections.tasks, { id:{ $eq:taskId } } ),
  ]

  await Promise.all( promises )

  return res.json( ANSWERS.TASK_DELETE_SUCCESS )
}

/** @param {MiddlewareParameters} param0 */
export async function httpChangeScale({ mod, req, res, next }) {

  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  /** @type {string} */
  let newScale = req.body.gradingScale
  if (!newScale)
  {
    return res.status( 400 ).json( ANSWERS.GRADES_NEW_VALUES_MISS )
  }

  /** @type {string[]} */
  let grades = newScale.split( ` ` ).map( Number )

  // console.log({notInt:grades.filter(item=> !Number.isInteger(Number(item)))})

  if (grades.some( grade => isNaN( grade ) || grade % 1 > 0 || grade == -0 )) return res.status( 400 ).json( ANSWERS.GRADES_NOT_INT )
  if (grades.some( (grade, i) => grades.indexOf( grade ) != i )) return res.status( 400 ).json( ANSWERS.REPEATED_GRADES )

  grades = grades.map( item => parseInt( item ) )
  newScale = new Scale(groupId, grades)

  await mod.dbManager.updateObject( mod.subcollections.scale, { groupId:{ $eq:groupId } }, { $set:{ grades:grades } } )
  return res.json( ANSWERS.GRADES_UPDATED_SUCCESS )
}

/** @param {MiddlewareParameters} param0 */
export async function httpGetGroupScale({ mod, req, res, next }) {
  // if(!req.user.newGroupPerms.perms.canManageNotes)
  // return res.status(400).json(ANSWERS.GET_GRADES_NOT_ALLOWED)

  const groupId = req.params.groupId || req.body.groupId || req.query.groupId
  // console.log({get_scale_from_group_id:groupId})

  const scale = await mod.getGradesScale( groupId )

  // console.log({scale})
  if (!scale) return res.status( 400 ).json({ code:9999, error:`Scale with provided ID is not exists` })

  return res.json({ ...ANSWERS.GET_GRADES_SUCCESS, scale:scale.grades || [] })
}


export function httpGetGroupPermissionAbilities({ mod, req, res, next }) {
  return res.json( new GroupAbilities() )
}

export async function httpCreateGroupPermissions({ mod, req, res, next }) {
  const groupId = req.params.groupId

  if (!req.user.newGroupPerms.perms.abilities.canManageRoles)
    return res.status( 400 ).json( ANSWERS.CREATE_ROLE_NOT_ALLOWED )

  const permissionObject = req.body
  const permsAbilities = Object.assign( new GroupAbilities(), permissionObject.abilities )
  const name = permissionObject.name.trim()

  // console.log({abilities:permsAbilities})

  if (!name) return res.status( 400 ).json( ANSWERS.CREATE_ROLE_NAME_MISS )
  if (await mod.doesRoleAlreadyExists( name ))
    return res.status( 400 ).json( ANSWERS.CREATE_ROLE_NAME_EXISTS )

  const newRole = new GroupPermissions(groupId, name, permissionObject.color,
    permissionObject.importance, permsAbilities)

  // console.log(JSON.stringify(newRole,null,2))

  await mod.saveNewGroupPermissionTemplate( newRole )

  return res.status( 200 ).json({ ...ANSWERS.CREATE_GROUP_PERMISSION_SUCCESS, role:newRole })
}

export async function httpGetNewTemplatePermissions({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  const permissions =  await mod.getAllPermissionsTemplateFromGroup( groupId )
  // console.log({groupPermissionsAll:permissions})
  return res.status( 200 ).json({ roles:permissions })
}

export async function httpAssignUserToPermission({ mod, req, res, next }) {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  // console.log({httpAssignUserToPermission_body:req.body})

  const userId = req.body.userId
  const permissionId = req.body.permissionId

  const connector = new ConnectorGroupPermissionToUser(groupId, userId, permissionId)

  await mod.saveNewGroupPermissionConnector( connector )

  return res.status( 200 ).json( ANSWERS.ASSIGN_PERMISSION_TO_USER_SUCCESS )
}


export async function httpUpdateNewGroupPermissions({ mod, req, res })
{
  const groupId = req.params.groupId
  const roleId = req.params.roleId

  const role = await mod.getRoleById( roleId )

  if (role.name == `Prowadzący`)
    return res.status( 400 ).json( ANSWERS.UPDATE_ROLE_OWNER )

  if (req.body.color)
  {
    if (!Number.isInteger( req.body.color ))
      return res.status( 400 ).json( ANSWERS.UPDATE_ROLE_COLOR_NOT_INT )

    if (!(req.body.color >= 0x000000  && req.body.color <= 0xFFFFFF))
      return res.status( 400 ).json( ANSWERS.UPDATE_ROLE_COLOR_NOT_IN_RANGE )
  }

  const updateToMake = req.body

  const formatedAbilities =  Object.entries( updateToMake.abilities )
    .map( ([ ability, bool ]) => ({ field:`abilities.${ability}`, value:bool }) )
    .reduce( (obj, { field, value }) => ({ [ field ]:value, ...obj }), {} )

  delete updateToMake.abilities

  Object.assign( updateToMake, formatedAbilities )

  // console.log(updateToMake)

  const { value } = await mod.updateGroupPermission( roleId, updateToMake )

  if (!value)
    return res.status( 400 ).json( ANSWERS.UPDATE_PERMISSIONS_TARGET_PERMS_MISS )

  return res.json({ ...ANSWERS.UPDATE_PERMISSIONS_SUCCESS, role:value })
}




/** @param {MiddlewareParameters} param0 */
export async function httpDeleteGroupTemplatePermission({ mod, req, res, next })
{
  const groupId = req.params.groupId
  const roleId = req.params.roleId

  if (!req.user.newGroupPerms.perms.abilities.canManageRoles)
    return res.status( 400 ).json( ANSWERS.DELETE_ROLE_NOT_ALLOWED )

  const role = await mod.getRoleById( roleId )

  if (role.name == `Prowadzący`)
    return res.status( 400 ).json( ANSWERS.DELETE_ROLE_OWNER )

  const removed = await mod.deleteGroupTemplatePermission( roleId )

  if (!removed)
    throw new Error(`delete role, role -> not found`)

  return res.json( ANSWERS.DELETE_ROLE_SUCCESS )
}
