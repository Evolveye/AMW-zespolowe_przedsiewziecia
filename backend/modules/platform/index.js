import { sameWords } from "../../src/utils.js";
import Module from "../module.js";
import group from '../group/index.js'
import { ANSWERS } from "./consts.js";
import { Platform } from "./model.js"
import User from './../user/model.js'
import { DEBUG } from '../../consts.js'


export default class PlatformModule extends Module {
  static requiredModules = [`UserModule`]

  constructor(...params) {
    super(`platforms`, ...params)
  }


  /** @param {import('express').Express} app */
  configure(app) {

    // console.log( this.requiredModules )
    // GET Lista wszystkich platform usera /api/platforms
    // POST Tworzenie platformy /api/platforms
    // GET Lista userów platformy /api/platforms/id:number/users
    // DELETE /api/platforms/id:number/users/id:number

    app.get(`/api/platforms`, this.httpGetUserPlatforms) // Lista wszystkich platform usera  "authenthication": "string"
    app.post(`/api/platforms`, this.httpCreatePlatform) // Tworzenie platformy /api/platforms
    app.post(`/api/platforms/:id/users`, this.httpCreateNewUser) // Tworzenie użytkownika do platformy.
    app.get(`/api/platforms/:id/users`, this.httpGetUsersOfPlatform)  // Lista userów platformy /api/platforms/id:number/users
    app.delete(`/api/platforms/:platformId/users/:userId`, this.httpDeleteUserFromPlatform) // Kasowanie userów z platformy /api/platforms/id:number/users/id:number
    app.delete(`/api/platforms/:id`, this.httpDeletePlatform) // DELETE usuwanie platformy  /api/platforms/:id
  }


  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {
    socket.on(`api.get.platforms`, () => { })
    socket.on(`api.post.platforms`, () => { })
    socket.on(`api.get.platforms.users`, () => { })
    socket.on(`api.delete.platforms.users`, () => { })
  }


  httpDeleteUserFromPlatform = async (req, res, next) => {
    // GET Kasowanie userów z platformy /api/platforms/id:number/users/id:number
    const { platformId, userId } = req.params

    const client = req.user
    const targetPlatform = await this.getPlatformFromDb(platformId)

    if (! await this.isPlatformOwner(client.id, targetPlatform)) return res.status(405).json(ANSWERS.PLATFORM_DELETE_NOT_ADMIN)
    if (sameWords(client.id, userId)) return res.status(400).json({ code: 204, error: "Platform owner can not delete himsef, from platform users." })
    if (!this.isUserAssigned(userId, targetPlatform)) return res.status(400).json(ANSWERS.PLATFORM_USER_NOT_MEMBER)

    await this.dbManager.updateObject(this.collectionName, { 'id': targetPlatform.id }, { $pull: { 'membersIds': userId } })

    res.status(200).send({ code: 205, success: "User has been deleted." })
  }
  

  httpDeletePlatform = async (req, res, next) => {
    // DELETE usuwanie platformy   /api/platforms/:id
    const targetPlatformId = req.params.id

    if (!await this.checkUserAdmin(req.user.id, targetPlatformId)) return res.status(400).json({ code: 209, error: "You dont have privilages to create new users on this platform." })
    await this.dbManager.deleteObject(this.collectionName, { id: { $eq: targetPlatformId } })
    return res.status(200).json({ code: 210, success: "Platform deleted successfuly." })
  }


  httpGetUserPlatforms = async (req, res, next) => {
    //  get(`/api/platforms`, this.httpGetAllPlatforms) // Lista wszystkich platform usera
    const user = req.user

    /** @type {Array} assignedPlatforms */
    const assignedPlatforms = await this.getAllUserPlatforms(user.id).then(cursor => cursor.toArray())

    if (!assignedPlatforms) return res.status(400).json({ code: 208, error: `This user dont belong to any platform.` }) // TODO: Send empty array.

    // this.logger(` ${user.name} ${user.surname} ${JSON.stringify({ PlatformList: assignedPlatforms.map(a => a.name) })}`)

    return res.status(200).json(assignedPlatforms);
  }


