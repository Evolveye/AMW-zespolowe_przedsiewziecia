const fakeGroupRoles = [
  {
    id: `1`,
    color: 0xff0000,
    name: `Admin`,
    abilities: {
      canManageMeets: true,
    },
  },
  {
    id: `3`,
    color: null,
    name: `Student`,
    abilities: {
      canManageMeets: true,
    },
  },
]
const fakePlatformRoles = [
  {
    id: `1`,
    color: 0xff0000,
    name: `Admin`,
    abilities: {
      canManageGroups: true,
    },
  },
  {
    id: `2`,
    color: 0x00ff00,
    name: `Asystent`,
    abilities: {
      canManageGroups: true,
    },
  },
  {
    id: `3`,
    color: null,
    name: `Student`,
    abilities: {
      canManageGroups: false,
    },
  },
]
const fakePlatformUsers = [
  {
    id: `1`,
    name: `Paweł`,
    surname: `Stolarski`,
    role: fakePlatformRoles.find( ({ name }) => name === `Admin` ),
  },
  {
    id: `2`,
    name: `Adam`,
    surname: `Szreiber`,
    role: fakePlatformRoles.find( ({ name }) => name === `Asystent` ),
  },
  {
    id: `3`,
    name: `Kamil`,
    surname: `Czarny`,
    role: fakePlatformRoles.find( ({ name }) => name === `Student` ),
  },
]
const fakeGroups = [
  {
    id: `1`,
    platformId: `1`,
    name: `Przyroda`,
    lecturer: fakePlatformUsers[ 1 ],
  },
  {
    id: `2`,
    platformId: `1`,
    name: `Oceanografia`,
    lecturer: fakePlatformUsers[ 0 ],
  },
]
const fakeMeets = [
  {
    id: `1`,
    platformId: `1`,
    groupId: `1`,
    startDate: Date.now(),
    expirationDate: Date.now() + 1000 * 60 * 60 * 1,
    description: `Short description`,
  },
]
const fakeData = {
  platformUsers: fakePlatformUsers,
  platformRoles: fakePlatformRoles,
  groupRoles: fakeGroupRoles,
  groups: fakeGroups,
  meets: fakeMeets,
}

/** @param {string} address */
export default function fetchOrGet( address, cb ) {
  if (address.startsWith( `fake.` )) {
    const data = fakeData[ address.slice( 5 ) ]

    if (cb) cb( data )

    return data
  }

  throw new Error( `Unknown data "${address}"` )
}

export const isData = data => !(data instanceof Promise)
