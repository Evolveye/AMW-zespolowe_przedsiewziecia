import React from "react"
import URLS from "../utils/urls.js"
import classes from "./formRule.module.css"
import "./formRule.css"
import { getToken } from "../utils/auth.js"
import { urlSearchParams } from "../utils/functions.js"

export default class FormRuleGroup extends React.Component {
  constructor(props) {
    super(props)
    const query = urlSearchParams()
    this.platformId = query.get(`platformId`)
    this.groupId = query.get(`groupId`)
  }

  state = {
    added: false,
    checked: false,
    checkedNew: false,
    name: "",
    roleNameTab: {
    },
    permissions: [],
  }

  permissions = [];
  

  handleInputChange = event => {
    console.log("pisze")
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  handleCheckedNew = () =>{
    this.setState({checkedNew: true})
  }

  handleButtonAddRole = (e) =>{
    e.preventDefault();
    if(this.state.added === false){
      this.enableButton();
      const abilities = ["canEditDetails","canDelete","canManageUsers","canManageNotes", "canManageMeets","canManageRoles"];
      const tableRef = document.getElementById('tableRoles').getElementsByTagName('tbody')[0];
      const newRow = tableRef.insertRow(tableRef.rows.length);
      const nameTd = document.createElement(`td`);
      const inputTd = document.createElement(`input`);
      inputTd.type = `text`;
      inputTd.name = `name`;
      inputTd.value = this.state.name;
      inputTd.addEventListener('input',this.handleInputChange);
      nameTd.appendChild(inputTd);
      newRow.appendChild(nameTd);
      abilities.forEach(ability => {
        const td = document.createElement(`td`);
        const input = document.createElement(`input`);

        input.type = `checkbox`;
        input.name = ability;
        input.addEventListener(`change`, e=>this.handleChange(e.target, this.state.name), 'change', this.handleCheckedNew );
        td.appendChild(input);
        newRow.appendChild(td);
      })
      this.setState({added: true})
    }else{
      alert('Jednorazowo można dodać jedną rolę!')
    }
  }

  handleChange = (input, roleName) =>{
    this.enableButton();
    this.setState({checked: true});
    const permission = this.permissions.find(({name}) => name === roleName)
    if(permission){
      permission.abilities[input.name] = input.checked
    }else{
      this.permissions.push({
        name: roleName,
        abilities: {
          [input.name]: input.checked,
        }
      })
    }
    console.log(this.permissions)
  }

  handleSubmit = (e) => {
    
    this.disableButton();
    //check that Dodaj rolę button was clicked
    if(this.state.added === false){
      //not clicked
      this.putDataPermissions();
    }else{
      //clicked
      if(this.state.name.length <= 0){
        //wrong - without name
        alert("UWAGA! Nie można wysłać roli bez nazwy!")
      }else{
        console.log("checked: ", this.state.checked)
        if(this.state.checked) {this.putDataPermissions()};
        if(this.state.added && this.state.checkedNew) {this.postDataPermissions(1)};
        if(this.state.added && !this.state.checkedNew) {this.postDataPermissions(0)};
        alert("Aby zobaczyć zmiany odśwież stronę!")
      }
    }
  }

  putDataPermissions = () =>{
    console.log("GID",this.groupId)
    console.log("URL", URLS.GROUP$ID_PERMISSIONS_POST.replace(`:groupId`,this.groupId))
    console.log("SEND",{update: this.permissions})
    fetch(URLS.GROUP$ID_PERMISSIONS_POST.replace(`:groupId`,this.groupId),{
      method: `PUT`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({array:this.permissions}),
    }).then(res => res.json())
    console.log("to co wysyłam: ",this.permissions)
    console.log("poszło put!")
  }


  postDataPermissions = (checked) =>{
    let perm = "";
    if(checked === 1) perm = this.permissions
    if(checked === 0) perm = {name: this.state.name}
    fetch(URLS.GROUP$ID_PERMISSIONS_POST.replace(`:groupId`,this.groupId),{
      method: `POST`,
      headers: {
        Authentication: `Bearer ${getToken()}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({perm:perm}),
    }).then(res => res.json())
    console.log("to co wysyłam: ",JSON.stringify({array:this.state.name}))
    console.log("poszło post!")
  }

  availableRoles = {
    canEditDetails: "Edycja szczegółów",
    canDelete: "Usuwanie grupy",
    canManageUsers: "Zarządzanie użytkownikami",
    canManageNotes: "Zarządzanie ocenami",
    canManageMeets: "Zarządzanie spotkaniami",
    canManageRoles: "Zarządzanie rolami",
    key: function(n) {
      return this[Object.keys(this)[n]];
    }
  }

  enableButton = () =>{
    const button =  document.querySelector('#button-Zapisz')
    button.disabled = false;
  }
  disableButton = () =>{
    const button =  document.querySelector('#button-Zapisz')
    button.disabled = true;
}

  async componentDidMount(){
    console.log("adres GETa: ", URLS.GROUP$ID_PERMISSIONS_GET.replace(`:groupId`,this.groupId))

    const button =  document.querySelector('#button-Zapisz')
    button.disabled = true;

    const {permissions} = await fetch(URLS.GROUP$ID_PERMISSIONS_GET.replace(`:groupId`,this.groupId),{
      method: 'GET',
      headers: { Authentication: `Bearer ${getToken()}` }
    }).then(res => res.json())
      //.then(response => console.log("response: ", response))
    console.log("permissions: ",permissions)
    const trs =  permissions.map(({name, abilities}) => (
        <tr key={name}>
          <td>{name}</td>
            {Object.entries(abilities).map(([ability, isChecked]) => (
                <td key={ability}>
                    <input defaultChecked={isChecked} type="checkbox" name={ability} onChange={e=>this.handleChange(e.target, name)}/>
                </td>
            ))}
        </tr>
    ))
    console.log("to jest trs: ", trs)
    this.setState({permissions: trs})
  }
  
  render = () => (
    <form className={classes.formStyle}>
      <button disabled="true" className={classes.buttonRight} onClick={this.handleButtonAddRole}>Dodaj rolę</button>
      <br className={classes.clearBoth} />
      <table id="tableRoles">
        <thead>
          <tr>
            <th>Rola</th>
            <th>{this.availableRoles.key(0)}</th>
            <th>{this.availableRoles.key(1)}</th>
            <th>{this.availableRoles.key(2)}</th>
            <th>{this.availableRoles.key(3)}</th>
            <th>{this.availableRoles.key(4)}</th>
            <th>{this.availableRoles.key(5)}</th>
          </tr>
        </thead>
        <tbody>
          {this.state.permissions}
          </tbody>
          <tfoot>
          <tr>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td>
                <button className={classes.button} id="button-Zapisz" onClick={this.handleSubmit}>Zapisz</button>
            </td>
          </tr>
          </tfoot>
      </table>
    </form>
  )
}
