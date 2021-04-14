import React from "react"
import { useState } from "react"


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
    id: `2`,
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
    id: `3`,
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
    id: `4`,
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
    lecturer: fakePlatformUsers.find( ({ id }) => id == 3 ),
    meets: [ 1, 2, 3 ],
  },
  {
    id: `1`,
    platformId: `0`,
    name: `Fizka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [],
  },
  {
    id: `2`,
    platformId: `0`,
    name: `Biolka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 4, 5 ],
  },
  {
    id: `3`,
    platformId: `0`,
    name: `Relka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 3 ),
    meets: [ 6 ],
  },
  {
    id: `4`,
    platformId: `1`,
    name: `Poważna fizyka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [ 1, 2 ],
  },
  {
    id: `5`,
    platformId: `1`,
    name: `Poważna matematyka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [],
  },
  {
    id: `6`,
    platformId: `1`,
    name: `Najpoważniejsza informatyka`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 3 ],
  },
  {
    id: `7`,
    platformId: `2`,
    name: `Sadzonki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 1, 2, 3 ],
  },
  {
    id: `8`,
    platformId: `2`,
    name: `Sadzoneczki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [ 4, 5 ],
  },
  {
    id: `9`,
    platformId: `2`,
    name: `Sadzeniunie`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 3 ),
    meets: [ 6, 7, 8, 9 ],
  },
  {
    id: `10`,
    platformId: `2`,
    name: `Doniczki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 1 ),
    meets: [],
  },
  {
    id: `11`,
    platformId: `2`,
    name: `Korzonki`,
    lecturer: fakePlatformUsers.find( ({ id }) => id == 2 ),
    meets: [ 10 ],
  },
]
const fakeMeets = [
  {
    id: `1`,
    platformId: `1`,
    groupId: `1`,
    startDate: new Date( Date.now() + Math.floor( Math.random() * 1000 * 60 * 60 * 24 * 7 ) ),
    expirationDate: Date.now() + 1000 * 60 * 60 * 1,
    description: `Short Desc`,
  },
  {
    id: `2`,
    platformId: `1`,
    groupId: `1`,
    startDate: new Date( Date.now() + Math.floor( Math.random() * 1000 * 60 * 60 * 24 * 7 ) ),
    expirationDate: Date.now() + 1000 * 60 * 60 * 1,
    description: `Desc`,
  },
  {
    id: `3`,
    platformId: `2`,
    groupId: `1`,
    startDate: new Date( Date.now() + Math.floor( Math.random() * 1000 * 60 * 60 * 24 * 7 ) ),
    expirationDate: Date.now() + 1000 * 60 * 60 * 1,
    description: `Desc`,
  },
  {
    id: `3`,
    platformId: `2`,
    groupId: `1`,
    startDate: new Date( Date.now() + Math.floor( Math.random() * 1000 * 60 * 60 * 24 * 7 ) ),
    expirationDate: Date.now() + 1000 * 60 * 60 * 1,
    description: `Short desc`,
  },
]
const fakeDataset = {
  platformUsers: fakePlatformUsers,
  platformRoles: fakePlatformRoles,
  groupRoles: fakeGroupRoles,
  platforms: fakePlatforms,
  groups: fakeGroups,
  meets: fakeMeets,
}


/** @param {string} address */
export function fetchOrGet( address, cb ) {
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

  throw new Error( `Unknown data "${address}"` )
}

export const isData = data => !(data instanceof Promise)
export const isBrowser = () => window !== undefined
export const getUrnQuery = () => isBrowser()
  ? Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )
  : {}

export const useForceUpdate = () => {
  const [ v, setV ] = useState( 0 )

  return () => setV( v + 1 )
}

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

// export const getActivePlatform = () => fetchOrGet()
