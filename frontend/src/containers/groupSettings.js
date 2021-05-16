import React, { useEffect, useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import Image from "gatsby-image"
import { authFetcher, getUser } from "../utils/auth"
import URLS from "../utils/urls"

import { getDate, getFromStorage } from "../utils/functions.js"

import SwitchBox, { Tab } from "../components/switchBox.js"
import Form, { Text, Submit } from "../components/form.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"

import boxesClasses from "../css/box.module.css"
import classes from "./groupsList.module.css"
import ToggableBox from "../components/toggableBox"



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

const buttonsClasname = `neumorphizm is-button`
const dataTableButtonsClassName = `${buttonsClasname} ${classes.actionButton}`
const dataTableProps = {
  errorBoxClassName: boxesClasses.errorBox,
  errorMessage: <p>Wystąpił nieoczekiwany błąd, skontaktuj się z administratorem</p>,
  successBoxClassName: boxesClasses.successBox,
  successMessage: <p>Operacja wykonana pomyślnie</p>,
  className: classes.table,
  actionPosibility: () => true, // same as { create:true, delete:true, edit:true, }
  actionsLabel: `Akcje`,
  create: { label:`Dodaj`, className:`${dataTableButtonsClassName} ${classes.isCreate}` },
  delete: { label:`Usuń`, className:`${dataTableButtonsClassName} ${classes.isDelete}` },
  edit: { label:`Edytuj`, className:`${dataTableButtonsClassName} ${classes.isEdit}` },
}


export default ({ className = ``, group, platformId }) => {
  if (!platformId || !group?.id) {
    // console.warn( `Missing data in GroupSettings component:`, { platformId, groupId } )
    return null
  }

  const abilities = group.myRole?.abilities
  const groupId = group.id
  const queryData = useStaticQuery( query )
  const [ gradesScale, setGradesScale ] = useState( null )

  const updateGradesScale = async data => {
    const response = await put( URLS.GROUP$ID_GRADES_SCALE_PUT( groupId ), data )

    if (`error` in response) return response
    if (response?.success) setGradesScale( data.gradingScale.split( / +/ ).join( `, ` ) )
  }
  const createUser = async(data, addToTable) => {
    const response = await post( URLS.GROUP$ID_USERS_POST( groupId ), data )

    if (`error` in response) return response
    if (response?.success) addToTable( response.user )
  }
  const deleteUser = async(data, removeFromTable) => {
    const response = await del( URLS.GROUP$ID_USERS$ID_DELETE( groupId, data.id ) )

    if (`error` in response) return response
    if (response?.success) removeFromTable()
  }
  const createGrade = async(data, addToTable) => {
    const response = await post( URLS.GROUP$ID_GRADES_POST( groupId ), data )

    if (`error` in response) return response
    if (response?.success) addToTable( response.note )
  }
  const deleteGrade = async(data, removeFromTable) => {
    const response = await del( URLS.GROUP$ID_GRADES$ID_DELETE( groupId, data.id ) )

    if (`error` in response) return response
    if (response?.success) removeFromTable()
  }
  const createRole = async(data, addToTable) => {
    const { name, color, ...abilities } = data
    const response = await post( URLS.GROUP$ID_PERMISSIONS_POST( groupId ), {
      name,
      color: color ? parseInt( color.slice( 1 ), 16 ) : undefined,
      abilities,
    } )

    if (`error` in response) return response
    if (response?.success) addToTable( response.role )
  }
  const editRole = async(id, data) => {
    const { name, color, ...abilities } = data
    const response = await put( URLS.GROUP$ID_PERMISSIONS$ID_PUT( groupId, id ), {
      name,
      color: color ? parseInt( color.slice( 1 ), 16 ) : undefined,
      abilities,
    } )

    if (`error` in response) return response
  }
  const deleteRole = async(data, removeFromTable) => {
    const response = await del( URLS.GROUP$ID_PERMISSIONS$ID_DELETE( groupId, data.id ) )

    if (`error` in response) return response
    if (response?.success) removeFromTable()
  }
  const createMaterial = async(data, addToTable) => {
    const formData = new FormData()

    formData.append( `document`, data.file?.[ 0 ] )
    formData.append( `description`, data.description )

    const response = await post( URLS.GROUPS$ID_MATERIALS_POST( groupId ), formData )

    if (`error` in response) return response
    if (response?.success) addToTable( response.file )
  }
  const deleteMaterial = async(data, removeFromTable) => {
    const response = await del( URLS.GROUPS$ID_MATERIALS_DELETE( groupId, data.id ) )

    if (`error` in response) return response
    if (response?.success) removeFromTable()
  }
  const createTask = async(data, addToTable) => {
    const response = await post( URLS.GROUPS$ID_TASKS_POST( groupId ), {
      ...data,
      dateExpire: new Date(data.dateExpire).getTime(),
      dateStart: new Date(data.dateStart).getTime(),
    } )

    if (`error` in response) return response
    if (response?.success) addToTable( response.task )
  }
  const deleteTask = async(data, removeFromTable) => {
    const response = await del( URLS.GROUPS$ID_TASKS$ID_DELETE( groupId, data.id ) )

    if (`error` in response) return response
    if (response?.success) removeFromTable()
  }
  const createMeet = async(data, addToTable) => {
    const response = await post( URLS.MEET_POST(), { platformId, groupId, ...data } )

    if (`error` in response) return response
    if (response?.success) addToTable( response.meet )
  }
  const deleteMeet = async(data, removeFromTable) => {
    const response = await del( URLS.MEET$ID_DELETE( data.id ) )

    if (`error` in response) return response
    if (response?.success) removeFromTable()
  }

  useEffect( () => {
    get( URLS.GROUP$ID_GRADES_SCALE_GET( groupId ) ).then( r => r.scale.join( `, ` ) ).then( setGradesScale )
  }, [ getFromStorage( `groups list token` ) ] )

  return Object.values( abilities ).filter( Boolean ).length == 0 ? null : (
    <ToggableBox
      className={`${classes.actions} ${className}`}
      boxClassName={boxesClasses.wrapper}
      btnClassName={`neumorphizm is-button ${boxesClasses.switch}`}
      btnIsActiveClassname="is-active"
      btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
      closeLabel="Zamknij"
      closeBtnClassName={boxesClasses.close}
      fullScreened
      closeBtnClassName={boxesClasses.closeButton}
      closeLabel="X"
    >
      <SwitchBox
        classNames={{
          switch: `neumorphizm is-button ${boxesClasses.tabSwitch}`,
          switches: boxesClasses.tabsSwitches,
          activeSwitch: `is-active`,
        }}
      >
        {abilities.canEditDetails && (
          <Tab className={`is-centered ${boxesClasses.tabSwitch}`} name="Ogólne">
            <p>Skala ocen (wartości całkowite rozdzielone spacjami)</p>

            <Form classNames={{ it:`is-relative`, errorBox:boxesClasses.floatingErrorBox }}>
              <Text
                className={classes.input}
                name="gradingScale"
                value={get( URLS.GROUP$ID_GRADES_SCALE_GET( groupId ) ).then( r => r.scale.join( ` ` ) )}
                children="Skala ocen"
              />
              <Submit className={`neumorphizm is-button ${classes.button}`} handler={updateGradesScale}>Zaktualizuj</Submit>
            </Form>
          </Tab>
        )}

        {abilities.canManageNotes && (
          <Tab className={boxesClasses.tabSwitch} name="Oceny">
            {gradesScale && (
              <>
                <p>
                  Oceny możliwe do wystawienia:
                  {` `}
                  {gradesScale}
                </p>
                <br />
              </>
            )}

            <DataTable
              {...dataTableProps}
              getData={() => get( URLS.GROUP$ID_GRADES_GET( groupId ), `notes` )}
              onCreate={createGrade}
              onDelete={deleteGrade}
            >
              <Field label="Wartość" name="value">
                <Adder className={classes.adder} type="number" />
              </Field>

              <Field label="Opis" name="description">
                <Adder className={classes.adder} type="textarea" />
              </Field>

              <Field label="Student" name="userId" dataFieldname="user">
                <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
                <Adder
                  className={classes.adder}
                  type="select"
                  getData={() => {
                    return get( URLS.GROUP$ID_USERS_GET( groupId ), `users` )
                      .then( users => users.filter( ({ role }) => !role.abilities.canManageNotes ) )
                  }}
                />
              </Field>
            </DataTable>
          </Tab>
        )}

        {abilities.canManageUsers && (
          <Tab className={boxesClasses.tabSwitch} name="Użytkownicy">
            <DataTable
              {...dataTableProps}
              getData={() => {
                return get( URLS.GROUP$ID_USERS_GET( groupId ), `users` )
                  .then( users => users.filter( ({ id }) => id != group.lecturer.id ) )
              }}
              onCreate={createUser}
              onDelete={deleteUser}
            >
              <Field label="Użytkownik" name="userId" dataFieldname="user">
                <Processor entire render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
                <Adder
                  className={classes.adder}
                  type="select"
                  getData={fields => {
                    const usersIds = fields.map( ({ id }) => id )

                    return get( URLS.PLATFORM$ID_USERS_GET( platformId ), `users` )
                      .then( users => users.filter( ({ id }) => id != group.lecturer.id && !usersIds.includes( id ) ) )
                  }}
                />
              </Field>

              <Field label="Rola" name="roleId" dataFieldname="role">
                <Processor render={({ id, name }) => ({ label:name, value:id })} />
                <Adder className={classes.adder} type="select" getData={() => get( URLS.GROUP$ID_PERMISSIONS_GET( groupId ), `roles` )} />
              </Field>
            </DataTable>
          </Tab>
        )}

        {abilities.canManageRoles && (
          <Tab className={boxesClasses.tabSwitch} name="Role">
            <DataTable
              {...dataTableProps}
              className={`${classes.table} ${classes.isRotated}`}
              getData={() => {
                return get( URLS.GROUP$ID_PERMISSIONS_GET( groupId ), `roles` ) // .then( console.log )
                  .then( perms => perms.filter( ({ name }) => name !== `Prowadzący` ) )
              }}
              onCreate={createRole}
              onEdit={editRole}
              onDelete={deleteRole}
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
                label="Zarządzanie ocenami"
                name="canManageNotes"
                dataFieldname="abilities"
                editable
              >
                <Processor render={({ canManageNotes }) => canManageNotes} />
                <Adder className={classes.adder} type="checkbox" />
              </Field>

              <Field
                className={classes.ability}
                label="Zarządzanie spotkaniami"
                name="canManageMeets"
                dataFieldname="abilities"
                editable
              >
                <Processor render={({ canManageMeets }) => canManageMeets} />
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
            </DataTable>
          </Tab>
        )}

        {abilities.canEditDetails && (
          <Tab className={boxesClasses.tabSwitch} name="Materiały">
            <DataTable
              {...dataTableProps}
              getData={() => get( URLS.GROUPS$ID_MATERIALS_GET( groupId ), `materials` )}
              onCreate={createMaterial}
              onDelete={deleteMaterial}
            >
              <Field label="Plik" name="file">
                <Processor
                  entire
                  render={({ id, path, name }) => ({
                    label: <a className="link" download href={path}>{name.match( /\d+-(.*)/ )[ 1 ]}</a>,
                    value: id,
                  })}
                />
                <Adder className={classes.adder} type="file" />
              </Field>

              <Field label="Opis" name="description">
                <Adder className={classes.adder} type="textarea" />
              </Field>

              <Field disabled label="Wstawiający" name="userId" dataFieldname="user">
                <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
                <Adder
                  className={classes.adder}
                  type="select"
                  getData={() => {
                    const user = getUser()

                    return get( URLS.GROUP$ID_USERS_GET( groupId ), `users` )
                      .then( users => users.filter( ({ id }) => id == user.id ) )
                  }}
                />
              </Field>
            </DataTable>
          </Tab>
        )}

        {abilities.canEditDetails && (
          <Tab className={boxesClasses.tabSwitch} name="Zadania">
            <DataTable
              {...dataTableProps}
              getData={() => get( URLS.GROUPS$ID_TASKS_GET( groupId ), `tasks` )}
              onCreate={createTask}
              onDelete={deleteTask}
            >
              <Field label="Nazwa" name="title">
                <Adder className={classes.adder} type="text" />
              </Field>

              {/* <Field label="Czas rozpoczęcia" name="startDate">
                <Processor render={getDate} />
                <Adder className={classes.adder} type="datetime-local" />
              </Field> */}

              <Field label="Data oddania" name="dateExpire" dataFieldname="expire">
                <Processor render={getDate} />
                <Adder className={classes.adder} type="datetime-local" />
              </Field>

              <Field label="Opis" name="description">
                <Adder className={classes.adder} type="textarea" />
              </Field>
            </DataTable>
          </Tab>
        )}

        {abilities.canManageMeets && (
          <Tab className={boxesClasses.tabSwitch} name="Spotkania">
            <DataTable
              {...dataTableProps}
              getData={() => get( URLS.MEET_FROM_GROUP$ID_GET( groupId ), `meets` )}
              onCreate={createMeet}
              onDelete={deleteMeet}
            >
              <Field label="Data rozpoczęcia" name="dateStart">
                <Processor render={getDate} />
                <Adder className={classes.adder} type="datetime-local" />
              </Field>

              <Field label="Czas trwania" name="dateEnd">
                <Processor render={date => getDate( date, `hh:mm` )} />
                <Adder className={classes.adder} type="time" getData="01:00" />
              </Field>

              <Field label="Opis" name="description">
                <Adder className={classes.adder} type="textarea" />
              </Field>

              <Field label="Link" name="externalUrl">
                <Adder className={classes.adder} type="text" />
              </Field>
            </DataTable>
          </Tab>
        )}
      </SwitchBox>
    </ToggableBox>
  )
}
