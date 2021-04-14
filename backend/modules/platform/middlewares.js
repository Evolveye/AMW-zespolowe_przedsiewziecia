import { CREATE_USER_EMAIL_CONTENT, ANSWERS, MAX_LEN_PLATFORM_NAME } from "./consts.js";
import { isEmailValid, isEveryChar, sameWords } from "./../../src/utils.js";
import { APP_ROOT_DIR, DEBUG } from "./../../consts.js"
import { Platform } from "./model.js"
import { PlatformUserPermission, PlatformPermissions, PlatformAbilities, ConnectorPlatformPermissionToUser } from './permissions.js'
import filesystem from 'fs/promises'
/** @typedef {import("./index.js").MiddlewareParameters} MiddlewareParameters */

/** @param {MiddlewareParameters} param0 */
export async function httpGetUserPlatforms({ req, res, mod }) {
  //  get(`/api/platforms`, this.httpGetAllPlatforms) // Lista wszystkich platform usera
  const user = req.user;

  /** @type {Array} assignedPlatforms */
  const assignedPlatforms = await mod.getAllUserPlatforms(user.id);

  if (!assignedPlatforms)
    return res.status(400).json(ANSWERS.USER_WITHOUT_PLATFORMS); // TODO: Send empty array.

  return res.status(200).json({ platforms: assignedPlatforms });
}

export async function httpCreateNewUser({ mod, req, res }) {
  const client = req.user;
  let { name, surname, email, roleName } = req.body;

  if(!isEveryChar(name) || !isEveryChar(surname))
  return res.status(400).json(ANSWERS.CREATE_USER_NAMES_NOT_CHARS_ONLY)


  if (!isEmailValid(email))
    return res.status(400).json(ANSWERS.CREATE_USER_BAD_EMAIL);

  if ([name, surname].some(str => str.includes(' ')))
    return res.status(400).json(ANSWERS.CREATE_USER_NAMES_WITH_SPACE)

  const targetPlatformId = req.params.platformId;
  if (!targetPlatformId)
    return res.status(400).json(ANSWERS.CREATE_USER_NOT_PLATFORM_ID);

  const platform = await mod.getPlatform(targetPlatformId);
  if (!platform)
    return res.status(400).json(ANSWERS.CREATE_USER_PLATFORM_NOT_EXIST);

  if (!client.platformPerms.canManageUsers && !client.platformPerms.isMaster)
    return res.status(400).json(ANSWERS.NOT_ALLOWED_TO_CREATE_USER);

  const alreadyExistUser = await mod.requiredModules.userModule.getUserByUserData(
    name,
    surname,
    email
  );
  const userByEmail = await mod.requiredModules.userModule.getUserByEmail(email)

  if (alreadyExistUser && userByEmail) {
    const userByEmail = await mod.requiredModules.userModule.getUserByEmail(email)
    const userSame =
      alreadyExistUser.name == userByEmail.name &&
      alreadyExistUser.surname == userByEmail.surname &&
      alreadyExistUser.email == userByEmail.email
    if (!userSame)
      return res.status(400).json(ANSWERS.CREATE_USER_EMAIL_IN_USE)
  }

  if (alreadyExistUser) {
    const alreadyAssigned = await mod.checkUserAssigned(alreadyExistUser.id, req.params.platformId)
    if (alreadyAssigned)
      return res.status(400).json(ANSWERS.CREATE_USER_ALREADY_ASSIGNED);
  }

  const user = // TODO: Zmienic to na fazy
    alreadyExistUser
    ?? await mod.requiredModules.userModule.createUser(
      { name, surname, email, activated: true },
      CREATE_USER_EMAIL_CONTENT
    )

  if (`error` in user)
    // jesli nie jest userem, to jest bladem.
    return res.status(400).json(user);

  // req.user.permission.isowner.
  // if (!this.isPlatformOwner(client.id, platform))
  //   return res.status(400).json({ code: 209, error: "You dont have privilages to create new users on this platform." })

  let baseRole = `student`;
  const permission = await mod.getPermission(
    roleName ?? baseRole,
    targetPlatformId
  );
  roleName = roleName.charAt(0).toUpperCase() + roleName.slice(1)
  const newPermissions = await mod.getNewPermission(
    roleName,
    targetPlatformId
  )

  if (!newPermissions)
  return res.status(400).json(ANSWERS.CREATE_USER_NO_PERMS_IN_REQ);

  if (!permission)
    return res.status(400).json(ANSWERS.CREATE_USER_NO_PERMS_IN_REQ);

  permission.userId = user.id;

  const connector = new ConnectorPlatformPermissionToUser(targetPlatformId,user.id,newPermissions.id)
  const task_connector_save =  mod.saveConnectorPermsToUser(connector)

  const task_perm_save = mod.saveUserPermission(permission);

  // dopistwanie do membersów.
  console.log({mod})
  const task_platform_update = mod.updatePlatform(
    { id: targetPlatformId },
    { $push: { membersIds: user.id } }
  );

  await Promise.all([task_perm_save, task_platform_update, task_connector_save]);

  delete user.password;
  return res.status(200).json({ user });
}

