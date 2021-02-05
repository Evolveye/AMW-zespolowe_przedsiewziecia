import React from "react"
import Image from "gatsby-image"

import styles from "./flatTile.module.css"
import getWrapper from "../components/link"

export default ({ className, fluid, src, alt, title, color, description, linkAddress }) =>
  <article>
    {
      getWrapper(
        `${styles.tile}${linkAddress ? ` ` + styles.link : ``}${className ? ` ` + className : ``}`,

        <>
          {src && <img className={styles.icon} src={src} alt={alt} />}
          {fluid && <Image className={styles.icon} fluid={fluid} alt={alt} />}

          <div className={styles.data}>
            <span className={styles.title} style={{ color }} >{title}</span>
            <span className={styles.description}>{description}</span>
          </div>
        </>,

        linkAddress
      )
    }
  </article>