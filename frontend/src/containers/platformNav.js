import React from "react"

import { getUrnQuery } from "../utils/functions.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox from "../components/switchBox.js"
import { QueryLink } from "./link.js"
import DataTable from "../components/dataTable.js"

import classes from "./platformNav.module.css"

const labelsTranslation = {
  actions: `Akcje`,
  create: `Dodaj`,
  delete: `Usuń`,
  edit: `Edytuj`,
}

export default ({ className = ``, showMeets }) => {

  return (
    <article className={`${classes.nav} ${className}`}>
      <article className={classes.groups}>
        <GroupsList platformId={p} />

      </article>

      <article className={classes.meets} hidden={!showMeets}>
        Spotkania
        {
          group?.meets.map( id => (
            <QueryLink
              key={id}
              className={classes.meetLink}
              to="/meet"
              requiredParams={[ `p`, `g` ]}
              params={[ { name:`m`, value:id } ]}
            >
              meet
              {` `}
              {id}
            </QueryLink>
          ) )
        }
      </article>
    </article>
  )
}

const GroupsList = ({ platformId }) => {
  const groups = fakeGroups[ platformId ]

  return (
    <section>
      Grupy
      {
        groups?.map( ({ id }) => (
          <div key={id} className={classes.groupLink}>
            <QueryLink
              to="/group"
              requiredParams={[ `p` ]}
              params={[ { name:`g`, value:id } ]}
            >
            group
              {` `}
              {id}
            </QueryLink>
            <ToggableBox boxClassName={classes.settings} btnContent="U" fullScreened>
              <SwitchBox tabs={
                [
                  { name:`Użytkownicy`, node:<>Jakaś tabelka z użytkownikami</> },
                  { name:`Spotkania`, node:<>Jakaś tabelka ze spotkaniami</> },
                ]
              }
              />
            </ToggableBox>
          </div>
        ) )
      }
    </section>
  )
}
