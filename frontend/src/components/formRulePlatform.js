import React from "react"

import classes from "./formRule.module.css"
import "./formRule.css"
import { element } from "prop-types"
export default class FormRulePlatform extends React.Component {
  state = {
    added: false,
    name: "",
    roleNameTab: {

    }
  }


  templatePermissions = {
    name: "",
    color: "",
    importance: "",
    abilities: {
      canEditDetails: "",
      canDeletePlatform: "",
      canManageGroups: "",
      canManageUsers: "",
    }
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
    if(this.state.added === false){
      const template = `
      <td>
        <input type="text" name="name" value="${this.state.name}" onChange={this.handleInputChange} />
      </td>
      ${["canEditDetails",
      "canDeletePlatform",
      "canManageGroups",
      "canManageUsers"].map(ability => (
        <td key={ability}>
          <input type="checkbox" name={ability} onChange={e=>this.handleChange(e.target, this.state.name)}/>{" "}
        </td>
      ))}
      `
      const tableRef = document.getElementById('tableRoles').getElementsByTagName('tbody')[0];
      var newRow = tableRef.insertRow(tableRef.rows.length);
      newRow.innerHTML = template;
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
        color: null,
        importance: 5,
        abilities: {
          [input.name]: input.checked,
        }
      })
    }
    console.log(this.permissions)

    /*
    const myTab = document.getElementById('tableRoles').getElementsByTagName('tbody')[0];
    let name, color, importance, canEditDetails, canDeletePlatform, canManageGroups, canManageUsers;
    const newRowTemp = `<input type="text" name="name" value="${this.state.name}" onChange={this.handleInputChange} />`;
    console.log("myTab.rows.length: ", myTab.rows.length)
    for (let i = 0; i < myTab.rows.length; i++) {
      let objCells = myTab.rows.item(i).cells;
      const tabObjCells = Array.from(objCells);
      //console.log(tabObjCells)
      name = tabObjCells[0].innerHTML === newRowTemp?this.state.name : tabObjCells[0].innerHTML;
      color = null;
      importance = 5;
      canEditDetails = tabObjCells[1].getElementsByTagName('input')[0].checked ? true : false;
      //if(tabObjCells[1].getElementsByTagName('input')[0].checked) console.log(tabObjCells[1].getElementsByTagName('input')[0])
      
      canDeletePlatform = tabObjCells[2].getElementsByTagName('input')[0].checked ? true : false;
      canManageGroups = tabObjCells[3].getElementsByTagName('input')[0].checked ? true : false;
      canManageUsers = tabObjCells[4].getElementsByTagName('input')[0].checked ? true : false;
      console.log({canEditDetails, canDeletePlatform, canManageGroups, canManageUsers})
      this.templatePermissions['name'] = name;
      this.templatePermissions['color'] = color;
      this.templatePermissions['importance'] = importance;
      this.templatePermissions.abilities['canEditDetails'] = canEditDetails;
      this.templatePermissions.abilities['canDeletePlatform'] = canDeletePlatform;
      this.templatePermissions.abilities['canManageGroups'] = canManageGroups;
      this.templatePermissions.abilities['canManageUsers'] = canManageUsers;
      //console.log("templatePermissions",this.templatePermissions)
      this.permissions.push(this.templatePermissions)
      //console.log("permissions",this.permissions)
    }
    //console.log("permissions",this.permissions)
    */
  }

  permissions = [];

  /*
  permissions=[
    {
      name: "owner",
      color: null,
      importance: 5,
      abilities: {
        canEditDetails: true,
        canDeletePlatform: true,
        canManageGroups: true,
        canManageUsers: true,
      }
    },
    {
      name: "lecturer",
      color: null,
      importance: 5,
      abilities: {
        canEditDetails: false,
        canDeletePlatform: false,
        canManageGroups: true,
        canManageUsers: true,
      }
    },
  ]
*/

  availableRoles = {
    canEditDetails: "Edycja szczegółów",
    canDeletePlatform: "Usuwanie platformy",
    canManageGroups: "Zarządzanie grupami",
    canManageUsers: "Zarządzanie użytkownikami",
    key: function(n) {
      return this[Object.keys(this)[n]];
    }
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
          <tr>
            <td>Właściciel</td>
            {["canEditDetails",
              "canDeletePlatform",
              "canManageGroups",
              "canManageUsers"].map(ability => (
                <td key={ability}>
                  <input type="checkbox" name={ability} onChange={e=>this.handleChange(e.target, "Właściciel")}/>{" "}
                </td>
              ))}
          </tr>
          <tr>
            <td>Nauczyciel</td>
            {["canEditDetails",
              "canDeletePlatform",
              "canManageGroups",
              "canManageUsers"].map(ability => (
                <td key={ability}>
                  <input type="checkbox" name={ability} onChange={e=>this.handleChange(e.target, "Nauczyciel")}/>{" "}
                </td>
              ))}
          </tr>
          <tr>
            <td>Student</td>
            {["canEditDetails",
              "canDeletePlatform",
              "canManageGroups",
              "canManageUsers"].map(ability => (
                <td key={ability}>
                  <input type="checkbox" name={ability} onChange={e=>this.handleChange(e.target, "Student")}/>{" "}
                </td>
              ))}
          </tr>
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
