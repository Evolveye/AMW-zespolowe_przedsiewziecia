import Meet from './model.js'
import Module from '../module.js'
import { sameWords } from '../../src/utils.js'

export default class MeetModule extends Module {
  static requiredModules = [`UserModule`, `PlatformModule`, `GroupModule`]

  constructor(...params) {
    super(`meets`, ...params)

    // const myCollections = [``] // ${this.collectionName}
    // new Promise(async res => {
    //     myCollections.forEach(async collectionName => {
    //         if (!(await this.dbManager.collectionExist(collectionName)))
    //             await this.dbManager.createCollection(collectionName)
    //     })
    //     res()
    // })
  }

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {

  }


  configure(app) {
    // Tworzenie spotkania /api/meets
    app.post(`/api/meets`, this.httpHandleCreateMeet)

    // Odczytywanie wszystkich spotkań /api/meets
    app.get(`/api/meets`, this.httpHandleGetAllMeets)

    //GET {{host}}/api/meets/:meetId
    app.get(`/api/meets/:meetId`, this.httpHandleMeetInfo)

    //   Odczytywanie wszystkich spotkań z danej grupy /api/meets/group/:groupId
    // GET{ "authenthication": "string" } // header{ // body  "meets": [    "<Meet>"  ]}
    app.get(`/api/meets/group/:groupId`, this.httpHandleGetAllMeetingFromGroup)

    // Odczytywanie uczestników spotkania /api/meets/:meetId/users
    // GET // header { "authenthication": "string" }
    //  / response  { / "participants": [    "<User>"  ]}
    app.get(`/api/meets/:meetId/users`, this.handleGetAllMeetingMembers)


    // Odczytywanie wszystkich publicznych spotkań /api/meets/public
    // GET // header { "authenthication": "string" } // body {   "meets": [    "<Meet>"  ]}
    //  wszystkie meet.public === true
    //  WSZYSCY - nie ważne od zapytania.
    app.get(`/api/meets/public`, this.httpHandlePublicMeets)


    // Odczytywanie wszystkich spotkań nieprzypisanych do grupy /api/meets/groupless
    // GET // header  { "authenthication": "string" } // body { "meets": [ "<Meet>" ] }
    // memersIds => contain user
    // admin widzi.
    app.get(`/api/meets/groupless`, this.httpHandleGrouplessMeetings)

    // //Dodawanie uczestników do spotkania /api/meets/:meetId/users
    // // // header POST{ "authenthication": "string" }
    // // // body {   "participantsIds": [    "<string>"  ]}
    app.post(`/api/meets/:meetId/users`, this.httpHandleAddUsers)

    // // Usuwanie uczestnika ze spotkania
    // // DELETE{ "authenthication": "string" } // header
    app.delete(`/api/meets/:meetId/users/:userId`, this.httpHandleDeleteUserFromMeeting)

    // //Kasowanie spotkania /api/meets/:meetId
    // //DELETE { "authenthication": "string" } // header
    app.delete(`/api/meets/:meetId`, this.httpHandleDeleteMeet)
  }

  httpHandleGrouplessMeetings = async (req, res, next) => {
    // Odczytywanie wszystkich spotkań nieprzypisanych do grupy /api/meets/groupless
    // GET // header  { "authenthication": "string" } // body { "meets": [ "<Meet>" ] }
    // memersIds => contain user
    // admin widzi.


    const client = req.user

    const meetings = await this.dbManager.findManyObjects(
      this.collectionName,
      { membersIds: client.id, groupId: "" }
    ).then(cursor => cursor.toArray())


    return res.json({meets:meetings})
  }


  httpHandlePublicMeets = async (req, res, next) => {
    const meets = await this.dbManager.findManyObjects(
      this.collectionName,
      { public: true }
    ).then(cursor => cursor.toArray())

    return res.json({ meets })
  }

