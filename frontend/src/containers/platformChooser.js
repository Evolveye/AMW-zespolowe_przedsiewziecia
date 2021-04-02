import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import Select, { Item } from "../components/select.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox, { Tab } from "../components/switchBox.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"
import { getUrnQuery, getDate } from "../utils/functions"

import settingsClasses from "./settings.module.css"
import classes from "./platformChooser.module.css"

const buttonsClasname = `neumorphizm is-button`
const dataTableButtonsClassName = `${buttonsClasname} ${classes.actionButton}`
const dataTableProps = {
  className: classes.table,
  actionPosibility: () => true, // same as { create:true, delete:true, edit:true, }
  actionsLabel: `Akcje`,
  create: { label:`Dodaj`, className:`${dataTableButtonsClassName} ${classes.isCreate}` },
  delete: { label:`Usuń`, className:`${dataTableButtonsClassName} ${classes.isDelete}` },
  edit: { label:`Edytuj`, className:`${dataTableButtonsClassName} ${classes.isEdit}` },
}

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
        () => !p ? `Wybierz platformę...` : <>
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
    btnClassName={`${buttonsClasname} ${settingsClasses.settingsSwitch}`}
    btnIsActiveClassname="is-active"
    btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
    fullScreened
  >
    <SwitchBox
      classNames={{
        switches: settingsClasses.settingsTabsSwitches,
        switch: `${buttonsClasname} ${settingsClasses.settingsTabSwitch}`,
        activeSwitch: `is-active`,
      }}
    >
      <Tab className={settingsClasses.settingsTabSwitch} name="Użytkownicy">
        <DataTable {...dataTableProps} getDataAddress="fake.platformUsers">
          <Field label="Imię" name="name">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Nazwisko" name="surname">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Rola" name="role" editable>
            <Processor render={({ id, name }) => ({ label:name, value:id })} />
            <Adder className={classes.adder} type="select" getDataAddress="fake.platformRoles" />
          </Field>
        </DataTable>
      </Tab>

      <Tab className={settingsClasses.settingsTabSwitch} name="Grupy">
        <DataTable {...dataTableProps} getDataAddress="fake.groups">
          <Field label="Nazwa" name="name">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Prowadzący" name="lecturer">
            <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
            <Adder
              className={classes.adder}
              type="select"
              getDataAddress="fake.platformUsers"
              validateInitialData={(data, { tableContent }) => data}
            />
          </Field>
        </DataTable>
      </Tab>

      <Tab className={settingsClasses.settingsTabSwitch} name="Spotkania">
        <DataTable {...dataTableProps} getDataAddress="fake.meets">
          <Field label="Czas rozpoczęcia" name="startDate">
            <Processor render={getDate} />
            <Adder className={classes.adder} type="datetime-local" />
          </Field>

          <Field label="Czas zakończenia" name="expirationDate">
            <Processor render={getDate} />
            <Adder className={classes.adder} type="datetime-local" />
          </Field>

          <Field label="Opis" name="description">
            <Adder className={classes.adder} type="textarea" />
          </Field>
        </DataTable>
      </Tab>
    </SwitchBox>
  </ToggableBox>
)
