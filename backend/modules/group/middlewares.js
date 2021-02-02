/** @typedef {import("./index.js").MiddlewareParameters} MiddlewareParameters */

import dbManager from "../../src/dbManager.js"
import GroupPermission, { GroupUserPermission } from "./permissions.js"

/** @param {MiddlewareParameters} param0 */
export async function httpHandleGroupPerms({mod, req,res}) {


  const client = req.user
  const groupId = req.body.groupId || req.query.groupId || req.params.groupId
  if(!groupId)
   return res.status(400).send({code:397,error:"Cannot get permissions without prividing groupId"})

  //TODO: check is admin.
  const platformOwnerOfGroup = (await dbManager.findOne(
    mod.requiredModules.platformModule.basecollectionName,
    {assignedGroups:groupId}
    )).owner

  if(platformOwnerOfGroup.id === client.id)
    return res.json({permissions:
      new GroupUserPermission(
        groupId,
        client.id,
        `platform owner`,
        GroupPermission.getOwnerPerm()
      )} )



  const isMember =await mod.checkIsUserAssigned(client.id,groupId)
  if(!isMember)
   return res.status(400).send({code:396,error:"Cannot get permmisions from group that u are not assigned in."})

  const value = await mod.getGroupPermissions(client.id,groupId)

  if(!value)
  return res.status(400).send({code:395,error:"Group permissions not found."})

  return res.json({permissions:value});
}


export async function httpHandleAllUsersInGroup({mod, req, res }) {
  // get all users of group
  // Pobieranie listy użytkowników z grupy /api/groups/:groupId/users
  // GET // header { "authenthication": "string"}
  // body { "users": [  "<User>", ] }
  // TODO: podać permisje.

  const groupId = req.params.groupId
  const client = req.user
  const targetGroup = await mod.getGroupObject(groupId)

  // if (!client.groupPerms)
  //   return res.status(400).json({ code: 315, error: "You are not allowed to see all users of target group." })

  if (!targetGroup)
    return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

  const isMember = mod.isUserAssigned(client.id, targetGroup)
  const isAdmin = client.platformPerms.target.isMaster
  // await this.requiredModules.platformModule.checkIsOwner(client.id, targetGroup.platformId)

  if (!isMember && !isAdmin)
    return res.status(400).json({ code: 302, error: "Only member or platform admin can look at userlist of group." })

  const tasks = targetGroup.membersIds.map((id) => mod.requiredModules.userModule.getUserById(id))
  const users = await Promise.all(tasks)

  res.json({ users })
}


export async function httpHandleDeleteUserFromGroup({mod, req, res }) {
  // // kasowanie usera z grupy api/groups/:groupId/users/:userId
  // // delete auth
  // TODO: this.canManageUsers
  if (!req.user.groupPerms.canManageUsers)
    return res.status(400).json({ code: 321, error: `Your role dont allow you to delete user from group.` })

  let { groupId, userId } = req.params
  groupId = req.query.groupId
  const groupObj = await mod.getGroupObject(groupId)
  const client = req.user

  if (!groupObj)
    return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

  if (!mod.isUserAssigned(userId, groupObj))
    return res.status(400).json({ code: 305, error: "User is not a member of this group." })

  const platformId = groupObj.platformId;
  const isAdmin = await mod.requiredModules.platformModule.checkUserOwner(client.id, platformId)

  if (groupObj.lecturer.id != client.id && !isAdmin)
    return res.status(400).json({ code: 309, error: "Only Lecturer or Admin can delete a member of group" })

  await mod.dbManager.updateObject(
    mod.basecollectionName,
    { id: { $eq: groupId } },
    { $pull: { membersIds: userId } }
  )

  return res.json({ code: 310, success: "User has been deleted from group successfully" })
}