export async function httpGetNewPlatformsPermissions({ mod, req, res }) {
  // "/api/platforms/:platformId/permissions": {
  // Pobieranie wszystkich permisji
  const platformId = req.params.platformId;

  const member = await mod.checkUserAssigned(req.user.id, platformId);
  if (!member) return res.status(400).json(ANSWERS.GET_PERMS_NOT_MEMBER);

  const permsTemplatesAll = await mod.getNewAllTemplatePerms(platformId);

  res.json({ permissions: permsTemplatesAll });
}

export async function httpGetPlatformsPermissions({ mod, req, res }) {
  // "/api/platforms/:platformId/permissions": {
  // Pobieranie wszystkich permisji
  const platformId = req.params.platformId;

  const member = await mod.checkUserAssigned(req.user.id, platformId);
  if (!member) return res.status(400).json(ANSWERS.GET_PERMS_NOT_MEMBER);

  const permsTemplatesAll = await mod.getAllTemplatePerms(platformId);

  res.json({ permissions: permsTemplatesAll });
}

export async function httpHandleMyPermission({ mod, req, res }) {
  const platformId =
    req.params.platformId || req.body.platformId || req.query.platformId;
  const returnValue = await mod.getMyPermission(req.user, platformId);
  if (!returnValue) return res.status(400).send(ANSWERS.GET_MY_PERMS_NO_FOUND);

  delete returnValue[`_id`];
  const value = { permissions: returnValue };
  return res.json(value);
}

export async function httpDeleteUserFromPlatform({ mod, req, res }) {
  // GET Kasowanie userów z platformy /api/platforms/id:number/users/id:number
  const { platformId, userId } = req.params;

  if (!req.user.platformPerms.canManageUsers)
    return res.status(405).json(ANSWERS.PLATFORM_DELETE_NOT_ADMIN);

  if (!(await mod.platformExist(platformId)))
    return res.status(400).json(ANSWERS.PLATFORM_DELETE_PLATFORM_NOT_EXIST);

  const client = req.user;
  const targetPlatform = await mod.getPlatform(platformId);

  if (!(await mod.isPlatformOwner(client.id, targetPlatform)))
    return res.status(405).json(ANSWERS.PLATFORM_DELETE_NOT_ADMIN);
  if (sameWords(client.id, userId))
    return res.status(400).json(ANSWERS.USER_DELETE_DELETE_OWNER);
  if (!mod.isUserAssigned(userId, targetPlatform))
    return res.status(400).json(ANSWERS.PLATFORM_USER_NOT_MEMBER);

  // await this.dbManager.updateObject(
  //   this.collectionName,
  //   { 'id': targetPlatform.id },
  //   { $pull: { 'membersIds': userId } }
  // )
  await mod.dbManager.updateObject(
    mod.basecollectionName,
    { id: targetPlatform.id },
    { $pull: { membersIds: userId } }
  );

  return res.status(200).send(ANSWERS.USER_DELETE_SUCCESS);
}

