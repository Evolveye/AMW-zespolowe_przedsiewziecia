export const HOST = "http://localhost:3000"

export const BACKEND_LOGIN_URL = `${HOST}/api/login`
export const BACKEND_REGISTER_URL = `${HOST}/api/register`
export const BACKEND_LOGOUT_URL = `${HOST}/api/logout`

export const BACKEND_REGISTER_CONFIRM = `${HOST}/api/activate/:code`

export const BACKEND_PASSWORD_REMIND_URL = `${HOST}/api/password/remind`
export const BACKEND_PASSWORD_RESET_URL = `${HOST}/api/password/reset`

export const BACKEND_USER_ME_URL = `${HOST}/api/users/me`

export const BACKEND_PLATFORMS_URL = `${HOST}/api/platforms`
export const BACKEND_PLATFORMS_URL_DEL = `${HOST}/api/platforms/id:number`
export const BACKEND_USER_ME_PINNED_ADD_URL = `${HOST}/api/users/me/pinned`
export const BACKEND_USER_ME_PINNED_DEL_URL = `${HOST}/api/users/me/pinned:elemenId`

export const BACKEND_PLATFORMS_USERS_POST = `${HOST}/api/platforms/id:number/users`
export const BACKEND_PLATFORMS_USERS_GET = `${HOST}/api/platforms/id:number/users`
export const BACKEND_PLATFORMS_USERS_DEL = `${HOST}/api/platforms/id:number/users/id:number`

export const BACKEND_PLATFORMS_GROUPS_GET = `${HOST}/api/groups/platform/:platformId`
export const BACKEND_PLATFORMS_GROUPS_POST = `${HOST}/api/groups`
export const BACKEND_PLATFORMS_GROUPS_ADD = `${HOST}/api/groups`
export const BACKEND_PLATFORMS_GROUPS_DEL = `${HOST}/api/groups/:groupId`
export const BACKEND_PLATFORMS_USERS_NOTES = `${HOST}/api/groups/notes`
export const BACKEND_PLATFORMS_USERS_ADD = `${HOST}/api/groups/users`
export const BACKEND_PLATFORMS_GROUP_USERS_GET = `${HOST}/api/groups/:groupId/users`
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_GET = `${HOST}/api/groups/:groupId/notes`
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_DEL = `${HOST}/api/groups/notes/:noteId`
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_ADD = `${HOST}/api/groups/:groupId/notes/`
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_PUT = `${HOST}/api/groups/notes/:noteId`

export const BACKEND_PLATFORMS_GROUPS_MEET_ADD = `${HOST}/api/meets`
export const BACKEND_PLATFORMS_GROUPS_MEET_GET = `${HOST}/api/meets`
export const BACKEND_PLATFORMS_GROUPS_MEET_DEL = `${HOST}/api/meets/:meetId`
export const BACKEND_PLATFORMS_GROUPS_MEET = `${HOST}/api/meets/group/:groupId`
export const BACKEND_PLATFORMS_GROUPS_MEET_ADD_USER = `${HOST}/api/meets/:meetId/users`
export const BACKEND_PLATFORMS_GROUPS_MEET_GET_USER = `${HOST}/api/meets/:meetId/users`
export const BACKEND_PLATFORMS_GROUPS_MEET_DEL_USER = `${HOST}/api/meets/:meetId/users/:userId`

export const BACKEND_CALENDAR_URL = "/api/calendar"

export const DEBUG_LOGIN_URL = `http://localhost:3000${BACKEND_LOGIN_URL}`//"https://mockend.com/evolveye/prymitywna-platforma-edukacyjna/tree/dev-frontend/tokens/1"
export const DEBUG_USER_ME_URL = `http://localhost:3000${BACKEND_USER_ME_URL}`//"https://mockend.com/evolveye/prymitywna-platforma-edukacyjna/tree/dev-frontend/users/1"

export const WEB_SOCKET_URL = "ws://localhost:3000"

export const DEBUG = true

export function getSocketEventFromHttp( method, httpUrl ) {
  const uri = httpUrl.match( /api\/(.*)/ )[ 1 ]
  const dottedUri = uri.replace( /\//g, `.` )
  const eventName = dottedUri.replace( /\.:\w+/g, `` )

  return `api.${method.toLowerCase()}.${eventName}`
}