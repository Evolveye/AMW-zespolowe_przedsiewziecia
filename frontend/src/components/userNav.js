import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import URLS from "../utils/urls.js"
import { authFetch } from "../utils/auth.js"
import PlatformAccessor, { PlatformAdder } from "../models/platformAccessor.js"

import classes from "./userNav.module.css"
import { processUrn } from "../utils/functions.js"

const defaultAvatarSrc = processUrn( `/media/image/avatarDefault.jpg` )

const accessorsMap = platform => (
  <PlatformAccessor key={platform.id} platform={platform} />
)

export default ({ className }) => {
  const [platformsAccessors, setAccessors] = useState(
    (authFetch({ url: URLS.PLATFORM_GET }) || { platforms: [] }).platforms
      .map(accessorsMap)
      .concat([<PlatformAdder key="platform adder" />])
  )

  useEffect(() => {
    authFetch({
      url: URLS.PLATFORM_GET,
      cb: ({ platforms }) =>
        setAccessors(
          platforms
            .map(accessorsMap)
            .concat([<PlatformAdder key="platform adder" />])
        ),
    })
  }, [])

  return (
    <nav className={className}>
      <div className={classes.avatarWrapper}>
        <img src={defaultAvatarSrc} alt="User avatar" />
      </div>

      <ul className="list">
        {[
          { urn: `me`, name: `Profil` },
          { urn: `settings`, name: `Ustawienia` },
          { urn: `notes`, name: `Zebrane oceny` },
          { urn: `logout`, name: `Wyloguj` },
        ].map(({ urn, name }) => (
          <li key={urn} className="list-item">
            <Link to={`/user/${urn}`}>{name}</Link>
          </li>
        ))}
      </ul>

      <hr />

      <ul className="list">
        <li className="list-item">
          <Link to="/">Strona główna</Link>
        </li>
      </ul>

      {platformsAccessors.length && (
        <>
          <hr />
          <section className={classes.platformsAccessors}>
            {platformsAccessors}
          </section>
        </>
      )}
    </nav>
  )
}
