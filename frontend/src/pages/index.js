import React from "react"

import Layout from "../layouts/main.js"

export default () => (
  <Layout
    className="main_wrapper"
    settings={() => <article></article>}
    navElements={
      [
        { label:`abc`, link:`/` },
        { label:`def`, link:`/?a=1&b=2&c=3` },
        { label:`ghi`, link:`/?a=1` },
      ]
    }
    titlesPathConfig={
      {
        staticPath: [ { link:`/`, value:`Strona główna` } ],
        // queryPath: [
        //   { link:`/?a`,   queryParam:`a`, resolveValue:(v, k) => k },
        //   { link:`/?a&c`, queryParam:`c`, resolveValue:(v, k) => k },
        // ],
      }
    }
  >
    <h1 className="h1">
      Platforma edukacyjna
    </h1>
    <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
  </Layout>
)
