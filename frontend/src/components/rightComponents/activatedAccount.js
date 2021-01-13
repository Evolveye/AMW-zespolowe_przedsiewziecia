import React from "react"
import { Link } from "@reach/router"
import {isBrowser} from "../../services/auth"
import { BACKEND_REGISTER_CONFIRM } from "../../config.js"

export default class RightContainerActiatedAccount extends React.Component {
    code = !isBrowser() ? "" : new URLSearchParams(window.location.search).get("code")

    /** @param {HTMLElement} container */
    handleContainer = container => {
        const text1 = container.querySelector( `.logo-text1` )
        const text2 = container.querySelector( `.logo-text2` )

        fetch( BACKEND_REGISTER_CONFIRM.replace( `:code`, this.code ) ).then( res => res.json() )
            .then( data => {
                if (data.error) {
                    text1.innerHTML = `Niepowodzenie!`
                    text2.innerHTML = `Aktywacja konta nie powiadoła się`
                } else {
                    text1.innerHTML = `Aktywowano!`
                    text2.innerHTML = `
                        Twój login to:
                        <span class="login-text">${this.code}</span>
                    `
                }

            } )
            .catch( err => {
                text1.innerHTML = `Niepowodzenie!`
                text2.innerHTML = `Aktywacja konta nie powiadoła się`
                console.error( `123: ${err}` )
             } )
    }

    render = () => <>
        <div className="right-container" ref={this.handleContainer}>
            <div className="index-logo">
                <Link to="/"><div className="logo"> </div></Link>
                <span className="logo-text1">Trwa aktywowanie konta</span>
                <span className="logo-text2"></span>
            </div>
        </div>
    </>
}