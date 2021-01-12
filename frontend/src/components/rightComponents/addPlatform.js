import React from "react"



export default class AddPlatform extends React.Component { 
 state = {
   name:'',
   description:'',
   password:'' 
 }

 handleUpdate = event => {
  this.setState({
    [event.target.name]: event.target.value,
  })
}
  render = () => 
  <div className="right-container-settings">
    <div className="settings-header">
      <div className="avatar-container">
      <div className="platform-adding"> 
     <div className="platform-adding-logo" title={this.state.description}>{this.state.name.substring(0,5)}</div> 
 </div>
      </div> 
    </div>

    <div className="hr-horizontal"></div>
    <div className="settings-form">
      <form method="post">
        <div className="settings-form-element">
          <div className="settings-form-element-label">Nazwa</div>
          <div className="settings-form-element-input">
            <input type="text" name="name" onChange={this.handleUpdate}/>
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label">Opis</div>
          <div className="settings-form-element-input">
            <textarea type="text" name="description" onChange={this.handleUpdate} />
          </div>
        </div>
       
        <div className="settings-form-element">
          <div className="settings-form-element-label">
            Potwierdź utworzenie hasłem
          </div>
          <div className="settings-form-element-input">
            <input type="password" name="password" onChange={this.handleUpdate}/>
          </div>
        </div>
        <div className="settings-form-element">
          <div className="settings-form-element-label"></div>
          <div className="settings-form-element-input settings-form-element-button">
            <input type="submit" value="Utwórz" />
          </div>
        </div>
      </form>
    </div>
  </div> 
}
