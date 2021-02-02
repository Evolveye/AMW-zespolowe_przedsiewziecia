export const ANSWERS = {
    PLATFORM_DELETE_NOT_ADMIN: { code: 200, error: "Only administrator can delete user from platform." },
    USER_DELETE_PLATFORM_NOT_EXIST: { code: 208, error: "Cannot delete not existing platform." },
   
    PLATFORM_USER_NOT_MEMBER: { code: 201, error: "Targeted user is not a platform member." },
    PLATFORM_DELETE_USER_SUCCESS: { code: 202, success: "User has been deleted sucessfully." },


    PLATFORM_PERMS_PE_ID_MISS: { code: 210, error: `Cannot assign your role in PE system, Because platformId is not provided.` },
    PLATFORM_PERMS_NOT_MEMBER: { code: 211, error: `You are not a member of target platform, Cannot create/assign permissions.` },


    USER_WITHOUT_PLATFORMS: { code: 220, error: `This user dont belong to any platform.` },
    NOT_ALLOWED_TO_CREATE_USER : { code: 231, error: `Your privilages dont allows you to create new platform account.` },
    CREATE_USER_NOT_PLATFORM_ID : { code: 230, error: "Not provided data - platformId" },
    CREATE_USER_PLATFORM_NOT_EXIST: { code: 208, error: "Cannot create new User. Bacause target platform does not exist." },
    CREATE_USER_NO_PERMS_IN_REQ : { code: 213, error: "Permission not found, please create permission on your platform, then assign to user." },
    
    GET_PERMS_NOT_MEMBER:{code:233,error:"You are not a member of target platform, cannot get permissions from specifed pe."},
    GET_MY_PERMS_NO_FOUND : {code:299,error:"Provided userId is not assign to platform. Privilages not found."},
    USER_DELETE_DELETE_OWNER: { code: 204, error: "Platform owner can not delete himsef, from platform users." }

    

}

export const MAX_PLATFORM_NUMBER = 1

export const CREATE_USER_EMAIL_CONTENT = {
    emailTitleText:"Portal edukacyjny - utworzono konto dla Ciebie.",
    emailHtmlText: `<h1><a href="http://localhost:3000"> Przejdz do portalu.</a></h1>`
}