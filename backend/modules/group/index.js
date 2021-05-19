import Module from "../module.js"

import GroupPermission, { GroupUserPermission } from "./permissions.js"

import * as middlewares from "./middlewares.js"

/**
 * @typedef {object} MiddlewareParameters
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 * @property {GroupModule} mod
 */

export default class GroupModule extends Module {
  static requiredModules = [ `UserModule`, `PlatformModule` ];
  subcollections = {
    materials: `materials`,
    tasks: `tasks`,
    tasksDone: `tasks.done`,
    notes: `notes`,
    templatePermissions: `permissions`,
    userPermissions: `permissions.users`,
    scale: `scale`,
    newTemplatePermissions: `newPermissions`,
    newUserPermissions: `newPermissions.users`,
  };

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator( socket ) {}


  getApi() {
    /** @type {import("../user/index.js").default} */
    const userModule = this.requiredModules.userModule
    const auth = userModule.auth
    const pPerms = this.requiredModules.platformModule.perms
    const m = middlewares

    return { groups: {
      get: auth( this.runMid( m.httpHandleMyGroups ) ),
      post: auth( pPerms( this.runMid( m.httpCreateGroup ) ) ),

      "notes": {
        get: auth( this.runMid( m.httpGetAllMyNotesFull ) ),
      },

      "permissiontemplate": {
        get: this.runMid( m.httpGetGroupPermissionAbilities ),
      },

      "permissions": {
        get: auth( this.runMid( m.httpHandleGroupPerms ) ),
      },

      "platform": {
        ":platformId": {
          get: auth( pPerms( this.runMid( m.httpHandleAllGroupsInPlatform ) ) ),
        },
      },

      ":groupId": {
        delete: auth( pPerms( this.runMid( m.httpDeleteGroup ) ) ),
        get: auth( this.perms( this.runMid( m.httpGetTargetGroup ) ) ),

        "newpermissions": { // TODO: dwa wyrazy, powinien być jeden -- źle zrobiona scieżka
          get: auth( this.perms( this.runMid( m.httpGetNewTemplatePermissions ) ) ),
          post: auth( this.perms( this.runMid( m.httpCreateGroupPermissions ) ) ), // TODO this.httpCreatePermissions

          ":roleId": {
            put: auth( this.perms( this.runMid( m.httpUpdateNewGroupPermissions ) ) ),
            delete: auth( this.perms( this.runMid( m.httpDeleteGroupTemplatePermission ) ) ),
          },
        },

        "permissions": {
          get: auth( this.perms( this.runMid( m.httpGetTemplatePermissions ) ) ),

          "my": {
            get: auth( this.runMid( m.httpHandleMyPermission ) ),
          },
        },

        "scale": {
          get: auth( this.runMid( m.httpGetGroupScale ) ),
          put: auth( this.perms( this.runMid( m.httpChangeScale ) ) ),
        },

        "tasks": {
          get: auth( this.runMid( m.httpGetAllGroupTasks ) ),
          post: auth( this.perms( this.runMid( m.httpCreateTask ) ) ),

          ":taskId": {
            delete: auth( this.runMid( m.HttpHandleDeleteTask ) ),

            "done": {
              get: auth( this.runMid( m.httpGetAllTasksDone ) ),
              post: auth( this.runMid( m.httpDoneTask ) ),
            },
          },
        },

        "materials": {
          get: auth( this.perms( this.runMid( m.httpHandleAllFilesInGroup ) ) ),
          post: auth( this.perms( this.runMid( m.httpAddFile ) ) ),

          ":materialId": {
            delete: auth( this.perms( this.runMid( m.httpHandleDeleteFile ) ) ),
          },
        },

        "users": {
          get: auth( this.perms( this.runMid( m.httpHandleAllUsersInGroup ) ) ),
          post: auth( this.perms( this.runMid( m.httpAddGroupMember ) ) ),

          ":userId": {
            delete: auth( this.perms( this.runMid( m.httpHandleDeleteUserFromGroup ) ) ),
          },
        },

        "notes": {
          get: auth( this.perms( this.runMid( m.httpGetAllMyNotes ) ) ),
          post: auth( this.perms( this.runMid( m.httpCreateNote ) ) ),

          ":noteId": {
            delete: auth( this.perms( this.runMid( m.httpHandleDeleteNote ) ) ),
            put: auth( this.perms( this.runMid( m.httpHandleNoteUpdate ) ) ),
          },
        },
      },
    } }
  }

