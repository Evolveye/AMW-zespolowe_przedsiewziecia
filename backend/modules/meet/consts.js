export const MEETING_DATE_MAX_YEARS_AHEAD  = 10
export const MAX_LEN_MEETING_DESCRIPTION  = 255

export const ANSWERS = {
    GET_PERMS_MISS_MEET_ID:{ code: 499, error:"Cannot get templates permissions, because meetId is not provided." },

    GET_MY_PERMS_MISS_MEET_ID:{code: 499, error:  "Cannot get templates permissions, because meetId is not provided."},

    DELETE_USER_FROM_MEETING_MISS_MEET_ID:{  code: 404,  error: "Can not find meeting. Make sure that meeting id is correct."},
    DELETE_USER_FROM_MEETING_NOT_ALLOWED:{code: 408, error: "Only lecturer or Platform owner, have access to add members to meeting." } ,   
    DELETE_USER_FROM_GROUP_NOT_MEMBER:{ code: 410, error: "Targeted user isn't a member of specified group" },
    DELETE_USER_FROM_GROUP_CANNOT_DEL_SELF:{ code: 411, error: "As lecturer or PlatOwner - PO - You can not delete himself from meeting members."},
    DELETE_USER_FROM_GROUP_CANNOT_DEL_LECTURER:{ code: 413, error: "Cannot delete lecturer from meeting, you can only update a lecturer." },
    DELETE_USER_SUCCESS:{ code: 412, success: "User has been deleted from user list of meeting"},
    
    ADD_USER_GROUP_NOT_FOUND:{ code: 404, error: "Can not find meeting. Make sure that meeting id is correct." },
    ADD_USER_NOT_ALLOWED:{ code: 408, error: "Only lecturer or Platform owner, have access to add members to meeting."},
    ADD_USER_PARTLY_SUCCESS:{code: 412, success:"Not all of users was assigned to platform. Because of that added to meeting only members of platform" },
    ADD_USER_SUCCESS:{ code: 409, success: "All new parcipants has been assigned to meeting"},

    GET_MEETING_MEMBERS_BAD_MEET_ID: { code: 404, error: "Can not find meeting. Make sure that meeting id is correct."  },
    GET_MEETING_MEMBERS_NOT_ALLOWED:{  code: 407,  error: "Only meeting members or Platform owner, have access to display users of specyfic meeting"  },

    DELETE_MEETING_BAD_MEET_ID:{ code: 404, error: "Can not find meeting. Make sure that meeting id is correct." },
    DELETE_MEETING_NOT_ALLOWED:{ code: 405, error: "Only Lecturer of meeting or platform Owner can delete an meeting" },
    DELETE_MEETING_SUCCESS:{code: 406, success: "Meeting has been deleted succesfully."},

    GET_ALL_MEETINGS_BAD_MEET_ID:{ code: 403, error: "Can not find specyfied group. Make sure you passed correct groupId" },
    GET_ALL_MEETINGS_NOT_ALLOWED: { code: 402, error:"Only meeting members or platform owner has access to see meeting of the specyfied group."},

    GET_MEET_INFO_BAD_MEET_ID:{ code: 403, error: "Can not find meeting with provided id." },
    GET_MEET_INFO_NOT_ALLOWED:{ code: 402, error: "Only meeting members or platform owner can see meeting information."},

    CREATE_MEETING_MISSING_DATA:{ code: 409, error:"required more data, to create an meeting. Please fill in all fields."},
    CREATE_MEETING_BAD_LINK:{ code: 410, error:"Incorrect link, external link should starts with ['http','https'] prefix" },
    CREATE_MEETING_MISS_GROUP_ID:{code: 416,error: "Create group not possible, groupId not provided."},
    CREATE_MEETING_MISSING_GROUP_IN_PLATFORM:{code: 415,error:"Can not create meeting for this group, because group is not assigned to targeted platform."},
    CREATE_MEETING_NOT_ALLOWED:{code: 400,error:"You cant create meeting on platform, You need to have 'personel' status to make this operation."},
    CREATE_MEETING_BAD_DATE:{ code: 401, error: "Date is not correct." },
    CREATE_MEETING_BAD_DESCRIPTION_LEN:{ code: 456, error: `Maximum length of meet description is ${MAX_LEN_MEETING_DESCRIPTION} characters.` },
    
    UPLOAD_BOARD_INVALID_FILE_EXT:{ code:420, error:"Images extensions are not allwed." },

}