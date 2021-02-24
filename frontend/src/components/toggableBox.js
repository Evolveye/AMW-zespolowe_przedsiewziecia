import React, { useEffect, useRef, useState } from "react"

export default ({ className = ``, btnClassName = ``, boxClassName = ``, btnContent, children }) => {
  const [ isButtonFocused, setBoxVisibility ] = useState( false )
  const toggleBoxVisibility = () => setBoxVisibility( !isButtonFocused )
  const ref = useRef( null )

  useEffect( () => {
    const handleClickOutside = ({ target }) =>
      ref.current && !ref.current.contains( target ) && setBoxVisibility( false )

    document.addEventListener( `mousedown`, handleClickOutside )

    return () => document.removeEventListener( `mousedown`, handleClickOutside )
  }, [ ref ] )


  return (
    <article className={className} ref={ref}>
      <button
        className={btnClassName}
        onPointerDown={toggleBoxVisibility}
        onKeyDown={({ key }) => key == ` ` && toggleBoxVisibility()}
      >
        {btnContent || `toggle box`}
      </button>
      <section style={{ display:(isButtonFocused ? `block` : `none`) }}>
        <div className={boxClassName}>
          {children}
        </div>
      </section>
    </article>
  )
}