  includePermsIntoReq = async(req, res, groupId) => {
    if (!groupId)
      return res
        .status( 400 )
        .json({
          code: 311,
          error: `Cannot assign your role in PE system, because groupId is not provided.`,
        })

    const newPerms = await this.getNewGroupPermission( req.user.id, groupId )
    req.user.newGroupPerms = newPerms

    if (!newPerms) {
      // console.log({userID:req.user.id, groupID:groupId})
      // console.log("GROUP PERMISSIONS NOT FOUND")
      return res.json({ code:9999, error:`GROUP PERMISSIONS NOT FOUND` })
    }
  }


  perms = cb => async(req, res, next) => {
    const groupId =
      (req.query.groupId || req.params.groupId || req.body.groupId) ?? null

    if (!groupId)
      return res
        .status( 400 )
        .json({
          code: 311,
          error: `Cannot assign your role in PE system, because groupId is not provided.`,
        })

    // const perms = await this.dbManager.findOne(
    //   this.subcollections.userPermissions,
    //   {
    //     $and: [
    //       { userId: { $eq: req.user.id } },
    //       { referenceId: { $eq: groupId } },
    //     ],
    //   }
    // );


    const newPerms = await this.getNewGroupPermission( req.user.id, groupId )

    // console.log(newPerms)
    if (newPerms) req.user.newGroupPerms = newPerms
    else {
      const platform = await this.getGroupPlatform( groupId )
      const platformPerms = await this.requiredModules.platformModule.getMyPermission( req.user.id, platform.id )

      if (platformPerms?.role.abilities.canManageGroups) {
        const group = await this.getTargetGroup( groupId )
        const groupOwnerPerms = await this.getNewGroupPermission( group.lecturer.id, groupId )
        // console.log( {group, groupOwnerPerms} )
        req.user.newGroupPerms = groupOwnerPerms
      } else {
        // console.log({userID:req.user.id, groupID:groupId})
        // console.log("GROUP PERMISSIONS NOT FOUND")
        return res.json({ code:9999, error:`GROUP PERMISSIONS NOT FOUND` })
      }
    }

    // if (!newPerms) {
    //   console.log(req.user.id, groupId)
    // const groupMember = await this.checkIsUserAssigned(req.user.id, groupId);

    // let isPlatformOwner = false;
    //   if (!groupMember) {
    //     // pobrac permisje ownera z platformy tej grupy.

    //     //TODO: ZAPYTANIE MERGE/CONNECT PLATFORM OBJ AND OWNER OF
    //     const plat = await this.requiredModules.platformModule.getPlatformByGroupId(
    //       groupId
    //     );

    //     if (plat.owner.id == req.user.id) isPlatformOwner = true;
    //     else
    //       return res
    //         .status(400)
    //         .json({
    //           code: 314,
    //           error: `You are not a member of target group, Cannot create/assign permissions.`,
    //         });
    //   }

    //   // TODO: FIX, double position in
    //   const permissions = isPlatformOwner
    //     ? new GroupPermission(groupId, `lecturer`, {
    //         isMaster: true,
    //       }).getProxy()
    //     : new GroupPermission(groupId, `student`).getProxy();

    //   req.user.groupPerms = permissions;
    //   req.user.groupPerms.groupId = groupId;
    //   const obj = permissions.target;

    //   if (!isPlatformOwner)
    //     await this.dbManager.insertObject(
    //       this.subcollections.userPermissions,
    //       obj
    //     );
    // }



    cb( req, res, next )
  }


  saveGroupPermissionsArr = arrayOfPerms => {
    const tasks = []
    arrayOfPerms.forEach( permission => {
      tasks.push( this.saveGroupPermissions( permission ) )
    } )
    return Promise.all( tasks )
  }


  saveGroupPermissions = perm => {
    if (perm instanceof GroupUserPermission)
      return this.dbManager.insertObject(
        this.subcollections.userPermissions,
        perm,
      )
    else if (perm instanceof GroupPermission)
      return this.dbManager.insertObject(
        this.subcollections.templatePermissions,
        perm,
      )
    else throw new Error(`permission save refused.`)
  }


  saveGroup = group => {
    // console.log({toSave:group});
    return this.dbManager.insertObject( this.basecollectionName, group )
  }


  saveNote = note =>
    this.dbManager.insertObject( this.subcollections.notes, note )


  groupExist = groupId =>
    this.dbManager.objectExist( this.basecollectionName, {
      id: { $eq:groupId },
    } );


  isLecturer = (userId, groupObj) => groupObj.lecturer.id === userId;

  doesTaskAlreadyExists = async(taskName, groupId) => {
    const task = await this.dbManager.findOne( this.subcollections.tasks, {
      $and: [
        { title:{ $eq:taskName } },
        { groupId:{ $eq:groupId } },
      ],
    } )
    return task ? true : false
  }

