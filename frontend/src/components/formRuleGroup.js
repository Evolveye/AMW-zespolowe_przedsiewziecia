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
    name: "",
    roleNameTab: {
    },
    permissions: [],
  }

  permissions = [];
  

  handleInputChange = event => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
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
      inputTd.addEventListener('change', this.handleInputChange);
      nameTd.appendChild(inputTd);
      newRow.appendChild(nameTd);
      abilities.forEach(ability => {
        const td = document.createElement(`td`);
        const input = document.createElement(`input`);

        input.type = `checkbox`;
        input.name = ability;
        input.addEventListener(`change`, e=>this.handleChange(e.target, this.state.name));
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
    e.preventDefault();
    //check that Dodaj rolę button was clicked
    if(this.state.added === false){
      //not clicked
      this.postDataPermissions();
    }else{
      //clicked
      if(this.state.name.length <= 0){
        //wrong - without name
        alert("UWAGA! Nie można wysłać roli bez nazwy!")
      }else{
        this.postDataPermissions();
      }
    }
  }

  postDataPermissions = () =>{
    fetch(URLS.GROUP$ID_PERMISSIONS_POST.replace(`:groupId`,this.groupId),{
      method: `POST`,
      headers: { Authentication: `Bearer ${getToken()}` },
      body: this.permissions,
    }).then(res => res.json()).then(response => console.log(response))
    console.log(this.permissions)
    console.log("poszło!")
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
  async componentDidMount(){
    console.log("adres GETa: ", URLS.GROUP$ID_PERMISSIONS_GET.replace(`:groupId`,this.groupId))

    const button =  document.querySelector('#button-Zapisz')
    button.disabled = true;

    const {permissions} = await fetch(URLS.GROUP$ID_PERMISSIONS_GET.replace(`:groupId`,this.groupId),{
      method: 'GET',
      headers: { Authentication: `Bearer ${getToken()}` }
    }).then(res => res.json())

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
    this.setState({permissions: trs})
  }
  
  render = () => (
    <form className={classes.formStyle}>
      <button className={classes.buttonRight} onClick={this.handleButtonAddRole}>Dodaj rolę</button>
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