export async function httpGetUsersOfPlatform({ mod, req, res }) {
  // GET Lista userów platformy /api/platforms/id:number/users
  const targetPlatformId = req.params.platformId;
  const user = req.user;
  if (!targetPlatformId)
    return res.status(400).json(ANSWERS.USERS_OF_PLATFORM_BAD_PLATFORM_ID);

  const platform = await mod.getPlatform(targetPlatformId);
  if (!platform)
    return res.status(400).json(ANSWERS.USERS_OF_PLATFORM_PLATFORM_NOT_EXISTS);

  if (!mod.checkUserAssigned(req.user.id, targetPlatformId))
    return res.status(400).json(ANSWERS.USERS_OF_PLATFORM_NOT_MEMBER);

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

  const allUsersPerms = await mod.dbManager
    .aggregate(`userModule`, {
      pipeline: [
        { $match: { id: { $in: platform.membersIds } } },
        {
          $lookup: {
            from: "platformModule.permissions.users",
            localField: "id",
            foreignField: "userId",
            as: "perms",
          },
        },
        { $unwind: { path: "$perms", preserveNullAndEmptyArrays: true } },
        { $unset: ["_id", "perms._id"] },
      ],
    })
    .toArray();

  return res.status(200).json({ users: allUsersPerms });
}

export async function httpCreatePlatform({ mod, req, res }) {
  // POST Tworzenie platformy /api/platforms

  const { name } = req.body;

  if (!name) return res.status(400).json(ANSWERS.CREATE_PLATFORM_NOT_NAME);

  const platfromByName= await mod.getPlatfromByName(name)
  if(platfromByName)
  return res.status(400).json(ANSWERS.CREATE_PLATFROM_NAME_DUPLICATE);

  if(name.length > MAX_LEN_PLATFORM_NAME)
  return res.status(400).json(ANSWERS.CREATE_PLATFORM_BAD_NAME_LEN)

  if (!DEBUG)
    if (!(await mod.canCreatePlatform(req.user.id)))
      return res.status(400).json(ANSWERS.CREATE_PLATFORM_LIMIT);

  const newPlatform = new Platform(req.user, name);

  const ownerPermisions = new PlatformUserPermission(
    req.user.id,
    newPlatform.id,
    `owner`,
    {
      isMaster: true,
    }
  );
  const newPerms = mod.createNewBaseRoles(newPlatform.id)
  const ownerNewPermissions = new ConnectorPlatformPermissionToUser(newPlatform.id,req.user.id,newPerms.find(perm=> perm.name==`Właściciel`).id)

  const tasksToDo = [newPerms.map(item=> mod.saveNewPermissions(item))];
  tasksToDo.push(mod.createBaseRoles(newPlatform.id))
  tasksToDo.push(mod.saveUserPermission(ownerPermisions));
  tasksToDo.push(mod.savePlatform(newPlatform));
  tasksToDo.push(mod.saveConnectorPermsToUser(ownerNewPermissions));

  await Promise.all(tasksToDo);

  return res.status(200).json({ platform: newPlatform });
}

