import React, { useState } from "react"

export default ({ className = ``, btnClassName = ``, boxClassName = ``, btnContent, children }) => {
  const [ isButtonFocused, setBoxVisibility ] = useState( false )
  const [ isBoxFocused, setBoxFocus ] = useState( false )

  const toggleBoxVisibility = () => setBoxVisibility( isBoxVisible ? false : !isButtonFocused )

  const isBoxVisible = isButtonFocused || isBoxFocused

  return (
    <article className={className}>
      <button
        className={btnClassName}
        onPointerDown={toggleBoxVisibility}
        onKeyDown={({ key }) => key == ` ` && toggleBoxVisibility()}
        onBlur={() => setTimeout( () => setBoxVisibility( false ), 0 )}
      >
        {btnContent}
      </button>

      <section
        tabIndex="-1"
        onBlur={() => setBoxFocus( false )}
        onFocus={() => setBoxFocus( true )}
        style={{ display:(isBoxVisible ? `block` : `none`) }}
      >
        <div className={boxClassName}>
          {children}
        </div>
      </section>
    </article>
  )
}
