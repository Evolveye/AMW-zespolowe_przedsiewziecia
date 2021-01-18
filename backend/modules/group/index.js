import Module from '../module.js'
import Group from './model.js'
import Grade from './../grade/model.js'
import { DEBUG } from '../../consts.js'


export default class groupModule extends Module {
  static requiredModules = [`UserModule`, `PlatformModule`]

  constructor(...params) {
    super(`groups`, ...params)

    const myCollections = [`${this.collectionName}Notes`]

    new Promise(async res => {
      myCollections.forEach(async collectionName => {
        if (!(await this.dbManager.collectionExist(collectionName)))
          await this.dbManager.createCollection(collectionName)
      })
      res()
    })

  }

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {

  }


  configure(app) {

    // GET Lista grup usera - wszystkie do które należy. /api/groups // header { "authenthication": "string" }
    app.get(`/api/groups`, this.httpHandleMyGroups)

    // GET api/groups/platform/:id -- wszystkie grupy na danej platformie.
    app.get(`/api/groups/platform/:platformId`, this.httpHandleAllGroupsInPlatform)

    // kto moze tworzyc grupy, all? or owner
    app.post(`/api/groups`, this.httpCreateGroup)

    //POST Dodawanie usera do grupy /api/groups/users // header { "authenthication": "string" } //body "usersIds": [ "string"  ]
    app.post(`/api/groups/users`, this.httpAddGroupMember)

    // DELETE Kasowanie grupy /api/groups/:groupId   { "authenthication": "string" } // header
    app.delete(`/api/groups/:groupId`, this.httpDeleteGroup)
    // kasowanie grupy możliwe tylko przez owner platformy.

    // ##############################################################################

    // Stworzenie oceny /api/groups/notes/
    // POST { "authenthication": "string" } // header
    // { "value": "string","description": "string" }
    app.post(`/api/groups/:groupId/notes/`, this.httpCreateNote)

    // GET Pobranie WSZYSTKICH ocen użytkownika
    // { "authenthication": "string" } // header
    // /api/groups/notes { "authenthication": "string" } // header
    app.get(`/api/groups/notes`, this.httpGetAllMyNotes)

    // GET Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
    // { "authenthication": "string" } // header
    // /api/groups/:groupId/notes
    app.get(`/api/groups/:groupId/notes`, this.httpHandleNotesFromGroup)



    // Skasowanie oceny /api/groups/notes/:noteId
    // { "authenthication": "string" } // header



    // Edycja oceny /api/groups/notes/:noteId
    // PUT { "authenthication": "string" } // header
    //{ // body  "value": "string",  "description": "string",}

  }

  httpHandleNotesFromGroup = async (req, res, next) => { // Pobranie wszystkich ocen użytkownika z DANEJ GRUPY

    // GET Pobranie wszystkich ocen użytkownika z DANEJ GRUPY
    // { "authenthication": "string" } // header
    // /api/groups/:groupId/notes

    const clinet = req.user
    const groupId = req.params.groupId
    const targetGroup = await this.getGroupObject(groupId)

    if (!targetGroup)
      return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

    if (!this.isUserAssigned(clinet.id, targetGroup))
      return res.status(400).json({ code: 305, error: "User is not a member of this group." })

    const notes = await this.getAllUserNotesInGroup(groupId, clinet.id).then(cursor => cursor.toArray())

    return res.json( {notes} )
  }




  httpCreateNote = async (req, res, next) => { // Stworzenie oceny /api/groups/:groupId/notes/
    // POST { "authenthication": "string" } // header
    // { "value": "string","description": "string" }
    const groupId = req.params.groupId
    const { value, description, userId } = req.body
    const lecturer = req.user
    const note = new Grade(userId, lecturer, value, groupId, { description })

    const targetGroup = await this.getGroupObject(groupId)

    if (!targetGroup)
      return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

    if (!this.isUserAssigned(userId, targetGroup))
      return res.status(400).json({ code: 305, error: "User is not a member of this group." })

    const isAdmin = await this.requiredModules.platformModule.checkUserAdmin(lecturer.id, targetGroup.platformId)

    if (!(this.isLecturer(lecturer.id, targetGroup) || isAdmin))
      return res.status(400).json({ code: 304, error: "Only lecturer or Admin can create an new notes." })

    await this.saveNote(note)

    return res.json({ note })
  }






  httpGetAllMyNotes = async (req, res, next) => {
    // GET Pobranie WSZYSTKICH ocen użytkownika
    // { "authenthication": "string" } // header
    // /api/groups/notes { "authenthication": "string" } // header

    const client = req.user


    const groupsInPlatforms = {}
    const notesInGroups = {}

    const userPlatforms = await this.requiredModules.platformModule.getAllUserPlatforms(client.id).then(cur => cur.toArray())
    /** @type {Group[]} */
    const userGroups = await this.getAllUserGroups(client.id).then(cur => cur.toArray())
    const userNotes = await this.getAllUserNotes(client.id).then(cur => cur.toArray())

    // zmiana nazwy db dla ocen

    userPlatforms.forEach(platform => groupsInPlatforms[platform.id] = {
      platform,
      groups: []
    })

    userGroups.forEach(group => notesInGroups[group.id] = {
      group,
      notes: []
    })

    userNotes.forEach(note => notesInGroups[note.groupId].notes.push(note))
    Object.values(notesInGroups).forEach(value =>
      groupsInPlatforms[value.group.platformId].groups.push(value)
    )

    const data = Object.values(groupsInPlatforms)

    return res.json({ data })
  }

