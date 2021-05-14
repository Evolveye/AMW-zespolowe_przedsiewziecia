import React, { useEffect, useState } from "react"
import { graphql, Link, navigate, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import Select, { Item } from "../components/select.js"
import ToggableBox from "../components/toggableBox.js"
import SwitchBox, { Tab } from "../components/switchBox.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"
import Form, { Text, Password, Submit } from "../components/form.js"
import { fetcher, getUrnQuery, isDataLoading, setInStorage } from "../utils/functions"

import boxesClasses from "../css/box.module.css"
import classes from "./platformChooser.module.css"
import { authFetcher, getAuthHeaders } from "../utils/auth.js"
import URLS from "../utils/urls.js"
import getWebsiteContext from "../utils/websiteContext.js"

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
const toggleBoxProps = {
  btnIsActiveClassname: `is-active`,
  closeBtnClassName: boxesClasses.closeButton,
  closeLabel: `X`,
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

const authFetch = (method, dataField, ...args) => authFetcher[ method ]( ...args ).
  then( data => data && dataField ? data[ dataField ] : data )

const get   = (address, dataField)        => authFetch( `get`,    dataField, address )
const post  = (address, data, dataField)  => authFetch( `post`,   dataField, address, data )
const del   = (address, data, dataField)  => authFetch( `delete`, dataField, address, data )
const put   = (address, data, dataField)  => authFetch( `put`, dataField, address, data )


export default ({ className = `` }) => {
  const queryData = useStaticQuery( query )
  const [ platforms, setPlatforms ] = useState( null )
  const { p } = getUrnQuery()
  const { platform } = getWebsiteContext()

  useEffect( () => {
    authFetcher.get( URLS.PLATFORM_GET() )
      .then( data => data ? setPlatforms( data.platforms ) : navigate( `/logout` ) )
  }, [ p ] )

  return (
    <Select
      className={`${classes.nav} ${className}`}
      selectedItemClassName={classes.selectedPlatform}
      itemsClassName={classes.items}
      btnClassName={`${buttonsClasname} ${classes.navSwitch}`}
      btnIsActiveClassname="is-active"
      renderChoosedItem={
        () => !p || isDataLoading( platform ) ? <span className={`tag ${classes.linkTag}`}>Wybierz platformę...</span> : <>
          <Link className={classes.platform} to={`/platform?p=${p}`}>
            {platform.name}
          </Link>

          {
            Object.values( platform.myRole.abilities ).filter( Boolean ).length == 0 ? null : (
              <ToggableBox
                {...toggleBoxProps}
                boxClassName={boxesClasses.wrapper}
                btnClassName={`${buttonsClasname} ${boxesClasses.switch}`}
                btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
                fullScreened
                children={<SettingsTabs platformId={p} />}
              />
            )
          }
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


const AddNewPlatformItem = () => {
  const createNewPlatform = async data => {
    const response = await fetcher.post( URLS.PLATFORM_POST(), data, getAuthHeaders() )

    if (response?.platform) navigate( `/platform?p=${response.platform.id}` )
  }

  return (
    <Item>
      <ToggableBox
        {...toggleBoxProps}
        boxClassName={boxesClasses.popup}
        btnClassName={`${buttonsClasname} ${classes.isCenteredButton}`}
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
}

const SettingsTabs = ({ platformId }) => {
  const deletePlatform = async data => {
    const response = await del( URLS.PLATFORM$ID_DELETE( platformId ), data )

    if (response?.success) navigate( `/` )
  }
  const createUser = async(data, addToTable) => {
    const response = await post( URLS.PLATFORM$ID_USERS_POST( platformId ), data )

    if (response?.user) addToTable( response.user )
  }
  const editUser = async(id, data) => {
    await put( URLS.PLATFORM$ID_USERS$ID_PUT( platformId, id ), data )
    // console.log( response )
  }
  const deleteUser = async(data, removeFromTable) => {
    const response = await del( URLS.PLATFORM$ID_USERS$ID_DELETE( platformId, data.id ) )

    if (response?.success) removeFromTable()
  }
  const createGroup = async(data, addToTable) => {
    const response = await post( URLS.GROUP_POST(), { platformId, ...data } )

    if (response?.group) {
      addToTable( response.group )
      setInStorage( `groups list token`, Math.random() )
    }
  }
  const deleteGroup = async(data, removeFromTable) => {
    const response = await del( URLS.GROUP$ID_DELETE( data.id ), { platformId, ...data } )

    if (response?.success) removeFromTable()
  }
  const createRole = async(data, addToTable) => {
    const { name, color, ...abilities } = data
    const response = await post( URLS.PLATFORM$ID_PERMISSIONS_POST( platformId ), {
      name,
      color: color ? parseInt( color.slice( 1 ), 16 ) : undefined,
      abilities,
    } )

    if (response?.role) addToTable( response.role )
  }
  const deleteRole = async(data, removeFromTable) => {
    const response = await del( URLS.PLATFORM$ID_PERMISSIONS$ID_DELETE( platformId, data.id ) )

    if (response?.success) removeFromTable()
  }
  const editRole = async(id, data) => {
    const { name, color, ...abilities } = data
    await put( URLS.PLATFORM$ID_PERMISSIONS$ID_PUT( platformId, id ), {
      name,
      color: color ? parseInt( color.slice( 1 ), 16 ) : undefined,
      abilities,
    } )
    // console.log( response, data )
  }

  return (
    <SwitchBox
      classNames={{
        switches: boxesClasses.tabsSwitches,
        switch: `${buttonsClasname} ${boxesClasses.tabSwitch}`,
        activeSwitch: `is-active`,
      }}
    >
      <Tab className={`is-centered ${boxesClasses.tabSwitch}`} name="Ogólne">
        {/* <Form classNames={{ it:classes.centered }}>
          <Text className={classes.input} name="description">Opis</Text>
          <Submit className={`neumorphizm is-button ${classes.button}`}>Zaktualizuj</Submit>
        </Form> */}

        <ToggableBox
          {...toggleBoxProps}
          boxClassName={boxesClasses.popup}
          btnClassName={`${dataTableButtonsClassName} ${classes.isDelete}`}
          btnContent="Skasuj platformę"
          fullScreened
        >
          <Form classNames={{ it:classes.centered }}>
            <Password className={classes.input} name="password">Podaj hasło</Password>
            <Submit className={`${dataTableButtonsClassName} ${classes.isDelete}`} handler={deletePlatform}>
              Skasuj
            </Submit>
          </Form>
        </ToggableBox>
      </Tab>

      <Tab className={boxesClasses.tabSwitch} name="Użytkownicy">
        <DataTable
          {...dataTableProps}
          getData={() => get( URLS.PLATFORM$ID_USERS_GET( platformId ), `users` )}
          onCreate={createUser}
          onDelete={deleteUser}
          onEdit={editUser}
        >
          <Field label="Imię" name="name">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Nazwisko" name="surname">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Email" name="email">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Rola" name="roleId" dataFieldname="role" editable>
            <Processor render={({ id, name }) => ({ label:name, value:id })} />
            <Adder
              className={classes.adder}
              type="select"
              getData={() => get( URLS.PLATFORM$ID_PERMISSIONS_GET( platformId ), `permissions` )} // .then( console.log )
            />
          </Field>
        </DataTable>
      </Tab>

      <Tab className={boxesClasses.tabSwitch} name="Grupy">
        <DataTable
          {...dataTableProps}
          getData={() => get( URLS.GROUP_FROM_PLATFORM$ID_GET( platformId ), `groups` )}
          onCreate={createGroup}
          onDelete={deleteGroup}
        >
          <Field label="Nazwa" name="name">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Prowadzący" dataFieldname="lecturer" name="lecturerId">
            <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
            <Adder
              className={classes.adder}
              type="select"
              getData={() => get( URLS.PLATFORM$ID_USERS_GET( platformId ), `users` )}
            />
          </Field>
        </DataTable>
      </Tab>

      <Tab className={boxesClasses.tabSwitch} name="Role">
        <DataTable
          {...dataTableProps}
          className={`${classes.table} ${classes.isRotated}`}
          getData={() => get( URLS.PLATFORM$ID_PERMISSIONS_GET( platformId ), `permissions` )}
          onCreate={createRole}
          onDelete={deleteRole}
          onEdit={editRole}
        >
          <Field label="Nazwa" name="name">
            <Adder className={classes.adder} type="text" />
          </Field>

          <Field label="Kolor" name="color" editable>
            <Processor
              process={color => `#` + color.toString( 16 ).padStart( 6, 0 )}
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
            editable
          >
            <Processor render={({ canEditDetails }) => canEditDetails} />
            <Adder className={classes.adder} type="checkbox" />
          </Field>

          <Field
            className={classes.ability}
            label="Nauczanie"
            name="canTeach"
            dataFieldname="abilities"
            editable
          >
            <Processor render={({ canTeach }) => canTeach} />
            <Adder className={classes.adder} type="checkbox" />
          </Field>

          <Field
            className={classes.ability}
            label="Zarządzanie użytkownikami"
            name="canManageUsers"
            dataFieldname="abilities"
            editable
          >
            <Processor render={({ canManageUsers }) => canManageUsers} />
            <Adder className={classes.adder} type="checkbox" />
          </Field>

          <Field
            className={classes.ability}
            label="Zarządzanie rolami"
            name="canManageRoles"
            dataFieldname="abilities"
            editable
          >
            <Processor render={({ canManageRoles }) => canManageRoles} />
            <Adder className={classes.adder} type="checkbox" />
          </Field>

          <Field
            className={classes.ability}
            label="Zarządzanie grupami"
            name="canManageGroups"
            dataFieldname="abilities"
            editable
          >
            <Processor render={({ canManageGroups }) => canManageGroups} />
            <Adder className={classes.adder} type="checkbox" />
          </Field>
        </DataTable>
      </Tab>
    </SwitchBox>
  )
}
