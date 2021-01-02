import React from "react"



const RightContainerProfile = () => (
  <div className="right-container-profile">
    <div className="right-container-profile-left">
      <div className="right-container-profile-left-text">
        <span>Przypięte przedmioty</span>
      </div>
      <div className="subjects-list">
        <div className="subject">
          <div className="subject-icon"></div>
          <div className="subject-name">Przedmiot 1</div>
        </div>
        <div className="subject">
          <div className="subject-icon"></div>
          <div className="subject-name">Przedmiot 2</div>
        </div>
      </div>
    </div>

    <div className="hr-vertical"></div>

    <div className="right-container-profile-right">
      <div className="calendar">
        <div className="calendar-header">
          <span>Kalendarz</span>
        </div>
      </div>
    </div>
  </div>
)
  export default RightContainerProfile