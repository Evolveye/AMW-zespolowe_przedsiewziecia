import React from "react"

import Layout from "../layouts/main.js"

export default () => (
  <Layout
    className="main_wrapper"
    header={({ className }) => <article className={className}>header</article>}
    nav={({ className }) =>    <article className={className}>nav</article>}
  >
    <h1
      className="h1" abc={1}
      def="12"
    >
      Platforma edukacyjna
    </h1>
    <small className="h1-small">Edukacja, szkolenia, spotkania, kursy</small>
  </Layout>
)
