import React from "react"

const DEFAULT_ERROR = <span>Coś poszło nie tak</span>
const ERRORS = {
    100: <span>
        <strong style={{ color:`red` }}>Niepoprawne dane logowanie</strong>. Nie znaleziono użytkownika o podanym loginie lub haśle
    </span>,
}

export default new Proxy( ERRORS, {
    get( target, key ) {
        if (key in target) return target[ key ]

        console.info( `NIEOBSŁUGIWANY KOD BŁĘDU: ${key}` )

        return DEFAULT_ERROR
    }
} )