export async function httpHandleDeleteNote({mod,req, res}) {
  // Skasowanie oceny /api/groups/notes/:noteId
  // { "authenthication": "string" } // header

  const noteId = req.params.noteId
  if (!noteId)
    return res.status(400).json({ code: 306, error: "Target noteId is not provided." })


  const targetNote = await mod.dbManager.findObject(mod.subcollections.notes, { id: noteId })

  if (!targetNote)
    return res.status(400).json({ code: 306, error: "Target note does not exists." })

  const group = await mod.getGroupObject(targetNote.groupId)

  req.params.groupId = group.id
  // await this.httpAddPermissionsToRequest(req, res)
  // admin nie ma wpisu w groupPermissions.
  if (!req.user.groupPerms.canManageNotes && !req.user.platformPerms.isMaster)
    return res.status(400).json({ code: 310, error: `Delete notes is option only for users with canManageNotes privilages or PE Master.` })


  // const client = req.user

  // admin or lecturer.
  // const platformId = group.platformId;
  // const isAdmin = await this.requiredModules.platformModule.checkUserOwner(client.id, platformId)
  // if (targetNote.lecturer.id != client.id && !isAdmin)
  //   return res.status(400).json({ code: 308, error: "Only Lecturer or Admin can delete note." })

  mod.dbManager.deleteObject(mod.subcollections.notes, { id: { $eq: noteId } })

  res.json({ code: 307, success: "Note has been deleted successfully." })
}


export async function httpHandleNotesFromGroup({mod,req, res}) { // Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
  // TODO: this.canManageNotes?
  // jesli takn wszystkie noty wszyskitch userów z tej grupy.
  // jenis nie otrzmyna swoje oceny.
  // GET Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
  // { "authenthication": "string" } // header
  // /api/groups/:groupId/notes
  let userVersion

  const canManageNotes = req.user.groupPerms.canManageNotes
  if (!canManageNotes)
    userVersion == true
  // return res.status(400).json({ code: 311, error: `Only member with canManageNotes privilages. can see all notes of group.` })

  const clinet = req.user
  const groupId = req.params.groupId
  const targetGroup = await mod.getGroupObject(groupId)

  if (!targetGroup)
    return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

  // platformid= targetGroup.platformId
  // const isOwner = req.user.platformPerms.isMaster
  //await this.requiredModules.platformModule.checkUserOwner(clinet.id, targetGroup.platformId)
  const isMember = mod.isUserAssigned(clinet.id, targetGroup)
  // const isLecturer = this.isLecturer(clinet.id, targetGroup)

  if (!isMember)
    return res.status(400).json({ code: 305, error: "Only member or Platform owner can see all user" })

  // wszysztkie oceny które sa przypisane do grupy.
  const allNotes = await mod.dbManager.findManyObjects(
    mod.subcollections.notes,
    { groupId: groupId })


  const users = new Map()
  const usersIds = new Set()
  const notes = allNotes.filter(
    note => canManageNotes
      ? true
      : note.userId === clinet.id
  )

  notes.forEach(({ userId }) => usersIds.add(userId))

  for (const id of usersIds) {
    const userObj = await mod.requiredModules.userModule.getUserById(id)
    users.set(userObj.id, userObj)
  }

  const notesWithUsers = notes.map(note => {
    const newNote = {
      user: users.get(note.userId),
      ...note
    }

    delete newNote.userId

    return newNote
  })

  //const notes = await this.getAllUserNotesInGroup(groupId, clinet.id).then(cursor => cursor.toArray())

  return res.json({ notes: notesWithUsers })
}


