import React, { useEffect, useRef, useState } from "react"

import classes from "./toggableBox.module.css"

export default ({
  className = ``,
  btnClassName = ``,
  boxClassName = ``,
  btnIsActiveClassname = ``,
  btnContent,
  fullScreened,
  children,
}) => {
  const [ isButtonFocused, setBoxVisibility ] = useState( false )
  const toggleBoxVisibility = () => setBoxVisibility( !isButtonFocused )
  const ref = useRef( null )

  useEffect( () => {
    const handleClickOutside = ({ target }) => {
      const node = ref.current

      if (node && (!node.contains( target ) || target.classList.contains( classes.fullscreen ))) {
        setBoxVisibility( false )
      }
    }

    document.addEventListener( `mousedown`, handleClickOutside )

    return () => document.removeEventListener( `mousedown`, handleClickOutside )
  }, [ ref ] )


  return (
    <article className={`${classes.wrapper} ${className}`} ref={ref}>
      <button
        className={`${btnClassName} ${isButtonFocused ? btnIsActiveClassname : ``}`}
        onPointerDown={toggleBoxVisibility}
        onKeyDown={({ key }) => key == ` ` && toggleBoxVisibility()}
      >
        {btnContent == null ? `toggle box` : btnContent}
      </button>

      <section style={{ display:(isButtonFocused ? `inline` : `none`) }}>
        {
          fullScreened ? (
            <div className={`${classes.box}`}>
              <div className={classes.fullscreen}>
                <div className={boxClassName}>
                  {children}
                </div>
              </div>
            </div>
          ) : (
            <div className={`${classes.box} ${boxClassName}`}>
              {children}
            </div>
          )
        }
      </section>
    </article>
  )
}
