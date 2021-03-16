import React, { useState } from "react"
import { navigate, Link } from "gatsby"

import URLS from "../../utils/urls.js"
import ERRORS, { DEFAULT_ERROR } from "../../utils/errorList.js"
import { AuthorizedContent, getToken } from "../../utils/auth.js"
import { urlSearchParams } from "../../utils/functions.js"

import Layout from "../../components/layout.js"
import Form from "../../components/form.js"

const fields = [
  { name: `name`, title: `Nazwa nowej platformy` },
  // { name:`description`, title:`Opis` },
  // { name:`password`, title:`Potwierdzenie hasłem`, type:"password" },
]

export default () => {
  const platformId = urlSearchParams().get(`platformId`)
  const [error, setError] = useState(null)

  return (
    <AuthorizedContent>
      <Layout className="main_wrapper">
        <Link
          className="return_link"
          to={`/platform/it?platformId=${platformId}`}
        >
          Powrót do widoku platformy
        </Link>

        <Form
          fields={fields}
          title="Tworzenie nowej platformy"
          submitName="Stwórz"
          method="POST"
          headers={{
            Authentication: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          }}
          address={URLS.PLATFORM_POST}
          onOk={({ platform }) =>
            navigate(`/platform/it?platformId=${platform.id ?? 0}`)
          }
          onError={({ code }) => setError(ERRORS[code] || DEFAULT_ERROR)}
        />
        {error && <article className="errorBox">{error}</article>}
      </Layout>
    </AuthorizedContent>
  )
}