export const BACKEND_LOGIN_URL = "/api/login"
export const BACKEND_REGISTER_URL = "/api/register"

export const BACKEND_PASSWORD_REMIND_URL = "/api/password/remind"
export const BACKEND_PASSWORD_RESET_URL = "/api/password/reset/:code"

export const BACKEND_USER_ME_URL = "/api/users/me"

export const BACKEND_PLATFORMS_URL = "/api/platforms"
export const BACKEND_USER_ME_PINNED_ADD_URL = "/api/users/me/pinned"
export const BACKEND_USER_ME_PINNED_DEL_URL = "/api/users/me/pinned:elemenId"

export const BACKEND_PLATFORMS_USERS_GET = "/api/platforms/id:number/users"
export const BACKEND_PLATFORMS_USERS_DEL = "/api/platforms/id:number/users/id:number"

export const BACKEND_PLATFORMS_GROUPS_GET = "/api/groups"
export const BACKEND_PLATFORMS_GROUPS_POST = "/api/groups"
export const BACKEND_PLATFORMS_GROUPS_ADD = "/api/groups"
export const BACKEND_PLATFORMS_GROUPS_DEL = "/api/groups/:groupId"
export const BACKEND_PLATFORMS_USERS_NOTES = "/api/groups/notes"
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_GET = "/api/groups/:groupId/notes"
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_DEL = "/api/groups/notes/:noteId"
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_ADD = "/api/groups/notes"
export const BACKEND_PLATFORMS_GROUPS_USER_NOTES_PUT = "/api/groups/notes/:noteId"

export const BACKEND_CALENDAR_URL = "/api/calendar"

export const DEBUG_LOGIN_URL = `localhost:3000${BACKEND_LOGIN_URL}`//"https://mockend.com/evolveye/prymitywna-platforma-edukacyjna/tree/dev-frontend/tokens/1"
export const DEBUG_USER_ME_URL = `localhost:3000${BACKEND_USER_ME_URL}`//"https://mockend.com/evolveye/prymitywna-platforma-edukacyjna/tree/dev-frontend/users/1"

export const WEB_SOCKET_URL = "ws://localhost:3000"

export const DEBUG = false