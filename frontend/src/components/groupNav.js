import { Link } from "gatsby"
import React from "react"

import classes from "./groupNav.module.css"

export default ({ className=``, showMeets }) => (
  <article className={`${classes.nav} ${className}`}>
    <section className={classes.groups}>
      <Link to="/group">group nav</Link>
    </section>

    <section className={classes.meets} hidden={!showMeets}>
      <Link to="/meet">meets</Link>
    </section>
  </article>
)
