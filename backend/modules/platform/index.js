import { sameWords } from "../../src/utils.js";
import Module from "../module.js";
import group from '../group/index.js'
import { ANSWERS } from "./consts.js";
import { Platform } from "./model.js"
import User from './../user/model.js'

export default class PlatformModule extends Module {
  static requiredModules = [ `UserModule` ]

  constructor( ...params ) {
    super( `platforms`, ...params )
  }

  /** @param {import('express').Express} app */
  configure(app) {

   // console.log( this.requiredModules )
    // GET Lista wszystkich platform usera /api/platforms
    // POST Tworzenie platformy /api/platforms
    // GET Lista userów platformy /api/platforms/id:number/users
    // DELETE /api/platforms/id:number/users/id:number

    app.get(`/api/platforms`, this.handleGetAllPlatforms)
    app.post(`/api/platforms`, this.handleCreatePlatform)
    app.post(`/api/platforms/:id/users`, this.handleCreateNewUser)
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


  handleCreateNewUser = async (req,res,next)=>{
    const { name, surname, email } = req.body;
    const user = new User(name,surname,email,{activated:true})

    if (!DEBUG) {
      let mess = user.validEmail()
      if(mess) return res.status(400).json(mess)

      mess = user.validNames()
      if(mess)return res.status(400).json(mess)
    }

    const targetPlatform = req.params.id
    //TODO sprawdzenie czy platfroma istnieje


    const newUser = new User(name, surname, email, { activated: true })
    console.log(this.requiredModules)
    await this.requiredModules.saveUserInDb(newUser);
    delete newUser.password
    // dodaj wpis w db.platforms i dopisz do members.

    this.dbManager.updateObject(this.collectionName,{id:targetPlatform},{$push:{membersIds:newUser.id }})

    return res.status(200).json({ user: newUser });
  }


  httpDeleteUserFromPlatform = async (req, res, next) => {
    //const { platformId, userId } =// :platformId/users/:userId
    const { platformId, userId } = req.params
    const sender = req.user

    const targetPlatform = await this.getPlatformFromDb(platformId)

  //  console.log({ targetPlatform })
    this.dbManager.findObject(this.collectionName, { admin: sender.id, admin2: targetPlatform.owner.id })

    if (!this.isPlatformOwner(sender.id, targetPlatform)) return res.status(405).json(ANSWERS.PLATFORM_DELETE_NOT_ADMIN)
    if(sameWords(sender.id,userId)) return res.status(400).json({code:204,error:"Platform owner can not delete himsef, from platform users."})
    if (!this.isUserAssigned(userId, targetPlatform)) return res.status(400).json(ANSWERS.PLATFORM_USER_NOT_MEMBER)

    await this.dbManager.updateObject(this.collectionName, { 'id': targetPlatform.id }, { $pull: { 'membersIds': userId } })

    res.status(200).send({code:205,success:"User has been deleted."})
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
    let platforms = await this.dbManager.getCollection(this.collectionName)
    return platforms.filter((platform) => platform.membersIds.some(id => id === userId))
  }

  getAllPlatformsInDb() {
    return this.dbManager.getCollection(this.collectionName)
  }

  async getAllUsersInPlatform(platformId) {
    return await this.getPlatformFromDb(platformId).membersIds
  }

  savePlatformInDb(platform) {
    return this.dbManager.insertObject(this.collectionName, platform)
  }

  async getPlatformFromDb(platformId) {
    return  await this.dbManager.findObject(this.collectionName, { id: platformId })
  }

  addUserToPlatform(userId)
  {

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
    return platform.administrator.id === userId
  }

  async checkUserAssigned(userId, platformId) {
    const platform = await this.getPlatformFromDb(platformId) // w platformach sa id userow
    const userList = platform.membersIds
    return userList.some(id => id === userId)
  }

  toString = () => this.constructor.toString()
  static toString = () => "PlatformModule"
}