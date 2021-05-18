import { isBrowser } from "./functions.js"

export const location = isBrowser() ? window.location : null
export const SERVER_SSL = false
export const ORIGIN = `http${SERVER_SSL ? `s` : ``}://${location?.hostname ?? `localhost`}:3000`

export const WS_ORIGIN = `ws${SERVER_SSL ? `s` : ``}://${location?.hostname ?? `localhost`}:3000`
export function getSocketEventFromHttp( method, httpUrl ) {
  const uri = httpUrl.match( /api\/(.*)/ )[ 1 ]
  const dottedUri = uri.replace( /\//g, `.` )
  const eventName = dottedUri.replace( /\.:\w+/g, `` )

  return `api.${method.toLowerCase()}.${eventName}`
}

const URLS = {
  // Base
  LOGIN_POST: () => `${ORIGIN}/api/login`,
  LOGOUT_POST: () => `${ORIGIN}/api/logout`,
  REGISTER_POST: () => `${ORIGIN}/api/register`,
  REGISTER_ACTIVATE_POST: () => `${ORIGIN}/api/activate/`,
  PASSWORD_REMIND_POST: () => `${ORIGIN}/api/password/remind`,
  PASSWORD_RESET_POST: () => `${ORIGIN}/api/password/reset`,

  // User scope
  USER_ME_POST: () => `${ORIGIN}/api/users/me`,
  USER_ME_GET: () => `${ORIGIN}/api/users/me`,
  USER_ME_PUT: () => `${ORIGIN}/api/users/me`,
  USER_ME_PINNED_POST: () => `${ORIGIN}/api/users/me/pinned`,
  USER_ME_PINNED_GET: () => `${ORIGIN}/api/users/me/pinned`,
  USER_ME_PINNED_DELETE: pinnedId => `${ORIGIN}/api/users/me/pinned/${pinnedId}`,

  // Platform scope
  PLATFORM_POST: () => `${ORIGIN}/api/platforms`,
  PLATFORM_GET: () => `${ORIGIN}/api/platforms`,
  PLATFORM$ID_GET: platformId => `${ORIGIN}/api/platforms/${platformId}`,
  PLATFORM$ID_PUT: platformId => `${ORIGIN}/api/platforms/${platformId}`,
  PLATFORM$ID_DELETE: platformId => `${ORIGIN}/api/platforms/${platformId}`,
  PLATFORM$ID_USERS_POST: platformId => `${ORIGIN}/api/platforms/${platformId}/users`,
  PLATFORM$ID_USERS_GET: platformId => `${ORIGIN}/api/platforms/${platformId}/users`,
  PLATFORM_USERS_ACTIVATE_POST: () => `${ORIGIN}/api/platforms/users/activate`,
  PLATFORM$ID_USERS$ID_PUT: (platformId, userId) => `${ORIGIN}/api/platforms/${platformId}/users/${userId}`,
  PLATFORM$ID_USERS$ID_DELETE: (platformId, userId) => `${ORIGIN}/api/platforms/${platformId}/users/${userId}`,
  PLATFORM$ID_PERMISSIONS_POST: platformId => `${ORIGIN}/api/platforms/${platformId}/newpermissions`,
  PLATFORM$ID_PERMISSIONS_GET: platformId => `${ORIGIN}/api/platforms/${platformId}/newpermissions`,
  PLATFORM$ID_PERMISSIONS_MY_GET: platformId => `${ORIGIN}/api/platforms/${platformId}/permissions/my`,
  PLATFORM$ID_PERMISSIONS$ID_PUT: (platformId, roleId) => `${ORIGIN}/api/platforms/${platformId}/newpermissions/${roleId}`,
  PLATFORM$ID_PERMISSIONS$ID_DELETE: (platformId, roleId) => `${ORIGIN}/api/platforms/${platformId}/newpermissions/${roleId}`,


  // Group scope
  GROUP_POST: () => `${ORIGIN}/api/groups`,
  GROUP_GET: () => `${ORIGIN}/api/groups`,
  GROUP_USERS_GET: () => `${ORIGIN}/api/groups/users`,
  GROUP_NOTES_GET: () => `${ORIGIN}/api/groups/notes`,
  GROUP_FROM_PLATFORM$ID_GET: platformId => `${ORIGIN}/api/groups/platform/${platformId}`,
  GROUP_NOTES$ID_DELETE: noteId => `${ORIGIN}/api/groups/notes/${noteId}`,
  GROUP$ID_GET: groupId => `${ORIGIN}/api/groups/${groupId}`,
  GROUP$ID_DELETE: groupId => `${ORIGIN}/api/groups/${groupId}`,
  GROUP$ID_USERS_POST: groupId => `${ORIGIN}/api/groups/${groupId}/users`,
  GROUP$ID_USERS_GET: groupId => `${ORIGIN}/api/groups/${groupId}/users`,
  GROUP$ID_GRADES_POST: groupId => `${ORIGIN}/api/groups/${groupId}/notes`,
  GROUP$ID_GRADES_GET: groupId => `${ORIGIN}/api/groups/${groupId}/notes`,
  GROUP$ID_GRADES$ID_DELETE: (groupId, gradeId) => `${ORIGIN}/api/groups/${groupId}/notes/${gradeId}`,
  GROUP$ID_GRADES_SCALE_GET: groupId => `${ORIGIN}/api/groups/${groupId}/scale`,
  GROUP$ID_GRADES_SCALE_PUT: groupId => `${ORIGIN}/api/groups/${groupId}/scale`,
  GROUP$ID_USERS$ID_DELETE: (groupId, userId) => `${ORIGIN}/api/groups/${groupId}/users/${userId}`,
  GROUP$ID_NOTES$ID_PUT: noteId => `${ORIGIN}/api/groups/notes/${noteId}`,
  GROUP$ID_PERMISSIONS_GET: groupId => `${ORIGIN}/api/groups/${groupId}/newpermissions`,
  GROUP$ID_PERMISSIONS_POST: groupId => `${ORIGIN}/api/groups/${groupId}/newpermissions`,
  GROUP$ID_PERMISSIONS_MY_GET: groupId => `${ORIGIN}/api/groups/${groupId}/permissions/my`,
  GROUP$ID_PERMISSIONS$ID_PUT: (groupId, roleId) => `${ORIGIN}/api/groups/${groupId}/newpermissions/${roleId}`,
  GROUP$ID_PERMISSIONS$ID_DELETE: (groupId, roleId) => `${ORIGIN}/api/groups/${groupId}/newpermissions/${roleId}`,
  GROUPS$ID_MATERIALS_POST: groupId => `${ORIGIN}/api/groups/${groupId}/materials`,
  GROUPS$ID_MATERIALS_GET: groupId => `${ORIGIN}/api/groups/${groupId}/materials`,
  GROUPS$ID_MATERIALS_DELETE: (groupId, materialId) => `${ORIGIN}/api/groups/${groupId}/materials/${materialId}`,
  GROUPS$ID_TASKS_POST: groupId => `${ORIGIN}/api/groups/${groupId}/tasks`,
  GROUPS$ID_TASKS_GET: groupId => `${ORIGIN}/api/groups/${groupId}/tasks`,
  GROUPS$ID_TASKS$ID_DELETE: (groupId, taskId) => `${ORIGIN}/api/groups/${groupId}/tasks/${taskId}`,
  GROUPS$ID_TASKS$ID_DONE_POST: (groupId, taskId) => `${ORIGIN}/api/groups/${groupId}/tasks/${taskId}/done`,
  GROUPS$ID_TASKS$ID_DONE_GET: (groupId, taskId) => `${ORIGIN}/api/groups/${groupId}/tasks/${taskId}/done`,

  // Meet scope
  MEET_GET: () => `${ORIGIN}/api/meets`,
  MEET_POST: () => `${ORIGIN}/api/meets`,
  MEET_FROM_GROUP$ID_GET: groupId => `${ORIGIN}/api/meets/group/${groupId}`,
  MEET$ID_GET: meetId => `${ORIGIN}/api/meets/${meetId}`,
  MEET$ID_DELETE: meetId => `${ORIGIN}/api/meets/${meetId}`,
  MEET$ID_USERS_POST: meetId => `${ORIGIN}/api/meets/${meetId}/users`,
  MEET$ID_USERS_GET: meetId => `${ORIGIN}/api/meets/${meetId}/users`,
  MEET$ID_USERS$ID_DELETE: (meetId, userId) => `${ORIGIN}/api/meets/${meetId}/users/${userId}`,
  MEET$ID_PERMISSIONS_GET: meetId => `${ORIGIN}/api/meets/${meetId}/permissions`,
  MEET$ID_PERMISSIONS_MY_GET: meetId => `${ORIGIN}/api/meets/${meetId}/permissions/my`,



}

export default URLS
// new Proxy( URLS, {
//   get( urls, key ) {

//     if (key in urls) return urls[ key ] // `${urls[ key ]}?${urlSearchParams()}`

//     return null
//   },
// } )
