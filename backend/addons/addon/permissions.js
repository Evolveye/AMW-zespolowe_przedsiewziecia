import createPermissionSchema from "../premissions.js"

const Addonpermissions = createPermissionSchema( [
  `canTeach`,
  `canEditDetails`,
  `canManageUsers`,
  `canManageRoles`,
  `canManageGroups`,
  `canManageCalendar`,
] )

export default {
  student: new Addonpermissions( `student`, 2, null, { canTeach:true } ),
  sekretarka: new Addonpermissions( `sekretarka`, 8, 0xff0000, { canTeach:true } ),
  dzban: new Addonpermissions( `dzban`, 1, 0, { canTeach:true } ),
}