import React from "react"
//import socket from "../../services/webSocket.js"
import { getToken } from "../../services/auth"
import { BACKEND_PLATFORMS_USERS_NOTES } from "../../config"

class RightContainerMyGrades extends React.Component {
  state = {
    grades: [],
    platformList: [],
  }

  data = {
    grades: [],
    average:'',
  }

  avgE = 0

  gradesElement = React.createRef()

  average = array => array.reduce((a, b) => a + b) / array.length

  handlePlatformClick = (platformTag, groups) => { 
    this.data.average = ""; 
    const table = groups.map(({ group, notes }, index) => { 
      const average =
       notes.reduce((avg, { value }) => parseFloat(avg) + parseFloat(value), 0) / notes.length 
      const notesElements = notes.map(({ value, description }, index) => <span key={index} title={description}>{value},</span>) 
      this.data.grades.push(average)
      this.data.average = this.data.grades.reduce((a, b) => a + b, 0) / this.data.grades.length

      return (
        <div className="grades-gained-container-grid-new-row" key={index}>
          <span className="grid-item przedmiot">{group.name}</span>
          <span className="grid-item prowadzacy">
            {group.lecturer.name} {group.lecturer.surname}
          </span>
          <span className="grid-item oceny">{notesElements}</span>
          <span className="grid-item ocena-koncowa">{average.toFixed(2)}</span>
        </div>
      )
    })
    this.setState({grades: table}); 
    //ref.innerHTML = table
  }

  componentDidMount() {
    RightContainerMyGrades.getData()
      .then(({ data }) => { 
        return data.map((platform, index) => (
          <div className="subject" key={index}>
            <div className="subject-icon"></div>
            <button
              className="subject-name"
              onClick={tag => this.handlePlatformClick(tag, platform.groups)}
            >
              {platform.platform.name}
            </button>
          </div>
        ))
      })
      .then(platformList => this.setState({ platformList }))

    // RightContainerMyGrades.getData()
    //   .then(({notes}) =>
    //     notes.map((a, index) => (
    //       <div className="grades-gained-container-grid-new-row" key={index}>
    //         <span className="grid-item przedmiot">{a.przedmiot}</span>
    //         <span className="grid-item prowadzacy">{a.prowadzacy}</span>
    //         <span className="grid-item oceny">
    //           {a.oceny.slice(1, -1)}
    //         </span>
    //         <span className="grid-item ocena-koncowa">
    //           {this.average(a.oceny).toFixed(2)}
    //         </span>
    //       </div>
    //     ))
    //   )
    //   .then(grades => this.setState({ grades }))
    //   .then(() => {
    //     /** @type {HTMLElement} */
    //     const gradesElement = this.gradesElement.current
    //     const gradesSelector = `.grades-gained-container .grades-gained-container-grid-new-row .grid-item.oceny`
    //     const allGrades = Array.from(
    //       gradesElement.querySelectorAll(gradesSelector)
    //     )

    //     this.data.grades = allGrades.map(({ textContent }) =>
    //       textContent.split(/[, ]+/).map(Number)
    //     )
    //   })
    //   .then(() => {
    //     for (let i = 0; i < this.data.grades.length; i++) {
    //       this.avgE += this.average(this.data.grades[i])
    //     }
    //     this.avgE = this.avgE / this.data.grades.length
    //     document.getElementsByClassName(
    //       "srednia-koncowa"
    //     )[0].innerHTML += this.avgE.toFixed(2)
    //   })
  }

  render = () => (
    <>
      <div className="right-container-profile">
        <div className="right-container-profile-left">
          <div className="right-container-profile-left-text">
            <span>Platformy</span>
            <br/>
            <span>z ocenami</span>
          </div>
          <div className="subjects-list">
            
            {this.state.platformList}
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
                  <span className="grid-item srednia-koncowa">{Number(this.data.average).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  static getData() {
    return fetch(BACKEND_PLATFORMS_USERS_NOTES, {
      method: "GET",
      headers: {
        Authentication: `Bearer ${getToken()}`,
      },
    }).then(res => res.json())
  }
  /*
  static getData() {
    if (!socket) return new Promise(res => res([]))
    else
      return new Promise(resolve => {
        socket.on(`api.get.groups.notes`, resolve)
        socket.emit(`api.get.groups.notes`)
        // console.error("jesteś w moich ocenach, po 'socket.on(`api.get.users.me.notes`, resolve) socket.emit(`api.get.users.me.notes`)'")
      }).catch(console.error)
  }
*/
}

export default RightContainerMyGrades
