import React from "react"

import svgUser from "../svg/user.svg"
import svgLock from "../svg/lock.svg"
import svgEmail from "../svg/email.svg"

// /** @type {React.CSSProperties} */
// const style = {
//   display: `block`,
//   backgroundColor: `#96d588`,
//   borderRadius: `50%`,
//   border: `1px solid #aaa`,
// }

function getIcon(name) {
  switch (name) {
    case `user`:
      return svgUser
    case `lock`:
      return svgLock
    case `email`:
      return svgEmail

    default:
      return null
  }
}

export default ({ classes = {}, data }) => {
  const { icon, title, name, type = `text`, autoComplete } = data
  const svgIcon = getIcon(icon)

  let jsx = null

  switch (type) {
    case `button`:
      jsx = (
        <button className={classes.button} type="button" name={name}>
          {title}
        </button>
      )
      break

    case `textarea`:
      jsx = (
        <textarea
          className={classes.textarea}
          name={name}
          placeholder={title}
        />
      )
      break

    default:
      jsx = (
        <label className={classes.label} key={name}>
          {svgIcon && (
            <img className={classes.icon} src={svgIcon} alt={title || type} />
          )}
          <input
            className={classes.input}
            type={type}
            name={name}
            placeholder={title}
            autoComplete={autoComplete}
          />
        </label>
      )
  }

  return jsx
  // ))
}

// let _ = [].map(field => {
//   const icon = Form.getIcon(field.icon)

//   if (icon) field.icon = icon
//   else delete field.icon

//   return field
// })
// .map(({ title = ``, type = `text`, name, icon, autoComplete = null }) => (
//   <label className={classes.label} key={name}>
//     {icon && (
//       <img className={classes.icon} src={icon} alt={title || type} />
//     )}
//     <input
//       className={classes.input}
//       type={type}
//       name={name}
//       placeholder={title}
//       autoComplete={autoComplete}
//     />
//   </label>
// ))
