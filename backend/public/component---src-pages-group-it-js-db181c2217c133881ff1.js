(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{"5kzk":function(e,t,a){"use strict";var r=a("q1tI"),n=a.n(r),l=a("Wbzz"),c=a("f23f"),s=a("X4fA"),m=a("Bl7J"),i=[{urn:"notes",name:"Oceny",permName:"isMaster"},{urn:"users",name:"Użytkownicy",permName:"isMaster"},{urn:"materials",name:"Materiały",permName:"isMaster"},{urn:"tasks",name:"Zadania",permName:"isMaster"},{urn:"meets",name:"Spotkania",permName:"isMaster"}],u=function(e,t){return i.filter((function(t){var a=t.permName;return!a||e[a]})).map((function(e){var a=e.urn,r=e.name;return n.a.createElement("li",{key:a,className:"list-item"},n.a.createElement(l.Link,{to:"/group/"+a+"?"+t},r))}))};t.a=function(e){var t=e.children,a=e.className,l=void 0===a?"":a,i=Object(c.f)(),o=i.get("platformId"),p=i.get("groupId"),f="platformId="+o+"&groupId="+p,d=Object(r.useState)(u(Object(s.c)(p)||{},f)),b=d[0],E=d[1];return Object(r.useEffect)((function(){Object(s.c)(p,(function(e){E(u(e||{},f))}))}),[p,f]),n.a.createElement(s.a,null,n.a.createElement(m.a,{className:"main_wrapper-splited"},n.a.createElement("nav",{className:"main_wrapper-splited-left_column"},b.length?n.a.createElement(n.a.Fragment,null,n.a.createElement("h2",null,"Panel ustawień"),n.a.createElement("ul",{className:"list"},b),n.a.createElement("hr",null)):null),n.a.createElement("article",{className:"main_wrapper-splited-right_column "+l},t)))}},ZKew:function(e,t,a){"use strict";a.r(t);var r=a("q1tI"),n=a.n(r),l=a("Wbzz"),c=a("5kzk"),s=a("f23f"),m=a("X4fA"),i=a("qQ7Z"),u=a("cA2t"),o=a("wx3x"),p=a.n(o),f=function(e,t){var a=e.id,r=e.dateStart,l=e.description;return n.a.createElement("li",{key:a},n.a.createElement(i.a,{title:Object(s.b)("YYYY.MM.DD - hh:mm",r),description:l,color:"#3e8bff",linkAddress:"/meet/it?"+t+"&meetId="+a}))},d=function(e,t){var a=e.id,r=(e.created,e.expire),l=(e.description,e.title);return n.a.createElement("li",{key:a},n.a.createElement(i.a,{title:Object(s.b)("YYYY.MM.DD - hh:mm",r),description:l,color:"#3e8bff",linkAddress:"/task/it?"+t+"&taskId="+a}))};t.default=function(){var e=Object(s.f)(),t="/platform/it?platformId="+e.get("platformId"),a=e.get("platformId"),i=e.get("groupId"),o="platformId="+a+"&groupId="+i,b=u.b.MEET_FROM_GROUP$ID_GET.replace(":groupId",i),E=u.b.GROUPS$ID_TASKS_GET.replace(":groupId",i);console.log({urlTasks:E});var k=Object(r.useState)((Object(m.b)({url:b})||{meets:[]}).meets.map((function(e){return f(e,o)}))),g=k[0],N=k[1],O=Object(r.useState)((Object(m.b)({url:E})||{tasks:[]}).tasks.map((function(e){return d(e,o)}))),w=O[0],h=O[1];return console.log(E),Object(r.useEffect)((function(){Object(m.b)({url:b,cb:function(e){var t=e.meets;return N(t.map((function(e){return f(e,o)})))}})}),[b,o]),Object(r.useEffect)((function(){Object(m.b)({url:E,cb:function(e){var t=e.tasks;return h(t.map((function(e){return d(e,o)})))}})}),[E,o]),console.log({tasksLis:w}),n.a.createElement(c.a,{className:"is-centered"},n.a.createElement(l.Link,{className:"return_link",to:t},"Powrót do widoku platformy"),n.a.createElement("article",{className:p.a.wrapper},n.a.createElement("article",{className:p.a.rightColumn},n.a.createElement("h2",null,"Spotkania"),n.a.createElement("ul",{className:"list"},g.length?g:"Nie należysz do żadnego spotkania")),n.a.createElement("article",{className:p.a.rightColumn},n.a.createElement("h2",null,"Zadania"),n.a.createElement("ul",{className:"list"},w.length?w:"Brak zadań"))))}},wx3x:function(e,t,a){e.exports={rightColumn:"group-module--rightColumn--ByMj0",wrapper:"group-module--wrapper--2dcHp"}}}]);
//# sourceMappingURL=component---src-pages-group-it-js-db181c2217c133881ff1.js.map