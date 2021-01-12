import React from "react";
import { navigate } from "gatsby"
import { isLoggedIn } from "../../services/auth"

class RightContainerMain extends React.Component {

    state = {
        rerender: true
    }
    componentDidMount() {
        this.setState( { rerender:false } )
    }
    render() {
        if (this.state.rerender && isLoggedIn()) navigate(`/users/me`)
        return <>
            <div className="right-container">
                <div className="index-logo">
                    <div className="logo"></div>
                    <span className="logo-text1">Platforma Edukacyjna</span>
                    <span className="logo-text2">Edukacja, szkolenia, spotkania, kursy</span>
                </div>
            </div>
        </>
    }
}
export default RightContainerMain




  /*
  const RightContainerMain = () => (

    <div className="right-container">
            <div className="index-logo">
                <div className="logo"></div>
                <span className="logo-text1">Platforma Edukacyjna</span>
                <span className="logo-text2">Edukacja, szkolenia, spotkania, kursy</span>
            </div>
    </div>
  )

  export default RightContainerMain
  */