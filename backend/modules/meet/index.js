import Meet, { BoardImgs, ChatMessage } from "./model.js";
import Module from "../module.js";
import multer from "multer"
import { sameWords } from "../../src/utils.js";
import { MeetUserPermission, MeetPermission, LivePermissions, LiveAbilities } from "./permissions.js";
import { ANSWERS, MAX_LEN_MEETING_DESCRIPTION } from "./consts.js";

/** @typedef {import("../../src/ws.js").WS} Socket  */
/** @typedef {Socket | { userScope:{ user:object token:string } }} AuthorizedSocket  */

/**
 * @typedef {object} MiddlewareParameters
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 * @property {MeetModule} mod
 */

 let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/boards')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

let upload = multer({ storage: storage }).array("boards"); // <input type="file" name="boards" accept='image/*' multiple>

export default class MeetModule extends Module {
  static requiredModules = [`UserModule`, `PlatformModule`];
  static additionalModules = [`GroupModule`]; //`GroupModule`


  subcollections = {
    chatMessages:`messages`,
    boards:`boards`,
    templatesPerm: `permissions`,
    userPermissions: `permissions.users`,
    livePermissions:`permissions.live`
  };

  constructor(...params) {
    super(...params);
  }

  getApi() {
    const userModule = this.requiredModules.userModule;
    const platformModule = this.requiredModules.platformModule;
    const groupModule = this.additionalModules.groupModule;
    const gPerms = groupModule?.perms || ((cb) => cb);
    const pPerms = platformModule.perms;
    const auth = userModule.auth;

    return { meets: {
      get: auth(this.runMid(this.httpHandleGetAllMeets)),
      post: auth(gPerms(this.runMid(this.httpHandleCreateMeet))),

      ":meetId": {
          get: auth(this.runMid(this.httpHandleMeetInfo)),
          delete: auth(this.runMid(this.httpHandleDeleteMeet)),
          // TODO: put, date start,end, link, desc,link, public
          // canEditDetails.
          "boards":{
            get:this.httpHandleGetBoards,
            post:this.httpHandleUploadBoards,

          },

          "permissions": {
              get: auth(this.runMid(this.httpHandleMeetPerms)), // TODO templates

              "my": {
                  get: auth(this.runMid(this.httpHandleMyMeetPermissions)), // TODO 1 perm of client
              },
          },

          "users": {
            get: auth(pPerms(this.runMid(this.handleGetAllMeetingMembers))), // TODO: dolaczyc permsy
            post: auth(pPerms(gPerms(this.runMid(this.httpHandleAddUsers)))),

            ":userId": {
                delete: auth(this.runMid(this.httpHandleDeleteUserFromMeeting)),
            }
          },
      },

      "group": {
          ":groupId": {
              get: auth(gPerms(this.runMid(this.httpHandleGetAllMeetingFromGroup))),
          },
      },

      "public": {
          get: auth(this.runMid(this.httpHandlePublicMeets)),
      },

      "groupless": {
          get: auth(this.runMid(this.httpHandleGrouplessMeetings)),
      }
    }}

    /*
    return new Map([
      [
        "/meets", {
            get: auth(this.runMid(this.httpHandleGetAllMeets)),
            post: auth(pPerms(gPerms(this.runMid(this.httpHandleCreateMeet)))),

            ":meetId": {
                get: auth(this.runMid(this.httpHandleMeetInfo)),
                delete: auth(this.runMid(this.httpHandleDeleteMeet)),
                // TODO: put, date start,end, link, desc,link, public
                // canEditDetails.

                "permissions": {
                    get: auth(this.runMid(this.httpHandleMeetPerms)), // TODO templates

                    "my": {
                        get: auth(this.runMid(this.httpHandleMyMeetPermissions)), // TODO 1 perm of client
                    },
                },

                "users": {
                  get: auth(pPerms(this.runMid(this.handleGetAllMeetingMembers))), // TODO: dolaczyc permsy
                  post: auth(pPerms(gPerms(this.runMid(this.httpHandleAddUsers)))),

                  ":userId": {
                      delete: auth(this.runMid(this.httpHandleDeleteUserFromMeeting)),
                  }
                },
            },

            "group": {
                ":groupId": {
                    get: auth(pPerms(this.runMid(this.httpHandleGetAllMeetingFromGroup))),
                },
            },

            "public": {
                get: auth(this.runMid(this.httpHandlePublicMeets)),
            },

            "groupless": {
                get: auth(this.runMid(this.httpHandleGrouplessMeetings)),
            }
        },
      ],

      [
        `/meets/:meetId/permissions`,
        {
          get: auth(this.runMid(this.httpHandleMeetPerms)), // TODO templates
        },
      ],

      [
        `/meets/:meetId/permissions/my`,
        {
          get: auth(this.runMid(this.httpHandleMyMeetPermissions)), // TODO 1 perm of client
        },
      ],

      [
        `/meets/:meetId`,
        {
          get: auth(this.runMid(this.httpHandleMeetInfo)),
          delete: auth(this.runMid(this.httpHandleDeleteMeet)),
          // TODO: put, date start,end, link, desc,link, public
          // canEditDetails.
        },
      ],

      [
        `/meets/group/:groupId`,
        {
          get: auth(pPerms(this.runMid(this.httpHandleGetAllMeetingFromGroup))),
        },
      ],

      [
        `/meets/:meetId/users`,
        {
          get: auth(pPerms(this.runMid(this.handleGetAllMeetingMembers))), // TODO: dolaczyc permsy
          post: auth(pPerms(gPerms(this.runMid(this.httpHandleAddUsers)))),
        },
      ],

      [
        `/meets/public`,
        {
          get: auth(this.runMid(this.httpHandlePublicMeets)),
        },
      ],

      [
        `/meets/groupless`,
        {
          get: auth(this.runMid(this.httpHandleGrouplessMeetings)),
        },
      ],

      [
        `/meets/:meetId/users/:userId`,
        {
          delete: auth(this.runMid(this.httpHandleDeleteUserFromMeeting)),
        },
      ],
    ]);
    */
  }

