import Module from "../module.js"
import Permissions, { ConnectorPlatformPermissionToUser, PlatformPermissions } from "./permissions.js"

import { ANSWERS, MAX_PLATFORM_NUMBER } from "./consts.js"
import * as middlewares from "./middlewares.js"

/** @typedef {import('express').Express} Express */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/** @typedef {import('./permissions').PlatformPermissions} PlatformPermissions */

/**
 * @typedef {object} MiddlewareParameters
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 * @property {PlatformModule} mod
 */

export default class PlatformModule extends Module {
  static requiredModules = [ `UserModule` ];
  static additionalModules = [ `GroupModule` ];

  subcollections = {
    newTemplatePermissions:`newPermissionsTemplates`,
    newUserPermissions:`newPermissionsUsers`,
    userInitialization:`init`,
  };

  //* * @return {PlatformPermissions} */
  logPerms( req ) {
    console.log( JSON.stringify( req.user, null, 2 ) )
  }

  getApi() {
    /** @type {import("../user/index.js").default} */
    const userModule = this.requiredModules.userModule
    const auth = userModule.auth
    const m = middlewares

    return { platforms: {
      get: auth( this.runMid( m.httpGetUserPlatforms ) ),
      post: auth( this.runMid( m.httpCreatePlatform ) ),

      "users":{
        "activate":{
          post: this.runMid( m.httpHandleFirstUserLogin ), // ?initialCode=123
        },
      },

      ":platformId": {
        delete: auth( this.perms( this.runMid( m.httpDeletePlatform ) ) ),
        get: auth( this.perms( this.runMid( m.httpGetUserPlatform ) ) ),

        "users": {
          get: auth( this.runMid( m.httpGetUsersOfPlatform ) ),
          post: auth( this.perms( this.runMid( m.httpCreateNewUser ) ) ),

          ":userId": {
            delete: auth( this.perms( this.runMid( m.httpDeleteUserFromPlatform ) ) ),
            put: auth( this.perms( this.runMid( m.httpAssignPermsToUser ) ) ),
          },
        },

        "newpermissions": {
          get: auth( this.perms( this.runMid( m.httpGetNewPlatformsPermissions ) ) ),
          post: auth( this.perms( this.runMid( m.httpCreatePlatformsPermissions ) ) ),

          ":roleId":{
            delete: auth( this.perms( this.runMid( m.httpDeletePlatformPermission ) ) ),
            put: auth( this.perms( this.runMid( m.httpUpdatePlatformsPermissions ) ) ),
          },
        },

        "permissions": {
          get: auth( this.runMid( m.httpGetPlatformsPermissions ) ),
          // post: auth(this.runMid(m.httpCreatePlatformsPermissions)),

          "my": {
            get: auth( this.runMid( m.httpHandleMyPermission ) ),
          },
          ":permissionId": {
            put: auth( this.runMid( m.httpUpdatePlatformsPermissions ) ),

            // delete: auth(this.perms(this.runMid(m.httpDeletePlatformPermission))), // TODO this.httpDeletePlatformPermission
            // put: auth(this.runMid(m.httpEditPlatformPermission)), // TODO this.httpEditPlatformPermission
          },
        },
      },

      "permissiontemplate": {
        get: m.httpGetBasePlatformPermisionTemplate,
      },


    } }

    /*
    new Map([
      [
        `platforms`,
        {
          get: auth(this.runMid(m.httpGetUserPlatforms)),
          post: auth(this.runMid(m.httpCreatePlatform)),
        },
      ],

      [
        `/platforms/:platformId/users`,
        {
          get: auth(this.runMid(m.httpGetUsersOfPlatform)),
          post: auth(this.perms(this.runMid(m.httpCreateNewUser))),
        },
      ],

      [
        `/platforms/:platformId/users/:userId`,
        {
          delete: auth(this.perms(this.runMid(m.httpDeleteUserFromPlatform))),
        },
      ],

      [
        `/platforms/:platformId`,
        {
          delete: auth(this.perms(this.runMid(m.httpDeletePlatform))),
        },
      ],
      [
        `/platforms/permissiontemplate`,
        {
         get: m.httpGetBasePlatformPermisionTemplate,
        },
      ],
      [
        `/platforms/:platformId/newpermissions`,
        {
          get: auth(this.runMid(m.httpGetNewPlatformsPermissions)),
          post: auth(this.runMid(m.httpCreatePlatformsPermissions)),
          put: auth(this.runMid(m.httpUpdatePlatformsPermissions))
        },
      ],

      [
        `/platforms/:platformId/permissions`,
        {
          get: auth(this.runMid(m.httpGetPlatformsPermissions)),
          // post: auth(this.runMid(m.httpCreatePlatformsPermissions)),
        },
      ],

      [
        `/platforms/:platformId/permissions/my`,
        {
          get: auth(this.runMid(m.httpHandleMyPermission)),
        },
      ],

      [
        `/platforms/:platformId/permissions/:permissionId`,
        {
          delete: auth(this.perms(this.runMid(m.httpDeletePlatformPermission))), // TODO this.httpDeletePlatformPermission
          put: auth(this.runMid(m.httpEditPlatformPermission)), // TODO this.httpEditPlatformPermission
        },
      ],
    ]);
    */
  }

