import React from "react"
import socket from "../../services/webSocket.js"


class RightContainerMyGrades extends React.Component {
  state = {
    grades:[]
  }

  data = {
    grades: []
  }

  avgE = 0;

  gradesElement = React.createRef()

  average = array => array.reduce((a, b) => a + b) / array.length

  componentDidMount() {
    RightContainerMyGrades.getData().then( arr => arr.map((a, index) =>
        <div
          className="grades-gained-container-grid-new-row"
          key={index}
        >
          <span className="grid-item przedmiot">
            {a.przedmiot}
          </span>
          <span className="grid-item prowadzacy">
            {a.prowadzacy}
          </span>
          <span className="grid-item oceny">
            {JSON.stringify(a.oceny).slice(1, -1)}
          </span>
          <span className="grid-item ocena-koncowa">
            {this.average(a.oceny).toFixed(2)}
          </span>
        </div>
    ) )
      .then( grades => this.setState( { grades } ) )
      .then( () => {
        /** @type {HTMLElement} */
        const gradesElement = this.gradesElement.current
        const gradesSelector = `.grades-gained-container .grades-gained-container-grid-new-row .grid-item.oceny`
        const allGrades = Array.from( gradesElement.querySelectorAll( gradesSelector ) )

        this.data.grades = allGrades.map( ({ textContent }) => textContent.split( /[, ]+/ ).map( Number ) )
      } )
      .then( () => {

        console.log("srednia w: ", this.average(this.data.grades[0]))
        for(let i=0;i<this.data.grades.length;i++)
        {
          this.avgE += this.average(this.data.grades[i])
        }
        this.avgE = this.avgE/this.data.grades.length
        document.getElementsByClassName('srednia-koncowa')[0].innerHTML += this.avgE.toFixed(2)
      } )
  }

  render = () => <>

    <div className="right-container-profile">
      <div className="right-container-profile-left">
        <div className="right-container-profile-left-text">
          <span>Przypięte przedmioty</span>
        </div>
        <div className="subjects-list">
          <div className="subject">
            <div className="subject-icon"></div>
            <div className="subject-name">Platforma A</div>
          </div>
          <div className="subject">
            <div className="subject-icon"></div>
            <div className="subject-name">Platofrma BC</div>
          </div>
        </div>
      </div>

      <div className="hr-vertical"></div>

      <div className="right-container-profile-right">
        <div className="grades" ref={this.gradesElement}>
          <div className="grades-filtre-container">
            <span>Filtruj oceny</span>
            <div className="grades-gained-container-grid">
              <span className="grid-item przedmiot">Przedmiot</span>
              <span className="grid-item prowadzacy">Prowadzący</span>
              <span className="grid-item oceny">Oceny</span>
              <span className="grid-item ocena-koncowa">Ocena końcowa</span>

              <div className="grades-gained-container-grid-new-row">
                <div className="grid-item przedmiot">
                  <input type="text" name="" placeholder="Wpisz..." />
                </div>
                <div className="grid-item prowadzacy">
                  <input type="text" name="" placeholder="Wpisz..." />
                </div>
                <div className="grid-item oceny">
                  <input type="text" name="" placeholder="Wpisz..." />
                </div>
                <div className="grid-item ocena-koncowa">
                  <input type="text" name="" placeholder="Wpisz..." />
                </div>
              </div>
            </div>
          </div>
          <div className="grades-gained-container">
            <span>Zebrane oceny</span>
            <div className="grades-gained-container-grid">
              <span className="grid-item przedmiot">Przedmiot</span>
              <span className="grid-item prowadzacy">Prowadzący</span>
              <span className="grid-item oceny">Oceny</span>
              <span className="grid-item ocena-koncowa">Ocena końcowa</span>

              {this.state.grades}

              <div className="grades-gained-container-grid-new-row">
                <span className="empty empty1"></span>
                <span className="empty empty2"></span>
                <span className="empty empty3"></span>
                <span className="grid-item srednia-koncowa">

                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>

static getData() {
  if(!socket) return new Promise(res => res([]))
  else return new Promise(resolve => {
    socket.on(`api.get.groups.notes`, resolve)
    socket.emit(`api.get.groups.notes`)
    // console.error("jesteś w moich ocenach, po 'socket.on(`api.get.users.me.notes`, resolve) socket.emit(`api.get.users.me.notes`)'")
  }).catch( console.error );
}
}
export default RightContainerMyGrades
