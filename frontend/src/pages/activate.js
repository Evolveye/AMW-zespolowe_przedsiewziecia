import React, { useEffect, useState } from "react"

import Layout from "../components/layout.js"
import Sygnet from "../models/sygnet.js"
import { urlSearchParams } from "../utils/functions.js"
import URLS from "../utils/urls.js"

export default () => {
  const code = urlSearchParams().get(`code`)

  const [state, setState] = useState({})

  useEffect(() => {
    fetch(URLS.REGISTER_CONFIRM_POST.replace(`:code`, code))
      .then(res => res.json())
      .then(({ error, success }) => setState({ error, success }))
  }, [code])

  return (
    <Layout className="main_wrapper">
      <Sygnet size={200} />

      <h1 className="h1">Aktywacja konta</h1>

      <small className="h1-small">
        {state.error ? (
          <>
            <strong style={{ color: `red` }}>Błąd aktywacji</strong>. Kod jest
            niepoprawny.
          </>
        ) : state.success ? (
          <>
            <strong style={{ color: `lime` }}>Aktywacja powiodła się</strong>.
            Możesz teraz zalogować się na swoje konto.
          </>
        ) : (
          <>Trwa aktywacja..</>
        )}
      </small>
    </Layout>
  )
}
