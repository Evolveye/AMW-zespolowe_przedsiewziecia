import Meet from "./model.js";
import Module from "../module.js";
import { sameWords } from "../../src/utils.js";
import { MeetUserPermission, MeetPermission } from "./permissions.js";

/**
 * @typedef {object} MiddlewareParameters
 * @property {UserRequest} req
 * @property {Response} res
 * @property {NextFunction} next
 * @property {MeetModule} mod
 */

export default class MeetModule extends Module {
  static requiredModules = [`UserModule`, `PlatformModule`];
  static additionalModules = [`GroupModule`];

  subcollections = {
    templatesPerm: `permissions`,
    userPermissions: `permissions.users`,
  };

  constructor(...params) {
    super(...params);
  }

  getApi() {
    const userModule = this.requiredModules.userModule;
    const platformModule = this.requiredModules.platformModule;
    const groupModule = this.addAdditionalModule.groupModule;
    const gPerms = groupModule?.perms || ((cb) => cb);
    const pPerms = platformModule.perms;
    const auth = userModule.auth;

    return new Map([
      [
        `/meets`,
        {
          get: auth(this.runMid(this.httpHandleGetAllMeets)),
          post: auth(pPerms(gPerms(this.runMid(this.httpHandleCreateMeet)))),
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
          // canManageDetails.

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
  }

  httpHandleMeetPerms = async ({ req, res, mod }) => {
    const meetId = req.params.meetId;
    const client = req.user;

    if (!meetId)
      return res.status(400).json({
        code: 499,
        error:
          "Cannot get templates permissions, because meetId is not provided.",
      });

    const templates = await this.getTemplatePermissions(meetId);

    return res.json({ permissions: templates });
  };

  httpHandleMyMeetPermissions = async ({ req, res, mod }) => {
    const client = req.user;
    const meetId = req.params.meetId;

    if (!meetId)
      return res.status(400).json({
        code: 499,
        error:
          "Cannot get templates permissions, because meetId is not provided.",
      });

    // if (!(await this.checkIsMeetingMember))
    //   return res
    //     .status(400)
    //     .json({
    //       code: 498,
    //       error:
    //         "Cannot get permissions, because you are not member of this meeting",
    //     });

    const perms = await this.getUserPermissions(client.id, meetId).toArray();

    return res.json({ permissions: perms });
  };

  /** @param {import("socket.io").Socket} socket */
  socketConfigurator(socket) {}

  configure(app) {
    // Tworzenie spotkania /api/meets
    app.post(`/api/meets`, this.httpHandleCreateMeet);

    // Odczytywanie wszystkich spotkań /api/meets
    app.get(`/api/meets`, this.httpHandleGetAllMeets);

    //GET {{host}}/api/meets/:meetId
    app.get(`/api/meets/:meetId`, this.httpHandleMeetInfo);

    // Odczytywanie wszystkich spotkań z danej grupy /api/meets/group/:groupId
    // GET{ "authenthication": "string" } // header{ // body  "meets": [    "<Meet>"  ]}
    app.get(`/api/meets/group/:groupId`, this.httpHandleGetAllMeetingFromGroup);

    // Odczytywanie uczestników spotkania /api/meets/:meetId/users
    // GET // header { "authenthication": "string" }
    //  / response  { / "participants": [    "<User>"  ]}
    app.get(`/api/meets/:meetId/users`, this.handleGetAllMeetingMembers);

    // Odczytywanie wszystkich publicznych spotkań /api/meets/public
    // GET // header { "authenthication": "string" } // body {   "meets": [    "<Meet>"  ]}
    //  wszystkie meet.public === true
    //  WSZYSCY - nie ważne od zapytania.
    app.get(`/api/meets/public`, this.httpHandlePublicMeets);

    // Odczytywanie wszystkich spotkań nieprzypisanych do grupy /api/meets/groupless
    // GET // header  { "authenthication": "string" } // body { "meets": [ "<Meet>" ] }
    // memersIds => contain user
    // admin widzi.
    app.get(`/api/meets/groupless`, this.httpHandleGrouplessMeetings);

    // //Dodawanie uczestników do spotkania /api/meets/:meetId/users
    // // // header POST{ "authenthication": "string" }
    // // // body {   "participantsIds": [    "<string>"  ]}
    app.post(`/api/meets/:meetId/users`, this.httpHandleAddUsers);

    // // Usuwanie uczestnika ze spotkania
    // // DELETE{ "authenthication": "string" } // header
    app.delete(
      `/api/meets/:meetId/users/:userId`,
      this.httpHandleDeleteUserFromMeeting
    );

    // //Kasowanie spotkania /api/meets/:meetId
    // //DELETE { "authenthication": "string" } // header
    app.delete(`/api/meets/:meetId`, this.httpHandleDeleteMeet);
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
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct.",
      });

    const isLecturer = this.isUserLecturer(client.id, meetingObj);
    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );
    if (!isLecturer && !isOwner)
      return res.status(400).json({
        code: 408,
        error:
          "Only lecturer or Platform owner, have access to add members to meeting.",
      });

    const isMember = this.isMeetingMember(userId, meetingObj);
    if (!isMember)
      return res.status(400).json({
        code: 410,
        error: "Targeted user isn't a member of specified group",
      });

    if (
      sameWords(client.id, userId) ||
      sameWords(client.id, meetingObj.lecturer.id)
    )
      return res.status(400).json({
        code: 411,
        error:
          "As lecturer or PlatOwner - PO - You can not delete himself from meeting members.",
      });

    if (sameWords(userId, meetingObj.lecturer.id))
      return res.status(400).json({
        code: 413,
        error:
          "Cannot delete lecturer from meeting, you can only update a lecturer.",
      });

    await this.dbManager.updateObject(
      this.basecollectionName,
      { id: { $eq: meetingObj.id } },
      { $pull: { membersIds: userId } }
    );
    return res.json({
      code: 412,
      success: "User has been deleted from user list of meeting",
    });
  };

  httpHandleAddUsers = async ({ req, res }) => {
    const client = req.user;
    const meetingId = req.params.meetId;
    let newMembers = req.body.participantsIds;

    if (!Array.isArray(newMembers)) newMembers = [newMembers];

    const meetingObj = await this.getMeetingById(meetingId);
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct.",
      });