  httpHandleDeleteUserFromMeeting = async (req, res, next) => {
    // Usuwanie uczestnika ze spotkania
    // DELETE{ "authenthication": "string" } // header
    /// api/meets/:meetId/users/:userId
    const client = req.user
    const { meetId, userId } = req.params

    const meetingObj = await this.getMeetingById(meetId)
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct."
      })


    const isLecturer = this.isUserLecturer(client.id, meetingObj)
    const isOwner = await this.requiredModules.platformModule.checkUserAdmin(client.id, meetingObj.platformId)
    if (!isLecturer && !isOwner)
      return res.status(400).json({
        code: 408,
        error: "Only lecturer or Platform owner, have access to add members to meeting."
      })

    const isMember = this.isMeetingMember(userId, meetingObj)
    if (!isMember)
      return res.status(400).json({
        code: 410,
        error: "Targeted user isn't a member of specified group"
      })

    if (sameWords(client.id, userId))
      return res.status(400).json({
        code: 411,
        error: "As lecturer or PlatOwner - PO - You can not delete himself from meeting members."
      })

    await this.dbManager.updateObject(
      this.collectionName,
      { id: { $eq: meetingObj.id } },
      { $pull: { membersIds: userId } }
    )
    return res.json({ code: 412, success: "User has been deleted from user list of meeting" })
  }


  httpHandleAddUsers = async (req, res, next) => {
    const client = req.user
    const meetingId = req.params.meetId
    let newMembers = req.body.participantsIds

    if (!Array.isArray(newMembers))
      newMembers = [newMembers]

    const meetingObj = await this.getMeetingById(meetingId)
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct."
      })

    const isLecturer = this.isUserLecturer(client.id, meetingObj)
    const isOwner = await this.requiredModules.platformModule.checkUserAdmin(client.id, meetingObj.platformId)

    if (!isLecturer && !isOwner)
      return res.status(400).json({
        code: 408,
        error: "Only lecturer or Platform owner, have access to add members to meeting."
      })

    //TODO: check that user exist.

    await this.dbManager.findOneAndUpdate(
      this.collectionName,
      { id: { $eq: meetingId } },
      { $push: { membersIds: { $each: newMembers } } },
    )

    return res.json({ code: 409, success: "New parcipants has been assigned to meeting" })
  }


  handleGetAllMeetingMembers = async (req, res, next) => {
    const client = req.user
    const meetingId = req.params.meetId

    const meetingObj = await this.getMeetingById(meetingId)
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct."
      })
    // const isLecturer = this.isUserLecturer(client.id, meetingObj)
    // jest dopisywany do membersów.

    const isOwner = await this.requiredModules.platformModule.checkUserAdmin(client.id, meetingObj.platformId)
    const isMember = this.isMeetingMember(client.id, meetingObj)

    if (!isOwner && !isMember)
      return res.status(400).json({
        code: 407,
        error: "Only meeting members or Platform owner, have access to display users of specyfic meeting"
      })

    const idsInMeeting = meetingObj.membersIds

    const tasks = idsInMeeting.map(userId => this.requiredModules.userModule.getUserById(userId))

    const usersArr = await Promise.all(tasks)

    return res.json({ participants: usersArr })
  }

  httpHandleDeleteMeet = async (req, res, next) => {
    //Kasowanie spotkania /api/meets/:meetId
    //DELETE { "authenthication": "string" } // header
    const client = req.user
    const meetingId = req.params.meetId

    const meetingObj = await this.getMeetingById(meetingId)
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct."
      })
    const isLecturer = this.isUserLecturer(client.id, meetingObj)

    const isOwner = await this.requiredModules.platformModule.checkUserAdmin(client.id, meetingObj.platformId)

    if (!isLecturer && !isOwner)
      return res.status(400).json({
        code: 405,
        error: "Only Lecturer of meeting or platform Owner can delete an meeting"
      })

    await this.deleteMeetingById(meetingObj.id)

    return res.json({ code: 406, success: "Meeting has been deleted succesfully." })
  }


  httpHandleGetAllMeetingFromGroup = async (req, res, next) => {
    const client = req.user
    const groupId = req.params.groupId

    const groupObj = await this.requiredModules.groupModule.getGroupObject(groupId)

    if (!groupObj)
      return res.status(400).json({
        code: 403,
        error: "Can not find specyfied group. Make sure you passed correct groupId"
      })

    const isMember = this.requiredModules.groupModule.isUserAssigned(client.id, groupObj)
    const isOwner = await this.requiredModules.platformModule.checkUserAdmin(client.id, groupObj.platformId)

    if (!isMember && !isOwner)
      return res.status(400).json({
        code: 402,
        error: "Only meeting members or platform owner has access to see meeting of the specyfied group."
      })

    const meetingList = await this.getMeetingsByGroupId(groupId).then(cursor => cursor.toArray())

    return res.json({ meets: meetingList })
  }


  httpHandleMeetInfo = async (req, res, next) => {
    const meetId = req.params.meetId
    const client = req.user

    if (! /\d/.test(meetId))
      return next()

    const meetingObj = await this.getMeetingById(meetId)
    if (!meetingObj)
      return res.status(400).json({ code: 403, error: "Can not find meeting with provided id." })

    const isOwner = await this.requiredModules.platformModule.checkUserAdmin(client.id, meetingObj.platformId)


    // members or owner
    const member = meetingObj.membersIds.some(id => id === client.id)
    if (!member && !isOwner)
      return res.status(400).json({ code: 402, error: "Only meeting members or platform owner can see meeting information." })

    return res.json({ meet: meetingObj })
  }

  httpHandleGetAllMeets = async (req, res, next) => {
    // "meets": [
    //     "<Meet>"
    //   ]
    const client = req.user

    const meets = await this.getAllMeets(client.id).then(cursor => cursor.toArray())

    return res.json({ meets })
  }


  httpHandleCreateMeet = async (req, res, next) => {
    // Tworzenie spotkania /api/meets
    // POST
    // { "authenthication": "string" } // header
    // { // body
    //   "dateStart": "number",
    //   "dateEnd": "number",
    //   "description": "string",
    //   "externalUrl": "string",
    //   "platformId": "string",
    //   "groupId?": "string"
    // }

    const client = req.user

    const { dateStart, dateEnd, description, externalUrl, platformId, groupId } = req.body

    const isAssigned = await this.requiredModules.platformModule.checkUserAssigned(client.id, platformId)

    if (!isAssigned)
      return res.status(400).json({ code: 400, error: "You cant create meeting on platform, You need to be a member of platfrom." })

    //TODO: remove double assigmentn of user.
    const ids = groupId ? [client.id, ...(await this.requiredModules.groupModule.getGroupObject(groupId)).membersIds] : [client.id]

    const meeting = new Meet(
      client, description, platformId, ids, externalUrl,
      { dateStart: dateStart, dateEnd: dateEnd, groupId: groupId }
    )

    if (!meeting.validate())
      return res.status(400).json({ code: 401, error: "Date is not correct." })

    await this.saveMeetingInDb(meeting)

    return res.json({ meet: meeting })
  }


  getAllMeets = (memberId) =>
    this.dbManager.findManyObjects(this.collectionName, { membersIds: memberId })

  saveMeetingInDb = (meet) => this.dbManager.insertObject(this.collectionName, meet)
  getMeetingById = (meetId) => this.dbManager.findObject(this.collectionName, { id: { $eq: meetId } })
  getMeetingsByGroupId = (groupId) => this.dbManager.findManyObjects(this.collectionName, { groupId: { $eq: groupId } })
  isUserLecturer = (userId, meetObj) => meetObj.lecturer.id === userId
  deleteMeetingById = (meetingId) => this.dbManager.deleteObject(this.collectionName, { id: { $eq: meetingId } })
  isMeetingMember = (userId, meetingObj) => meetingObj.membersIds.some(id => id === userId)

  /**@returns {string}  Name of class */
  toString = () => this.constructor.toString()

  /**@returns {string}  Name of class */
  static toString = () => "NoteModule"
}