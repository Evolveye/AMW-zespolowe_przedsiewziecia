import React from "react"

import Layout from "../../components/groupLayout.js"

// import classes from "./group.module.css"

export default () => (
  <Layout>
    <h1>Grupa -- użytkownicy</h1>

    {/* <TableForm
      fetchPostAddress={BACKEND_PLATFORMS_GROUPS_ADD}
      fetchGetAddress={BACKEND_PLATFORMS_GROUPS_GET.replace(`:platformId`, this.platformId)}
      fetchDeleteAddress={BACKEND_PLATFORMS_GROUPS_DEL}
      deleteIdParameterName=":groupId"
      responseGetDataName="groups"
      responsePostDataName="group"
      staticPostBodyData={{ platformId:this.platformId }}
      objectsFields={[
        `name`,
        { prop:`lecturer`, processor: obj => `${obj.name} ${obj.surname}` },
      ]}
      titleFields={[
        `Nazwa grupy`,
        `Prowadzący`,
      ]}
    /> */}
  </Layout>
)
