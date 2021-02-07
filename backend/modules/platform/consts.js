export const MAX_PLATFORM_NUMBER = 2

export const CREATE_USER_EMAIL_CONTENT = {
    titleText: "Portal edukacyjny - utworzono dla Ciebie konto.",
    bodyHtml: `
    W serwisie Platforma Edukacyjna, ktoś dodał Ciebie do listy członków swojej oragnizacji.</br>
    Aby zalogować się na nowo utworzone konto, zaloguj się <a href="http://localhost:3000">tutaj</a>, korzystając z poniższych danych:</br>
    `
}

export const ANSWERS = {
    PLATFORM_DELETE_NOT_ADMIN: { code: 200, error: "Only administrator can delete user from platform." },
    USER_DELETE_PLATFORM_NOT_EXIST: { code: 208, error: "Cannot delete not existing platform." },

    PLATFORM_USER_NOT_MEMBER: { code: 201, error: "Targeted user is not a platform member." },
    PLATFORM_DELETE_USER_SUCCESS: { code: 202, success: "User has been deleted sucessfully." },


    PLATFORM_PERMS_PE_ID_MISS: { code: 210, error: `Cannot assign your role in PE system, Because platformId is not provided.` },
    PLATFORM_PERMS_NOT_MEMBER: { code: 211, error: `You are not a member of target platform, Cannot create/assign permissions.` },


    USER_WITHOUT_PLATFORMS: { code: 220, error: `This user dont belong to any platform.` },
    NOT_ALLOWED_TO_CREATE_USER: { code: 231, error: `Your privilages dont allows you to create new platform account.` },
    CREATE_USER_NOT_PLATFORM_ID: { code: 230, error: "Not provided data - platformId" },
    CREATE_USER_PLATFORM_NOT_EXIST: { code: 208, error: "Cannot create new User. Bacause target platform does not exist." },
    CREATE_USER_NO_PERMS_IN_REQ: { code: 213, error: "Permission not found, please create permission on your platform, then assign to user." },
    CREATE_USER_NAMES_WITH_SPACE: { code: 214, error: "User name or surname contain space, char(0x32). Please insert correct data." },
    CREATE_USER_BAD_EMAIL: { code: 215, error: "Provided email is not valid. Please provide a correct email." },
    CREATE_USER_EMAIL_IN_USE: { code: 255, error: "User with provided email exist in system. But cannot assign user to your platform, because name/surname does not match existing user." },
    CREATE_USER_ALREADY_ASSIGNED: { code: 255, error: "Cannot create user that already is signed to platform." },


    GET_PERMS_NOT_MEMBER: { code: 233, error: "You are not a member of target platform, cannot get permissions from specifed pe." },
    GET_MY_PERMS_NO_FOUND: { code: 299, error: "Provided userId is not assign to platform. Privilages not found." },
    USER_DELETE_DELETE_OWNER: { code: 204, error: "Platform owner can not delete himsef, from platform users." },
    USER_DELETE_SUCCESS: { code: 205, success: "User has been deleted." },

    USERS_OF_PLATFORM_BAD_PLATFORM_ID: { code: 211, error: "Please provide correct platform id." },
    USERS_OF_PLATFORM_PLATFORM_NOT_EXISTS: { code: 208, error: "Cannot get all users assigned to platform. Bacause target platform does not exist." },
    USERS_OF_PLATFORM_NOT_MEMBER: { code: 212, error: "Can not send users from platform, where u are not assigned in." },


    CREATE_PLATFORM_NOT_NAME: { code: 203, error: "Platform name not provided." },
    CREATE_PLATFORM_LIMIT: { code: 210, error: "You have already an your own platform." },
    CREATE_PLATFROM_NAME_DUPLICATE:{code:219,error:"Platfrom name already is assigned, please choose diffrent name for your platform."},

    DELETE_PLATFORM_PLATFORM_NOT_EXISTS: { code: 208, error: "Cannot delete not existing platform." },
    DELETE_PLATFORM_NOT_ALLOWED: { code: 209, error: "You dont have privilages to create new users on mod platform." },
    DELETE_PLATFORM_SUCCESS: { code: 210, success: "Platform deleted successfuly." },
}