  doesRoleAlreadyExists = async(roleName, groupId) => {
    const role = await this.dbManager.findOne( this.subcollections.newTemplatePermissions, {
      $and: [
        { name:{ $eq:roleName } },
        { groupId:{ $eq:groupId } },
      ],
    } )

    return role ? true : false
  }


  getAllUserGroups = userId =>
    this.dbManager.findManyObjects( this.basecollectionName, {
      membersIds: { $in:[ userId ] },
    } );


  getGroupObject = groupId =>
    this.dbManager.findObject( this.basecollectionName, {
      id: { $eq:groupId },
    } );


  getAllPlatformGroups = platformId =>
    this.dbManager.findManyObjects( this.basecollectionName, {
      platformId: { $eq:platformId },
    } );


  getGroupPlatform = groupId =>
    this.dbManager.findOne( `platformModule`, {
      assignedGroups: { $elemMatch:{ $eq:groupId } },
    } );


  getAllUserNotes = userId =>
    this.dbManager.findManyObjects( this.subcollections.notes, {
      userId: { $eq:userId },
    } );

  getAllNotesByGroupId = groupId =>
    this.dbManager.findManyObjects( this.subcollections.notes, {
      groupId: { $eq:groupId },
    } );

  getGradesScale = groupId => this.dbManager.findObject( this.subcollections.scale, { groupId:{ $eq:groupId } } )

  getAllUserNotesInGroup = (groupId, userId) =>
    this.dbManager.findManyObjects( this.subcollections.notes, {
      $and: [
        { userId:{ $eq:userId } },
        { groupId:{ $eq:groupId } },
      ],
    } );

  isUserAssigned = (userId, groupObj) =>
    groupObj.membersIds.some( id => id === userId );

  checkIsUserAssigned = async(userId, groupId) => {
    const groupObj = await this.getGroupObject( groupId )
    return this.isUserAssigned( userId, groupObj )
  };

  checkIsGroupDuplicate =async(platformId, groupName) =>
  {
    const groups = await this.getAllGroupsFromPlatform( platformId )
    return groups.some( group => group.name === groupName )
  }

  getAllTemplatePerms = groupId =>
    this.dbManager.findManyObjects( this.subcollections.templatePermissions, {
      referenceId: { $eq:groupId },
    } );

  getAllGroupsFromPlatform = platformId =>
    this.dbManager.findManyObjects( this.basecollectionName, {
      platformId: { $eq:platformId },
    } );

  getAllPermissionsTemplateFromGroup = groupId =>
    this.dbManager.findManyObjects(
      this.subcollections.newTemplatePermissions,
      { groupId:{ $eq:groupId } },
    )

  saveNewGroupPermissionTemplate = template =>
    this.dbManager.insertObject( this.subcollections.newTemplatePermissions, template )

  addUserToGroupMembers = (userId, groupId) =>
    this.dbManager.findOneAndUpdate( // test this.
      this.basecollectionName,
      { id:{ $eq:groupId } },
      { $push:{ membersIds:userId } },
      { new:true },
    );

  removeUserFromGroupMembers = (userId, groupId) =>
  {
    return this.dbManager.findOneAndUpdate(
      this.basecollectionName,
      { id:{ $eq:groupId } },
      { $pull:{ membersIds:userId } },
      { new:true },
    )
  }

  saveNewGroupPermissionConnector = connector => {
    // console.log(this.subcollections.newUserPermissions, { connector })
    this.dbManager.insertObject( this.subcollections.newUserPermissions, connector )
  }

  getNewGroupPermission = async(userId, groupId) =>
  {
    const perms =  this.dbManager.aggregate(
      this.subcollections.newUserPermissions,
      { pipeline: [
        {
          $match: {
            $and: [
              {
                userId: {
                  $eq: userId,
                },
              }, {
                groupId: {
                  $eq: groupId,
                },
              },
            ],
          },
        }, {
          $lookup: {
            from: this.subcollections.newTemplatePermissions,
            localField: `permissionTemplateId`,
            foreignField: `id`,
            as: `perms`,
          },
        }, {
          $unwind: {
            path: `$perms`,
          },
        },
      ] },
    )
    const z = await perms.toArray()
    return z[ 0 ]
  }

  saveTaskInDb = taskObj =>
    this.dbManager.insertObject( this.subcollections.tasks, taskObj )

  getTargetGroup = groupId =>
    this.dbManager.findObject( this.basecollectionName, { id:{ $eq:groupId } } )

