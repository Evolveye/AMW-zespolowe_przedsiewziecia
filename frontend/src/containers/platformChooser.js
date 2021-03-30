import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import Select, { Item } from "../components/select.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox, { Tab } from "../components/switchBox.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"
import { getUrnQuery } from "../utils/functions"

import settingsClasses from "./settings.module.css"
import classes from "./platformChooser.module.css"

const defaultValue = `Wybierz platformę...`
const fakePlatforms = [
  { id:1, name:`Szkoła` },
  { id:2, name:`Akademia` },
  { id:3, name:`Szkółka leśna` },
]
const labelsTranslation = {
  actions: `Akcje`,
  create: `Dodaj`,
  delete: `Usuń`,
  edit: `Edytuj`,
}

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
  const queryData = useStaticQuery( query )
  const { p } = getUrnQuery()

  return (
    <Select
      className={`${classes.nav} ${className}`}
      selectedItemClassName={classes.selectedPlatform}
      itemsClassName={classes.items}
      btnClassName={`neumorphizm is-button ${classes.navSwitch}`}
      btnIsActiveClassname="is-active"
      renderChoosedItem={
        () => !p ? defaultValue : <>
          <Link className={classes.platform} to={`/platform?p=${p}`}>
            {fakePlatforms.find( ({ id }) => id == p ).name}
          </Link>

          <PlatformSettings queryData={queryData} />
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

const PlatformSettings = ({ queryData }) => (
  <ToggableBox
    boxClassName={settingsClasses.settings}
    btnClassName={`neumorphizm is-button ${settingsClasses.settingsSwitch}`}
    btnIsActiveClassname="is-active"
    btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
    fullScreened
  >
    <SwitchBox
      classNames={{
        switches: settingsClasses.settingsTabsSwitches,
        switch: `neumorphizm is-button ${settingsClasses.settingsTabSwitch}`,
        activeSwitch: `is-active`,
      }}
    >
      <Tab className={settingsClasses.settingsTabSwitch} name="Użytkownicy">
        <DataTable
          className={classes.table}
          getDataAddress="fakePlatformUsers"
          deleteDataAddress=""
          // deletePosibilityChecker={fields => true}
          staticLabels={labelsTranslation}
        >
          <Field label="Imię" name="name">
            <Adder type="text" validator={() => true} />
          </Field>

          <Field label="Nazwisko" name="surname">
            <Adder type="text" validator={() => true} />
          </Field>

          <Field label="Rola" name="role" editable>
            <Processor render={({ name }) => name} />
            <Adder type="text" validator={() => true} />
          </Field>
        </DataTable>
      </Tab>

      <Tab className={settingsClasses.settingsTabSwitch} name="Grupy">
        <DataTable
          className={classes.table}
          getDataAddress="fakeGroups"
          deleteDataAddress=""
          // deletePosibilityChecker={fields => true}
          staticLabels={labelsTranslation}
        >
          <Field label="Nazwa" name="name">
            <Adder type="text" validator={() => true} />
          </Field>

          <Field label="Prowadzący" name="lecturer">
            <Processor render={({ name, surname }) => `${name} ${surname}`} />
            <Adder type="text" validator={() => true} />
          </Field>
        </DataTable>
      </Tab>
    </SwitchBox>
  </ToggableBox>
)