  httpDeletePlatformPermission = async({ req, res }) => {
    // can manage roles.
    const { platformId, permissionId } = req.params
    const client = req.user

    if (!client.platformPerms.isMaster)
      return res.status( 400 ).json({ code: 234, error: `` }) // TODO: startpoint
  };

  /**
   * @param {(req:Request res:Response next:NextFunction) => void} cb
   * @return {(req:Request res:Response next:NextFunction) => void|Response }
   */
  perms = cb => async(req, res, next) => {
    const platformId =
      req.query.platformId || req.params.platformId || req.body.platformId

    if (!(await this.includePermsIntoReq( req, res, platformId )))
      cb( req, res, next )
  };

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {string} platformId
   */
  async includePermsIntoReq( req, res, platformId ) {


    if (!platformId)
      return res.status( 400 ).json( ANSWERS.PLATFORM_PERMS_PE_ID_MISS )

    let newPerms = await this.dbManager.aggregate(
      this.subcollections.newUserPermissions,
      { pipeline: [
        {
          $match: {
            $and: [
              {
                userId: {
                  $eq: req.user.id,
                },
              }, {
                platformId: {
                  $eq: platformId,
                },
              },
            ],
          },
        }, {
          $lookup: {
            from: this.subcollections.newTemplatePermissions,
            localField: `permissionId`,
            foreignField: `id`,
            as: `perms`,
          },
        }, {
          $unwind: {
            path: `$perms`,
          },
        },
      ] },
    ).toArray()
    newPerms = newPerms[ 0 ]

    const perms = await this.dbManager.findOne(
      this.subcollections.newUserPermissions,
      {
        $and: [
          { userId: { $eq: req.user.id } },
          { referenceId: { $eq: platformId } },
        ],
      },
    )

    if (!newPerms) {
      const platformMember = await this.checkUserAssigned( req.user.id, platformId )

      if (!platformMember)
        return res.status( 400 ).json( ANSWERS.PLATFORM_PERMS_NOT_MEMBER )

      const inDbPermission = await this.getNewPermission( `Student`, platformId )
      req.user.platformPerms = inDbPermission
      req.user.platformPerms.platformId = platformId
      const connector = new ConnectorPlatformPermissionToUser(platformId, req.user.id, inDbPermission.id)
      await this.saveConnectorPermsToUser( connector )
    } else {
      req.user.newPlatformPerms = newPerms
    }

    if (!perms) {
      const platformMember = this.checkUserAssigned( req.user.id, platformId )

      if (!platformMember)
        return res.status( 400 ).json( ANSWERS.PLATFORM_PERMS_NOT_MEMBER )

      const permissions = new Permissions(platformId, `student`).getProxy()

      req.user.platformPerms = permissions
      req.user.platformPerms.platformId = platformId

      await this.dbManager.insertObject(
        this.subcollections.newUserPermissions,
        permissions,
      )
    } else {
      req.user.platformPerms = new Permissions(
        platformId,
        perms.name,
        perms,
      ).getProxy()
    }
    // console.log({old:req.user.platformPerms.target,new:req.user.newPlatformPerms})
  }

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator( socket ) {
    socket.on( `api.get.platforms`, () => {} )
    socket.on( `api.post.platforms`, () => {} )
    socket.on( `api.get.platforms.users`, () => {} )
    socket.on( `api.delete.platforms.users`, () => {} )
  }

  getMyPermission = async(userObjOrId, platfromId) => {
    const userId = typeof userObjOrId == `string` ? userObjOrId : userObjOrId.id
    const userAssigned = await this.checkUserAssigned( userId, platfromId )

    if (!userAssigned) return null

    return this.getNewPermissionsByPlatfromIdAndUserId( platfromId, userId )

    // return this.dbManager.findOne(`platformModule.newPermissionsUsers`, {
    //   userId: { $eq: userId },
    //   referenceId: { $eq: platfromId },
    // });
  };

