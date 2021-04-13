import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Image from "gatsby-image"

import SwitchBox, { Tab } from "../components/switchBox.js"
import ToggableBox from "../components/toggableBox.js"

import TableList, { Tr, Td } from "../components/tableList.js"
import { fetchOrGet, getUrnQuery } from "../utils/functions.js"
import { QueryLink } from "./link.js"

import settingsClasses from "./settings.module.css"
import classes from "./groupsList.module.css"

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
  const groups = fetchOrGet( `fake://groups` ).filter( ({ platformId }) => platformId == p )

  return (
    <article className={className}>
      <h2>Grupy</h2>
      <TableList className={classes.list}>
        {
          groups?.map( ({ id }) => (
            <Tr key={id} className={classes.field}>
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
                        <Tab name="Użytkownicy">
                          Jakaś tabelka z użytkownikami
                        </Tab>

                        <Tab name="Spotkania">
                          Jakaś tabelka ze spotkaniami
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

