import React from "react"
import { Link } from "@reach/router"

class RightContainerActiatedAccount extends React.Component {


    code = new URLSearchParams(document.location.search).get("code")


 render() {
  return <>
 <div className="right-container">
 <div className="index-logo">
     <Link to="/"><div className="logo"> </div></Link>
     <span className="logo-text1">Konto zostało aktywowane</span>
     <span className="logo-text2">
         Twój login to:
         <span class="login-text">{this.code}</span>
         </span>
 </div>
</div>
</>
    }
}
export default RightContainerActiatedAccount