export async function httpCreateNote({mod,req, res}) { // Stworzenie oceny /api/groups/:groupId/notes/
  // POST { "authenthication": "string" } // header
  // { "value": "string","description": "string" }

  if (!req.user.groupPerms.canManageNotes &&
    !req.user.platformPerms.isMaster)
    return res.status(400).json({ code: 322, error: `Only group member with canManageNotes privilages can create new notes.` })


  const groupId = req.params.groupId
  const { value, description, userId } = req.body
  const lecturer = req.user

  delete lecturer.groupPerms
  delete lecturer.platformPerms

  /**@type {Grade} */
  const note = new Grade(userId, lecturer, value, groupId, { description })

  const targetGroup = await mod.getGroupObject(groupId)

  if (!targetGroup)
    return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

  if (!mod.isUserAssigned(userId, targetGroup))
    return res.status(400).json({ code: 305, error: "User is not a member of this group." })

  // const isAdmin = await this.requiredModules.platformModule.checkUserOwner(lecturer.id, targetGroup.platformId)

  // if (!(this.isLecturer(lecturer.id, targetGroup) || isAdmin))
  //   return res.status(400).json({ code: 304, error: "Only lecturer or Admin can create an new notes." })
  if(targetGroup.lecturer.id === userId)
   return res.status(400).json({code:313,error: "Teacher cannot assign note to yourself."})

  await mod.saveNote(note)

  return res.json({ note })
}


export async function httpGetAllMyNotes({req, res}) {
  //TODO   this.canManageNotes?
  // GET Pobranie WSZYSTKICH ocen użytkownika
  // { "authenthication": "string" } // header
  // /api/groups/notes { "authenthication": "string" } // header


  // nie ma roli -> oceny usera
  // mam -> wszyskie user + te co wystawilem.


  const client = req.user


  const groupsInPlatforms = {}
  const notesInGroups = {}

  const userPlatforms = await mod.requiredModules.platformModule.getAllUserPlatforms(client.id)
  /** @type {Group[]} */

  const userGroups = await mod.getAllUserGroups(client.id)

  let data = null



  //if (req.user.groupPerms.canManageNotes || req.user.platform.isMaster) {

  let userNotes = await mod.dbManager.find( // wszystkie oceny z lecturerId or userId.
    mod.subcollections.notes,
    {
      $or: [
        { "lecturer.id": client.id },
        { "userId": client.id }
      ]
    }).toArray()

  //const userNotes = await this.getAllUserNotes(client.id).then(cur => cur.toArray())

  userPlatforms.forEach(platform => groupsInPlatforms[platform.id] = {
    platform,
    groups: []
  })

  userGroups.forEach(group => notesInGroups[group.id] = {
    group,
    notes: []
  })


  for (const note of userNotes) {
    note.user = await mod.requiredModules.userModule.getUserById(note.userId)
    delete note.userId
  }

  userNotes.forEach(note => notesInGroups[note.groupId].notes.push(note))

  Object.values(notesInGroups).forEach(value => {
    groupsInPlatforms[value.group.platformId].groups.push(value)
  })

  data = Object.values(groupsInPlatforms)

  return res.json({ data })
}


export async function httpHandleAllGroupsInPlatform({mod, req, res }) {
  const user = req.user
  const isMaster = user.platformPerms.isMaster
  const targetPlatform = req.params.platformId
  const platformObj = await mod.requiredModules.platformModule.getPlatform(targetPlatform)

  if (!platformObj)
    return res.status(400).json({ code: 208, error: "Cannot find target platform, Unable to send all groups of target platform" })

  const isMember = platformObj.membersIds.some(id => id == user.id)

  if (!isMaster && !isMember)
    return res.status(400).json({ code: 217, error: `You cannot see all of groups in platform, You dont have privilages to do int.` })

  console.log(`groups`, isMaster, targetPlatform, user)
  // const isOwner = this.requiredModules.platformModule.isPlatformOwner(user.id, platformObj)

  let groups = null
  //   isOwner ? await this.getAllGroupsFromPlatform(targetPlatform)
  //     : await this.getAllGroupsFromPlatformWithMemberId(user.id, targetPlatform)

  groups = isMaster ? await mod.getAllGroupsFromPlatform(targetPlatform)
    : await mod.getAllGroupsFromPlatformWithMemberId(user.id, targetPlatform)



  return res.json({ groups })
}