    const platformObj = await this.requiredModules.platformModule.getPlatform(
      meetingObj.platformId
    );
    const isLecturer = this.isUserLecturer(client.id, meetingObj);
    const isOwner = this.requiredModules.platformModule.isPlatformOwner(
      client.id,
      platformObj
    );

    if (!isLecturer && !isOwner)
      return res.status(400).json({
        code: 408,
        error:
          "Only lecturer or Platform owner, have access to add members to meeting.",
      });

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
      return res.json({
        code: 412,
        success:
          "Not all of users was assigned to platform. Because of that added to meeting only members of platform",
      });

    return res.json({
      code: 409,
      success: "All new parcipants has been assigned to meeting",
    });
  };

  handleGetAllMeetingMembers = async ({ req, res }) => {
    // TODO: doklejać meeting perms. for each.

    const client = req.user;
    const meetingId = req.params.meetId;

    const meetingObj = await this.getMeetingById(meetingId);
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct.",
      });
    // const isLecturer = this.isUserLecturer(client.id, meetingObj)
    // jest dopisywany do membersów.

    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );
    const isMember = this.isMeetingMember(client.id, meetingObj);

    if (!isOwner && !isMember)
      return res.status(400).json({
        code: 407,
        error:
          "Only meeting members or Platform owner, have access to display users of specyfic meeting",
      });

    const idsInMeeting = meetingObj.membersIds;

    const tasks = idsInMeeting.map((userId) =>
      this.requiredModules.userModule.getUserById(userId)
    );

    const usersArr = await Promise.all(tasks);

    return res.json({ participants: usersArr });
  };

  httpHandleDeleteMeet = async ({ req, res }) => {
    //Kasowanie spotkania /api/meets/:meetId
    //DELETE { "authenthication": "string" } // header
    const client = req.user;
    const meetingId = req.params.meetId;

    const meetingObj = await this.getMeetingById(meetingId);
    if (!meetingObj)
      return res.status(400).json({
        code: 404,
        error: "Can not find meeting. Make sure that meeting id is correct.",
      });
    const isLecturer = this.isUserLecturer(client.id, meetingObj);

    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );

    if (!isLecturer && !isOwner)
      return res.status(400).json({
        code: 405,
        error:
          "Only Lecturer of meeting or platform Owner can delete an meeting",
      });

    await this.deleteMeetingById(meetingObj.id);

    return res.json({
      code: 406,
      success: "Meeting has been deleted succesfully.",
    });
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

    const groupObj = await this.additionalModules.groupModule.getGroupObject(
      groupId
    );

    if (!groupObj)
      return res.status(400).json({
        code: 403,
        error:
          "Can not find specyfied group. Make sure you passed correct groupId",
      });

    const isMember = this.additionalModules.groupModule.isUserAssigned(
      client.id,
      groupObj
    );
    const isOwner = await this.requiredModules.platformModule.checkIsOwner(
      client.id,
      groupObj.platformId
    );

    if (!isMember && !isOwner)
      return res.status(400).json({
        code: 402,
        error:
          "Only meeting members or platform owner has access to see meeting of the specyfied group.",
      });

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
        .json({ code: 403, error: "Can not find meeting with provided id." });

    const isOwner = await this.requiredModules.platformModule.checkUserOwner(
      client.id,
      meetingObj.platformId
    );

    // members or owner
    const member = meetingObj.membersIds.some((id) => id === client.id);
    if (!member && !isOwner)
      return res.status(400).json({
        code: 402,
        error:
          "Only meeting members or platform owner can see meeting information.",
      });

    return res.json({ meet: meetingObj });
  };

  httpHandleGetAllMeets = async ({ req, res }) => {
    // "meets": [
    //     "<Meet>"
    //   ]
    const client = req.user;

    const meets = await this.getAllMeets(client.id);

    return res.json({ meets });
  };

  httpHandleCreateMeet = async ({ req, res }) => {
    // Tworzenie spotkania /api/meets

    const client = req.user;

    let { dateStart, dateEnd } = req.body;
    const { description, externalUrl, platformId, groupId } = req.body;

    if (!dateStart || !dateEnd || !description || !externalUrl || !platformId)
      return res.status(400).json({
        code: 409,
        error:
          "required more data, to create an meeting. Please fill in all fields.",
      });
    
    if(!externalUrl.startsWith(`http`) ||  !externalUrl.startsWith(`https`))
    return res.status(400).json({
      code: 410,
      error:
        "Incorrect link, external link should starts with http/https prefix",
    });

    dateStart = new Date(dateStart).getTime();
    dateEnd = new Date(dateEnd).getTime();

    const platfromObj = await this.requiredModules.platformModule.getPlatform(
      platformId
    );
    // const isAssigned = await this.requiredModules.platformModule.checkUserAssigned(
    //   client.id,
    //   platformId
    // );

    if (!groupId)
      return res.status(400).json({
        code: 416,
        error: "Create group not possible, groupId not provided.",
      });

    if (groupId != "") {
      const isGroupAssignedToPlatform = platfromObj.assignedGroups.some(
        (id) => id === groupId
      );

      if (!isGroupAssignedToPlatform)
        return res.status(400).json({
          code: 415,
          error:
            "Can not create meeting for this group, because group is not assigned to targeted platform.",
        });
    }

    if (!client.platformPerms.isPersonel)
      return res.status(400).json({
        code: 400,
        error:
          "You cant create meeting on platform, You need to have 'personel' status to make this operation.",
      });

    let ids = groupId
      ? (await this.additionalModules.groupModule.getGroupObject(groupId))
          .membersIds
      : [client.id];

    if (!ids.some((id) => id === client.id)) ids = ids.concat(client.id);

    let meeting = new Meet(client, description, platformId, ids, externalUrl, {
      dateStart: dateStart,
      dateEnd: dateEnd,
      groupId: groupId,
    });

    if (!meeting.validate())
      return res.status(400).json({ code: 401, error: "Date is not correct." });

    const userPermsList = ids.map((value) =>
      value != client.id
        ? MeetUserPermission.createStudentPerms(value, meeting.id)
        : MeetUserPermission.createOwnerPerms(value, meeting.id)
    );

    const templatePermsList = [
      MeetPermission.createOwnerTemplate(meeting.id),
      MeetPermission.createStudentTemplate(meeting.id),
    ];

    await this.saveMeetingInDb(meeting);
    await this.saveTemplatePermissions(templatePermsList);
    await this.saveUserPermissions(userPermsList);

    return res.json({ meet: meeting });
  };

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
