import { useState } from "react"

if (true);

export const isBrowser = () => window !== undefined
export const useForceUpdate = () => {
  const [ v, setV ] = useState( 0 )

  return () => setV( v + 1 )
}
