import React from "react"
import SwitchBox from "../components/switchBox.js"
import ToggableBox from "../components/toggableBox.js"

import TwoColumnsList from "../components/twoColumnsList.js"
import { getUrnQuery } from "../utils/functions.js"
import { QueryLink } from "./link.js"

const fakeGroups = {
  1: [
    { id:1, meets:[ 1, 2, 3 ] },
    { id:2, meets:[] },
    { id:3, meets:[ 4, 5 ] },
    { id:4, meets:[ 6 ] },
  ],
  2: [
    { id:1, meets:[ 1, 2 ] },
    { id:2, meets:[] },
    { id:3, meets:[ 3 ] },
  ],
  3: [
    { id:1, meets:[ 1, 2, 3 ] },
    { id:2, meets:[ 4, 5 ] },
    { id:3, meets:[ 6, 7, 8, 9 ] },
    { id:4, meets:[] },
    { id:5, meets:[ 10 ] },
  ],
}

export default ({ className = `` }) => {
  const { p, g } = getUrnQuery()
  const groups = fakeGroups[ p ]
  const group = groups?.find( ({ id }) => id == g )

  return (
    <TwoColumnsList className={className}>
      {
        groups?.map( ({ id }) => (
          <li key={id} className="classes.groupLink">
            <QueryLink
              to="/group"
              requiredParams={[ `p` ]}
              params={[ { name:`g`, value:id } ]}
            >
            group
              {` `}
              {id}
            </QueryLink>
            <ToggableBox boxClassName="classes.settings" btnContent="U" fullScreened>
              <SwitchBox tabs={
                [
                  { name:`Użytkownicy`, node:<>Jakaś tabelka z użytkownikami</> },
                  { name:`Spotkania`, node:<>Jakaś tabelka ze spotkaniami</> },
                ]
              }
              />
            </ToggableBox>
          </li>
        ) )
      }
      {/* <ul className={className}>
        <li>list item</li>
        <li>list item</li>
      </ul> */}
    </TwoColumnsList>
  )
}

