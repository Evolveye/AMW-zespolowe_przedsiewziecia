import { Link } from "gatsby"
import React from "react"



const PlatformSettigsGroup = () => {

    return (
        <div className="right-container-profile">
            <div className="right-container-profile-left">
                <div className="right-container-profile-left-text">
                    <span>Ustawienia grupy</span>
                </div>

                <div className="subjects-list"> 
                    <div className="subject">
                        <div className="subject-name"><Link to="/usersPlatform/">Użytkownicy</Link></div>
                    </div>
                    <div className="subject">
                        <div className="subject-name"><Link to="/platformGroups/">Oceny</Link></div>
                    </div>
                    <div className="subject">
                        <div className="subject-name">Role</div>
                    </div> 
                    <div className="subject">
                        <div className="subject-name"><Link to="/platformsGeneral/">Spotkania</Link></div>
                    </div>

                </div>
                </div>


                <div className="hr-vertical"></div>

                <div className="right-container-profile-right">
                    <div className="calendar">
                        <div className="calendar-header">
                            <span>Forum</span>
                        </div>
                    </div>
                </div>
            
        </div>
    )
}
export default PlatformSettigsGroup