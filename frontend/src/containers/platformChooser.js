import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import Select, { Item } from "../components/select.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox, { Tab } from "../components/switchBox.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"
import { fetchOrGet, getUrnQuery } from "../utils/functions"

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

  // const [ platform, setPlatforms ] = useState([])
  // const { platform } = useContext( AuthContext )
  const platforms = fetchOrGet( `fake://platforms` )
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
            {platforms.find( ({ id }) => id == p ).name}
          </Link>

          <PlatformSettings queryData={queryData} platformId={p} />
        </>
      }
    >
      {
        platforms.map( ({ id, name }) => (
          <Item key={id} className={classes.item} linkTo={`/platform?p=${id}`}>
            {name}
          </Item>
        ) )
      }
    </Select>
  )
}

const PlatformSettings = ({ queryData, platformId }) => {
  // const platform = ()

  return (
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
        <Tab className={settingsClasses.settingsTabSwitch} name="Ogólne">
          Opis
          <br />
          Kasowanie
        </Tab>

        <Tab className={settingsClasses.settingsTabSwitch} name="Użytkownicy">
          <DataTable {...dataTableProps} getDataAddress="fake://platformUsers">
            <Field label="Imię" name="name">
              <Adder className={classes.adder} type="text" />
            </Field>

            <Field label="Nazwisko" name="surname">
              <Adder className={classes.adder} type="text" />
            </Field>

            <Field label="Email" name="email">
              <Adder className={classes.adder} type="text" />
            </Field>

            <Field label="Rola" name="role" editable>
              <Processor render={({ id, name }) => ({ label:name, value:id })} />
              <Adder className={classes.adder} type="select" getDataAddress="fake://platformRoles" />
            </Field>
          </DataTable>
        </Tab>

        <Tab className={settingsClasses.settingsTabSwitch} name="Grupy">
          <DataTable {...dataTableProps} getDataAddress={`fake://groups?platformId=${platformId}`}>
            <Field label="Nazwa" name="name">
              <Adder className={classes.adder} type="text" />
            </Field>

            <Field label="Prowadzący" name="lecturer">
              <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
              <Adder
                className={classes.adder}
                type="select"
                getDataAddress="fake://platformUsers"
              />
            </Field>
          </DataTable>
        </Tab>

        <Tab className={settingsClasses.settingsTabSwitch} name="Role">
          <DataTable {...dataTableProps} className={`${classes.table} ${classes.isRotated}`} getDataAddress="fake://platformRoles">
            <Field label="Nazwa" name="name">
              <Adder className={classes.adder} type="text" />
            </Field>

            <Field label="Kolor" name="color">
              <Processor
                render={color => (
                  <span className={classes.color} style={{ backgroundColor:`#` + color?.toString( 16 ).padStart( 6, 0 ) }} />
                )}
              />
              <Adder className={classes.adder} type="color" />
            </Field>

            <Field
              className={classes.ability}
              label="Edycja szczegółów"
              name="canEditDetails"
              dataFieldname="abilities"
            >
              <Processor render={({ canEditDetails }) => canEditDetails} />
              <Adder className={classes.adder} type="checkbox" />
            </Field>

            <Field
              className={classes.ability}
              label="Nauczanie"
              name="canTeach"
              dataFieldname="abilities"
            >
              <Processor render={({ canTeach }) => canTeach} />
              <Adder className={classes.adder} type="checkbox" />
            </Field>

            <Field
              className={classes.ability}
              label="Zarządzanie użytkownikami"
              name="canManageUsers"
              dataFieldname="abilities"
            >
              <Processor render={({ canManageUsers }) => canManageUsers} />
              <Adder className={classes.adder} type="checkbox" />
            </Field>

            <Field
              className={classes.ability}
              label="Zarządzanie rolami"
              name="canManageRoles"
              dataFieldname="abilities"
            >
              <Processor render={({ canManageRoles }) => canManageRoles} />
              <Adder className={classes.adder} type="checkbox" />
            </Field>

            <Field
              className={classes.ability}
              label="Zarządzanie grupami"
              name="canManageGroups"
              dataFieldname="abilities"
            >
              <Processor render={({ canManageGroups }) => canManageGroups} />
              <Adder className={classes.adder} type="checkbox" />
            </Field>
          </DataTable>
        </Tab>
      </SwitchBox>
    </ToggableBox>
  )
}