  httpCreateNewUser = async (req, res, next) => {
    const { name, surname, email } = req.body;
    const user = new User(name, surname, email, { activated: true })

    if (!DEBUG) {
      let mess = user.validEmail()
      if (mess) return res.status(400).json(mess)

      mess = user.validNames()
      if (mess) return res.status(400).json(mess)
    }

    const targetPlatformId = req.params.id

    if (!await this.platformExist(targetPlatformId))
      return res.status(400).json({ code: 208, error: "Cannot create new User. Bacause target platform does not exist." })

    if (!await this.checkUserAdmin(req.user.id, targetPlatformId))
      return res.status(400).json({ code: 209, error: "You dont have privilages to create new users on this platform." })


    const newUser = new User(name, surname, email, { activated: true })
    await this.requiredModules[0].UserModule.saveUserInDb(newUser);
    delete newUser.password

    // TODO: Wyslij email. ze ktoś dodał do platfformy.
    await this.dbManager.updateObject(this.collectionName, { id: targetPlatformId }, { $push: { membersIds: newUser.id } })
    return res.status(200).json({ user: newUser });
  }

  platformExist = id => {
    return this.dbManager.findObject(this.collectionName, { id: { $eq: id } })
  }


  httpGetUsersOfPlatform = async (req, res, next) => {
    // GET Lista userów platformy /api/platforms/id:number/users
    const targetPlatformId = req.params.id

    if (!targetPlatformId)
      return res.status(400).json({ code: 211, error: "Please provide correct platform id." })
    if (!this.checkUserAssigned(req.user.id, targetPlatformId))
      return res.status(400).json({ code: 212, error: "Can not send users from platform, where u are not assigned in." })

    const processedUsers = await this.getAllUsersInPlatform(targetPlatformId)
      .then(ids => ids.map(id => this.requiredModules[0].UserModule.getUserById(id)))
      .then(users => Promise.all(users))
      .then(users => users.map(({ login, password, ...processedUser }) => processedUser))

    return res.status(200).json(processedUsers)
  }


  httpCreatePlatform = async (req, res, next) => {
    // POST Tworzenie platformy /api/platforms
    const { name } = req.body

    if (!name) return res.status(400).json({ code: 203, error: "Platform name not provided." })
    if (!await this.canCreatePlatform(req.user.id)) return res.status(400).json({ code: 210, error: "You have already an your own platform." })

    const newPlatform = new Platform(req.user, name)
    await this.savePlatformInDb(newPlatform);

    return res.status(200).json(newPlatform)
  }


  getAllUserPlatforms(userId) {
    return this.dbManager.findManyObjects(this.collectionName, { membersIds: { $eq: userId } })
  }


  canCreatePlatform = async (userId) => {
    const ownerOf = await this.dbManager.findManyObjects(this.collectionName, { 'owner.id': { $eq: userId } }).then(cursor => cursor.toArray())
    return ownerOf.length === 0 // TODO: max count of owner platform.
  }


  getAllPlatformsInDb() {
    return this.dbManager.getCollection(this.collectionName)
  }


  async getAllUsersInPlatform(platformId) {
    const platforms = await this.getPlatformFromDb(platformId)
    return platforms.membersIds
  }


  savePlatformInDb(platform) {
    return this.dbManager.insertObject(this.collectionName, platform)
  }


  getPlatformFromDb(platformId) {
    return this.dbManager.findObject(this.collectionName, { id: platformId })
  }


  isUserAssigned(userId, platformObj) {
    const userList = platformObj.membersIds
    // console.log({ assigned: userList.some(id => id === userId  )})
    return userList.some(id => id === userId)
  }


  isPlatformOwner(userId, platformObj) {
    return userId === platformObj.owner.id
  }


  async checkUserAdmin(userId, platformId) {
    const platform = await this.getPlatformFromDb(platformId)
    return platform.owner.id === userId
  }


  async checkUserAssigned(userId, platformId) {
    const platform = await this.getPlatformFromDb(platformId) // w platformach sa id userow
    const userList = platform.membersIds
    return userList.some(id => id === userId)
  }

  
  toString = () => this.constructor.toString()
  static toString = () => "PlatformModule"
}