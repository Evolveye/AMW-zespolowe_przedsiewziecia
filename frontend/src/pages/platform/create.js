import React from "react"
import { navigate } from "gatsby"

import { BACKEND_PLATFORMS_CREATE_URL } from "../../config.js"
import ERRORS from "../../utils/errorList.js"
import { AuthorizedContent, getToken } from "../../utils/auth.js"

import Layout from "../../components/layout.js"
import Form from "../../components/form.js"

const fields = [
  { name:`name`, title:`Nazwa nowej platformy` },
  // { name:`description`, title:`Opis` },
  // { name:`password`, title:`Potwierdzenie hasłem`, type:"password" },
]

export default () => (
  <AuthorizedContent>
    <Layout className="main_wrapper" >
      <Form
        fields={fields}
        title="Tworzenie nowej platformy"
        submitName="Stwórz"
        method="POST"
        headers={{
          Authentication: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        }}
        address={BACKEND_PLATFORMS_CREATE_URL}
        onOk={({ platform }) => navigate( `/platform/it?platformId=${platform.id ?? 0}` )}
        onError={({ code }) => this.setState({ error: ERRORS[code] })}
      />
      {/* {this.state.error && <article className={classes.errorBox}>{this.state.error}</article>} */}
    </Layout>
  </AuthorizedContent>
)
