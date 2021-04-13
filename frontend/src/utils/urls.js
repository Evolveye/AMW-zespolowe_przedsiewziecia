import { isBrowser, urlSearchParams } from "./functions.js"

//export const HOST = isBrowser() ? window.location.origin : `http://localhost:3000`
export const HOST = isBrowser() ? `http://localhost:3000` : `http://localhost:3000`

export const WS_HOST = "ws://localhost:3000"
export function getSocketEventFromHttp( method, httpUrl ) {
  const uri = httpUrl.match( /api\/(.*)/ )[ 1 ]
  const dottedUri = uri.replace( /\//g, `.` )
  const eventName = dottedUri.replace( /\.:\w+/g, `` )

  return `api.${method.toLowerCase()}.${eventName}`
}

const URLS = {
  // Base
  LOGIN_POST: `${HOST}/api/login`,
  LOGOUT_POST: `${HOST}/api/logout`,
  REGISTER_POST: `${HOST}/api/register`,
  REGISTER_CONFIRM_POST: `${HOST}/api/activate/:code`,
  PASSWORD_REMIND_POST: `${HOST}/api/password/remind`,
  PASSWORD_RESET_POST: `${HOST}/api/password/reset`,

  // User scope
  USER_ME_POST: `${HOST}/api/users/me`,
  USER_ME_GET: `${HOST}/api/users/me`,
  USER_ME_PUT: `${HOST}/api/users/me`,
  USER_ME_PINNED_POST: `${HOST}/api/users/me/pinned`,
  USER_ME_PINNED_GET: `${HOST}/api/users/me/pinned`,
  USER_ME_PINNED_DELETE: `${HOST}/api/users/me/pinned/:pinnedId`,

  // Platform scope
  PLATFORM_POST: `${HOST}/api/platforms`,
  PLATFORM_GET: `${HOST}/api/platforms`,
  PLATFORM$ID_GET: `${HOST}/api/platforms/:platformId`,
  PLATFORM$ID_PUT: `${HOST}/api/platforms/:platformId`,
  PLATFORM$ID_DELETE: `${HOST}/api/platforms/:platformId`,
  PLATFORM$ID_USERS_POST: `${HOST}/api/platforms/:platformId/users`,
  PLATFORM$ID_USERS_GET: `${HOST}/api/platforms/:platformId/users`,
  PLATFORM$ID_USERS$ID_DELETE: `${HOST}/api/platforms/:platformId/users/:userId`,
  PLATFORM$ID_PERMISSIONS_GET: `${HOST}/api/platforms/:platformId/newpermissions`,
  PLATFORM$ID_PERMISSIONS_MY_GET: `${HOST}/api/platforms/:platformId/permissions/my`,
  PLATFORM$ID_PERMISSIONS_POST: `${HOST}/api/platforms/:platformId/newpermissions`,
  

  // Group scope
  GROUP_POST: `${HOST}/api/groups`,
  GROUP_GET: `${HOST}/api/groups`,
  GROUP_USERS_GET: `${HOST}/api/groups/users`,
  GROUP_NOTES_GET: `${HOST}/api/groups/notes`,
  GROUP_FROM_PLATFORM$ID_GET: `${HOST}/api/groups/platform/:platformId`,
  GROUP_NOTES$ID_DELETE: `${HOST}/api/groups/notes/:noteId`,
  GROUP$ID_DELETE: `${HOST}/api/groups/:groupId`,
  GROUP$ID_USERS_POST: `${HOST}/api/groups/:groupId/users`,
  GROUP$ID_USERS_GET: `${HOST}/api/groups/:groupId/users`,
  GROUP$ID_USERS$ID_DELETE: `${HOST}/api/groups/:groupId/users/:userId`,
  GROUP$ID_NOTES_POST:  `${HOST}/api/groups/:groupId/notes`,
  GROUP$ID_NOTES_GET:  `${HOST}/api/groups/:groupId/notes`,
  GROUP$ID_NOTES$ID_PUT: `${HOST}/api/groups/notes/:noteId`,
  GROUP$ID_PERMISSIONS_GET: `${HOST}/api/groups/:groupId/permissions`,
  GROUP$ID_PERMISSIONS_POST: `${HOST}/api/groups/:groupId/newpermissions`,
  GROUP$ID_PERMISSIONS_MY_GET: `${HOST}/api/groups/:groupId/permissions/my`,
  GROUPS$ID_FILE_POST: `${HOST}/api/groups/:groupId/materials`,
  GROUPS$ID_FILE_GET: `${HOST}/api/groups/:groupId/materials`,
  GROUPS$ID_FILE_DELETE: `${HOST}/api/groups/:groupId/materials/:materialId`,
  GROUPS$ID_TASKS_POST: `${HOST}/api/groups/:groupId/tasks`,
  GROUPS$ID_TASKS_GET:  `${HOST}/api/groups/:groupId/tasks`,
  GROUPS$ID_TASKS_DELETE:  `${HOST}/api/groups/:groupId/tasks/:taskId`,
  GROUPS$ID_TASKS_DONE_POST: `${HOST}/api/groups/:groupId/tasks/:taskId/done`,
  GROUPS$ID_TASKS_DONE_GET: `${HOST}/api/groups/:groupId/tasks/:taskId/done`,
  GROUP$ID_GRADINGSCALE_PUT: `${HOST}/api/groups/:groupId/scale`,

  // Meet scope
  MEET_GET: `${HOST}/api/meets`,
  MEET_POST: `${HOST}/api/meets`,
  MEET_FROM_GROUP$ID_GET: `${HOST}/api/meets/group/:groupId`,
  MEET$ID_GET: `${HOST}/api/meets/:meetId`,
  MEET$ID_DELETE: `${HOST}/api/meets/:meetId`,
  MEET$ID_USERS_POST: `${HOST}/api/meets/:meetId/users`,
  MEET$ID_USERS_GET: `${HOST}/api/meets/:meetId/users`,
  MEET$ID_USERS$ID_DELETE: `${HOST}/api/meets/:meetId/users/:userId`,
  MEET$ID_PERMISSIONS_GET: `${HOST}/api/meets/:meetId/permissions`,
  MEET$ID_PERMISSIONS_MY_GET: `${HOST}/api/meets/:meetId/permissions/my`,



}

export default new Proxy( URLS, {
  get( urls, key ) {
    if (key in urls) return `${urls[ key ]}?${urlSearchParams()}`

    return null
  }
} )