  updateGroupPermission = (roleId, update) =>
  {
    // console.log("GROUP PERMS UPDATE",{roleId, update})
    return this.dbManager.findOneAndUpdate( this.subcollections.newTemplatePermissions,
      { id:{ $eq:roleId } },
      { $set:update },
      { new:true },
    )
  }


  getGroupPermissions = (userId, groupId) => {
    // console.log(this.subcollections.newUserPermissions, { userId, groupId })
    return this.dbManager.findOne( this.subcollections.newUserPermissions, {
      groupId: { $eq:groupId },
      userId: { $eq:userId },
    } )
  };

  getAllGroupsFromPlatformWithMemberId = async(memberId, platformId) =>
    this.dbManager.findManyObjects( this.basecollectionName, {
      $and: [
        { platformId:{ $eq:platformId } },
        { membersIds:{ $in:[ memberId ] } },
      ],
    } );


  getUsersOfGroupAssignedRoles =groupObj => {
    return this.dbManager.aggregate( `userModule`, { pipeline: [
      {
        $match: { id:{ $in:groupObj.membersIds } },
      },
      {
        $lookup: {
          from: `groupModule.newPermissions.users`,
          let: { userId:`$id` },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq:[ `$groupId`, groupObj.id ] },
              { $eq:[ `$userId`, `$$userId` ] },
            ] } } },
          ],
          as: `connector`,
        },
      },
      {
        $unwind: { path:`$connector` },
      },
      {
        $lookup: {
          from: `groupModule.newPermissions`,
          localField: `connector.permissionTemplateId`,
          foreignField: `id`,
          as: `role`,
        },
      }, {
        $unwind: { path:`$role` },
      }, {
        $project: { connector:0 },
      },
    ] } ).toArray()

    // console.log({ groupObj, temp })
  }


  deleteGroupTemplatePermission = roleId =>
    this.dbManager.findOneAndDelete(
      this.subcollections.newTemplatePermissions,
      { id:{ $eq:roleId } },
    )

  deleteConnectorGroupRolesToUser = (groupId, userId) =>
    this.dbManager.deleteObject( this.subcollections.newUserPermissions,
      { $and: [
        { groupId:{ $eq:groupId } },
        { userId:{ $eq:userId } },
      ] },
    )

  deleteDocumentFromGroup = documentId => {
    return this.dbManager.findOneAndDelete( this.subcollections.materials, { id:{ $eq:documentId } } )
  }


  getAllMaterialsAssignedToGroup = groupId =>
    this.dbManager.findManyObjects( this.subcollections.materials, { groupId:{ $eq:groupId } } )

  getAllNotesFromGroup = groupId =>
  {
    return this.dbManager.aggregate( this.subcollections.notes,
      {
        pipeline:
        [
          {
            '$match': {
              'groupId': groupId,
            },
          }, {
            '$lookup': {
              'from': `userModule`,
              'localField': `userId`,
              'foreignField': `id`,
              'as': `user`,
            },
          }, {
            '$unwind': {
              'path': `$user`,
            },
          },
        ],
      },
    ).toArray()
  }

  getRoleById = roleId =>
    this.dbManager.findOne( this.subcollections.newTemplatePermissions, { id:{ $eq:roleId } } )

  getUserWithRoleByUserIdAndGroupId = (userId, groupId) =>
  {
    return this.dbManager.aggregate( this.subcollections.newUserPermissions,
      { pipeline: [
        {
          '$match': {
            'groupId': groupId,
            'userId': userId,
          },
        }, {
          '$lookup': {
            'from': `groupModule.newPermissions`,
            'localField': `permissionTemplateId`,
            'foreignField': `id`,
            'as': `role`,
          },
        }, {
          '$unwind': {
            'path': `$role`,
          },
        }, {
          '$lookup': {
            'from': `userModule`,
            'localField': `userId`,
            'foreignField': `id`,
            'as': `user`,
          },
        }, {
          '$unwind': {
            'path': `$user`,
          },
        },
      ] },
    ).toArray().then( data => data[ 0 ] )
  }
  // updateGroupPermissions = (permsName,groupId,update)=>
  // this.dbManager.findOneAndUpdate(this.subcollections.newTemplatePermissions,{
  //   $and:[
  //     {groupId:{$eq:groupId}},
  //     {name:{$eq:permsName}}
  //   ]
  // },
  // {$set:update},
  // {returnOriginal: false})

  toString() {
    return `GroupModule`
  }

  static toString() {
    return `GroupModule`
  }


  showRole( req ) {
    console.log( JSON.stringify( req.user, null, 2 ) )
  }
}