export async function httpDeletePlatform({ mod, req, res }) {
  // DELETE usuwanie platformy   /api/platforms/:id
  const targetPlatformId = req.params.platformId;
  const client = req.user;
  const fullFilePath = (relpath) => APP_ROOT_DIR + `/` + relpath


  const target = await mod.getPlatform(targetPlatformId);

  if (!target)
    return res.status(400).json(ANSWERS.DELETE_PLATFORM_PLATFORM_NOT_EXISTS);

  if (!client.platformPerms.isMaster)
    return res.status(400).json(ANSWERS.DELETE_PLATFORM_NOT_ALLOWED);

  if (!target) throw new Error("Drop Platform cascade has been refused.");

  let platformId = target.id;
  console.log({ target })

  const query = { platformId: { $eq: platformId } };

  const tasksAssignedToPe = await mod.dbManager.findManyObjects(`groupModule.tasks`,{groupId:{$in:target.assignedGroups}})
  const tasksIds = tasksAssignedToPe.map(task => task.id)
  const materialsOfGroup = await mod.dbManager.findManyObjects(`groupModule.materials`,{groupId:{$in:target.assignedGroups}})

  const deleteTasks = await mod.dbManager.deleteMany(`groupModule.tasks`,{groupId:{$in:target.assignedGroups}})
  const deleteTasksDone = await mod.dbManager.deleteMany(`groupModule.tasks.done`,{taskId:{$in:tasksIds}});
  const deleteMaterials = await mod.dbManager.deleteMany(`groupModule.materials`,{groupId:{$in:target.assignedGroups}});
  const deleteScales = await mod.dbManager.deleteMany(`groupModule.scale`,{groupId:{$in:target.assignedGroups}});

  const deleteFilesFromDrive = materialsOfGroup.map(item => filesystem.unlink(fullFilePath(item.path))  )

  const deleteMeetingsTask = await mod.dbManager.deleteMany(
    `meetModule`,
    query
  );
  const deleteGroupsTask = await mod.dbManager.deleteMany(`groupModule`, query);
  const deleteGroupsTemplatesPerm = await mod.dbManager.deleteMany(
    `groupModule.permissions`,
    { referenceId: { $in: target.assignedGroups } }
  );
  const deleteGroupsUsersPerms = await mod.dbManager.deleteMany(
    `groupModule.permissions.users`,
    { referenceId: { $in: target.assignedGroups } }
  );
  const deleteNotesTask = await mod.dbManager.deleteMany(`groupModule.notes`, {
    groupId: { $in: target.assignedGroups },
  });
  const deletePermissions = await mod.dbManager.deleteMany(
    mod.subcollections.userPermissions,
    { referenceId: { $eq: platformId } }
  );
  const deleteTemplatePermissions = await mod.dbManager.deleteMany(
    mod.subcollections.templatesPerm,
    { referenceId: { $eq: platformId } }
  );
  const deletePlatformTask = await mod.dbManager.deleteOne(
    mod.basecollectionName,
    { id: { $eq: platformId } }
  );
  // await Promise.all(
  //   [deleteMeetingsTask, deleteGroupsTask, deleteNotesTask,
  //     deletePermissions, deletePlatformTask, deleteTemplatePermissions,
  //     deleteGroupsUsersPerms, deleteGroupsTemplatesPerm
  //   ]
  // )

  // await mod.dbManager.deleteObject(mod.collectionName, { id: { $eq: targetPlatformId } })

  return res.status(200).json(ANSWERS.DELETE_PLATFORM_SUCCESS);
}

export function httpGetBasePlatformPermisionTemplate({ mod, req, res }){
    return res.json(new PlatformAbilities())
}

/** @param {MiddlewareParameters} param0 */
export function httpCreatePlatformsPermissions({ mod, req, res }) {
  const platformId =  req.params.platformId || req.body.platformId || req.query.platformId;
  const permissionObject = req.body.perm
  console.log(req.body)
  if(!permissionObject)
  return res.status(400).json({code:223,error:"Permission object not found"})

  console.log({bodyOfRequest:req.body.perm})

  const template = new PlatformPermissions(
    permissionObject.name,permissionObject.color,permissionObject.importance,
    permissionObject.abilities,platformId )

  console.log({recivedObj:permissionObject,createdObj:template})

  mod.dbManager.insertObject(mod.subcollections.newTemplatePermissions,template)
  return res.json({...ANSWERS.CREATE_PERMISSIONS_SUCCESS,perms:template})
}


export async function httpUpdatePlatformsPermissions({ mod, req, res })
{
  console.log("httpUpdatePlatformsPermissions --> ")
  const platformId =  req.params.platformId || req.body.platformId || req.query.platformId;
  const arrayOfPermissions = req.body.array

  const updateTasks = arrayOfPermissions.map(perms => {
    const abilities = Object.entries( perms.abilities )
      .map( ([ability, bool]) => ({ field:`abilities.${ability}`, value:bool }) )
      .reduce( (obj, { field,value }) => ({ [field]:value, ...obj }), {} )

    return mod.updatePlatformPermission(platformId,perms.name,abilities).then( ({ value }) => value )
   } )

  const newPerms = await Promise.all(updateTasks)

  return res.json({...ANSWERS.UPDATE_PERMISSIONS_SUCCESS,perms:newPerms})
}


// /** @param {MiddlewareParameters} param0 */
// export function httpAssignPermsToUser({ mod, req, res }) {
//   const platformId =  req.params.platformId || req.body.platformId || req.query.platformId;
//   const userId = req.body.userId
//   const permsId = req.body.permsId

//   const connector = new ConnectorPlatformPermissionToUser(platformId,userId,permsId)
//   console.log({ConnectorPermsToUser:connector})

//   mod.dbManager.insertObject(mod.subcollections.newUserPermissions,connector)
// }