  async deletePlatformCascade( platformId ) {
    // co jesli 1 konto jest przypisane do wielu platform.
    let platform = await this.getPlatform( platformId )

    this.dbManager.find( this.basecollectionName, { id: { $eq: platformId } } )

    platform = await this.dbManager.findOneAndDelete( this.basecollectionName, {
      id: { $eq: platformId },
    } )

    if (!platform) throw new Error(`Drop Platform cascade has been refused.`)

    const query = { platformId: { $eq: platformId } }
    const deleteUsersTask = this.dbManager.deleteMany( `userModule`, {
      id: { $in: platform.membersIds },
    } )
    const deleteMeetingsTask = this.dbManager.deleteMany( `meetModule`, query )
    const deleteGroupsTask = this.dbManager.deleteMany( `groupModule`, query )
    const deleteNotesTask = this.dbManager.deleteMany( `groupModule.notes`, {
      groupId: { $in: platform.assignedGroups },
    } )

    return Promise.all([
      deleteUsersTask,
      deleteMeetingsTask,
      deleteGroupsTask,
      deleteNotesTask,
    ])
  }

  getPermission = (permissionName, platformId) => {
    return this.dbManager.findOne( this.subcollections.templatesPerm, {
      $and: [
        { referenceId: { $eq: platformId } },
        { name: { $eq: permissionName } },
      ],
    } )
  };

  getPermissionByPermId = (permissionId, platformId) => {
    return this.dbManager.findOne( this.subcollections.templatesPerm, {
      $and: [
        { referenceId: { $eq: platformId } },
        { id: { $eq: permissionId } },
      ],
    } )
  };

  getNewPermissionByPermId = (permissionId, platformId) => {
    return this.dbManager.findOne( this.subcollections.newTemplatePermissions, {
      $and: [
        { platformId: { $eq: platformId } },
        { id: { $eq: permissionId } },
      ],
    } )
  };

  platformExist = id => {
    return this.dbManager.findObject( this.basecollectionName, {
      id: { $eq: id },
    } )
    // return this.dbManager.findObject(`platforms`, { id: { $eq: id } })
  };

  createBaseRoles = (platformId,
    student = true,
    lecturer = true,
    owner = true) => {
    const basePerms = []

    if (student)
      basePerms.push(
        new Permissions(platformId, `Student`, { canTeach: true }),
      )
    if (lecturer)
      basePerms.push(
        new Permissions(platformId, `Prowadzący`, {
          isPersonel: true,
          canTeach: true,
        }),
      )
    if (owner)
      basePerms.push( new Permissions(platformId, `Właściciel`, { isMaster: true }) )

    return this.dbManager.insetMany(
      this.subcollections.templatesPerm,
      basePerms,
    )
  };

  createNewBaseRoles = platformId =>
  {
    return [
      PlatformPermissions.getLecturerPermissions( platformId ),
      PlatformPermissions.getOwnerPermissions( platformId ),
      PlatformPermissions.getStudentPermissions( platformId ),
    ]
  }

  saveUserInitObj = initObj =>
    this.dbManager.insertObject( this.subcollections.userInitialization, initObj )

  getUserInitObj = initCode =>
    this.dbManager.findOne( this.subcollections.userInitialization, { code:{ $eq:initCode } } )

  deleteUserInitObj = initCode =>
    this.dbManager.findOneAndDelete(
      this.subcollections.userInitialization,
      { code:{ $eq:initCode } },
    )

  getInitObjectByCode = code =>
    this.dbManager.findObject( this.subcollections.userInitialization, { code:{ $eq:code } } )

  deleteInitObjectByCode = code =>
    this.dbManager.findOneAndDelete( this.subcollections.userInitialization, { code:{ $eq:code } } )

  getAllUserPlatforms( userId ) {
    return this.dbManager.findManyObjects( this.basecollectionName, {
      membersIds: { $eq: userId },
    } )
  }

  canCreatePlatform = async userId => {
    const countPlatforms = await this.dbManager
      .findManyObjects( this.basecollectionName, { "owner.id": { $eq: userId } } )
      .then( cursor => cursor.length )
    return countPlatforms < MAX_PLATFORM_NUMBER
  };

  getAllPlatformsInDb() {
    return this.dbManager.getCollection( this.basecollectionName )
    // return this.dbManager.getCollection(this.collectionName)
  }

  async getAllUsersInPlatform( platformId ) {
    const platforms = await this.getPlatform( platformId )
    return platforms.membersIds
  }

  savePlatform = platform => {
    return this.dbManager.insertObject( this.basecollectionName, platform )
    // this.dbManager.insertObject(`platforms`, platform)
  };

  updatePlatform = (findSchema, newValues) =>
    this.dbManager.updateObject( this.basecollectionName, findSchema, newValues );

  saveTemplatePermission = permisionObj => {
    // TODO: Make use of it.
    this.dbManager.insertObject(
      this.subcollections.templatesPerm,
      permisionObj,
    )
  };

  saveUserPermission = permissionObj => {
    return this.dbManager.insertObject(
      this.subcollections.userPermissions,
      permissionObj,
    )
  };

  getPlatform = platformId => {
    return this.dbManager.findOne( this.basecollectionName, {
      id: { $eq: platformId },
    } )
  };

