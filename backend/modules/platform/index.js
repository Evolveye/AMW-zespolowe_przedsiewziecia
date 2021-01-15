import { sameWords } from "../../src/utils.js";
import Module from "../baseModule.js";
import group from '../group/index.js'
import { ANSWERS } from "./consts.js";
import { Platform } from "./model.js"

export default class PlatformModule extends Module {
  static requiredModules = [ `UserModule` ]

  #usersDb = `users`
  #platformsDb = `platforms`

  /**
  * @param {Logger} logger
  * @param {DatabaseManager} dbManager
  */
  constructor(logger, dbManager) {
    super(logger, dbManager)
  }
  /**
  * @param {import('express').Express} app
  */


  configure(app) {
    // GET Lista wszystkich platform usera /api/platforms
    // POST Tworzenie platformy /api/platforms
    // GET Lista userów platformy /api/platforms/id:number/users
    // DELETE /api/platforms/id:number/users/id:number
    app.get(`/api/platforms`, this.handleGetAllPlatforms)
    app.post(`/api/platforms`, this.handleCreatePlatform)
    app.get(`/api/platforms/:id/users`, this.handleAllUserPlatforms)
    app.delete(`/api/platforms/:platformId/users/:userId`, this.httpDeleteUserFromPlatform)
  }


  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {
    socket.on(`api.get.platforms`, () => { })
    socket.on(`api.post.platforms`, () => { })
    socket.on(`api.get.platforms.users`, () => { })
    socket.on(`api.delete.platforms.users`, () => { })
  }



  httpDeleteUserFromPlatform = async (req, res, next) => {
    //const { platformId, userId } =// :platformId/users/:userId
    const { platformId, userId } = req.params
    const sender = req.user
    const token = req.token

    //console.log({ params:req.params, platformId, userId, compare: userId == userId })

    const targetPlatform = await this.getPlatformFromDb(platformId)

  //  console.log({ targetPlatform })
    this.dbManager.findObject(this.#platformsDb, { admin: sender.id, admin2: targetPlatform.owner.id })

    if (!this.isPlatformOwner(sender.id, targetPlatform)) return res.status(405).json(ANSWERS.PLATFORM_DELETE_NOT_ADMIN)
    // if admin is a target user.?
    if(!sameWords(sender.id))
    if (!this.isUserAssigned(userId, targetPlatform)) return res.status(400).json(ANSWERS.PLATFORM_USER_NOT_MEMBER)

    await this.dbManager.updateObject(this.#platformsDb, { 'id': targetPlatform.id }, { $pull: { 'membersIds': userId } })

   // console.log({ sender, token, platformId, userId })
   // console.log("Deleted sucessfuly user.")

    res.status(200).send()
  }





  handleGetAllPlatforms = async (req, res, next) => {
    // wszystkie platformy do ktorych nalezy user.
    const userId = req.user.id

    const allPlatforms = await this.getAllUserPlatforms(userId)

    return res.status(200).json(allPlatforms);
  }



  handleAllUserPlatforms = async (req, res, next) => {
    const targetPlatform = req.params.id

    const usersInPlatform = await this.getAllUsersInPlatform(targetPlatform)

    res.status(200).json(usersInPlatform)
  }


  handleCreatePlatform = async (req, res, next) => {
    const { name } = req.body

    const sender = req.user

    console.log({ name, sender })

    if (!name) res.status(400).json({ code: 203, error: "Platform name not provided." })


    const newPlatform = new Platform(sender, name)

    await this.savePlatformInDb(newPlatform);

    return res.status(200).json(newPlatform)
  }



  async getAllUserPlatforms(userId) {
    let platforms = await this.dbManager.getCollection(this.#platformsDb)
    return platforms.filter((platform) => platform.members.some(id => id === userId))
  }

  getAllPlatformsInDb() {
    return this.dbManager.getCollection(this.#platformsDb)
  }

  async getAllUsersInPlatform(platformId) {
    return await this.getPlatformFromDb(platformId).members
  }

  savePlatformInDb(platform) {
    return this.dbManager.insertObject(this.#platformsDb, platform)
  }

  async getPlatformFromDb(platformId) {
    return  await this.dbManager.findObject(this.#platformsDb, { id: platformId })
  }



  isUserAssigned(userId, platformObj) {
    const userList = platformObj.members
    console.log({ assigned: userList.some(id => id === userId  )})
    return userList.some(id => id === userId)
  }

  isPlatformOwner(userId, platformObj) {
    return userId === platformObj.owner.id
  }

  async checkUserAdmin(userId, platformId) {
    const platform = await this.getPlatformFromDb(platformId)
    return platform.administrator.id === userId
  }

  async checkUserAssigned(userId, platformId) {
    const platform = await this.getPlatformFromDb(platformId) // w platformach sa id userow
    const userList = platform.members
    return userList.some(id => id === userId)
  }

  toString = () => this.constructor.toString()
  static toString = () => "PlatformModule"
}