import React from "react"
import { useState } from "react"

export const isBrowser = () => window !== undefined
export const getUrnQuery = () => isBrowser()
  ? Object.fromEntries( Array.from( new URLSearchParams( window.location.search ) ) )
  : {}

export const useForceUpdate = () => {
  const [ v, setV ] = useState( 0 )

  return () => setV( v + 1 )
}
