import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import SwitchBox, { Tab } from "../components/switchBox.js"
import ToggableBox from "../components/toggableBox.js"

import TableList, { Tr, Td } from "../components/tableList.js"
import DataTable, { Adder, Field, Processor } from "../components/dataTable.js"
import { fetchOrGet, getDate, getUrnQuery } from "../utils/functions.js"
import { QueryLink } from "./link.js"

import settingsClasses from "./settings.module.css"
import classes from "./groupsList.module.css"


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
  const { p, g } = getUrnQuery()
  const groups = fetchOrGet( `fake://groups` ).filter( ({ platformId }) => platformId == p )

  return (
    <article className={className}>
      <h2>Grupy</h2>
      <TableList className={classes.list}>
        {
          groups?.map( ({ id }) => (
            <Tr key={id} className={`is-highlightable ${classes.field}`}>
              <Td>
                {
                  Math.random() > .5 ? null : (
                    <ToggableBox
                      className={classes.actions}
                      boxClassName={settingsClasses.settings}
                      btnClassName={`neumorphizm is-button ${settingsClasses.settingsSwitch}`}
                      btnIsActiveClassname="is-active"
                      btnContent={<Image fluid={queryData.cog.childImageSharp.fluid} />}
                      fullScreened
                    >
                      <SwitchBox
                        classNames={{
                          switch: `neumorphizm is-button ${settingsClasses.settingsTabSwitch}`,
                          switches: settingsClasses.settingsTabsSwitches,
                          activeSwitch: `is-active`,
                        }}
                      >
                        <Tab className={settingsClasses.settingsTabSwitch} name="Ogólne">
                          Skala ocen
                        </Tab>

                        <Tab className={settingsClasses.settingsTabSwitch} name="Oceny">
                          <DataTable {...dataTableProps} getDataAddress={`fake://notes?groupId=${g}`}>
                            <Field label="Wartość" name="value">
                              <Adder className={classes.adder} type="number" />
                            </Field>

                            <Field label="Opis" name="description">
                              <Adder className={classes.adder} type="textarea" />
                            </Field>

                            <Field label="Student" name="userId">
                              <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
                              <Adder
                                className={classes.adder}
                                type="select"
                                getDataAddress="fake://platformUsers"
                              />
                            </Field>
                          </DataTable>
                        </Tab>

                        <Tab className={settingsClasses.settingsTabSwitch} name="Użytkownicy">
                          <DataTable {...dataTableProps} getDataAddress="fake://platformUsers">
                            <Field label="Użytkownik" name="user">
                              <Processor entire render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
                              <Adder className={classes.adder} type="select" getDataAddress="fake://platformUsers" />
                            </Field>

                            <Field label="Rola" name="role">
                              <Processor render={({ id, name }) => ({ label:name, value:id })} />
                              <Adder className={classes.adder} type="select" getDataAddress="fake://platformRoles" />
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
                              label="Zarządzanie użytkownikami"
                              name="canManageUsers"
                              dataFieldname="abilities"
                            >
                              <Processor render={({ canManageUsers }) => canManageUsers} />
                              <Adder className={classes.adder} type="checkbox" />
                            </Field>

                            <Field
                              className={classes.ability}
                              label="Zarządzanie ocenami"
                              name="canManageNotes"
                              dataFieldname="abilities"
                            >
                              <Processor render={({ canManageRoles }) => canManageRoles} />
                              <Adder className={classes.adder} type="checkbox" />
                            </Field>

                            <Field
                              className={classes.ability}
                              label="Zarządzanie spotkaniami"
                              name="canManageMeets"
                              dataFieldname="abilities"
                            >
                              <Processor render={({ canManageGroups }) => canManageGroups} />
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
                          </DataTable>
                        </Tab>

                        <Tab className={settingsClasses.settingsTabSwitch} name="Materiały">
                          <DataTable {...dataTableProps} getDataAddress={`fake://notes?groupId=${g}`}>
                            <Field label="Plik" name="file">
                              <Adder className={classes.adder} type="file" />
                            </Field>

                            <Field label="Opis" name="description">
                              <Adder className={classes.adder} type="textarea" />
                            </Field>

                            {/* TODO default disabled value */}
                            <Field label="Wstawiający" name="userId">
                              <Processor render={({ id, name, surname }) => ({ label:`${name} ${surname}`, value:id })} />
                              <Adder
                                className={classes.adder}
                                type="select"
                                getDataAddress="fake://platformUsers"
                              />
                            </Field>
                          </DataTable>
                        </Tab>

                        <Tab className={settingsClasses.settingsTabSwitch} name="Zadania">
                          <DataTable {...dataTableProps} getDataAddress="fake://meets">
                            <Field label="Nazwa" name="name">
                              <Adder className={classes.adder} type="text" />
                            </Field>

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

                        <Tab className={settingsClasses.settingsTabSwitch} name="Spotkania">
                          <DataTable {...dataTableProps} getDataAddress="fake://meets">
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

                            <Field label="Link" name="link">
                              <Adder className={classes.adder} type="text" />
                            </Field>
                          </DataTable>
                        </Tab>
                      </SwitchBox>
                    </ToggableBox>
                  )
                }
              </Td>

              <Td>
                <QueryLink
                  className={classes.link}
                  to="/group"
                  requiredParams={[ `p` ]}
                  params={[ { name:`g`, value:id } ]}
                >
                  {groups.find( g => g.id == id ).name}
                </QueryLink>
              </Td>
            </Tr>
          ) )
        }
        {/* <ul className={className}>
        <li>list item</li>
        <li>list item</li>
      </ul> */}
      </TableList>
    </article>
  )
}