  httpHandleAllGroupsInPlatform = async (req, res, next) => {
    const user = req.user

    console.log(req.params)
    const targetPlatform = req.params.platformId

    if (!(await this.requiredModules.platformModule.platformExist(targetPlatform)))
      return res.status(400).json({ code: 208, error: "Cannot create new User. Bacause target platform does not exist." })

    if (!(await this.requiredModules.platformModule.checkUserAdmin(user.id, targetPlatform)))
      return res.status(400).json({ code: 209, error: "You are not an admin, to get all groups in platform." })

    const groups = await this.dbManager.findManyObjects(
      this.collectionName,
      { platformId: { $eq: targetPlatform } }
    ).then(cursor => cursor.toArray())

    return res.json({ groups })
  }



  httpHandleMyGroups = async (req, res, next) => {
    // GET Lista grup usera - wszystkie do które należy. /api/groups // header { "authenthication": "string" }
    const client = req.user

    //BUG
    const clientGroups = await this.dbManager.findManyObjects(
      this.collectionName,
      { membersIds: { $in: [client.id] } }
    ).then(cursor => cursor.toArray())



    return res.json({ groups: clientGroups })
  }


  httpDeleteGroup = async (req, res, next) => {
    // DELETE Kasowanie grupy /api/groups/:groupId   { "authenthication": "string" } // header

    /** @type {import("../user/index.js").default} */
    const userMod = this.requiredModules.userModule
    /** @type {import("../platform/index.js").default} */
    const platformMod = this.requiredModules.platformModule

    const { groupId } = req.body

    if (!(await this.groupExist(groupId)))
      return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

    if (!(await platformMod.checkUserAdmin(req.user.id, platformId)))
      return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })

    await this.dbManager.deleteObject(this.collectionName, { id: { $eq: groupId } })

    return res.json({ code: 303, success: "Group has been deleted sucessfuly." })
  }


  httpAddGroupMember = async (req, res, next) => {
    /** @type {import("../user/index.js").default} */
    const userMod = this.requiredModules.userModule
    /** @type {import("../platform/index.js").default} */
    const platformMod = this.requiredModules.platformModule


    const { groupId, usersIds } = req.body

    if (!(await this.groupExist(groupId)))
      return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

    // poobrac objekt grupy.
    //  grupa.platformId
    const groupObj = await this.dbManager.findObject(
      this.collectionName,
      { id: { $eq: groupId } }
    )

    if (!(await platformMod.checkUserAdmin(req.user.id, groupObj.platformId)))
      return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })

    if (!DEBUG) {
      // BUG: PAWEŁ
      const result = await Promise.all(usersIds.map(userId => userMod.userExist(userId)))
      console.log({ result })
      if (!result.every(Boolean))
        return res.status(400).json({ code: 301, error: "You are trying to assign non existing user." })

      // TODO: check list if exist, filter existing members, and add them, return to client partly bad. with notAdded : [ids]
      // findOneAndUpdate(
      //   <filter>,
      //   <update document or aggregation pipeline>,
      //  { $push: { <field1>: { <modifier1>: <value1>, ... }, ... } }
    }


    await this.dbManager.findOneAndUpdate(
      this.collectionName,
      { id: { $eq: groupId } },
      { $push: { membersIds: { $each: usersIds } } },
    )
    return res.json({ code: 302, success: "Succesfully assigned users to group." })
  }



  httpCreateGroup = async (req, res, next) => {
    // header { "authenthication": "string" }
    // body:{"name": "string", "lecturer": "string", "platformId":"string"}

    /** @type {import("../user/index.js").default} */
    const userMod = this.requiredModules.userModule
    /** @type {import("../platform/index.js").default} */
    const platformMod = this.requiredModules.platformModule

    const { name, lecturer, platformId } = req.body
    const client = req.user

    if (!(await platformMod.platformExist(platformId)))
      return res.status(400).json({ code: 207, error: "Platform does not exist" })

    if (!(await platformMod.checkUserAdmin(client.id, platformId)))
      return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })


    const lecturerObj = await userMod.getUserById(lecturer)


    let group = new Group(name, lecturerObj, platformId)
    group.membersIds.push(lecturerObj.id)
    await this.saveGroup(group)

    await this.dbManager.updateObject(
      `platforms`,
      { id: { $eq: platformId } },
      {$push :{ assignedGroups: group.id}}
    )

    //BUG: ASSIGN GROUP TO PLATFORM

    return res.status(200).json(group)
  }

  saveGroup = (group) => this.dbManager.insertObject(this.collectionName, group)
  saveNote = (note) => this.dbManager.insertObject(`groupsNotes`, note)

  groupExist = (groupId) => this.dbManager.objectExist(this.collectionName, { id: { $eq: groupId } })

  isLecturer = (userId, groupObj) => groupObj.lecturer.id === userId

  getAllUserGroups = (userId) => this.dbManager.findManyObjects('groups', { membersIds: { $in: [userId] } })

  getGroupObject = (groupId) =>
    this.dbManager.findObject(this.collectionName, { id: { $eq: groupId } })

  getAllPlatformGroups = (platformId) => this.dbManager.findManyObjects(this.collectionName, { platformId: { $eq: platformId } })
  getAllUserNotes = (userId) =>
    this.dbManager.findManyObjects('groupsNotes', { userId: { $eq: userId } })
  getAllUserNotesInGroup = (groupId, userId) =>
    this.dbManager.findManyObjects('groupsNotes', { userId: { $eq: userId }, groupId: { $eq: groupId } })

  isUserAssigned = (userId, groupObj) =>
    groupObj.membersIds.some(id => id === userId)





  toString() {
    return "GroupModule"
  }

  static toString() {
    return "GroupModule"
  }



}