export async function httpDeleteGroup({mod,req, res}) {
  // DELETE Kasowanie grupy /api/groups/:groupId   { "authenthication": "string" } // header
  // TODO this.isOwner ! of platform or what
  // oceny, spotkania ,permisje template/users


  if (!req.user.platformPerms.canManageGroups)
    return res.status(200).json({ code: 330, error: `To delete group, required is masterOfGroup permission.` })


  // /** @type {import("../user/index.js").default} */
  // const userMod = this.requiredModules.userModule
  // /** @type {import("../platform/index.js").default} */
  // const platformMod = this.requiredModules.platformModule

  const { groupId } = req.params

  if (!(await mod.groupExist(groupId)))
    return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

  // if (!(await platformMod.checkUserOwner(req.user.id, platformId)))
  //   return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })

  await mod.dbManager.deleteObject(mod.basecollectionName, { id: { $eq: groupId } })
  await mod.dbManager.deleteMany(mod.subcollections.notes, { groupId: { $eq: groupId } })
  await mod.dbManager.deleteMany(mod.subcollections.templatePermissions, { referenceId: { $eq: groupId } })
  await mod.dbManager.deleteMany(mod.subcollections.userPermissions, { referenceId: { $eq: groupId } })


  return res.json({ code: 303, success: "Group has been deleted sucessfuly." })
}


export async function httpAddGroupMember({ mod, req, res }) {
  /** @type {import("../user/index.js").default} */
  const userMod = mod.requiredModules.userModule
  /** @type {import("../platform/index.js").default} */
  const platformMod = mod.requiredModules.platformModule

  const groupId = req.params.groupId || req.body.groupId || req.query.groupId

  // let usersIds = req.body.usersIds
  let usersIds = req.body.usersIds ?? req.body.userId

  if (!Array.isArray(usersIds))
    usersIds = [usersIds]

  //BUG: REMOVE WITH PAWEŁ Build.
  // TODO: this.canManageUsers
  if (!req.user.groupPerms.canManageUsers)
    return res.status(400).json({ code: 319, error: `Your privilages dont allows you to, assign new member to group.` })

  usersIds = usersIds.filter(id => id !== `wybierz`)

  // poobrac objekt grupy.
  //  grupa.platformId

  const groupObj = await mod.getGroupObject(groupId)

  if (!groupObj)
    return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

  const platformObj = await mod.requiredModules.platformModule.getPlatform(groupObj.platformId)

  const platformOwner = platformMod.isPlatformOwner(req.user.id, platformObj)
  const groupLecturer = groupObj.lecturer.id == req.user.id

  if (!platformOwner && !groupLecturer)
    return res.status(400).json({ code: 300, error: "Only Lecturer or Platform owner can assign new members to group." })

  // if (!DEBUG) {
  //   // BUG: PAWEŁ
  //   const result = await Promise.all(usersIds.map(userId => userMod.userExist(userId)))
  //   console.log({ result })
  //   if (!result.every(Boolean))
  //     return res.status(400).json({ code: 301, error: "You are trying to assign non existing user." })

  //   // TODO: check list if exist, filter existing members, and add them, return to client partly bad. with notAdded : [ids]
  //   // findOneAndUpdate(
  //   //   <filter>,
  //   //   <update document or aggregation pipeline>,
  //   //  { $push: { <field1>: { <modifier1>: <value1>, ... }, ... } }
  // }



  let positiveIds = usersIds.filter(id => platformObj.membersIds.some(member => member === id))
  positiveIds = positiveIds.filter(id => groupObj.membersIds.every(memberId => memberId !== id)) // przefiltruj wszystkich którzy sa juz dopisani.


  if (positiveIds.lenght <= 0)
    return res.json({ code: 321, success: `All selected users are already assigned in group.` })

  const updateTask = mod.dbManager.updateObject(
    mod.basecollectionName,
    { id: { $eq: groupId } },
    { $push: { membersIds: { $each: positiveIds } } },
  )

  const tasks = []
  tasks.push(updateTask)

  positiveIds.forEach(id => {
    const userPerm = GroupUserPermission.createStudentPerm(groupId, id)
    tasks.push(mod.saveGroupPermissions(userPerm))
  });

  await Promise.all(tasks)
  const asssignedUsers = await Promise.all(
    positiveIds.map(id => mod.requiredModules.userModule.getUserById(id))
  )

  const success = { code: 302, success: "Succesfully assigned users to group." }
  const returndata = { data: asssignedUsers, ...success }


  // przerobic aby success byl obslogiwany
  if (positiveIds.length !== usersIds.length)
    return res.json({ code: 320, success: "Not all of users was assigned to group. Because not all of users are targeted platfrom member." })

  return res.json(returndata)
}


