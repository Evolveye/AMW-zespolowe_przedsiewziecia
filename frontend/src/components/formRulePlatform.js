import React from "react"
import URLS from "../utils/urls.js"
import classes from "./formRule.module.css"
import "./formRule.css"
import { getToken } from "../utils/auth.js"
import { urlSearchParams } from "../utils/functions.js"
export default class FormRulePlatform extends React.Component {
  constructor(props) {
    super(props)
    const query = urlSearchParams()
    this.platformId = query.get(`platformId`)
  }


  state = {
    added: false,
    name: "",
    roleNameTab: {
    },
    permissions: [],
  }

  

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
    console.log(this.platformId)
    if(this.state.added === false){
      const abilities = ["canEditDetails","canDeletePlatform","canManageGroups","canManageUsers"];
      const tableRef = document.getElementById('tableRoles').getElementsByTagName('tbody')[0];
      const newRow = tableRef.insertRow(tableRef.rows.length);
      const nameTd = document.createElement(`td`);
      const inputTd = document.createElement(`input`);
      inputTd.type = `text`;
      inputTd.name = `name`;
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
    const permission = this.permissions.find(({name}) => name == roleName)
    console.log(input.name)
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

  permissions = [];

  availableRoles = {
    canEditDetails: "Edycja szczegółów",
    canDeletePlatform: "Usuwanie platformy",
    canManageGroups: "Zarządzanie grupami",
    canManageUsers: "Zarządzanie użytkownikami",
    key: function(n) {
      return this[Object.keys(this)[n]];
    }
  }

  async componentDidMount(){
    console.log("adres GETa: ", URLS.PLATFORM$ID_PERMISSIONS_GET.replace(`:platformId`,this.platformId))
    const {permissions} = await fetch(URLS.PLATFORM$ID_PERMISSIONS_GET.replace(`:platformId`,this.platformId),{
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
            <td>
                <button className={classes.button}>Zapisz</button>
            </td>
          </tr>
          </tfoot>
      </table>
    </form>
  )
}
