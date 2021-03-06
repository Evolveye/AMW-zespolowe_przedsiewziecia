import { Link } from "gatsby"
import React from "react"

import SwitchBox from "./switchBox.js"
import ToggableBox from "./toggableBox.js"
import DataTable from "./dataTable.js"
import { getUrnQuery } from "../utils/functions"

import classes from "./platformNav.module.css"

const defaultValue = `Wybierz platformę...`
const fakePlatforms = [
  { id:1, name:`Szkoła` },
  { id:2, name:`Akademia` },
  { id:3, name:`Szkółka leśna` },
]

export default ({ className = `` }) => {
  const { p } = getUrnQuery()
  const labelsTranslation = {
    actions: `Akcje`,
    create: `Dodaj`,
    delete: `Usuń`,
    edit: `Edytuj`,
  }

  return (
    <article className={className}>
      {
        !p ? defaultValue : (
          <Link to={`/platform?p=${p}`}>
            platform-
            {` `}
            {p}
          </Link>
        )
      }

      <ToggableBox boxClassName={classes.nav} btnContent="Ustawienia" fullScreened>
        <SwitchBox tabs={
          [
            { name: `Użytkownicy`, node: (
              <DataTable
                getDataAddress="fakePlatformUsers"
                deleteDataAddress=""
                deletePosibilityChecker={fields => true}
                staticLabels={labelsTranslation}
                fields={
                  [
                    {
                      name: `name`,
                      label: `Imię`,
                      dataFieldname: `name`,
                      // processor: () => `Imię ` + Math.random(),
                      adder: {
                        // type: `select`,
                        colspan: 2,
                        validator: field => field,
                      },
                    },
                    {
                      name: `surname`,
                      label: `Nazwisko`,
                      dataFieldname: `surname`,
                      // processor: () => `Nazwisko ` + Math.random(),
                    },
                    {
                      name: `role`,
                      label: `Rola`,
                      dataFieldname: `role`,
                      processor: ({ name }) => name, // `Rola ` + Math.random(),
                      editable: true,
                      adder: {
                        type: `select`,
                        validator: ({ name }) => name,
                        getDataAddress: `fakeGroupRoles`,
                      },
                    },
                  ]
                }
              />
            ) },
            { name: `Grupy`, node: (
              <DataTable
                getDataAddress="fakeGroups"
                deleteDataAddress=""
                deletePosibilityChecker={fields => true}
                staticLabels={labelsTranslation}
                fields={
                  [
                    { name:`name`, label:`Nazwa`, processor:name => name },
                    {
                      name: `lecturer`,
                      label: `Prowadzący`,
                      processor: ({ name, surname }) => `${name} ${surname}`,
                      adder: {
                        type: `select`,
                        validator: ({ name }) => name,
                        getDataAddress: `fakePlatformUsers`,
                      },
                    },
                  ]
                }
              />
            ) },
          ]
        }
        />
      </ToggableBox>

      <ToggableBox boxClassName={classes.nav} btnContent="Wybierz platformę">
        <ul>
          {
            fakePlatforms.map( ({ id, name }) => (
              <li key={id}><Link to={`/platform?p=${id}`} state={{}}>{name}</Link></li>
            ) )
          }
        </ul>
      </ToggableBox>
    </article>
  )
}