export async function httpCreateGroup({ mod,req, res }) {

  // OK: Działa tutaj. platform permision.
  // TODO sprawdzenie permisji
  //  TODO platform.canManageGroups
  // header { "authenthication": "string" }
  // body:{"name": "string", "lecturer": "string", "platformId":"string"}

  // req.user.groupPerms
  // req.user.platformParams


  if (!req.user.platformPerms.canManageGroups)
    return res.status(400).json({
      code: 312,
      error: `Your role in platform dont allow you to create groups.`
    })




  /** @type {import("../user/index.js").default} */
  const userMod = mod.requiredModules.userModule
  /** @type {import("../platform/index.js").default} */
  const platformMod = mod.requiredModules.platformModule

  const { name, lecturerId, platformId } = req.body
  const client = req.user

  // TODO: update user pemissions because he is now an personel.

  // req.params.platformId = platformId
  // await this.requiredModules.platformModule.httpAddPermissionsToRequest(req, res)

  if (!name || !lecturerId || !platformId)
    return res.status(400).json({ code: 222, error: "Can not create platform, not   all credentials are provided." })

  if (!(await platformMod.platformExist(platformId)))
    return res.status(400).json({ code: 207, error: "Platform does not exist" })

  // if (!(await platformMod.checkUserOwner(client.id, platformId)))
  //   return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })

  const lecturerObj = await userMod.getUserById(lecturerId)


  const oldPerms = await platformMod.getPermissions(platformId, lecturerId)
  if (oldPerms.name === `student`) {
       await mod.requiredModules.platformModule.updatePlatformPermissions(
      { referenceId: {$eq:platformId},userId:{$eq:lecturerId} },
      { $set: { name: 'lecturer', isPersonel:true} }
    )
  }

  let group = new Group(name, lecturerObj, platformId)
  group.membersIds.push(lecturerObj.id)

  const ownerPerms = GroupUserPermission.createOwnerPerm(group.id, lecturerObj.id)

  const studentTemplate = new GroupPermission(group.id, `student`)
  const ownerTemplate = new GroupPermission(group.id, `lecturer`, GroupPermission.getOwnerPerm())

  await mod.dbManager.insertObject(mod.subcollections.userPermissions, ownerPerms)
  await mod.dbManager.insertObject(mod.subcollections.templatePermissions, studentTemplate)
  await mod.dbManager.insertObject(mod.subcollections.templatePermissions, ownerTemplate)



  // await this.saveGroupPermissionsArr([ownerPerms, ownerTemplate, studentTemplate])

  await mod.saveGroup(group)

  await platformMod.updatePlatform({ id: { $eq: platformId } }, { $push: { assignedGroups: group.id } })



  return res.status(200).json({ group })
}


export async function httpGetTemplatePermissions({mod,req,res}) {
  const client = req.user
  const groupId = req.params.groupId

  if(!groupId)
    return res.status(400).json({code:334,error:"Cannot find groupId in request params."})

  const groupObj =await mod.getGroupObject(groupId)
  const member = mod.isUserAssigned(client.id,groupObj)

  //tutaj dodac platform perms aby spr czy Master.
  await mod.requiredModules.platformModule.includePermsIntoReq(req,res,groupObj.platformId)

  //await mod.requiredModules.platformModule.perms( req, res ,"group id" )

  if(!client.platformPerms.isMaster && !member )
    return res.status(400).json({code:333,erorr:"can not get list of group perms, because u are not  -> PE master or group member."})

  const permissionList = await mod.getAllTemplatePerms(groupId)

  return res.json({permissions:permissionList})
}