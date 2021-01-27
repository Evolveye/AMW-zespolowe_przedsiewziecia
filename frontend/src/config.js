export const HOST = "http://localhost:3000"

export const WS_HOST = "ws://localhost:3000"
export function getSocketEventFromHttp( method, httpUrl ) {
  const uri = httpUrl.match( /api\/(.*)/ )[ 1 ]
  const dottedUri = uri.replace( /\//g, `.` )
  const eventName = dottedUri.replace( /\.:\w+/g, `` )

  return `api.${method.toLowerCase()}.${eventName}`
}



// Base
export const URL_LOGIN_POST = `${HOST}/api/login`
export const URL_LOGOUT_POST = `${HOST}/api/logout`
export const URL_REGISTER_POST = `${HOST}/api/register`
export const URL_REGISTER_CONFIRM_POST = `${HOST}/api/activate/:code`
export const URL_PASSWORD_REMIND_POST = `${HOST}/api/password/remind`
export const URL_PASSWORD_RESET_POST = `${HOST}/api/password/reset`

// User scope
export const URL_USER_ME_POST = `${HOST}/api/users/me`
export const URL_USER_ME_GET = `${HOST}/api/users/me`
export const URL_USER_ME_PUT = `${HOST}/api/users/me`
export const URL_USER_ME_PINNED_POST = `${HOST}/api/users/me/pinned`
export const URL_USER_ME_PINNED_GET = `${HOST}/api/users/me/pinned`
export const URL_USER_ME_PINNED_DELETE = `${HOST}/api/users/me/pinned/:pinnedId`

// Platform scope
export const URL_PLATFORM_POST = `${HOST}/api/platforms`
export const URL_PLATFORM_GET = `${HOST}/api/platforms`
export const URL_PLATFORM$ID_GET = `${HOST}/api/platforms/:platformId`
export const URL_PLATFORM$ID_PUT = `${HOST}/api/platforms/:platformId`
export const URL_PLATFORM$ID_DELETE = `${HOST}/api/platforms/:platformId`
export const URL_PLATFORM$ID_USERS_POST = `${HOST}/api/platforms/:platformId/users`
export const URL_PLATFORM$ID_USERS_GET = `${HOST}/api/platforms/:platformId/users`
export const URL_PLATFORM$ID_USERS$ID_DELETE = `${HOST}/api/platforms/:platformId/users/:userId`

// Group scope
export const URL_GROUP_POST = `${HOST}/api/groups`
export const URL_GROUP_GET = `${HOST}/api/groups`
export const URL_GROUP_USERS_GET = `${HOST}/api/groups/users`
export const URL_GROUP_NOTES_GET = `${HOST}/api/groups/notes`
export const URL_GROUP_FROM_PLATFORM$ID_GET = `${HOST}/api/groups/platform/:platformId`
export const URL_GROUP$ID_DELETE = `${HOST}/api/groups/:groupId`
export const URL_GROUP$ID_USERS_POST = `${HOST}/api/groups/:groupId/users`
export const URL_GROUP$ID_USERS_GET = `${HOST}/api/groups/:groupId/users`
export const URL_GROUP$ID_USERS$ID_DELETE = `${HOST}/api/groups/:groupId/users/:userId`
export const URL_GROUP$ID_NOTES_POST =  `${HOST}/api/groups/:groupId/notes`
export const URL_GROUP$ID_NOTES_GET =  `${HOST}/api/groups/:groupId/notes`
export const URL_GROUP$ID_NOTES$ID_PUT = `${HOST}/api/groups/notes/:noteId`
export const URL_GROUP$ID_NOTES$ID_DELETE = `${HOST}/api/groups/notes/:noteId`

// Meet scope
export const URL_MEET_GET = `${HOST}/api/meets`
export const URL_MEET_POST = `${HOST}/api/meets`
export const URL_MEET_FROM_GROUP$ID_GET = `${HOST}/api/meets/group/:groupId`
export const URL_MEET$ID_DELETE = `${HOST}/api/meets/:meetId`
export const URL_MEET$ID_USERS_POST = `${HOST}/api/meets/:meetId/users`
export const URL_MEET$ID_USERS_GET = `${HOST}/api/meets/:meetId/users`
export const URL_MEET$ID_USERS$ID_DELETE = `${HOST}/api/meets/:meetId/users/:userId`



export const DEBUG = true