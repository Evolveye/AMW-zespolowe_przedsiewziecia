(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{"5kzk":function(e,t,r){"use strict";var a=r("q1tI"),n=r.n(a),o=r("Wbzz"),s=r("f23f"),c=r("X4fA"),l=r("Bl7J"),i=[{urn:"notes",name:"Oceny",permName:"isMaster"},{urn:"users",name:"Użytkownicy",permName:"isMaster"},{urn:"materials",name:"Materiały",permName:"isMaster"},{urn:"tasks",name:"Zadania",permName:"isMaster"},{urn:"meets",name:"Spotkania",permName:"isMaster"}],u=function(e,t){return i.filter((function(t){var r=t.permName;return!r||e[r]})).map((function(e){var r=e.urn,a=e.name;return n.a.createElement("li",{key:r,className:"list-item"},n.a.createElement(o.Link,{to:"/group/"+r+"?"+t},a))}))};t.a=function(e){var t=e.children,r=e.className,o=void 0===r?"":r,i=Object(s.f)(),d=i.get("platformId"),p=i.get("groupId"),m="platformId="+d+"&groupId="+p,f=Object(a.useState)(u(Object(c.c)(p)||{},m)),b=f[0],h=f[1];return Object(a.useEffect)((function(){Object(c.c)(p,(function(e){h(u(e||{},m))}))}),[p,m]),n.a.createElement(c.a,null,n.a.createElement(l.a,{className:"main_wrapper-splited"},n.a.createElement("nav",{className:"main_wrapper-splited-left_column"},b.length?n.a.createElement(n.a.Fragment,null,n.a.createElement("h2",null,"Panel ustawień"),n.a.createElement("ul",{className:"list"},b),n.a.createElement("hr",null)):null),n.a.createElement("article",{className:"main_wrapper-splited-right_column "+o},t)))}},SI9k:function(e,t,r){"use strict";r.r(t),r.d(t,"default",(function(){return p}));var a=r("dI71"),n=r("q1tI"),o=r.n(n),s=r("Wbzz"),c=r("f23f"),l=r("cA2t"),i=r("5kzk"),u=r("j3jx"),d=function(e){function t(){for(var t,r=arguments.length,a=new Array(r),n=0;n<r;n++)a[n]=arguments[n];return(t=e.call.apply(e,[this].concat(a))||this).render=function(){return o.a.createElement("input",{type:"datetime-local",onChange:function(e){var r=e.target;return t.props.onChange(r.name,r.value)}})},t}return Object(a.a)(t,e),t}(o.a.Component),p=function(e){function t(t){var r;(r=e.call(this,t)||this).render=function(){return o.a.createElement(i.a,{className:"is-centered"},o.a.createElement(s.Link,{className:"return_link",to:r.href},"Powrót do widoku grupy"),o.a.createElement("h1",null,"Grupa -- dodawanie zadań przez prowadzącego"),o.a.createElement(u.a,{fetchPostAddress:l.b.GROUPS$ID_TASKS_POST.replace(":groupId",r.groupId),fetchGetAddress:l.b.GROUPS$ID_TASKS_GET.replace(":groupId",r.groupId),fetchDeleteAddress:l.b.GROUPS$ID_TASKS_DELETE,deleteIdParameterName:":taskId",responseGetDataName:"tasks",responsePostDataName:"task",buttonAdd:"Dodaj zadanie",buttonDelete:"Usuń zadanie",staticPostBodyData:{groupId:r.groupId,platformId:r.platformId},objectsFields:[{name:"created",processor:function(e){return Object(c.b)("YYYY:MM:DD hh:mm",e)}},{name:"expire",processor:function(e){return Object(c.b)("YYYY:MM:DD hh:mm",e)}},"title","description"],titleFields:["Data rozpoczęcia","Data zakończenia","Nazwa","Opis"],inputFieldsComponents:{created:{component:d},expire:{component:d}}}))};var a=Object(c.f)();return r.groupId=a.get("groupId"),r.platformId=a.get("platformId"),r.href="/group/it?platformId="+r.platformId+"&groupId="+r.groupId,r}return Object(a.a)(t,e),t}(o.a.Component)},j3jx:function(e,t,r){"use strict";r.d(t,"a",(function(){return m}));var a=r("KQm4");function n(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}var o=r("dI71"),s=r("q1tI"),c=r.n(s),l=r("X4fA"),i=r("4DYZ"),u=r("f23f");function d(e,t){var r;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(r=function(e,t){if(!e)return;if("string"==typeof e)return p(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return p(e,t)}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var a=0;return function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(r=e[Symbol.iterator]()).next.bind(r)}function p(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,a=new Array(t);r<t;r++)a[r]=e[r];return a}var m=function(e){function t(){for(var t,r=arguments.length,o=new Array(r),s=0;s<r;s++)o[s]=arguments[s];return(t=e.call.apply(e,[this].concat(o))||this).state={error:"",rows:[],data:[],creatingLis:[],creationAllowed:!0},t.onFillListeners=[],t.updateNewField=function(e,r){var a;void 0===r&&(r=null);var n=e.target||e;t.setState(((a={})[r?e:n.name]=r||n.value,a))},t.deleteRow=function(e){Object(u.a)(t.props.fetchDeleteAddress.replace(t.props.deleteIdParameterName,e),{method:"DELETE",headers:{Authentication:"Bearer "+Object(l.f)()}}).then((function(r){var a=r.code,n=r.error,o=r.success;return n?console.error({code:a,error:n}):o?(t.setState((function(t){return{rows:t.rows.filter((function(t){return t.key!==e}))}})),t.onFillListeners.forEach((function(e){var t=e.ref,r=e.field;return t.current[r]()})),console.info({code:a,success:o})):void 0}))},t.sendCreationData=function(){var e=t.state,r=(e.error,e.rows,e.data,e.creatingLis,e.creationAllowed,n(e,["error","rows","data","creatingLis","creationAllowed"]));t.setCreatingElements(),t.setState({creationAllowed:!1});var a={Authentication:"Bearer "+Object(l.f)()},o=JSON.stringify(Object.assign({},r,t.props.staticPostBodyData));"multipart/form-data"===t.props.enctype?(o=new FormData,Object.entries(Object.assign({},r,t.props.staticPostBodyData)).forEach((function(e){var t=e[0],r=e[1];console.log({k:t,v:r}),o.append(t,r)}))):a["Content-Type"]="application/json",Object(u.a)(t.props.fetchPostAddress,{method:"POST",headers:a,body:o}).then((function(e){if(t.setState({creationAllowed:!0}),e.error){var r=e.code,a=e.error;return console.error({code:r,error:a}),t.setState({error:i.b[e.code]})}if(t.setState({error:""}),e.success){var n=e.code,o=e.success;return console.log({data:e}),console.info({code:n,success:o}),Object(u.c)()&&window.location.reload()}t.props.responsePostDataName&&t.addToTable(e[t.props.responsePostDataName])}))},t.addToTable=function(e){Array.isArray(e)||(e=[e]);var r=e.map((function(e){for(var r,a=[],n=d(t.props.objectsFields);!(r=n()).done;){var o=r.value;if("object"==typeof o){var s=o.processor||function(e){return e},l=o.alt||o.name,i=o.entire?e:e[l];a.push(c.a.createElement("td",{key:o.name},s(i)))}else a.push(c.a.createElement("td",{key:o},e[o]))}return c.a.createElement("tr",{key:e.id},a,c.a.createElement("td",null,t.props.buttonDelete?c.a.createElement("button",{type:"button",onClick:function(){return t.deleteRow(e.id)}},t.props.buttonDelete):null))}));t.setState((function(t){return{rows:[].concat(Object(a.a)(r),Object(a.a)(t.rows)),data:[].concat(Object(a.a)(e),Object(a.a)(t.data))}}))},t.setCreatingElements=function(){for(var e=[],r=0;r<t.props.objectsFields.length;++r){var a,n,o=t.props.objectsFields[r],s=o.name||o,l=null===(a=t.props.inputFieldsComponents)||void 0===a?void 0:a[s],i=null===(n=t.props.colSpans)||void 0===n?void 0:n[s],u=c.a.createElement("input",{onChange:t.updateNewField,name:s});if(i&&(r+=i-1),l)if("props"in l||(l.props={}),"string"==typeof l.component)u=c.a.createElement(l.component,Object.assign({name:s},l.props,{onChange:t.updateNewField}));else{var d=c.a.createRef();u=c.a.createElement(l.component,Object.assign({name:s},l.props,{onChange:t.updateNewField,getTableData:function(){return t.state.data},ref:d})),l.onTableFillTrigger&&t.onFillListeners.push({ref:d,field:l.onTableFillTrigger})}e.push(c.a.createElement("td",{key:Date.now()+"."+Math.random(),colSpan:i,className:"inputCell"},u))}t.setState({creatingLis:e})},t.render=function(){return c.a.createElement("table",{className:"table"},c.a.createElement("thead",{className:"thead"},c.a.createElement("tr",null,t.props.titleFields.map((function(e){return c.a.createElement("td",{key:e},e)})),c.a.createElement("td",null,"Akcja"))),c.a.createElement("tbody",null,c.a.createElement("tr",null,t.state.creatingLis,c.a.createElement("td",null,c.a.createElement("button",{type:"button",onClick:t.sendCreationData,disabled:!t.state.creationAllowed},t.props.buttonAdd))),c.a.createElement("tr",{className:"emptyRow"},c.a.createElement("td",{colSpan:"5"},t.state.error)),c.a.createElement("tr",{className:"emptyRow"}),t.state.rows))},t}return Object(o.a)(t,e),t.prototype.componentDidMount=function(){var e=this;this.setCreatingElements(),Object(u.a)(this.props.fetchGetAddress,{method:"GET",headers:{Authentication:"Bearer "+Object(l.f)()}}).then((function(t){if(t.error){var r=t.code,a=t.error;return console.error({code:r,error:a})}if(t.success){var n=t.code,o=t.success;return console.info({code:n,success:o})}e.addToTable(t[e.props.responseGetDataName]),e.onFillListeners.forEach((function(e){var t=e.ref,r=e.field;return t.current[r]()}))}))},t}(c.a.Component)}}]);
//# sourceMappingURL=component---src-pages-group-tasks-js-b95989d9e2ab27bed7c7.js.map