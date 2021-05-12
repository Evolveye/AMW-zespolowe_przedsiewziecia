import Fetcher from "./fetch"
import { navigate } from "gatsby"

const fakeStartDate = () => new Date( Date.now() + Math.floor( Math.random() * 1000 * 60 * 60 * 24 * 7 ) )
const fakeExpirationDate = () => Date.now() + 1000 * 60 * 60 * 1

const fakeGroupRoles = [
  {
    id: `0`,
    color: 0xff0000,
    name: `Admin`,
    abilities: {
      canManageMeets: true,
    },
  },
  {
    id: `1`,
    color: null,
    name: `Student`,
    abilities: {
      canManageMeets: true,
    },
  },
]
const fakePlatformRoles = [
  {
    id: `0`,
    color: 0xf64118,
    name: `Admin`,
    abilities: {
      canEditDetails: true,
      canTeach: true,
      canManageUsers: true,
      canManageRoles: true,
      canManageGroups: true,
    },
  },
  {
    id: `1`,
    color: 0xff5300,
    name: `Asystent`,
    abilities: {
      canEditDetails: true,
      canTeach: true,
      canManageUsers: true,
      canManageRoles: false,
      canManageGroups: true,
    },
  },
  {
    id: `2`,
    color: 0x53f853,
    name: `Prowadzący`,
    abilities: {
      canEditDetails: false,
      canTeach: true,
      canManageUsers: false,
      canManageRoles: false,
      canManageGroups: false,
    },
  },
  {
    id: `3`,
    color: null,
    name: `Student`,
    abilities: {
      canEditDetails: false,
      canTeach: false,
      canManageUsers: false,
      canManageRoles: false,
      canManageGroups: false,
    },
  },
]
const fakePlatformUsers = [
  {
    id: `0`,
    name: `Paweł`,
    surname: `Stolarski`,
    role: fakePlatformRoles.find( ({ name }) => name === `Admin` ),
  },
  {
    id: `1`,
    name: `Adam`,
    surname: `Szreiber`,
    role: fakePlatformRoles.find( ({ name }) => name === `Asystent` ),
  },
  {
    id: `2`,
    name: `Kamil`,
    surname: `Czarny`,
    role: fakePlatformRoles.find( ({ name }) => name === `Student` ),
  },
]
const fakePlatforms = [
  {
    id: `0`,
    name: `Szkoła`,
  },
  {
    id: `1`,
    name: `Akademia`,
  },
  {
    id: `2`,
    name: `Szkółka leśna`,
  },
]
const fakeGroups = [
  {
    id: `0`,
    platformId: `0`,
    name: `Przyrka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 1, 2, 3 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `1`,
    platformId: `0`,
    name: `Fizka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 0 ),
    meets: [],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `2`,
    platformId: `0`,
    name: `Biolka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [ 4, 5 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `3`,
    platformId: `0`,
    name: `Relka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 6 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `4`,
    platformId: `1`,
    name: `Poważna fizyka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 0 ),
    meets: [ 1, 2 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `5`,
    platformId: `1`,
    name: `Poważna matematyka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `6`,
    platformId: `1`,
    name: `Najpoważniejsza informatyka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [ 3 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `7`,
    platformId: `2`,
    name: `Sadzonki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [ 1, 2, 3 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `8`,
    platformId: `2`,
    name: `Sadzoneczki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 0 ),
    meets: [ 4, 5 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `9`,
    platformId: `2`,
    name: `Sadzeniunie`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 6, 7, 8, 9 ],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `10`,
    platformId: `2`,
    name: `Doniczki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 0 ),
    meets: [],
    membersIds: [ 0, 1, 2 ],
  },
  {
    id: `11`,
    platformId: `2`,
    name: `Korzonki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [ 10 ],
    membersIds: [ 0, 1, 2 ],
  },
]
const fakeMeets = [
  { platformId:`0`, groupId:`0`, description:`Short Desc` },
  { platformId:`0`, groupId:`0`, description:`Short Desc` },
  { platformId:`0`, groupId:`1`, description:`Desc` },
  { platformId:`0`, groupId:`2`, description:`Short Desc` },
  { platformId:`0`, groupId:`3`, description:`Short Desc` },
  { platformId:`0`, groupId:`3`, description:`Desc` },
  { platformId:`1`, groupId:`4`, description:`Desc` },
  { platformId:`1`, groupId:`5`, description:`Short description` },
  { platformId:`1`, groupId:`5`, description:`Desc` },
  { platformId:`1`, groupId:`5`, description:`Short Desc` },
  { platformId:`1`, groupId:`6`, description:`Short Desc` },
  { platformId:`1`, groupId:`6`, description:`Desc` },
  { platformId:`2`, groupId:`7`, description:`Desc` },
  { platformId:`2`, groupId:`8`, description:`Short description` },
].map( (props, i) => ({
  id: i,
  startDate: fakeStartDate(),
  expirationDate: fakeExpirationDate(),
  ...props,
}) )
const fakeNotes = [
  { id:`0`, groupId:`0`, userId:`0`, value:`1`, description:`Bad` },
  { id:`1`, groupId:`0`, userId:`1`, value:`6`, description:`Great` },
]
const fakeDataset = {
  platformUsers: fakePlatformUsers,
  platformRoles: fakePlatformRoles,
  groupRoles: fakeGroupRoles,
  platforms: fakePlatforms,
  groups: fakeGroups,
  meets: fakeMeets,
  notes: fakeNotes,
}


export const fetcher = new Fetcher({ processError: ({ data }) => {
  if (data?.code === 110) return navigate( `/logout` )

  console.error( data )
} })

/** @param {string} address */
export function fetchOrGet( address, headersOrCb = {}, cb = (typeof headersOrCb == `function` ? headersOrCb : null) ) {
  if (address.startsWith( `fake://` )) {
    const { addressBase, index, query } = address.slice( 7 )
      .match( /(?<addressBase>\w+)(?:\/(?<index>\w*))?(?:\?(?<query>.*))?/ )
      .groups
    const fakeData = fakeDataset[ addressBase ]

    let data = index ? fakeData[ index ] : fakeData

    if (query && Array.isArray( data )) {
      const queryParts = query.split( /&/g )
        .map( part => part.split( `=` ) )

      data = data.filter( it =>
        queryParts.reduce( (bool, [ prop, value ]) => bool && it[ prop ] == value, true ),
      )
    }

    cb?.( data )

    return data
  }

  return fetcher.get( address, typeof headersOrCb == `object` ? headersOrCb : null ).then( data => {
    cb?.( data )
    return data
  } )
}

export const isData = data => !(data instanceof Promise)
export const isDataLoading = data => !isData( data )
export const isBrowser = () => window !== undefined
export const getUrnQuery = () => isBrowser()
  ? Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )
  : {}

export function getDate( date = Date.now(), format = `YYYY.MM.DD hh:mm` ) {
  if (typeof date != `number`) date = new Date(date)

  const options = {
    year: `numeric`,
    month: `2-digit`,
    day: `2-digit`,
    hour: `2-digit`,
    minute: `2-digit`,
  }
  const [
    { value:DD },
    ,
    { value:MM },
    ,
    { value:YYYY },
    ,
    { value:hh },
    ,
    { value:mm },
  ] = new Intl.DateTimeFormat(`pl`, options).formatToParts( date )

  return `${format}`
    .replace( /YYYY/, YYYY )
    .replace( /YY/, YYYY.slice( -2 ) )
    .replace( /MM/, MM )
    .replace( /DD/, DD )
    .replace( /hh/, hh )
    .replace( /mm/, mm )
}
