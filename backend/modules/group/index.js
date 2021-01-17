import Module from '../module.js'
import Group from './model.js'


// /**
//  * @typedef {Object} Group
//  * @property {string} lecturer
//  * @property {string} name
//  */
export default class groupModule extends Module {
  static requiredModules = [`UserModule`, `PlatformModule`]

  constructor(...params) {
    super(`groups`, ...params);

    const myCollections = [`${this.collectionName}Notes`]

    new Promise(async res => {
      myCollections.forEach(async collectionName => {
        if (!(await this.dbManager.collectionExist(collectionName)))
          await this.dbManager.createCollection(collectionName)
      })
      res()
    })

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


    // GET Pobranie wszystkich ocen użytkownika /api/groups/notes { "authenthication": "string" } // header
    // app.get(`/api/groups/notes`, this.httpGetMyNotes)
    // httpGetMyNotes = (req, res, next) => {
    //   // GET Pobranie wszystkich ocen użytkownika /api/groups/notes { "authenthication": "string" } // header
    //   //   "notes": [
    //   //     {
    //   //       "_id": "string",
    //   //       "value": "string",
    //   //       "description": "string",
    //   //       "date": "number",
    //   //       "lecturer": "User",
    //   //     }
    //   //   ]
    //   // }
    // }

  }


  httpHandleAllGroupsInPlatform = async (req, res, next) => {
    const user = req.user
    const targetPlatform = req.params.platformId

    if (!(await this.requiredModules.PlatformModule.platformExist(targetPlatform)))
      return res.status(400).json({ code: 208, error: "Cannot create new User. Bacause target platform does not exist." })

    if (!(await this.requiredModules.PlatformModule.checkUserAdmin(user.id, targetPlatform)))
      return res.status(400).json({ code: 209, error: "You dont have privilages to create new users on this platform." })

    const groups = await this.dbManager.findManyObjects(
      this.collectionName,
      { platformId: { $eq: targetPlatform } }
    ).then(Array.from)

    res.json({groups})
  }



  httpHandleMyGroups = async (req, res, next) => {
    // GET Lista grup usera - wszystkie do które należy. /api/groups // header { "authenthication": "string" }
    const client = req.user

    //BUG
    const clientGroups = await this.dbManager.findManyObjects(
      this.collectionName,
      { assignedUsers: { $elemMatch: client.id } }
    ).then(Array.from)

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


    const { groupId, userIds } = req.body

    if (!(await this.groupExist(groupId)))
      return res.status(400).json({ code: 302, error: "Targeted group does not exist." })

    if (!(await platformMod.checkUserAdmin(client.id, platformId)))
      return res.status(400).json({ code: 300, error: "Only platform admin can create a group." })


    // BUG: PAWEŁ
    const result = await Promise.all(userIds.map(userId => userMod.userExist(userId)))
    console.log({ result })
    if (!result.every(Boolean))
      return res.status(400).json({ code: 301, error: "You are trying to assign non existing user." })


    // TODO: check list if exist, filter existing members, and add them, return to client partly bad. with notAdded : [ids]

    // findOneAndUpdate(
    //   <filter>,
    //   <update document or aggregation pipeline>,
    //  { $push: { <field1>: { <modifier1>: <value1>, ... }, ... } }

    await this.dbManager.findOneAndUpdate(this.collectionName, { id: { $eq: groupId } }, { $push: { membersIds: userIds } })


    return res.status(200).json({ code: 302, success: "Succesfully assigned users to group." })
  }

  groupExist = (groupId) => this.dbManager.objectExist(this.collectionName, { id: { $eq: groupId } })


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
    await this.saveGroup(group);

    return res.status(200).json(group)
  }

  saveGroup = (group) => this.dbManager.insertObject(this.collectionName, group)

  isLecturerOrOwner = async (userId) => {

  }



  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {

  }






  toString() {
    return "GroupModule"
  }

  static toString() {
    return "GroupModule"
  }



}