  httpHandleMeetPerms = async ({ req, res, mod }) => {
    const meetId = req.params.meetId;
    const client = req.user;

    if (!meetId)
      return res.status(400).json(ANSWERS.GET_PERMS_MISS_MEET_ID);



    const templates = await this.getTemplatePermissions(meetId);

    return res.json({ permissions: templates });
  };

  httpHandleMyMeetPermissions = async ({ req, res, mod }) => {
    const client = req.user;
    const meetId = req.params.meetId;

    if (!meetId)
      return res.status(400).json(ANSWERS.GET_MY_PERMS_MISS_MEET_ID);

    const perms = await mod.dbManager.findOne(`meetModule.permissions.users`, {
      $and: [{ referenceId: meetId }, { userId: client.id }],
    });
    delete perms["_id"];
    //await this.getUserPermissions(client.id, meetId).toArray();

    return res.json({ permissions: perms });
  };

  // /** @param {import("socket.io").Socket} socket */
   /** @param {AuthorizedSocket} socket  */
  socketConfigurator(socket) {
    console.log( `Socket ${socket.id}, user ${socket.userScope.user}` )

    socket.on( `join room`, async msg => {
      const {roomId} = msg

      const perms = await this.getLivePermissions(socket.userScope.user.id,roomId); // TODO:
      if(!perms)
      throw new Error("Live - perms not found")

      socket.userScope.user.livePermissions = perms


      socket.join(roomId)
      socket.emitToRoom(roomId,`member joined`,socket.userScope.user)
    }),

    socket.on(`change permission`,async msg => {
      const {roomId,targetUserId,abilities} = msg

      const permission = await this.updateLivePermissions(targetUserId,roomId,abilities)

      socket.emitToRoom(roomId,`update permission`,permission)
    })

    socket.on( `chat message`, async msg => {
      // roomId === meetId
     const user = socket.userScope.user // tutaj wysyłającym jest user czy jak?
     const {roomId,content} = msg

     const message = new ChatMessage(user,roomId,content)
     await this.saveChatMessage(message)

     const msgData = {
       messageId:message.id,
       author:user,
       content: content
     }

     socket.emitToRoom(roomId,`new message`,msgData)
     // socket.emit( `chat message`, msgData )
     // socket.broadcast.emit( `chat message`, msgData )
   })

   socket.on(`edit message`,async msg => {
       const {messageId,content,roomId} = msg


       await this.updateMessage(messageId,content)

       socket.emitToRoom(roomId,`update message`,{messageId, content})
   }),

   socket.on(`delete message`,async msg => {
       const {messageId,roomId} = msg

       await this.deleteMessage(messageId)

       socket.emitToRoom(roomId,`remove message`,{messageId})
   }),

   socket.on(`change permission`, msg =>{
    const {targetuserId,changedPermissions,roomId} = msg // roomId też ?


    //TODO, update perms in db


      socket.emitToRoom(roomId,`update permission`,msg)
   }),

   socket.on(`leave room`, msg => {

     const user = socket.userScope.user

     // zawiadomic czat, że ktoś opuszcza czat/spotkanie whatever.
     socket.emitToRoom(msg.roomId,`member leaved`, user)
     socket.leaveRoom(msg.roomId)
   })
  }