  async checkIsOwner( userId, platformId ) {
    const result = await this.dbManager.findOne( this.basecollectionName, {
      $and: [ { id: { $eq: platformId } }, { "owner.id": { $eq: userId } } ],
    } )

    return !!result
  }

  isUserAssigned( userId, platformObj ) {
    const userList = platformObj.membersIds
    return userList.some( id => id === userId )
  }

  isPlatformOwner = (userId, platformObj) => userId === platformObj.owner.id;

  getPlatformByGroupId = groupId =>
    this.dbManager.findOne( this.basecollectionName, {
      assignedGroups: groupId,
    } );

  // updatePlatformPermissions = (findShema, newValues) =>
  //   this.dbManager.findOneAndUpdate(
  //     this.subcollections.userPermissions,
  //     findShema,
  //     newValues
  //   );

  async checkUserOwner( userId, platformId ) {
    const platform = await this.getPlatform( platformId )
    return platform.ownerId === userId
    // return platform.owner.id === userId;
  }

  async checkUserAssigned( userId, platformId ) {
    const platform = await this.getPlatform( platformId ) // w platformach sa id userow
    if (!platform) return false

    return platform.membersIds.some( id => id === userId )
  }

  getNewPermissionById = permissionId =>
    this.dbManager.findOne( this.subcollections.newTemplatePermissions, { id: { $eq: permissionId } } )

  getPlatfromByName=name =>
    this.dbManager.findOne( this.basecollectionName, { name:{ $eq:name } } )

  getAllTemplatePerms = platformId =>
    this.dbManager.findManyObjects( this.subcollections.templatesPerm, {
      referenceId: { $eq: platformId },
    } );

  getNewAllTemplatePerms = platformId =>
    this.dbManager.findManyObjects( this.subcollections.newTemplatePermissions, {
      platformId: { $eq: platformId },
    } );

  getPermissions = (platformId, userId) =>
    this.dbManager.findOne( this.subcollections.userPermissions, {
      $and: [ { referenceId: platformId }, { userId: userId } ],
    } );

  getNewPermission = (permissionName, platformId) => {
    return this.dbManager.findOne( this.subcollections.newTemplatePermissions, {
      $and: [
        { platformId: { $eq: platformId } },
        { name: { $eq: permissionName } },
      ],
    } )
  };



  getNewPermissionsByPlatfromIdAndUserId = (platformId, userId) =>
  {
    return this.dbManager.aggregate( this.subcollections.newUserPermissions,
      { pipeline:
      [
        {
          $match: {
            $and: [
              {
                userId: {  $eq: userId },
              }, {
                platformId: {  $eq: platformId },
              },
            ],
          },
        }, {
          $lookup: {
            from: `platformModule.newPermissionsTemplates`,
            localField: `permissionId`,
            foreignField: `id`,
            as: `role`,
          },
        }, {
          $unwind: { path: `$role` },
        },
      ],
      },
    ).toArray().then( data => data[ 0 ] )
  }

  updatePlatformPermission = (roleId, update) =>
  {
    // console.log("PLATFORM PERMS UPDATE",{roleId, update})
    return  this.dbManager.findOneAndUpdate( this.subcollections.newTemplatePermissions,
      { id:{ $eq:roleId } },
      { $set:update },
      { new: true },
    )
  }

  getPlatformWithOwnerObj = targetPlatformId =>
  {
    return this.dbManager.aggregate( this.basecollectionName, {
      pipeline:[
        {
          $match: {
            id: { $eq: targetPlatformId },
          },
        }, {
          $lookup: {
            from: `userModule`,
            localField: `ownerId`,
            foreignField: `id`,
            as: `owner`,
          },
        }, {
          $unwind: {
            path: `$owner`,
          },
        },
      ],
    } ).toArray().then( data => data[ 0 ] )
  }

  getTargetPlatform = targetPlatformId =>
    this.dbManager.findObject( this.basecollectionName, { id:{ $eq:targetPlatformId } } )



  saveNewPermissions = obj =>
    this.dbManager.insertObject( this.subcollections.newTemplatePermissions, obj )

  deleteTemplateOfNewPermissions = permissionId =>
    this.dbManager.findOneAndDelete( this.subcollections.newTemplatePermissions, { id:{ $eq:permissionId } } )

  deleteConnectorUserPermission = (userId, platformId) =>
    this.dbManager.deleteObject( this.subcollections.newUserPermissions, { $and:[
      { userId:{ $eq:userId } },
      { platformId:{ $eq:platformId } },
    ] } )

  saveConnectorPermsToUser =obj =>
    this.dbManager.insertObject( this.subcollections.newUserPermissions, obj )

  toString = () => this.constructor.toString();
  static toString = () => `PlatformModule`;
}
