import React, { useEffect, useState } from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import Select, { Item } from "../components/select.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox, { Tab } from "../components/switchBox.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"
import Form, { Text, Password, Submit } from "../components/form.js"
import { fetcher, fetchOrGet, getUrnQuery } from "../utils/functions"

import boxesClasses from "../css/box.module.css"
import classes from "./platformChooser.module.css"
import { authFetcher, getAuthHeaders, isLogged } from "../utils/auth.js"
import URLS from "../utils/urls.js"

const buttonsClasname = `neumorphizm is-button`
const dataTableButtonsClassName = `${buttonsClasname} ${classes.actionButton}`
const dataTableProps = {
  className: classes.table,
  actionPosibility: () => true, // same as { create:true, delete:true, edit:true, }
  actionsLabel: `Akcje`,
  create: { label:`Dodaj`, className:`${dataTableButtonsClassName} ${classes.isSoftCreate}` },
  delete: { label:`Usuń`, className:`${dataTableButtonsClassName} ${classes.isSoftDelete}` },
  edit: { label:`Edytuj`, className:`${dataTableButtonsClassName} ${classes.isSoftEdit}` },
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
  const [ platforms, setPlatforms ] = useState( null )
  const { p } = getUrnQuery()

  useEffect( () => {
    authFetcher.get( URLS.PLATFORM_GET() ).then( ({ platforms }) => setPlatforms( platforms ) )
  }, [] )

  return (
    <Select
      className={`${classes.nav} ${className}`}
      selectedItemClassName={classes.selectedPlatform}
      itemsClassName={classes.items}
      btnClassName={`${buttonsClasname} ${classes.navSwitch}`}
      btnIsActiveClassname="is-active"
      renderChoosedItem={
        () => !p || !platforms ? <span className={`tag ${classes.linkTag}`}>Wybierz platformę...</span> : <>
          <Link className={classes.platform} to={`/platform?p=${p}`}>
            {platforms.find( ({ id }) => id == p ).name}
          </Link>

          <ToggableBox
            boxClassName={boxesClasses.wrapper}
            btnClassName={`${buttonsClasname} ${boxesClasses.switch}`}
            btnIsActiveClassname="is-active"
            btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
            fullScreened
          >
            <SettingsTabs platformId={p} />
          </ToggableBox>
        </>
      }
    >
      {
        platforms?.map( ({ id, name }) => (
          <Item key={id} className={classes.item} linkTo={`/platform?p=${id}`}>
            {name}
          </Item>
        ) )
      }

      <AddNewPlatformItem />
    </Select>
  )
}


const createNewPlatform = async data => {
  const platform = await fetcher.post( URLS.PLATFORM_POST(), data, getAuthHeaders() )
  console.log( platform )
}
const AddNewPlatformItem = () => (
  <Item>
    <ToggableBox
      boxClassName={boxesClasses.popup}
      btnClassName={`${buttonsClasname} ${classes.isCenteredButton}`}
      btnIsActiveClassname="is-active"
      btnContent="Stwórz nową platformę"
      fullScreened
    >
      <Form classNames={{ it:classes.centered }}>
        <Text className={classes.input} name="name">Nazwa paltformy</Text>
        <Submit className={`${dataTableButtonsClassName} ${classes.isSoftCreate}`} handler={createNewPlatform}>
          Stwórz
        </Submit>
      </Form>
    </ToggableBox>
  </Item>
)


const SettingsTabs = ({ platformId }) => (
  <SwitchBox
    classNames={{
      switches: boxesClasses.tabsSwitches,
      switch: `${buttonsClasname} ${boxesClasses.tabSwitch}`,
      activeSwitch: `is-active`,
    }}
  >
    <Tab className={`is-centered ${boxesClasses.tabSwitch}`} name="Ogólne">
      <Form classNames={{ it:classes.centered }}>
        <Text className={classes.input} name="description">Opis</Text>
        <Submit className={`neumorphizm is-button ${classes.button}`}>Zaktualizuj</Submit>
      </Form>

      <ToggableBox
        boxClassName={boxesClasses.popup}
        btnClassName={`${dataTableButtonsClassName} ${classes.isDelete}`}
        btnIsActiveClassname="is-active"
        btnContent="Skasuj platformę"
        fullScreened
      >
        <Form classNames={{ it:classes.centered }}>
          <Password className={classes.input} name="password">Podaj hasło</Password>
          <Submit className={`${dataTableButtonsClassName} ${classes.isDelete}`}>Skasuj</Submit>
        </Form>
      </ToggableBox>
    </Tab>

    <Tab className={boxesClasses.tabSwitch} name="Użytkownicy">
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

    <Tab className={boxesClasses.tabSwitch} name="Grupy">
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

    <Tab className={boxesClasses.tabSwitch} name="Role">
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
)
