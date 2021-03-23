import { CREATE_USER_EMAIL_CONTENT, ANSWERS, MAX_LEN_PLATFORM_NAME } from "./consts.js";
import { isEmailValid, isEveryChar, sameWords } from "./../../src/utils.js";
import { DEBUG } from "./../../consts.js"
import { Platform } from "./model.js"
import { PlatformUserPermission } from './permissions.js'
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
  const { name, surname, email, roleName } = req.body;

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

  const baseRole = `student`;
  const permission = await mod.getPermission(
    roleName ?? baseRole,
    targetPlatformId
  );

  if (!permission)
    return res.status(400).json(ANSWERS.CREATE_USER_NO_PERMS_IN_REQ);

  permission.userId = user.id;

  const task_perm_save = mod.saveUserPermission(permission);

  // dopistwanie do membersów.
  const task_platform_update = mod.updatePlatform(
    { id: targetPlatformId },
    { $push: { membersIds: user.id } }
  );

  await Promise.all([task_perm_save, task_platform_update]);

  delete user.password;
  return res.status(200).json({ user });
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

  const tasksToDo = [];
  tasksToDo.push(mod.saveUserPermission(ownerPermisions));
  tasksToDo.push(mod.savePlatform(newPlatform));
  tasksToDo.push(mod.createBaseRoles(newPlatform.id));

  await Promise.all(tasksToDo);

  return res.status(200).json({ platform: newPlatform });
}

export async function httpDeletePlatform({ mod, req, res }) {
  // DELETE usuwanie platformy   /api/platforms/:id
  const targetPlatformId = req.params.platformId;
  const client = req.user;

  const target = await mod.getPlatform(targetPlatformId);

  if (!target)
    return res.status(400).json(ANSWERS.DELETE_PLATFORM_PLATFORM_NOT_EXISTS);

  if (!client.platformPerms.isMaster)
    return res.status(400).json(ANSWERS.DELETE_PLATFORM_NOT_ALLOWED);

  // if (!mod.isPlatformOwner(client.id, target))
  //   return res.status(400).json({ code: 209, error: "You dont have privilages to create new users on mod platform." })

  //await mod.deletePlatformCascade(targetPlatformId)

  //  let platform = mod.dbManager.find(
  //     mod.basecollectionName,
  //     { id: { $eq: platformId } })
  // let platform = await mod.dbManager.findOneAndDelete(mod.basecollectionName, { id: { $eq: platformId } })

  if (!target) throw new Error("Drop Platform cascade has been refused.");

  let platformId = target.id;
  //console.log({ target })

  const query = { platformId: { $eq: platformId } };
  // const deleteUsersTask = mod.dbManager.deleteMany(`userModule`, { id: { $in: target.membersIds } })
  // const deleteUsersSessions = mod.dbManager.deleteMany(`userModule.sessions`, { userId: { $in: target.membersIds } })
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