  // configure(app) {
  //   // Tworzenie spotkania /api/meets
  //   app.post(`/api/meets`, this.httpHandleCreateMeet);

  //   // Odczytywanie wszystkich spotkań /api/meets
  //   app.get(`/api/meets`, this.httpHandleGetAllMeets);

  //   //GET {{host}}/api/meets/:meetId
  //   app.get(`/api/meets/:meetId`, this.httpHandleMeetInfo);

  //   // Odczytywanie wszystkich spotkań z danej grupy /api/meets/group/:groupId
  //   // GET{ "authenthication": "string" } // header{ // body  "meets": [    "<Meet>"  ]}
  //   app.get(`/api/meets/group/:groupId`, this.httpHandleGetAllMeetingFromGroup);

  //   // Odczytywanie uczestników spotkania /api/meets/:meetId/users
  //   // GET // header { "authenthication": "string" }
  //   //  / response  { / "participants": [    "<User>"  ]}
  //   app.get(`/api/meets/:meetId/users`, this.handleGetAllMeetingMembers);

  //   // Odczytywanie wszystkich publicznych spotkań /api/meets/public
  //   // GET // header { "authenthication": "string" } // body {   "meets": [    "<Meet>"  ]}
  //   //  wszystkie meet.public === true
  //   //  WSZYSCY - nie ważne od zapytania.
  //   app.get(`/api/meets/public`, this.httpHandlePublicMeets);

  //   // Odczytywanie wszystkich spotkań nieprzypisanych do grupy /api/meets/groupless
  //   // GET // header  { "authenthication": "string" } // body { "meets": [ "<Meet>" ] }
  //   // memersIds => contain user
  //   // admin widzi.
  //   app.get(`/api/meets/groupless`, this.httpHandleGrouplessMeetings);

  //   // //Dodawanie uczestników do spotkania /api/meets/:meetId/users
  //   // // // header POST{ "authenthication": "string" }
  //   // // // body {   "participantsIds": [    "<string>"  ]}
  //   app.post(`/api/meets/:meetId/users`, this.httpHandleAddUsers);

  //   // // Usuwanie uczestnika ze spotkania
  //   // // DELETE{ "authenthication": "string" } // header
  //   app.delete(
  //     `/api/meets/:meetId/users/:userId`,
  //     this.httpHandleDeleteUserFromMeeting
  //   );

  //   // //Kasowanie spotkania /api/meets/:meetId
  //   // //DELETE { "authenthication": "string" } // header
  //   app.delete(`/api/meets/:meetId`, this.httpHandleDeleteMeet);
  // }

