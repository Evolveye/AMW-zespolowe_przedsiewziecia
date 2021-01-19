//import { Link } from "gatsby"
import React from "react"
import { navigate } from "gatsby"
import { getToken } from "../../services/auth"
import { BACKEND_PLATFORMS_GROUPS_MEET_ADD, BACKEND_PLATFORMS_GROUPS_MEET_GET, BACKEND_PLATFORMS_GROUPS_MEET_DEL } from "../../config"


class GroupMakeMeets extends React.Component {

    state = {
        dateStart: ``,
        dateEnd: ``,
        description: ``,
        externalUrl: ``,
        platformId: this.props.platformId,
        groupId: this.props.groupId,

        meetsList: [],
    }

    goBack = () => {
        navigate(-1)
      }

    handleUpdate = event => {
        this.setState({
          [event.target.name]: event.target.value,
        })
    } 

    handleDelete = (id) => {
        console.log("id do usunięcia: ", id)
        const reply = GroupMakeMeets.delData(id)
        reply.then(data => {
            if(data.error){
                alert("nie udało się usunąć spotkania")
                return null
            }
            const {del} = data
            console.log("usunieto spotkanie: ", del)
            alert("spotkanie zostało usunięte!")
        })
    }

    handleSubmit = event => {
        event.preventDefault()
        const {meetsList,...formData} = this.state
        const reply = GroupMakeMeets.setData(formData)
        reply.then(data =>{
            if(data.error){
                alert('Błąd podczas dodawania spotkania')
                return null
            }
            const {meet} = data
            console.log("spotkanie dodane: ", meet)
            alert("spotkanie zostało dodane")
        })

    }

    componentDidMount(){
        const reply = GroupMakeMeets.getData()
        reply.then(({meets})=>{
            if(meets.error){
                return null
            }
            console.log(meets)
            return meets.map((meet,index)=>(
                <div className="grades-gained-container-grid-new-row" key={index}> 
                    <div className="grid-item  empty-filtre-user"></div>
                    <div className="grid-item  imie">{meet.dateStart}</div>
                    <div className="grid-item  nazwisko">{meet.description}</div>
                    <div className="grid-item  email">{meet.dateEnd}</div>
                    <div className="grid-item  rola">{meet.externalUrl}</div>
                    <div className="grid-item  znak">
                    <input
                        type="submit"
                        className="delete" 
                        value="X"
                        onClick={() => this.handleDelete(meet.id)}
                    />    
                    </div> 
                </div> 
            ))
        }).then(meetsList => this.setState({meetsList}))
    }

  render = () => (
    <div className="right-container-settings">
    <div className="settings-header">
      <div className="back-main-view">
        <span
          onClick={this.goBack}
          onKeyDown={this.goBack}
          role="button"
          tabIndex="0"
        >
          Powrót do widoku głównego
        </span>
      </div>
    </div>
    <div className="platform-users">
      <div className="grid-filtre">
        <div className="filtre-add-meet-wrapp">
          <div className="grid-item  empty-filtre-user"></div>
          <div className="grid-item  imie">Data rozpoczęcia</div>
          <div className="grid-item  nazwisko">Opis</div>
          <div className="grid-item  email">Data zakończenia</div>
          <div className="grid-item  rola">Link do strony obsługującej spotkanie</div>
          <div className="grid-item  znak"></div>

          <div className="grades-gained-container-grid-new-row">
            <div className="grid-item  dodaj border-bottom-none">Filtruj</div>
            <div className="grid-item  imie">
              <input type="date" name="filtreDateStart" placeholder="Wybierz" />
            </div>
            <div className="grid-item nazwisko">
              <input
                type="text"
                name="filtreDateDesccription"
                placeholder="Wpisz..."
              />
            </div>
            <div className="grid-item email">
              <input type="date" name="filtreDateEnd" placeholder="Wybierz" />
            </div>
            <div className="grid-item  rola">
            <input type="text" name="filtreLink" placeholder="wpisz..." />
            </div>
            <div className="grid-item  znak border-bottom-none"></div>
          </div>

          <div className="grades-gained-container-grid-new-row">
            <div className="grid-item  dodaj border-bottom-none">Dodaj</div>
            <div className="grid-item  imie border-bottom-none">
              <input
                type="date"
                name="dateStart"
                placeholder="Wybierz" 
                onChange={this.handleUpdate}
              />
            </div>
            <div className="grid-item nazwisko border-bottom-none">
              <input
                type="text"
                name="description"
                placeholder="Wpisz..." 
                onChange={this.handleUpdate}
              />
            </div>
            <div className="grid-item email border-bottom-none">
              <input
                type="date"
                name="dateEnd"
                placeholder="Wybierz"
                onChange={this.handleUpdate}
              />
            </div>
            <div className="grid-item  rola border-bottom-none">
            <input
                type="text"
                name="externalUrl"
                placeholder="Wpisz..."
                onChange={this.handleUpdate}
              />
            </div>
            <div className="grid-item  znak border-bottom-none">
              <input
                type="submit"
                className="dodaj"
                value="+"
                onClick={this.handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid-users">
        <div className="filtre-add-user-wrapp">
          <div className="grid-item  empty-filtre-user"></div>
          <div className="grid-item  imie">Data rozpoczęcia</div>
          <div className="grid-item  nazwisko">Opis</div>
          <div className="grid-item  email">Data zakończenia</div>
          <div className="grid-item  rola">Link do strony obsługującej spotkanie</div>
          <div className="grid-item  znak"></div>

          {this.state.meetsList}
        </div>
      </div>
    </div>
  </div>
  )

  static setData(data){
      return fetch(BACKEND_PLATFORMS_GROUPS_MEET_ADD,{
        method: `POST`,
        headers: {
            "Content-Type": "application/json",
            Authentication: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(data),
      }).then(res => res.json())
  }

  static getData(){
    return fetch(BACKEND_PLATFORMS_GROUPS_MEET_GET, {
        method: `GET`,
        headers: {
          Authentication: `Bearer ${getToken()}`,
        },
      }).then(res => res.json())
  }

  static delData(id){
      return fetch(BACKEND_PLATFORMS_GROUPS_MEET_DEL.replace(':meetId',id),{
        method: `DELETE`,
        headers: { 
          "Authentication":`Bearer ${getToken()}`
        }, 
      } ).then( res => res.json() )
  }
}
export default GroupMakeMeets
