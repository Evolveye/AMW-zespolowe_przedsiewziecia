(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{"5kzk":function(e,t,r){"use strict";var n=r("q1tI"),a=r.n(n),o=r("Wbzz"),s=r("f23f"),c=r("X4fA"),l=r("Bl7J"),i=[{urn:"settings",name:"Ustawienia grupy",permName:"isMaster"},{urn:"notes",name:"Oceny",permName:"isMaster"},{urn:"users",name:"Użytkownicy",permName:"isMaster"},{urn:"materials",name:"Materiały",permName:"isMaster"},{urn:"tasks",name:"Zadania",permName:"isMaster"},{urn:"meets",name:"Spotkania",permName:"isMaster"}],u=function(e,t){return i.filter((function(t){var r=t.permName;return!r||e[r]})).map((function(e){var r=e.urn,n=e.name;return a.a.createElement("li",{key:r,className:"list-item"},a.a.createElement(o.Link,{to:"/group/"+r+"?"+t},n))}))};t.a=function(e){var t=e.children,r=e.className,o=void 0===r?"":r,i=Object(s.g)(),p=i.get("platformId"),d=i.get("groupId"),m="platformId="+p+"&groupId="+d,f=Object(n.useState)(u(Object(c.c)(d)||{},m)),b=f[0],h=f[1];return Object(n.useEffect)((function(){Object(c.c)(d,(function(e){h(u(e||{},m))}))}),[d,m]),a.a.createElement(c.a,null,a.a.createElement(l.a,{className:"main_wrapper-splited"},a.a.createElement("nav",{className:"main_wrapper-splited-left_column"},b.length?a.a.createElement(a.a.Fragment,null,a.a.createElement("h2",null,"Panel ustawień"),a.a.createElement("ul",{className:"list"},b),a.a.createElement("hr",null)):null),a.a.createElement("article",{className:"main_wrapper-splited-right_column "+o},t)))}},j3jx:function(e,t,r){"use strict";r.d(t,"a",(function(){return m}));var n=r("KQm4");function a(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}var o=r("dI71"),s=r("q1tI"),c=r.n(s),l=r("X4fA"),i=r("4DYZ"),u=r("f23f");function p(e,t){var r;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(r=function(e,t){if(!e)return;if("string"==typeof e)return d(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return d(e,t)}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0;return function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(r=e[Symbol.iterator]()).next.bind(r)}function d(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var m=function(e){function t(){for(var t,r=arguments.length,o=new Array(r),s=0;s<r;s++)o[s]=arguments[s];return(t=e.call.apply(e,[this].concat(o))||this).state={error:"",rows:[],data:[],creatingLis:[],creationAllowed:!0},t.onFillListeners=[],t.updateNewField=function(e,r){var n;void 0===r&&(r=null);var a=e.target||e;t.setState(((n={})[r?e:a.name]=r||a.value,n))},t.deleteRow=function(e){Object(u.a)(t.props.fetchDeleteAddress.replace(t.props.deleteIdParameterName,e),{method:"DELETE",headers:{Authentication:"Bearer "+Object(l.f)()}}).then((function(r){var n=r.code,a=r.error,o=r.success;return a?console.error({code:n,error:a}):o?(t.setState((function(t){return{rows:t.rows.filter((function(t){return t.key!==e}))}})),t.onFillListeners.forEach((function(e){var t=e.ref,r=e.field;return t.current[r]()})),console.info({code:n,success:o})):void 0}))},t.sendCreationData=function(){var e=t.state,r=(e.error,e.rows,e.data,e.creatingLis,e.creationAllowed,a(e,["error","rows","data","creatingLis","creationAllowed"]));t.setCreatingElements(),t.setState({creationAllowed:!1});var n={Authentication:"Bearer "+Object(l.f)()},o=JSON.stringify(Object.assign({},r,t.props.staticPostBodyData));"multipart/form-data"===t.props.enctype?(o=new FormData,Object.entries(Object.assign({},r,t.props.staticPostBodyData)).forEach((function(e){var t=e[0],r=e[1];console.log({k:t,v:r}),o.append(t,r)}))):n["Content-Type"]="application/json",Object(u.a)(t.props.fetchPostAddress,{method:"POST",headers:n,body:o}).then((function(e){if(t.setState({creationAllowed:!0}),e.error){var r=e.code,n=e.error;return console.error({code:r,error:n}),t.setState({error:i.b[e.code]})}if(t.setState({error:""}),e.success){var a=e.code,o=e.success;return console.log({data:e}),console.info({code:a,success:o}),Object(u.c)()&&window.location.reload()}t.props.responsePostDataName&&t.addToTable(e[t.props.responsePostDataName])}))},t.addToTable=function(e){Array.isArray(e)||(e=[e]);var r=e.map((function(e){for(var r,n=[],a=p(t.props.objectsFields);!(r=a()).done;){var o=r.value;if("object"==typeof o){var s=o.processor||function(e){return e},l=o.alt||o.name,i=o.entire?e:e[l];n.push(c.a.createElement("td",{key:o.name},s(i)))}else n.push(c.a.createElement("td",{key:o},e[o]))}return c.a.createElement("tr",{key:e.id},n,c.a.createElement("td",null,t.props.buttonDelete?c.a.createElement("button",{type:"button",onClick:function(){return t.deleteRow(e.id)}},t.props.buttonDelete):null))}));t.setState((function(t){return{rows:[].concat(Object(n.a)(r),Object(n.a)(t.rows)),data:[].concat(Object(n.a)(e),Object(n.a)(t.data))}}))},t.setCreatingElements=function(){for(var e=[],r=0;r<t.props.objectsFields.length;++r){var n,a,o=t.props.objectsFields[r],s=o.name||o,l=null===(n=t.props.inputFieldsComponents)||void 0===n?void 0:n[s],i=null===(a=t.props.colSpans)||void 0===a?void 0:a[s],u=c.a.createElement("input",{onChange:t.updateNewField,name:s});if(i&&(r+=i-1),l)if("props"in l||(l.props={}),"string"==typeof l.component)u=c.a.createElement(l.component,Object.assign({name:s},l.props,{onChange:t.updateNewField}));else{var p=c.a.createRef();u=c.a.createElement(l.component,Object.assign({name:s},l.props,{onChange:t.updateNewField,getTableData:function(){return t.state.data},ref:p})),l.onTableFillTrigger&&t.onFillListeners.push({ref:p,field:l.onTableFillTrigger})}e.push(c.a.createElement("td",{key:Date.now()+"."+Math.random(),colSpan:i,className:"inputCell"},u))}t.setState({creatingLis:e})},t.render=function(){return c.a.createElement("table",{className:"table"},c.a.createElement("thead",{className:"thead"},c.a.createElement("tr",null,t.props.titleFields.map((function(e){return c.a.createElement("td",{key:e},e)})),c.a.createElement("td",null,"Akcja"))),c.a.createElement("tbody",null,c.a.createElement("tr",null,t.state.creatingLis,c.a.createElement("td",null,c.a.createElement("button",{type:"button",onClick:t.sendCreationData,disabled:!t.state.creationAllowed},t.props.buttonAdd))),c.a.createElement("tr",{className:"emptyRow"},c.a.createElement("td",{colSpan:"5"},t.state.error)),c.a.createElement("tr",{className:"emptyRow"}),t.state.rows))},t}return Object(o.a)(t,e),t.prototype.componentDidMount=function(){var e=this;this.setCreatingElements(),Object(u.a)(this.props.fetchGetAddress,{method:"GET",headers:{Authentication:"Bearer "+Object(l.f)()}}).then((function(t){if(t.error){var r=t.code,n=t.error;return console.error({code:r,error:n})}if(t.success){var a=t.code,o=t.success;return console.info({code:a,success:o})}e.addToTable(t[e.props.responseGetDataName]),e.onFillListeners.forEach((function(e){var t=e.ref,r=e.field;return t.current[r]()}))}))},t}(c.a.Component)},o5sh:function(e,t,r){"use strict";r.r(t);var n=r("dI71"),a=r("q1tI"),o=r.n(a),s=r("Wbzz"),c=r("f23f"),l=r("cA2t"),i=r("X4fA"),u=r("5kzk"),p=r("j3jx"),d=function(e){function t(){for(var t,r=arguments.length,n=new Array(r),a=0;a<r;a++)n[a]=arguments[a];return(t=e.call.apply(e,[this].concat(n))||this).render=function(){return o.a.createElement("input",{type:"file",name:t.props.name,onChange:function(e){var r=e.target;console.dir(r.files[0]),t.props.onChange(r.name,r.files[0])}})},t}return Object(n.a)(t,e),t}(o.a.Component),m=function(e){function t(){for(var t,r=arguments.length,n=new Array(r),a=0;a<r;a++)n[a]=arguments[a];return(t=e.call.apply(e,[this].concat(n))||this).state={user:null},t.render=function(){return o.a.createElement("input",{type:"text",disabled:!0,name:t.props.name,value:t.state.user?t.state.user.name+" "+t.state.user.surname:""})},t}return Object(n.a)(t,e),t.prototype.componentDidMount=function(){var e=this;Object(i.g)().then((function(t){return e.setState({user:t})}))},t}(o.a.Component);t.default=function(){var e=Object(c.g)(),t=e.get("groupId"),r="/group/it?platformId="+e.get("platformId")+"&groupId="+t;return o.a.createElement(u.a,{className:"is-centered"},o.a.createElement(s.Link,{className:"return_link",to:r},"Powrót do widoku grupy"),o.a.createElement("h1",null,"Grupa -- Materiały"),o.a.createElement(p.a,{fetchPostAddress:l.b.GROUPS$ID_FILE_POST.replace(":groupId",t),fetchGetAddress:l.b.GROUPS$ID_FILE_GET.replace(":groupId",t),fetchDeleteAddress:l.b.GROUPS$ID_FILE_DELETE.replace(":groupId",t),enctype:"multipart/form-data",deleteIdParameterName:":materialId",responseGetDataName:"fileDataset",responsePostDataName:"fileData",buttonAdd:"Wyślij plik",buttonDelete:"Usuń plik",staticPostBodyData:{},objectsFields:[{name:"file",alt:"filePath",entire:!0,processor:function(e){return o.a.createElement("a",{download:!0,href:"/"+e.path},e.name)}},{name:"user",processor:function(e){return e.name+" "+e.surname}},"description"],titleFields:["Plik","Dodał","Opis"],inputFieldsComponents:{file:{component:d,props:{name:"myFile"}},user:{component:m,props:{name:"user"}}}}))}}}]);
//# sourceMappingURL=component---src-pages-group-materials-js-c5c244d8cdd21afc43d2.js.map