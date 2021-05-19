import {  ANSWERS, MAX_LEN_PLATFORM_NAME } from "./consts.js"
import { isEmailValid, isEveryChar, sameWords } from "./../../src/utils.js"
import { APP_ROOT_DIR, DEBUG } from "./../../consts.js"
import { Platform, InitializationUserAccount } from "./model.js"
import { PlatformUserPermission, PlatformPermissions, PlatformAbilities, ConnectorPlatformPermissionToUser } from './permissions.js'
import filesystem from 'fs/promises'
/** @typedef {import("./index.js").MiddlewareParameters} MiddlewareParameters */


/** @param {MiddlewareParameters} param0 */
export async function httpGetUserPlatforms({ req, res, mod }) {
  //  get(`/api/platforms`, this.httpGetAllPlatforms) // Lista wszystkich platform usera
  const user = req.user

  /** @type {Array} assignedPlatforms */
  const assignedPlatforms = await mod.getAllUserPlatforms( user.id )

  if (!assignedPlatforms)
    return res.status( 400 ).json( ANSWERS.USER_WITHOUT_PLATFORMS ) // TODO: Send empty array.

  return res.status( 200 ).json({ platforms: assignedPlatforms })
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetUserPlatform({ req, res, mod }) {
  //  get(`/api/platform`, this.httpGetAllPlatform) // Lista wszystkich platform usera
  const user = req.user
  const targetPlatformId = req.params.platformId

  const targetPlatform = await mod.getTargetPlatform( targetPlatformId )

  if (!targetPlatform)
    return res.status( 400 ).json( ANSWERS.GET_TARGET_PLATFORM_MISS )

  targetPlatform.myRole = user.newPlatformPerms.perms

  return res.status( 200 ).json({ platform:targetPlatform })
}


/** @param {MiddlewareParameters} param0 */
export async function httpCreateNewUser({ mod, req, res }) {
  // console.log({RecivedDataAboutUser:req.body})

  const client = req.user
  let { name, surname, email, roleId } = req.body

  if (!isEveryChar( name ) || !isEveryChar( surname ))
    return res.status( 400 ).json( ANSWERS.CREATE_USER_NAMES_NOT_CHARS_ONLY )


  if (!isEmailValid( email ))
    return res.status( 400 ).json( ANSWERS.CREATE_USER_BAD_EMAIL )

  if ([ name, surname ].some( str => str?.includes( ` ` ) ))
    return res.status( 400 ).json( ANSWERS.CREATE_USER_NAMES_WITH_SPACE )

  const targetPlatformId = req.params.platformId
  if (!targetPlatformId)
    return res.status( 400 ).json( ANSWERS.CREATE_USER_NOT_PLATFORM_ID )

  const platform = await mod.getPlatform( targetPlatformId )
  if (!platform)
    return res.status( 400 ).json( ANSWERS.CREATE_USER_PLATFORM_NOT_EXIST )

  // console.log(JSON.stringify(client,null,2))

  if (!client.newPlatformPerms.perms.abilities.canManageUsers)
    return res.status( 400 ).json( ANSWERS.NOT_ALLOWED_TO_CREATE_USER )

  // const alreadyExistUser = await mod.requiredModules.userModule.getUserByUserData(
  //   name,
  //   surname,
  //   email
  // );

  const userByEmail = await mod.requiredModules.userModule.getUserByEmail( email )

  const initCode = `${Date.now()}t${Math.random().toString().slice( 2 )}r`

  // JUMP
  const CREATE_USER_EMAIL_CONTENT = {
    titleText: `Portal edukacyjny - utworzono dla Ciebie konto.`,
    bodyHtml: `
          W serwisie Platforma Edukacyjna, ktoś dodał Ciebie do listy członków swojej oragnizacji.</br>
          Aby zalogować się na nowo utworzone konto, zaloguj się
          <a href="${req?.headers.origin}/activate?initialCode=${initCode}">
          tutaj</a>, korzystając z poniższych danych:</br>
      `,
  }

  const user = userByEmail ?? await mod.requiredModules.userModule.createUser(
    { name, surname, email, activated: true },
    CREATE_USER_EMAIL_CONTENT,
  )
  if (!user || user.error)  // jesli nie jest userem, to jest bladem.
    return res.status( 400 ).json( ANSWERS.USER_BY_MAIL_NOT_FOUND )

  // JUMP
  const initObj = new InitializationUserAccount(user, initCode)

  await mod.saveUserInitObj( initObj )


  // if (userByEmail)
  //   return res.status(400).json(ANSWERS.CREATE_USER_EMAIL_IN_USE)

  // if (alreadyExistUser && userByEmail) {
  //   // const userByEmail = await mod.requiredModules.userModule.getUserByEmail(email)
  //   const userSame =
  //     alreadyExistUser.name == userByEmail.name &&
  //     alreadyExistUser.surname == userByEmail.surname &&
  //     alreadyExistUser.email == userByEmail.email

  // }

  const alreadyAssigned = await mod.checkUserAssigned( user.id, req.params.platformId )
  if (alreadyAssigned)
    return res.status( 400 ).json( ANSWERS.CREATE_USER_ALREADY_ASSIGNED )


  const newPermissions = await mod.getNewPermissionByPermId(
    roleId,
    targetPlatformId,
  )

  if (!newPermissions)
    return res.status( 400 ).json( ANSWERS.CREATE_USER_NO_PERMS_IN_REQ )

  // req.user.permission.isowner.
  // if (!this.isPlatformOwner(client.id, platform))
  //   return res.status(400).json({ code: 209, error: "You dont have privilages to create new users on this platform." })

  // let baseRole = `student`;
  // const permission = await mod.getPermission(
  //   roleName ?? baseRole,
  //   targetPlatformId
  // );
  // const permission = await mod.getPermissionByPermId(roleId,targetPlatformId)


  // if (!permission)
  //   return res.status(400).json(ANSWERS.CREATE_USER_NO_PERMS_IN_REQ);

  // permission.userId = user.id;

  const connector = new ConnectorPlatformPermissionToUser(targetPlatformId, user.id, newPermissions.id)
  const task_connector_save =  mod.saveConnectorPermsToUser( connector )

  // const task_perm_save = mod.saveUserPermission(permission);


  const task_platform_update = mod.updatePlatform(
    { id: targetPlatformId },
    { $push: { membersIds: user.id } },
  )

  await Promise.all([ task_platform_update, task_connector_save ])

  delete user.password
  return res.status( 200 ).json({ ...ANSWERS.CREATE_USER_SUCCESS, user })
}


export async function httpHandleFirstUserLogin({ mod, req, res }) {
  const { code, login, password1, password2 } = req.body

  if (!code || !login || !password1 || !password2)
    return res.status( 400 ).json( ANSWERS.REGISTER_PART2_MISSING_DATA )

  if (!sameWords( password1, password2 ))
    return res.status( 400 ).json( ANSWERS.REGISTER_PART2_PASSWORDS_NOT_SAME )

  if (!code)
  {
    console.error( `code not provided - first user login failed.` )
    return res.status( 400 ).json( ANSWERS.REGISTER_PART2_CODE_MISS )
  }

  const loginExists = await mod.requiredModules.userModule.getUserByLogin( login ) ? true : false

  if (loginExists)
    return res.status( 400 ).json( ANSWERS.REGISTER_PART2_LOGIN_TAKEN )

  const initObj = (await mod.deleteUserInitObj( code )).value
  // console.log( JSON.stringify( initObj, null, 2 ) )
  if (!initObj)
    return res.status( 400 ).json( ANSWERS.UPDATE_USER_LOGIN_FAILED )

  const user = initObj.user

  const newUser = await mod.requiredModules.userModule.changeUserLoginAndPassw( user.id, login, password1 )

  if (!newUser)
    throw new Error(`Update of user login has been failed.`)


  return res.status( 400 ).json({ ...ANSWERS.REGISTER_PART2_SUCCESS, user:newUser })

}


/** @param {MiddlewareParameters} param0 */
export async function httpGetNewPlatformsPermissions({ mod, req, res }) {
  // "/api/platforms/:platformId/permissions": {
  // Pobieranie wszystkich permisji
  const platformId = req.params.platformId

  const member = await mod.checkUserAssigned( req.user.id, platformId )
  if (!member) return res.status( 400 ).json( ANSWERS.GET_PERMS_NOT_MEMBER )

  const permsTemplatesAll = await mod.getNewAllTemplatePerms( platformId )

  res.json({ permissions: permsTemplatesAll })
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetPlatformsPermissions({ mod, req, res }) {
  // "/api/platforms/:platformId/permissions": {
  // Pobieranie wszystkich permisji
  const platformId = req.params.platformId

  const member = await mod.checkUserAssigned( req.user.id, platformId )
  if (!member) return res.status( 400 ).json( ANSWERS.GET_PERMS_NOT_MEMBER )

  const permsTemplatesAll = await mod.getNewAllTemplatePerms( platformId )
  // console.log({newPermsTemplatesAll:permsTemplatesAll})
  // const permsTemplatesAll = await mod.getAllTemplatePerms(platformId);

  res.json({ permissions: permsTemplatesAll })
}


/** @param {MiddlewareParameters} param0 */
export async function httpHandleMyPermission({ mod, req, res }) {
  const platformId =
    req.params.platformId || req.body.platformId || req.query.platformId
  const returnValue = await mod.getMyPermission( req.user, platformId )
  if (!returnValue) return res.status( 400 ).send( ANSWERS.GET_MY_PERMS_NO_FOUND )

  delete returnValue[ `_id` ]
  const value = { permissions: returnValue }
  return res.json( value )
}


/** @param {MiddlewareParameters} param0 */
export async function httpDeleteUserFromPlatform({ mod, req, res }) {
  // GET Kasowanie userów z platformy /api/platforms/id:number/users/id:number
  const { platformId, userId } = req.params

  if (!req.user.newPlatformPerms.perms.abilities.canManageUsers)
    return res.status( 405 ).json( ANSWERS.PLATFORM_DELETE_NOT_ADMIN )

  if (!(await mod.platformExist( platformId )))
    return res.status( 400 ).json( ANSWERS.PLATFORM_DELETE_PLATFORM_NOT_EXIST )

  const client = req.user
  const targetPlatform = await mod.getPlatform( platformId )

  if (sameWords( client.id, userId ))
    return res.status( 400 ).json( ANSWERS.USER_DELETE_DELETE_OWNER )

  if (!mod.isUserAssigned( userId, targetPlatform ))
    return res.status( 400 ).json( ANSWERS.PLATFORM_USER_NOT_MEMBER )

  // await this.dbManager.updateObject(
  //   this.collectionName,
  //   { 'id': targetPlatform.id },
  //   { $pull: { 'membersIds': userId } }
  // )
  await mod.dbManager.updateObject(
    mod.basecollectionName,
    { id: targetPlatform.id },
    { $pull: { membersIds: userId } },
  )

  return res.status( 200 ).send( ANSWERS.USER_DELETE_SUCCESS )
}


/** @param {MiddlewareParameters} param0 */
export async function httpGetUsersOfPlatform({ mod, req, res }) {
  // GET Lista userów platformy /api/platforms/id:number/users
  const targetPlatformId = req.params.platformId
  const user = req.user
  if (!targetPlatformId)
    return res.status( 400 ).json( ANSWERS.USERS_OF_PLATFORM_BAD_PLATFORM_ID )

  const platform = await mod.getPlatform( targetPlatformId )
  if (!platform)
    return res.status( 400 ).json( ANSWERS.USERS_OF_PLATFORM_PLATFORM_NOT_EXISTS )

  if (!mod.checkUserAssigned( req.user.id, targetPlatformId ))
    return res.status( 400 ).json( ANSWERS.USERS_OF_PLATFORM_NOT_MEMBER )

  // if (`groupModule` in this.additionalModules) { // BUG: CZEMU TAKIE CACKO TUTAJ WSTAWIONE JEST
  //   // ze wszystkich group gdzie jest user, wyciagam userów
  //   // oraz z całej platformy osoby personel.
  //   const collegues = this.dbManager.aggregate(
  //     this.additionalModules.groupModule.basecollectionName,
  //     {
  //       pipeline: {
  //         $lookup: { from: `users`, localField: `membersIds`, foreignField: `id`, as: `colleagues` },
  //         $project: { colleagues: true }
  //       }
  //     }
  //   )

  //   const personel = this.dbManager.aggregate(
  //     this.subcollections.userPermissions,               // `platform.permissions`,
  //     {
  //       pipeline: {
  //         $lookup: { from: `users`, localField: `userId`, foreignId: `id`, as: `personel` },
  //         $project: { personel: true }
  //       }
  //     }
  //   )

  //   findedUsers.concat(collegues)
  //   findedUsers.concat(personel)

  // } else { }

  // const arrUserIds = await this.getAllUsersInPlatform(targetPlatformId)
  // const getUsersTask = arrUserIds.map(id => this.requiredModules.userModule.getUserById(id))
  // const result = await Promise.all(getUsersTask)

  // let processedUsers = result.filter(user => user != null)
  //   .map(({ login, password, ...processedUser }) => processedUser)

  //  const taskArr = processedUsers.map((user) => this.getPermissions(platform.id,user.id) )
  // const collegues = this.dbManager.aggregate(
  //     this.additionalModules.groupModule.basecollectionName,
  //     {
  //       pipeline: {
  //         $lookup: { from: `users`, localField: `membersIds`, foreignField: `id`, as: `colleagues` },
  //         $project: { colleagues: true }
  //       }
  //     }
  //   )
  // const allUsersPerms = await dbManager.aggregate(
  //   `userModule`,
  //   {
  //     pipeline: { $lookup: { from: "platformModule.permissions.users", localField: "id", foreignField: "userId", as: "usersInPlatform" } },
  //     options: { $project: { usersInPlatform: true, name: true, surname: true, id: true } }
  //   },
  // ).toArray()

  // console.log({platform})

  const usersWithPermissions = await mod.dbManager.aggregate( `userModule`, { pipeline: [
    {
      $match: { id: { $in: platform.membersIds } },
    }, {
      $lookup: {
        from: `platformModule.newPermissionsUsers`,
        let: { userId:`$id` },
        pipeline: [
          {
            $match: { $expr: {
              $and: [
                { $eq: [ `$platformId`, platform.id ] },
                { $eq: [ `$userId`, `$$userId` ] },
              ],
            } },
          },
        ],
        as: `connector`,
      },
    }, {
      $unwind: { path:`$connector` },
    }, {
      $lookup: {
        from: `platformModule.newPermissionsTemplates`,
        localField: `connector.permissionId`,
        foreignField: `id`,
        as: `role`,
      },
    }, {
      $unwind: { path:`$role` },
    }, {
      $project: { connector:0 },
    },
  ] } ).toArray()



  // console.log(JSON.stringify(usersWithPermissions,null,2))

  //  const newUsersWithConnectorQuery = await mod.dbManager
  //   .aggregate(`userModule`, {
  //     pipeline: [{ $match: { id: { $in: platform.membersIds } } },
  //     {
  //       $lookup: {
  //         from: 'platformModule.newPermissionsUsers',
  //         let:{'userId':"$id" },
  //         pipeline:[
  //           {$match:{$and:[
  //             {platformId:{$eq:platform.id}},
  //             {userId: {$eq:'$$userId'}},
  //           ]}}
  //         ],
  //         as: 'connector',
  //       }
  //     }, {
  //       $unwind: {
  //         path: '$connector'
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'platformModule.newPermissionsTemplates',
  //         localField: 'connector.permissionId',
  //         foreignField: 'id',
  //         as: 'role'
  //       }
  //     }, {
  //       $unwind: {
  //         path: '$role'
  //       }
  //     }
  //   ]},).toArray()

  // console.log({newUsersWithConnectorQuery})

  // const allUsersPerms = await mod.dbManager
  //   .aggregate(`userModule`, {
  //     pipeline: [
  //       { $match: { id: { $in: platform.membersIds } } },
  //       {
  //         $lookup:{},


  //         $lookup: {
  //           from: "platformModule.permissions.users",
  //           localField: "id",
  //           foreignField: "userId",
  //           as: "perms",
  //         },
  //       },
  //       { $unwind: { path: "$perms", preserveNullAndEmptyArrays: true } },
  //       { $unset: ["_id", "perms._id"] },
  //     ],
  //   })
  //   .toArray();

  // console.log(JSON.stringify(newUsersWithConnectorQuery,null,2))

  return res.status( 200 ).json({ users: usersWithPermissions })
}


/** @param {MiddlewareParameters} param0 */
export async function httpCreatePlatform({ mod, req, res }) {
  // POST Tworzenie platformy /api/platforms

  const name = req.body.name?.trim()

  if (!name) return res.status( 400 ).json( ANSWERS.CREATE_PLATFORM_NOT_NAME )

  const platfromByName = await mod.getPlatfromByName( name )
  if (platfromByName)
    return res.status( 400 ).json( ANSWERS.CREATE_PLATFROM_NAME_DUPLICATE )

  if (name.length > MAX_LEN_PLATFORM_NAME)
    return res.status( 400 ).json( ANSWERS.CREATE_PLATFORM_BAD_NAME_LEN )

  if (!DEBUG)
    if (!(await mod.canCreatePlatform( req.user.id )))
      return res.status( 400 ).json( ANSWERS.CREATE_PLATFORM_LIMIT )


  // const ownerPermisions = new PlatformUserPermission(
  //   req.user.id,
  //   newPlatform.id,
  //   `Właściciel`,
  //   {
  //     isMaster: true,
  //   }
  // );
  const newPlatform = new Platform(req.user.id, name)

  const newPerms = mod.createNewBaseRoles( newPlatform.id )

  const ownerNewPermissions = new ConnectorPlatformPermissionToUser(
    newPlatform.id,
    req.user.id,
    newPerms.find( perm => perm.name == `Właściciel` ).id,
  )

  const tasksToDo = [ newPerms.map( item => mod.saveNewPermissions( item ) ) ]
  // tasksToDo.push(mod.createBaseRoles(newPlatform.id))
  // tasksToDo.push(mod.saveUserPermission(ownerPermisions));
  tasksToDo.push( mod.savePlatform( newPlatform ) )
  tasksToDo.push( mod.saveConnectorPermsToUser( ownerNewPermissions ) )

  await Promise.all( tasksToDo )

  return res.status( 200 ).json({ ...ANSWERS.CREATE_PLATFORM_SUCCESS,  platform: newPlatform })
}


/** @param {MiddlewareParameters} param0 */
export async function httpDeletePlatform({ mod, req, res }) {
  // DELETE usuwanie platformy   /api/platforms/:id
  const targetPlatformId = req.params.platformId
  const client = req.user
  const fullFilePath = relpath => APP_ROOT_DIR + `/` + relpath


  const confirmPassw = req.body.password

  const target = await mod.getPlatformWithOwnerObj( targetPlatformId )

  if (!target)
    return res.status( 400 ).json( ANSWERS.DELETE_PLATFORM_PLATFORM_NOT_EXISTS )

  if (!client.newPlatformPerms.perms.abilities.canDeletePlatform)
    return res.status( 400 ).json( ANSWERS.DELETE_PLATFORM_NOT_ALLOWED )

  if (!target) throw new Error(`Drop Platform cascade has been refused.`)

  const platformOwner = await mod.requiredModules.userModule.getUserById( target.owner.id )

  if (platformOwner.password != confirmPassw)
    return res.status( 400 ).json( ANSWERS.PLATFORM_DELETE_BAD_CONFIRM )

  let platformId = target.id

  const query = { platformId: { $eq: platformId } }

  const tasksAssignedToPe = await mod.dbManager.findManyObjects( `groupModule.tasks`, { groupId:{ $in:target.assignedGroups } } )
  const tasksIds = tasksAssignedToPe.map( task => task.id )
  const materialsOfGroup = await mod.dbManager.findManyObjects( `groupModule.materials`, { groupId:{ $in:target.assignedGroups } } )

  await mod.dbManager.deleteMany( `groupModule.tasks`, { groupId:{ $in:target.assignedGroups } } )
  await mod.dbManager.deleteMany( `groupModule.tasks.done`, { taskId:{ $in:tasksIds } } )
  await mod.dbManager.deleteMany( `groupModule.materials`, { groupId:{ $in:target.assignedGroups } } )
  await mod.dbManager.deleteMany( `groupModule.scale`, { groupId:{ $in:target.assignedGroups } } )

  materialsOfGroup.map( item => filesystem.unlink( fullFilePath( item.path ) )  )

  await mod.dbManager.deleteMany( `meetModule`, query )
  await mod.dbManager.deleteMany( `groupModule`, query )
  await mod.dbManager.deleteMany(
    `groupModule.permissions`,
    { referenceId: { $in: target.assignedGroups } },
  )
  await mod.dbManager.deleteMany(
    `groupModule.permissions.users`,
    { referenceId: { $in: target.assignedGroups } },
  )
  await mod.dbManager.deleteMany( `groupModule.notes`, {
    groupId: { $in: target.assignedGroups },
  } )
  // const deletePermissions = await mod.dbManager.deleteMany(
  //   mod.subcollections.userPermissions,
  //   { referenceId: { $eq: platformId } },
  // )
  // const deleteTemplatePermissions = await mod.dbManager.deleteMany(
  //   mod.subcollections.templatesPerm,
  //   { referenceId: { $eq: platformId } },
  // )
  await mod.dbManager.deleteOne( mod.basecollectionName, { id: { $eq: platformId } } )
  // await Promise.all(
  //   [deleteMeetingsTask, deleteGroupsTask, deleteNotesTask,
  //     deletePermissions, deletePlatformTask, deleteTemplatePermissions,
  //     deleteGroupsUsersPerms, deleteGroupsTemplatesPerm
  //   ]
  // )

  // await mod.dbManager.deleteObject(mod.collectionName, { id: { $eq: targetPlatformId } })

  return res.status( 200 ).json( ANSWERS.DELETE_PLATFORM_SUCCESS )
}


/** @param {MiddlewareParameters} param0 */
export function httpGetBasePlatformPermisionTemplate({ mod, req, res }) {
  return res.json( new PlatformAbilities() )
}


/** @param {MiddlewareParameters} param0 */
export async function httpCreatePlatformsPermissions({ mod, req, res }) {
  const platformId =  req.params.platformId || req.body.platformId || req.query.platformId
  const name = req.body.name?.trim()

  if (!name) return res.status( 400 ).json( ANSWERS.CREATE_PERMISSIONS_NAME_MISS )

  const doesPermissionExists = await mod.getNewPermission( name, platformId )

  if (doesPermissionExists)
    return res.status( 400 ).json( ANSWERS.CREATE_PERMISSIONS_DOUBLED )

  const createdtemplatePermissions = new PlatformPermissions(
    name,
    req.body.color || null,
    req.body.importance || null,
    req.body.abilities || null,
    platformId,
  )

  // if(!createdtemplatePermissions)
  // return res.status(400).json({code:223,error:"Permission object not found"})

  // const template = new PlatformPermissions(
  //   permissionObject.name,permissionObject.color,permissionObject.importance,
  //   permissionObject.abilities,platformId )

  // console.log({recivedObj:permissionObject,createdObj:template})

  await mod.saveNewPermissions( createdtemplatePermissions )

  return res.json({ ...ANSWERS.CREATE_PERMISSIONS_SUCCESS, role:createdtemplatePermissions })
}


/** @param {MiddlewareParameters} param0 */
export async function httpUpdatePlatformsPermissions({ mod, req, res })
{
  const platformId =  req.params.platformId
  const roleId =  req.params.roleId

  if (!roleId || !platformId)
    throw new Error(`edit role - roleId/platformId not provided`)

  const targetRole = await mod.getNewPermissionById( roleId )

  if (targetRole.name == `Właściciel`)
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
    .map( ([ ability, bool ]) => ({ field: `abilities.${ability}`, value:bool }) )
    .reduce( (obj, { field, value }) => ({ [ field ]:value, ...obj }), {} )

  delete updateToMake.abilities

  Object.assign( updateToMake, formatedAbilities )

  // const updateRolesValues = toUpdateRole.map(perms => {
  //   const abilities = Object.entries( perms.abilities )
  //     .map( ([ability, bool]) => ({ field:`abilities.${ability}`, value:bool }) )
  //     .reduce( (obj, { field,value }) => ({ [field]:value, ...obj }), {} )
  // })


  const { value } = await mod.updatePlatformPermission( roleId, updateToMake )

  if (!value)
    return res.status( 400 ).json( ANSWERS.UPDATE_ROLE_ROLE_NOT_FOUND )

  // console.log({ updateToMake ,updatedRole:value})

  return res.json({ ...ANSWERS.UPDATE_PERMISSIONS_SUCCESS, role:value })
}


/** @param {MiddlewareParameters} param0 */
export async function httpAssignPermsToUser({ mod, req, res }) {

  // console.log({body:req.body})

  const platformId =  req.params.platformId || req.body.platformId || req.query.platformId
  const userId =  req.params.userId || req.body.userId
  const roleId = req.body.roleId

  await mod.deleteConnectorUserPermission( userId, platformId )

  const connector = new ConnectorPlatformPermissionToUser(platformId, userId, roleId)
  await mod.saveConnectorPermsToUser( connector )

  // console.log({ConnectorPermsToUser:connector})

  return res.json( ANSWERS.CHANGE_PERMISSIONS_FOR_USER )
}


/** @param {MiddlewareParameters} param0 */
export async function httpDeletePlatformPermission({ mod, req, res }) {
  const permissionId = req.params.roleId

  if (!permissionId)
    throw new Error(`Delete role - role id not provided.`)

  const targetRole = await mod.getNewPermissionById( permissionId )

  if (targetRole.name == `Właściciel`)
    return res.status( 400 ).json( ANSWERS.DELETE_ROLE_OWNER )

  const removedObj = await mod.deleteTemplateOfNewPermissions( permissionId )

  if (!removedObj)
    return res.status( 400 ).json( ANSWERS.DELETE_ROLE_ROLE_NOT_FOUND )

  return res.json( ANSWERS.DELETE_ROLE_SUCCESS )
}
