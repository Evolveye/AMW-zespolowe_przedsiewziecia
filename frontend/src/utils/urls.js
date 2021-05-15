import { isBrowser } from "./functions.js"

// export const HOST = isBrowser() ? window.location.origin : `http://localhost:3000`
export const HOST = `http://${isBrowser() ? window.location.hostname : `localhost`}:3000`

export const WS_HOST = `ws://${isBrowser() ? window.location.hostname : `localhost`}:3000`
export function getSocketEventFromHttp( method, httpUrl ) {
  const uri = httpUrl.match( /api\/(.*)/ )[ 1 ]
  const dottedUri = uri.replace( /\//g, `.` )
  const eventName = dottedUri.replace( /\.:\w+/g, `` )

  return `api.${method.toLowerCase()}.${eventName}`
}

const URLS = {
  // Base
  LOGIN_POST: () => `${HOST}/api/login`,
  LOGOUT_POST: () => `${HOST}/api/logout`,
  REGISTER_POST: () => `${HOST}/api/register`,
  REGISTER_CONFIRM$CODE_POST: () => `${HOST}/api/activate/:code`,
  PASSWORD_REMIND_POST: () => `${HOST}/api/password/remind`,
  PASSWORD_RESET_POST: () => `${HOST}/api/password/reset`,

  // User scope
  USER_ME_POST: () => `${HOST}/api/users/me`,
  USER_ME_GET: () => `${HOST}/api/users/me`,
  USER_ME_PUT: () => `${HOST}/api/users/me`,
  USER_ME_PINNED_POST: () => `${HOST}/api/users/me/pinned`,
  USER_ME_PINNED_GET: () => `${HOST}/api/users/me/pinned`,
  USER_ME_PINNED_DELETE: pinnedId => `${HOST}/api/users/me/pinned/${pinnedId}`,

  // Platform scope
  PLATFORM_POST: () => `${HOST}/api/platforms`,
  PLATFORM_GET: () => `${HOST}/api/platforms`,
  PLATFORM$ID_GET: platformId => `${HOST}/api/platforms/${platformId}`,
  PLATFORM$ID_PUT: platformId => `${HOST}/api/platforms/${platformId}`,
  PLATFORM$ID_DELETE: platformId => `${HOST}/api/platforms/${platformId}`,
  PLATFORM$ID_USERS_POST: platformId => `${HOST}/api/platforms/${platformId}/users`,
  PLATFORM$ID_USERS_GET: platformId => `${HOST}/api/platforms/${platformId}/users`,
  PLATFORM$ID_USERS$ID_PUT: (platformId, userId) => `${HOST}/api/platforms/${platformId}/users/${userId}`,
  PLATFORM$ID_USERS$ID_DELETE: (platformId, userId) => `${HOST}/api/platforms/${platformId}/users/${userId}`,
  PLATFORM$ID_PERMISSIONS_POST: platformId => `${HOST}/api/platforms/${platformId}/newpermissions`,
  PLATFORM$ID_PERMISSIONS_GET: platformId => `${HOST}/api/platforms/${platformId}/newpermissions`,
  PLATFORM$ID_PERMISSIONS_MY_GET: platformId => `${HOST}/api/platforms/${platformId}/permissions/my`,
  PLATFORM$ID_PERMISSIONS$ID_PUT: (platformId, roleId) => `${HOST}/api/platforms/${platformId}/newpermissions/${roleId}`,
  PLATFORM$ID_PERMISSIONS$ID_DELETE: (platformId, roleId) => `${HOST}/api/platforms/${platformId}/newpermissions/${roleId}`,


  // Group scope
  GROUP_POST: () => `${HOST}/api/groups`,
  GROUP_GET: () => `${HOST}/api/groups`,
  GROUP_USERS_GET: () => `${HOST}/api/groups/users`,
  GROUP_NOTES_GET: () => `${HOST}/api/groups/notes`,
  GROUP_FROM_PLATFORM$ID_GET: platformId => `${HOST}/api/groups/platform/${platformId}`,
  GROUP_NOTES$ID_DELETE: noteId => `${HOST}/api/groups/notes/${noteId}`,
  GROUP$ID_GET: groupId => `${HOST}/api/groups/${groupId}`,
  GROUP$ID_DELETE: groupId => `${HOST}/api/groups/${groupId}`,
  GROUP$ID_USERS_POST: groupId => `${HOST}/api/groups/${groupId}/users`,
  GROUP$ID_USERS_GET: groupId => `${HOST}/api/groups/${groupId}/users`,
  GROUP$ID_GRADES_POST: groupId => `${HOST}/api/groups/${groupId}/notes`,
  GROUP$ID_GRADES_GET: groupId => `${HOST}/api/groups/${groupId}/notes`,
  GROUP$ID_GRADES$ID_DELETE: (groupId, gradeId) => `${HOST}/api/groups/${groupId}/notes/${gradeId}`,
  GROUP$ID_GRADES_SCALE_GET: groupId => `${HOST}/api/groups/${groupId}/scale`,
  GROUP$ID_GRADES_SCALE_PUT: groupId => `${HOST}/api/groups/${groupId}/scale`,
  GROUP$ID_USERS$ID_DELETE: (groupId, userId) => `${HOST}/api/groups/${groupId}/users/${userId}`,
  GROUP$ID_NOTES$ID_PUT: noteId => `${HOST}/api/groups/notes/${noteId}`,
  GROUP$ID_PERMISSIONS_GET: groupId => `${HOST}/api/groups/${groupId}/newpermissions`,
  GROUP$ID_PERMISSIONS_POST: groupId => `${HOST}/api/groups/${groupId}/newpermissions`,
  GROUP$ID_PERMISSIONS_MY_GET: groupId => `${HOST}/api/groups/${groupId}/permissions/my`,
  GROUP$ID_PERMISSIONS$ID_PUT: (groupId, roleId) => `${HOST}/api/groups/${groupId}/newpermissions/${roleId}`,
  GROUP$ID_PERMISSIONS$ID_DELETE: (groupId, roleId) => `${HOST}/api/groups/${groupId}/newpermissions/${roleId}`,
  GROUPS$ID_MATERIALS_POST: groupId => `${HOST}/api/groups/${groupId}/materials`,
  GROUPS$ID_MATERIALS_GET: groupId => `${HOST}/api/groups/${groupId}/materials`,
  GROUPS$ID_MATERIALS_DELETE: (groupId, materialId) => `${HOST}/api/groups/${groupId}/materials/${materialId}`,
  GROUPS$ID_TASKS_POST: groupId => `${HOST}/api/groups/${groupId}/tasks`,
  GROUPS$ID_TASKS_GET: groupId => `${HOST}/api/groups/${groupId}/tasks`,
  GROUPS$ID_TASKS$ID_DELETE: (groupId, taskId) => `${HOST}/api/groups/${groupId}/tasks/${taskId}`,
  GROUPS$ID_TASKS$ID_DONE_POST: (groupId, taskId) => `${HOST}/api/groups/${groupId}/tasks/${taskId}/done`,
  GROUPS$ID_TASKS$ID_DONE_GET: (groupId, taskId) => `${HOST}/api/groups/${groupId}/tasks/${taskId}/done`,

  // Meet scope
  MEET_GET: () => `${HOST}/api/meets`,
  MEET_POST: () => `${HOST}/api/meets`,
  MEET_FROM_GROUP$ID_GET: groupId => `${HOST}/api/meets/group/${groupId}`,
  MEET$ID_GET: meetId => `${HOST}/api/meets/${meetId}`,
  MEET$ID_DELETE: meetId => `${HOST}/api/meets/${meetId}`,
  MEET$ID_USERS_POST: meetId => `${HOST}/api/meets/${meetId}/users`,
  MEET$ID_USERS_GET: meetId => `${HOST}/api/meets/${meetId}/users`,
  MEET$ID_USERS$ID_DELETE: (meetId, userId) => `${HOST}/api/meets/${meetId}/users/${userId}`,
  MEET$ID_PERMISSIONS_GET: meetId => `${HOST}/api/meets/${meetId}/permissions`,
  MEET$ID_PERMISSIONS_MY_GET: meetId => `${HOST}/api/meets/${meetId}/permissions/my`,



}

export default URLS
// new Proxy( URLS, {
//   get( urls, key ) {

//     if (key in urls) return urls[ key ] // `${urls[ key ]}?${urlSearchParams()}`

//     return null
//   },
// } )