  httpHandleUploadBoards = ({ req, res })=>
  {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) console.error(`Please upload a file: ${err}`)
      else if (err) console.error(`Unknown error: ${err}`)

      const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
      const meetId = req.params.meetId || req.body.meetId || req.query.meetId;
      const boardsImg = req.files

      console.log({boardsImg})

      debugger;

      arrayOfFileNames = boardsImg.map(item => item.filename)
      arrayOfFilePaths = boardsImg.map(item => item.path)

      const boardObj = new BoardImgs(meetId,arrayOfFileNames,arrayOfFilePaths)

      if(!boardObj.validate())
      res.status(400).json(ANSWERS.UPLOAD_BOARD_INVALID_FILE_EXT)

      await this.saveMeetingBoardInDb(boardObj)


     return res.json({ board: boardObj })
    });
  }


  httpHandleGetBoards = async ({ req, res }) =>
  {
    const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
    const meetId = req.params.meetId || req.body.meetId || req.query.meetId;

    const BoardImgs = await this.findMeetingBoard(meetId)
    if(!BoardImgs)
    return res.status(400).json({code:432,error:"Board of meeting not found"})

   return res.json({board:BoardImgs})
  }

  httpHandleGrouplessMeetings = async ({ req, res }) => {
    // Odczytywanie wszystkich spotkań nieprzypisanych do grupy /api/meets/groupless
    // GET // header  { "authenthication": "string" } // body { "meets": [ "<Meet>" ] }
    // memersIds => contain user
    // admin widzi.

    const client = req.user;

    const meetings = await this.dbManager.findManyObjects(
      this.basecollectionName,
      { membersIds: client.id, groupId: "" }
    );

    return res.json({ meets: meetings });
  };

  httpHandlePublicMeets = async (req, res, next) => {
    const meets = await this.dbManager.findManyObjects(
      this.basecollectionName,
      { public: true }
    );

    return res.json({ meets });
  };

  httpHandleDeleteUserFromMeeting = async ({ req, res }) => {
    // Usuwanie uczestnika ze spotkania
    // DELETE{ "authenthication": "string" } // header
    /// api/meets/:meetId/users/:userId
    const client = req.user;
    const { meetId, userId } = req.params;

    const meetingObj = await this.getMeetingById(meetId);
    if (!meetingObj)
      return res.status(400).json(ANSWERS.DELETE_USER_FROM_MEETING_MISS_MEET_ID);

    const isLecturer = this.isUserLecturer(client.id, meetingObj);
    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );
    if (!isLecturer && !isOwner)
      return res.status(400).json(ANSWERS.DELETE_USER_FROM_MEETING_NOT_ALLOWED);

    const isMember = this.isMeetingMember(userId, meetingObj);
    if (!isMember)
      return res.status(400).json(ANSWERS.DELETE_USER_FROM_GROUP_NOT_MEMBER);

    if (
      sameWords(client.id, userId) ||
      sameWords(client.id, meetingObj.lecturer.id)
    )
      return res.status(400).json(ANSWERS.DELETE_USER_FROM_GROUP_CANNOT_DEL_SELF);

    if (sameWords(userId, meetingObj.lecturer.id))
      return res.status(400).json(ANSWERS.DELETE_USER_FROM_GROUP_CANNOT_DEL_LECTURER);

    await this.dbManager.updateObject(
      this.basecollectionName,
      { id: { $eq: meetingObj.id } },
      { $pull: { membersIds: userId } }
    );
    return res.json(ANSWERS.DELETE_USER_SUCCESS);
  };

  httpHandleAddUsers = async ({ req, res }) => {
    const client = req.user;
    const meetingId = req.params.meetId;
    let newMembers = req.body.participantsIds;

    if (!Array.isArray(newMembers)) newMembers = [newMembers];

    const meetingObj = await this.getMeetingById(meetingId);
    if (!meetingObj)
      return res.status(400).json(ANSWERS.ADD_USER_GROUP_NOT_FOUND);

    const platformObj = await this.requiredModules.platformModule.getPlatform(
      meetingObj.platformId
    );
    const isLecturer = this.isUserLecturer(client.id, meetingObj);
    const isOwner = this.requiredModules.platformModule.isPlatformOwner(
      client.id,
      platformObj
    );

    if (!isLecturer && !isOwner)
      return res.status(400).json(ANSWERS.ADD_USER_NOT_ALLOWED);

    //take users that are members of platform.
    let positiveIds = platformObj.membersIds.filter((id) =>
      newMembers.some((member) => id === member)
    );
    positiveIds = positiveIds.filter((id) =>
      meetingObj.membersIds.every(member != id)
    );

    // const query = { // znajdz platformę  do której należa wszyscy.
    //   $and: [
    //     { membersIds: { $all:newMembers } },
    //     { platformId: meetingObj.platformId }
    //   ]
    // }
    // this.dbManager.findObject(
    //   'platforms',
    //   { platformId:meetingObj.platformId, $in:[ newMembers,membersIds ] }
    // )
    if (positiveIds.length > 0)
      await this.dbManager.findOneAndUpdate(
        this.basecollectionName,
        { id: { $eq: meetingId } },
        { $push: { membersIds: { $each: positiveIds } } }
      );

    if (positiveIds.length !== newMembers.length)
      return res.json(ANSWERS.ADD_USER_PARTLY_SUCCESS);

    return res.json(ANSWERS.ADD_USER_SUCCESS);
  };

  handleGetAllMeetingMembers = async ({ mod, req, res }) => {
    // TODO: doklejać meeting perms. for each.

    const client = req.user;
    const meetingId = req.params.meetId;

    const meetingObj = await this.getMeetingById(meetingId);
    if (!meetingObj)
      return res.status(400).json(ANSWERS.GET_MEETING_MEMBERS_BAD_MEET_ID);
    // const isLecturer = this.isUserLecturer(client.id, meetingObj)
    // jest dopisywany do membersów.

    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );
    const isMember = this.isMeetingMember(client.id, meetingObj);

    if (!isOwner && !isMember)
      return res.status(400).json(ANSWERS.GET_MEETING_MEMBERS_NOT_ALLOWED);

    const idsInMeeting = meetingObj.membersIds;

    const users = idsInMeeting.map((userId) =>
      mod.requiredModules.userModule.getUserById(userId)
    );

    const perms = idsInMeeting.map((userId) =>
      mod.dbManager.findOne(`meetModule.permissions.users`, {
        $and: [{ userId }, { referenceId: meetingObj.id }],
      })
    );

    const usersArr = await Promise.all(users);
    const permsArr = await Promise.all(perms);
    usersArr.map((user) => {
      user.perms = permsArr.find((permObj) => permObj.userId == user.id);
      delete user.perms['_id']
    });

    return res.json({ participants: usersArr });
  };

  httpHandleDeleteMeet = async ({ req, res }) => {
    //Kasowanie spotkania /api/meets/:meetId
    //DELETE { "authenthication": "string" } // header
    const client = req.user;
    const meetingId = req.params.meetId;

    const meetingObj = await this.getMeetingById(meetingId);

    const platformModule = this.requiredModules.platformModule
    const groupModule = this.additionalModules.groupModule

    if (!meetingObj)
      return res.status(400).json(ANSWERS.DELETE_MEETING_BAD_MEET_ID);

    await platformModule.includePermsIntoReq(req,res,meetingObj.platformId)
    await groupModule.includePermsIntoReq(req,res,meetingObj.groupId)

    console.log(JSON.stringify(req.user,null,2))

    // const isOwner = await this.requiredModules.platformModule.checkUserOwner(
    //   client.id,
    //   meetingObj.platformId
    // );

    if (!req.user.newGroupPerms.perms.abilities.canManageMeets &&
      !req.user.newPlatformPermissions.perms.abilities.canManageGroups)
      return res.status(400).json(ANSWERS.DELETE_MEETING_NOT_ALLOWED);

    await this.deleteMeetingById(meetingId);

    return res.json(ANSWERS.DELETE_MEETING_SUCCESS);
  };

  deleteUserPermissionsByGroupId = (groupId) =>
    this.dbManager.deleteMany(this.subcollections.userPermissions, {
      referenceId: { $eq: groupId },
    });

  deleteTemplatePermissionsByGroupId = (groupId) =>
    this.dbManager.deleteMany(this.subcollections.templatesPerm, {
      referenceId: { $eq: groupId },
    });

  httpHandleGetAllMeetingFromGroup = async ({ req, res }) => {
    const client = req.user;
    const groupId = req.params.groupId;

    // const groupObj = await this.additionalModules.groupModule.getGroupObject(
    //   groupId
    // );

    // if (!groupObj)
    //   return res.status(400).json(ANSWERS.GET_ALL_MEETINGS_BAD_MEET_ID);

    // const isMember = this.additionalModules.groupModule.isUserAssigned(
    //   client.id,
    //   groupObj
    // );

    // const isOwner = await this.requiredModules.platformModule.checkIsOwner(
    //   client.id,
    //   groupObj.platformId
    // );

    // if (!isMember && !isOwner)
    //   return res.status(400).json(ANSWERS.GET_ALL_MEETINGS_NOT_ALLOWED);

    const meetingList = await this.getMeetingsByGroupId(groupId);

    return res.json({ meets: meetingList });
  };

  httpHandleMeetInfo = async ({ req, res }) => {
    const meetId = req.params.meetId;
    const client = req.user;

    if (!/\d/.test(meetId)) return next();

    const meetingObj = await this.getMeetingById(meetId);
    if (!meetingObj)
      return res
        .status(400)
        .json(ANSWERS.GET_MEET_INFO_BAD_MEET_ID);

    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );

    // members or owner
    const member = meetingObj.membersIds.some((id) => id === client.id);
    if (!member && !isOwner)
      return res.status(400).json(ANSWERS.GET_MEET_INFO_NOT_ALLOWED);

    const perms = await this.getLivePermissions(client.id,meetId); // TODO:

    if(!perms)
    throw new Error("Live - perms not found")

    meetingObj.myRole = perms

    return res.json({ meet: meetingObj });
  };

  httpHandleGetAllMeets = async ({ req, res }) => {
    const client = req.user;
    const { platformId, groupId } = req.query
    //JUMP


    let meets = await this.getAllMeetsAssignedToUserId(client.id)

   // console.log({query:req.query})
   // console.log({TUTAJ: meets})
    //const meets = await this.getAllMeets(client.id);

    if (platformId) meets = meets.filter( m => m.platformId === platformId )
    if (groupId)    meets = meets.filter( m => m.groupId    === groupId )

    return res.json({ meets });
  };

  httpHandleCreateMeet = async ({ req, res }) => {
    // Tworzenie spotkania /api/meets

    const client = req.user;

    console.log({body:req.body.newGroupPermissions})
    console.log(JSON.stringify(client,null,2))

    let { dateStart, dateEnd } = req.body;
    const { description, externalUrl, groupId, platformId } = req.body;

    if (!dateStart || !dateEnd || !description || !platformId)
      return res.status(400).json(ANSWERS.CREATE_MEETING_MISSING_DATA);

    if (description.length > MAX_LEN_MEETING_DESCRIPTION)
      return res.status(400).json(ANSWERS.CREATE_MEETING_BAD_DESCRIPTION_LEN)

    // if (!externalUrl.startsWith(`http`) && !externalUrl.startsWith(`https`))
    //   return res.status(400).json(ANSWERS.CREATE_MEETING_BAD_LINK);

    dateStart = new Date(dateStart).getTime();
    dateEnd = (() => {
      // return new Date(dateEnd).getTime();
      const endTime = dateEnd.split(`:`)
      return dateStart + 1000 * 60 * (endTime[ 1 ] + 60 * endTime[ 0 ])
    })()

    // const platfromObj = await this.requiredModules.platformModule.getPlatform(
    //   platformId
    // );
    // const isAssigned = await this.requiredModules.platformModule.checkUserAssigned(
    //   client.id,
    //   platformId
    // );

    if (!groupId)
      return res.status(400).json(ANSWERS.CREATE_MEETING_MISS_GROUP_ID);

    // if (groupId != "") {
    //   const isGroupAssignedToPlatform = platfromObj.assignedGroups.some(
    //     (id) => id === groupId
    //   );

    //   if (!isGroupAssignedToPlatform)
    //     return res.status(400).json(ANSWERS.CREATE_MEETING_MISSING_GROUP_IN_PLATFORM);
    // }

    const targetGroup = await this.additionalModules.groupModule.getGroupObject(groupId)

    console.log(targetGroup)


    if (!client.newGroupPerms.perms.abilities.canManageMeets)
      return res.status(400).json(ANSWERS.CREATE_MEETING_NOT_ALLOWED);

    let ids = groupId
      ? targetGroup.membersIds
      : [client.id];

    if (!ids.some((id) => id === client.id)) ids = ids.concat(client.id);

    const { platformPerms, avatar, createdDatetime, activated, ...lector } = client

    let meeting = new Meet(lector, description, ids, platformId, externalUrl, {
      dateStart: dateStart,
      dateEnd: dateEnd,
      groupId: groupId,
    });

    if (!meeting.validate())
      return res.status(400).json(ANSWERS.CREATE_MEETING_BAD_DATE);

    const userPermsList = ids.map((value) =>
      value != client.id
        ? new LivePermissions(value,meeting.id,LiveAbilities.getStudentAbilities())
        : new LivePermissions(value,meeting.id,LiveAbilities.getLecturerAbilities())
    );

    // const templatePermsList = [
    //   MeetPermission.createOwnerTemplate(meeting.id),
    //   MeetPermission.createStudentTemplate(meeting.id),
    // ];

    // const saveLivePermTasks = userPermsList.map(livePermission =>
    //   this.saveLivePermissionsList(perms)
    //   )

    // const LivePermsList = ids.map(userId =>
    //  {
    //   let perms = null
    //   if(userId===client.id)
    //        perms = LivePermissions(userId, meeting.id ,LiveAbilities.getLecturerAbilities())
    //   else
    //       perms = LivePermissions(userId,meeting.id,LiveAbilities.getStudentAbilities())

    //    return this.saveLivePermissionsList(perms)
    //  })


    // await this.saveLivePermissionsList(LivePermsList);
    //await this.saveTemplatePermissions(templatePermsList);
    // await this.saveUserPermissions(userPermsList);

    console.log(userPermsList)
    await this.saveLivePermissionsList(userPermsList)
    await this.saveMeetingInDb(meeting);


    console.log({ meet: meeting, ...ANSWERS.CREATE_MEETING_SUCCESS })
    return res.json({ meet: meeting, ...ANSWERS.CREATE_MEETING_SUCCESS });
  };



  saveLivePermissionsList = (livePermissions) =>
  {
    if(Array.isArray(livePermissions))
      return this.dbManager.insetMany(this.subcollections.livePermissions,livePermissions)

    throw new Error("not array of permission")
  }

  getLivePermissions = (userId,meetId) =>
  this.dbManager.findObject(this.subcollections.livePermissions,{$and:[
    {meetId:{$eq:meetId}},
    {userId:{$eq:userId}}
  ]})


  findAndUpdateLivePermissions = (userId,meetId,newAbilities) =>{
    const abilities = newAbilities
      .map( ([ability, bool]) => ({ field:`abilities.${ability}`, value:bool }) )
      .reduce( (obj, { field,value }) => ({ [field]:value, ...obj }), {} )

    this.dbManager.findOneAndUpdate(this.subcollections.livePermissions,
      {$and:[
        {userId:{$eq:userId}},
        {meetId:{$eq:meetId}}
      ]},
      abilities,
      {returnOriginal: false} )
  }

  updateLivePermissions = (userId,meetId,newAbilities) =>
  {
    //const newabilities = { this_canReadChat:true, this_canWriteOnChat:true}
    // cos jak tutaj
    const abilities = newAbilities
      .map( ([ability, bool]) => ({ field:`abilities.${ability}`, value:bool }) )
      .reduce( (obj, { field,value }) => ({ [field]:value, ...obj }), {} )

    return this.dbManager.updateObject(this.subcollections.livePermissions,
      {$and:[
        {userId:{$eq:userId}},
        {meetId:{$eq:meetId}}
      ]},
      abilities)
  }
  //getLivePermissions = ()

  saveChatMessage = (messageObj) =>
  this.dbManager.insertObject(this.subcollections.chatMessages,messageObj)

  getAllMessagesFromMeet = (meetId) =>
  this.dbManager.findManyObjects(this.subcollections.chatMessages,{meetId:{$eq:meetId}})

  deleteMessage = (messageId) =>
  this.dbManager.deleteObject(this.subcollections.chatMessages,{id:{$eq:messageId}})

  updateMessage = (messageId,newTextMessage) =>
  this.dbManager.updateObject(
    this.subcollections.chatMessages,
    {id:{$eq:messageId}},
    { $set:{message:newTextMessage}} )

  getAllMeets = (memberId) =>
    this.dbManager.findManyObjects(this.basecollectionName, {
      membersIds: memberId,
    });

  /**
   *
   * @param {string} meetId
   * @returns {Array<MeetPermission>}
   */
  getTemplatePermissions = (meetId) =>
    this.dbManager.findManyObjects(this.subcollections.templatesPerm, {
      referenceId: { $eq: meetId },
    });

  getUserPermissions = (userId, meetId) =>
    this.dbManager.aggregate(this.subcollections.userPermissions, {
      pipeline: [
        { $match: { $and: [{ referenceId: meetId }, { userId: userId }] } },
        { $project: { _id: false } },
      ],
    });

  saveTemplatePermissions = (perms) =>
    Array.isArray(perms)
      ? this.dbManager.insetMany(this.subcollections.templatesPerm, perms)
      : this.dbManager.insertObject(this.subcollections.templatesPerm, perms);

  saveUserPermissions = (perms) =>
    Array.isArray(perms)
      ? this.dbManager.insetMany(this.subcollections.userPermissions, perms)
      : this.dbManager.insertObject(this.subcollections.userPermissions, perms);

  saveMeetingInDb = (meet) =>
    this.dbManager.insertObject(this.basecollectionName, meet);

  saveMeetingBoardInDb = (boardImgsObj) =>
    this.dbManager.insertObject(this.subcollections.boards,boardImgsObj)

  findMeetingBoard = (meetingId) =>
    this.dbManager.findOne(this.subcollections.boards,{meetId:{$eq:meetingId}})

  getAllMeetsAssignedToUserId = (userId) =>
  {
    console.log({user_as_memb:userId})
    return this.dbManager.findManyObjects(this.basecollectionName,
      { membersIds: userId }
      )
  }

  getMeetingById = (meetId) =>
    this.dbManager.findObject(this.basecollectionName, { id: { $eq: meetId } });

  getMeetingsByGroupId = (groupId) =>
    this.dbManager.findManyObjects(this.basecollectionName, {
      groupId: { $eq: groupId },
    });

  isUserLecturer = (userId, meetObj) => meetObj.lecturer.id === userId;

  deleteMeetingById = (meetingId) =>
    this.dbManager.deleteObject(this.basecollectionName, {
      id: { $eq: meetingId },
    });

  isMeetingMember = (userId, meetingObj) =>
    meetingObj.membersIds.some((id) => id === userId);

  checkIsMeetingMember = (userId, meetingId) =>
    this.dbManager.find(this.basecollectionName, {
      $and: [{ id: { $eq: { meetingId } } }, { membersIds: { $in: [userId] } }],
    });

  /**@returns {string}  Name of class */
  toString = () => this.constructor.toString();

  /**@returns {string}  Name of class */
  static toString = () => "MeetModule";
}
