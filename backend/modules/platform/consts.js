export const MAX_PLATFORM_NUMBER = 2
export const MAX_LEN_PLATFORM_NAME = 255


export const ANSWERS = {
  PLATFORM_DELETE_NOT_ADMIN: { code: 200, error: `Only administrator can delete user from platform.` },
  USER_DELETE_PLATFORM_NOT_EXIST: { code: 208, error: `Cannot delete not existing platform.` },

  PLATFORM_USER_NOT_MEMBER: { code: 201, error: `Targeted user is not a platform member.` },
  PLATFORM_DELETE_USER_SUCCESS: { code: 202, success: `User has been deleted sucessfully.` },
  PLATFORM_DELETE_BAD_CONFIRM:{ code:223, error:`For deleting platform, you must provide correct password of owner account.` },

  PLATFORM_PERMS_PE_ID_MISS: { code: 210, error: `Cannot assign your role in PE system, Because platformId is not provided.` },
  PLATFORM_PERMS_NOT_MEMBER: { code: 211, error: `You are not a member of target platform, Cannot create/assign permissions.` },
  GET_TARGET_PLATFORM_MISS:{ code: 221, error:`Platform with specified ID not found.` },

  USER_WITHOUT_PLATFORMS: { code: 220, error: `This user dont belong to any platform.` },
  NOT_ALLOWED_TO_CREATE_USER: { code: 231, error: `Your privilages dont allows you to create new platform account.` },
  USER_BY_MAIL_NOT_FOUND: { code:239, error:`W systemie nie występuje użytkownik o podanym mailu` },
  CREATE_USER_NOT_PLATFORM_ID: { code: 230, error: `Not provided data - platformId` },
  CREATE_USER_PLATFORM_NOT_EXIST: { code: 208, error: `Cannot create new User. Bacause target platform does not exist.` },
  CREATE_USER_NO_PERMS_IN_REQ: { code: 213, error: `Permission not found, please create permission on your platform, then assign to user.` },
  CREATE_USER_NAMES_WITH_SPACE: { code: 214, error: `User name or surname contain space, char(0x32). Please insert correct data.` },
  CREATE_USER_BAD_EMAIL: { code: 215, error: `Provided email is not valid. Please provide a correct email.` },
  CREATE_USER_EMAIL_IN_USE: { code: 255, error: `User with provided email exist in system. But cannot assign user to your platform, because name/surname does not match existing user.` },
  CREATE_USER_ALREADY_ASSIGNED: { code: 255, error: `Cannot create user that already is signed to platform.` },
  CREATE_USER_NAMES_NOT_CHARS_ONLY:{ code:256, error:`name and surname can contain only characters, (NOT digits | math chars)` },
  CREATE_USER_SUCCESS:{ code:272, success:`User has been created` },

  GET_PERMS_NOT_MEMBER: { code: 233, error: `You are not a member of target platform, cannot get permissions from specifed pe.` },
  GET_MY_PERMS_NO_FOUND: { code: 299, error: `Provided userId is not assign to platform. Privilages not found.` },
  USER_DELETE_DELETE_OWNER: { code: 204, error: `Platform owner can not delete himsef, from platform users.` },
  USER_DELETE_SUCCESS: { code: 205, success: `User has been deleted.` },

  USERS_OF_PLATFORM_BAD_PLATFORM_ID: { code: 211, error: `Please provide correct platform id.` },
  USERS_OF_PLATFORM_PLATFORM_NOT_EXISTS: { code: 208, error: `Cannot get all users assigned to platform. Bacause target platform does not exist.` },
  USERS_OF_PLATFORM_NOT_MEMBER: { code: 212, error: `Can not send users from platform, where u are not assigned in.` },


  CREATE_PLATFORM_NOT_NAME: { code: 203, error: `Platform name not provided.` },
  CREATE_PLATFORM_LIMIT: { code: 210, error: `You have already an your own platform.` },
  CREATE_PLATFROM_NAME_DUPLICATE:{ code:219, error:`Platfrom name already is assigned, please choose diffrent name for your platform.` },
  CREATE_PLATFORM_BAD_NAME_LEN:{ code:276, error:`Lenght of platform name can not me more then ${MAX_LEN_PLATFORM_NAME} characters.` },


  DELETE_PLATFORM_PLATFORM_NOT_EXISTS: { code: 208, error: `Cannot delete not existing platform.` },
  DELETE_PLATFORM_NOT_ALLOWED: { code: 209, error: `You dont have privilages to create new users on mod platform.` },
  DELETE_PLATFORM_SUCCESS: { code: 210, success: `Platform deleted successfuly.` },

  CREATE_PERMISSIONS_NAME_MISS:{ code:227, error:`create new platform permission - not provided name.` },
  CREATE_PERMISSIONS_SUCCESS:{ code:217, success:`Successfully created permissions.` },
  CREATE_PERMISSIONS_DOUBLED:{ code:222, error:`permissions with provided name already exists in your platfom.` },
  UPDATE_PERMISSIONS_SUCCESS: { code: 216, success: `Premissions has been updated` },
  CHANGE_PERMISSIONS_FOR_USER:{ code:225, success:`new permissions are assigned to user.` },


  DELETE_ROLE_OWNER:{ code:235, error:`Cannot delete platform owner role.` },
  DELETE_ROLE_ROLE_NOT_FOUND:{ code:226, error:`Delete role refused. Object to delete not found.` },
  DELETE_ROLE_SUCCESS:{ code:224, success:`Delete role has ended sucessfull` },
  UPDATE_ROLE_ROLE_NOT_FOUND:{ code:234, error:`Edit role refused - can not find role with specified id.` },
  UPDATE_ROLE_COLOR_NOT_INT:{ code:236, error:`color must be presented as an initger value` },
  UPDATE_ROLE_COLOR_NOT_IN_RANGE:{ code:237, error:`Invalid range of color. color must be in range of 0x000000 to 0xffffff` },
  UPDATE_ROLE_OWNER:{ code:238, error:`Cannot update platform owner role.` },

  UPDATE_USER_LOGIN_FAILED:{ code:267, error:`Can not change user login because user has been not found.` },
  REGISTER_PART2_LOGIN_TAKEN:{ code:268, error:`Provided login is already in use. Please insert diffrend login.` },
  REGISTER_PART2_CODE_MISS:{ code:269, error:`Initial code is not provided.` },
  REGISTER_PART2_MISSING_DATA:{ code:271, error:`Change login/password. Missing data in request-body.` },
  REGISTER_PART2_PASSWORDS_NOT_SAME:{ code:270, error:`Provided passwors are not the same.` },
  REGISTER_PART2_SUCCESS:{ code:273, success:`Login has been changed` },

  CREATE_PLATFORM_SUCCESS:{ code:274, success:`Platform has been created.` },
}

