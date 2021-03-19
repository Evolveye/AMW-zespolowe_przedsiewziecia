import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import Select, { Item } from "../components/select.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox, { Tab } from "../components/switchBox.js"
import DataTable from "../components/dataTable.js"
import { getUrnQuery } from "../utils/functions"

import classes from "./platformChooser.module.css"

const defaultValue = `Wybierz platformę...`
const fakePlatforms = [
  { id:1, name:`Szkoła` },
  { id:2, name:`Akademia` },
  { id:3, name:`Szkółka leśna` },
]

const query = graphql`
  query {
    cog: file( relativePath:{ eq:"cog.png" } ) {
      childImageSharp {
        fluid( maxWidth:50 ) { ...GatsbyImageSharpFluid }
      }
    }
  }
`

export default ({ className = `` }) => {
  const { p } = getUrnQuery()
  const queryData = useStaticQuery( query )
  const labelsTranslation = {
    actions: `Akcje`,
    create: `Dodaj`,
    delete: `Usuń`,
    edit: `Edytuj`,
  }

  return (
    <Select
      className={`${classes.nav} ${className}`}
      selectedItemClassName={classes.selectedPlatform}
      itemsClassName={classes.items}
      btnClassName={`neumorphizm is-button ${classes.navSwitch}`}
      btnIsActiveClassname="is-active"
      render={
        () => !p ? defaultValue : <>
          <Link className={classes.platform} to={`/platform?p=${p}`}>
            {fakePlatforms.find( ({ id }) => id == p ).name}
          </Link>
          <ToggableBox
            boxClassName={classes.settings}
            btnClassName={`neumorphizm is-button ${classes.settingsSwitch}`}
            btnIsActiveClassname="is-active"
            btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
            fullScreened
          >
            <SwitchBox
              switchesWrapperClassname={classes.settingsTabsSwitches}
              switchClassname={`neumorphizm is-button ${classes.settingsTabSwitch}`}
              activeSwitchClassname="is-active"
            >
              <Tab className={classes.settingsTabSwitch} name="Użytkownicy">
                <DataTable
                  getDataAddress="fakePlatformUsers"
                  deleteDataAddress=""
                  // deletePosibilityChecker={fields => true}
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
              </Tab>

              <Tab name="Grupy">
                <DataTable
                  getDataAddress="fakeGroups"
                  deleteDataAddress=""
                  // deletePosibilityChecker={fields => true}
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
              </Tab>
            </SwitchBox>
          </ToggableBox>
        </>
      }
    >
      {
        fakePlatforms.map( ({ id, name }) => (
          <Item key={id} className={classes.item} linkTo={`/platform?p=${id}`}>
            {name}
          </Item>
        ) )
      }
    </Select>

  )
}
