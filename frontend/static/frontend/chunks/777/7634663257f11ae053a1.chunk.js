"use strict";(self.webpackChunksgp=self.webpackChunksgp||[]).push([[777],{48777:(e,t,n)=>{n.r(t),n.d(t,{default:()=>le});n(47042),n(43371),n(33321),n(79753),n(82526),n(41817),n(32165),n(91038),n(74916),n(69070),n(47941),n(38880),n(89554),n(54747),n(49337),n(82772),n(35666),n(66992),n(41539),n(88674),n(78783),n(33948),n(21249),n(92222),n(56977),n(68309),n(57327);var r=n(67294),a=n(34144),l=(n(27484),n(42705),n(42919)),o=n(23455),i=n(28479),c=n(96579),u=n(75950),s=n(27279),d=n(39144),m=n(38272),f=n(11382),p=n(71577),y=n(74962),g=n(7085),b=n(63386),v=n(54397),E=(n(96641),n(26402)),h=n(5368),w=n(92080),x=n(32787),k=n(19650),_=n(36904);function O(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function S(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?O(Object(n),!0).forEach((function(t){j(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):O(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function j(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function P(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==n)return;var r,a,l=[],o=!0,i=!1;try{for(n=n.call(e);!(o=(r=n.next()).done)&&(l.push(r.value),!t||l.length!==t);o=!0);}catch(e){i=!0,a=e}finally{try{o||null==n.return||n.return()}finally{if(i)throw a}}return l}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return C(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return C(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function C(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function F(e,t,n,r,a,l,o){try{var i=e[l](o),c=i.value}catch(e){return void n(e)}i.done?t(c):Promise.resolve(c).then(r,a)}function Z(e){return function(){var t=this,n=arguments;return new Promise((function(r,a){var l=e.apply(t,n);function o(e){F(l,r,a,o,i,"next",e)}function i(e){F(l,r,a,o,i,"throw",e)}o(void 0)}))}}var R=function(e,t){return(0,b.J1)({},e,t).unknown(!0)},D=function(){var e=Z(regeneratorRuntime.mark((function e(t){var n,r,a,i;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.produto_id,r=t.agg_id,e.next=3,(0,l.SD)({url:"".concat(o.T5,"/tempaggofabricolookup/"),filter:{status:0,produto_id:n,agg_id:r},parameters:{group:!1},sort:[]});case 3:return a=e.sent,i=a.data.rows,e.abrupt("return",i);case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();const A=function(e){var t,n=e.setFormTitle,a=e.parentRef,c=e.closeParent,u=e.parentReload,s=e.wrapForm,d=void 0===s?"form":s,m=e.forInput,f=void 0===m||m,y=(0,r.useContext)(_.OFabricoContext),g=P(w.Z.useForm(),1)[0],b=P((0,r.useState)(!0),2),O=(b[0],b[1]),j=P((0,r.useState)(!1),2),C=j[0],F=j[1],A=P((0,r.useState)({}),2),I=(A[0],A[1]),z=P((0,r.useState)({error:[],warning:[],info:[],success:[]}),2),T=z[0],q=(z[1],P((0,r.useState)(!1),2)),B=q[0],N=(q[1],P((0,r.useState)((t=y.agg_id)?{key:"update",values:{id:t}}:{key:"insert",values:{}}),2)),W=N[0],V=(N[1],P((0,r.useState)({status:"none"}),2)),G=V[0],K=V[1],J=function(){var e=y.produto_id,t=(y.produto_cod,y.of_cod),r=y.agg_id;Z(regeneratorRuntime.mark((function a(){var l,o;return regeneratorRuntime.wrap((function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,D({produto_id:e,agg_id:r});case 2:l=a.sent,n&&n({title:"Agrupar Ordens Fabrico"}),o=l.filter((function(e){return e.id==r||e.agg_ofid_original==e.id})).map((function(e){return{checked:r===e.id?1:0,tempof_id:e.tempof_id,of_id:e.of_id,artigo_cod:e.item_cod,cliente_nome:e.cliente_nome,iorder:e.iorder,item_nome:e.item_nome,enabled:t!=e.of_id}})),g.setFieldsValue({aggs:o}),O(!1);case 7:case"end":return a.stop()}}),a)})))()};(0,r.useEffect)((function(){return J(),function(){}}),[]);var L=function(){var e=Z(regeneratorRuntime.mark((function e(t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,l.SD)({url:"".concat(o.T5,"/savetempagg/"),parameters:S(S({},t),{},{agg_id:y.agg_id})});case 2:"error"!==(n=e.sent).data.status?(u({agg_id:y.agg_id},"init"),F(!1),c()):(F(!1),K(n.data));case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),U=function(){c()},Y=(0,r.useCallback)((function(){F(!0),g.submit()}),[]);return r.createElement(r.Fragment,null,r.createElement(E.Z,{result:G,successButtonOK:"insert"===W.key&&r.createElement(p.Z,{type:"primary",key:"goto-of",onClick:function(){"insert"===W.key&&(F(!1),g.resetFields(),J(),K({status:"none"}))}},"xxxx"),successButtonClose:r.createElement(p.Z,{key:"goto-close",onClick:function(){return U(!0)}},"Fechar"),errorButtonOK:r.createElement(p.Z,{type:"primary",key:"goto-ok",onClick:function(){F(!1),K({status:"none"})}},"OK"),errorButtonClose:r.createElement(p.Z,{key:"goto-close",onClick:U},"Fechar")},r.createElement(i.NH,{id:"el-external"}),r.createElement(v.Z,{formStatus:T}),r.createElement(w.Z,{form:g,name:"fps",onFinish:L,onValuesChange:function(e){I(e)},component:d},r.createElement(i.lt,{id:"LAY-AGG-UPSERT",guides:B,layout:"vertical",style:{width:"100%",padding:"0px"},schema:R,field:{forInput:f,wide:[16],margin:"2px",overflow:!1,guides:B,label:{enabled:!0,pos:"top",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!1},layout:{top:"",right:"",center:"",bottom:"",left:""},required:!0,style:{alignSelf:"center"}},fieldSet:{guides:B,wide:16,margin:!1,layout:"horizontal",overflow:!1}},r.createElement(w.Z.List,{name:"aggs"},(function(e,t){return function(e){if(null==e)throw new TypeError("Cannot destructure undefined")}(t),r.createElement(i.C3,{layout:"vertical",margin:!1},e.map((function(e,t){return r.createElement(i.C3,{key:e.key,field:{wide:[1]},margin:"0px 0px 3px 0px",padding:"5px",style:{border:"solid 1px #d9d9d9",borderRadius:"3px"}},r.createElement(i.gN,{forInput:!0,name:[e.name,"checked"],label:{enabled:!1}},r.createElement(i.ji,{disabled:!g.getFieldValue(["aggs",e.name,"enabled"])})),r.createElement(i.C3,{margin:!1,wide:15,layout:"vertical"},r.createElement(i.C3,{field:{wide:[5,5,6],forViewBorder:!1},margin:!1,wide:16,style:{fontWeight:700}},r.createElement(i.gN,{forInput:!1,name:[e.name,"of_id"],label:{enabled:!1}},r.createElement(x.Z,{disabled:!0,size:"small"})),r.createElement(i.gN,{forInput:!1,name:[e.name,"iorder"],label:{enabled:!1}},r.createElement(x.Z,{disabled:!0,size:"small"})),r.createElement(i.gN,{forInput:!1,name:[e.name,"artigo_cod"],label:{enabled:!1}},r.createElement(x.Z,{disabled:!0,size:"small"}))),r.createElement(i.C3,{field:{wide:[7,9],forViewBorder:!1},margin:!1,wide:16},r.createElement(i.gN,{forInput:!1,name:[e.name,"cliente_nome"],label:{enabled:!1}},r.createElement(x.Z,{disabled:!0,size:"small"})),r.createElement(i.gN,{forInput:!1,name:[e.name,"item_nome"],label:{enabled:!1}},r.createElement(x.Z,{disabled:!0,size:"small"})))))})))})))),a&&r.createElement(h.Z,{elId:a.current},r.createElement(k.Z,null,r.createElement(p.Z,{disabled:C,type:"primary",onClick:Y},"Guardar")))))};n(27171);var I,z,T=n(85227),q=["form","guides","schema"];function B(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}function N(e,t,n,r,a,l,o){try{var i=e[l](o),c=i.value}catch(e){return void n(e)}i.done?t(c):Promise.resolve(c).then(r,a)}function W(e){return function(){var t=this,n=arguments;return new Promise((function(r,a){var l=e.apply(t,n);function o(e){N(l,r,a,o,i,"next",e)}function i(e){N(l,r,a,o,i,"throw",e)}o(void 0)}))}}function V(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function G(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?V(Object(n),!0).forEach((function(t){K(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):V(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function K(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function J(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==n)return;var r,a,l=[],o=!0,i=!1;try{for(n=n.call(e);!(o=(r=n.next()).done)&&(l.push(r.value),!t||l.length!==t);o=!0);}catch(e){i=!0,a=e}finally{try{o||null==n.return||n.return()}finally{if(i)throw a}}return l}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return L(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return L(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function L(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function U(e,t){return t||(t=e.slice(0)),Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(t)}}))}var Y=s.Z.Panel,M=r.lazy((function(){return Promise.all([n.e(216),n.e(625)]).then(n.bind(n,16625))})),$=r.lazy((function(){return Promise.all([n.e(216),n.e(733)]).then(n.bind(n,51733))})),H=r.lazy((function(){return n.e(438).then(n.bind(n,87438))})),Q=r.lazy((function(){return Promise.all([n.e(216),n.e(269)]).then(n.bind(n,39269))})),X=(0,a.ZP)(d.Z)(I||(I=U(["\n    .ant-card-body{\n        height:250px;\n        max-height:400px; \n        overflow-y:hidden;\n    }\n\n"]))),ee=(0,a.ZP)(s.Z)(z||(z=U(["\n\n    .ant-collapse-header{\n        background-color:#f5f5f5;\n        border-radius: 2px!important;\n        padding:1px 1px!important;\n    }\n    .ant-collapse-content > .ant-collapse-content-box{\n        padding:15px 15px!important;\n    }\n\n"]))),te=function(e){var t=e.showWrapper,n=e.setShowWrapper,a=e.parentReload,l=J((0,r.useState)({}),2),o=l[0],c=l[1],s=(0,r.useRef)(),d=t.record,m=void 0===d?{}:d,f=function(){n((function(e){return G(G({},e),{},{show:!e.show})}))};return r.createElement(i.JE,{title:r.createElement(i.QF,{title:o.title,subTitle:o.subTitle}),type:t.mode,destroyOnClose:!0,width:800,mask:!0,setVisible:f,visible:t.show,bodyStyle:{height:"450px"},footer:r.createElement("div",{ref:s,id:"form-wrapper",style:{textAlign:"right"}})},r.createElement(u.Z,null,!t.type&&r.createElement(A,{setFormTitle:c,parentRef:s,closeParent:f,parentReload:a}),"paletes_stock"===t.type&&r.createElement(r.Suspense,{fallback:r.createElement(r.Fragment,null)},r.createElement(M,{setFormTitle:c,record:m,parentRef:s,closeParent:f,parentReload:a})),"schema"===t.type&&r.createElement(r.Suspense,{fallback:r.createElement(r.Fragment,null)},r.createElement($,{setFormTitle:c,record:m,parentRef:s,closeParent:f,parentReload:a})),"settings"===t.type&&r.createElement(r.Suspense,{fallback:r.createElement(r.Fragment,null)},r.createElement(H,{setFormTitle:c,record:m,parentRef:s,closeParent:f,parentReload:a})),"attachments"===t.type&&r.createElement(r.Suspense,{fallback:r.createElement(r.Fragment,null)},r.createElement(Q,{setFormTitle:c,record:m,parentRef:s,closeParent:f,parentReload:a}))))},ne=function(){var e=W(regeneratorRuntime.mark((function e(t,n){var r,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,l.SD)({url:"".concat(o.T5,"/tempaggofabricolookup/"),filter:{status:6,produto_id:t},sort:[],cancelToken:n});case 2:return r=e.sent,a=r.data.rows,e.abrupt("return",a);case 5:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),re=function(e){var t=e.item;return r.createElement("div",{style:{display:"flex",flexWrap:"wrap",flexDirection:"row-reverse"}},t.paletesstock&&t.paletesstock.map((function(e,n){return r.createElement("div",{style:{flex:"1 1 80px"},key:"ps-".concat(t.tempof_id,"-").concat(n)},e)})))},ae=function(e){var t,n,a=e.aggItem,l=e.setShowForm,o=e.of_id,c=JSON.parse(null==a?void 0:a.n_paletes),s=function(e){switch(e){case"paletes_stock":case"schema":case"settings":case"attachments":l((function(t){return G(G({},t),{},{type:e,mode:"drawer",show:!t.show,record:{aggItem:a,of_id:o}})}))}};return r.createElement(m.ZP.Item,null,r.createElement(X,{hoverable:!0,style:{width:"100%"},headStyle:{backgroundColor:"#002766",color:"#fff"},title:r.createElement("div",null,r.createElement("div",{style:{fontWeight:700,fontSize:"14px"}},a.of_id),r.createElement("div",{style:{color:"#fff",fontSize:".7rem"}},a.item_cod," - ",a.cliente_nome)),size:"small",actions:[r.createElement("div",{key:"settings",onClick:function(){return s("settings")},title:"Outras definições"},"Definições"),r.createElement("div",{key:"schema",onClick:function(){return s("schema")},title:"Paletização (Esquema)"},"Paletização"),r.createElement("div",{key:"paletes",onClick:function(){return s("paletes_stock")}},"Stock"),r.createElement("div",{key:"attachments",onClick:function(){return s("attachments")}},r.createElement("span",null,r.createElement(y.Z,null),"Anexos"))]},r.createElement(u.Z,null,r.createElement(i.C3,{wide:16,margin:!1,layout:"vertical"},r.createElement(ee,{defaultActiveKey:["1"],expandIconPosition:"right",bordered:!0},r.createElement(Y,{header:r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between",width:"80%"}},r.createElement("div",null,r.createElement("b",null,"Encomenda")),r.createElement("div",null,a.qty_encomenda," m²")),key:"1"},r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",null,a.linear_meters.toFixed(2)),r.createElement("div",null,"m/bobine")),r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",null,a.sqm_bobine.toFixed(2)),r.createElement("div",null,"m²/bobine")),r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",null,(a.qty_encomenda/a.sqm_bobine).toFixed(2)),r.createElement("div",null,"bobines")),(null==c?void 0:c.items)&&r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",null,c.total.n_paletes.toFixed(2)),r.createElement("div",null,"paletes")),(null==c?void 0:c.items)&&r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",null,c.total.sqm_contentor.toFixed(2)),r.createElement("div",null,"m²/contentor")),(null==c?void 0:c.items)&&r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",null,(a.qty_encomenda/c.total.sqm_contentor).toFixed(2)),r.createElement("div",null,"contentores"))),r.createElement(Y,{header:r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between",width:"80%"}},r.createElement("div",null,r.createElement("b",null,"Paletização"))),key:"2"},(null==c?void 0:c.items)&&c.items.map((function(e,t){return r.createElement("div",{style:{borderBottom:"20px"},key:"pc-".concat(a.name,"-").concat(e.id)},r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between",borderBottom:"solid 1px #d9d9d9"}},r.createElement("div",null,r.createElement("b",null,"Palete")," ",t+1),r.createElement("div",null,r.createElement("b",null,"Bobines")," ",e.num_bobines)),r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",{style:{color:"#595959"}},"m²"),r.createElement("div",null,e.sqm_palete.toFixed(2))),r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"}},r.createElement("div",{style:{color:"#595959"}},"Nº Paletes"),r.createElement("div",null,(c.total.n_paletes/c.items.length).toFixed(2))))})),r.createElement(T.ZP,{items:a,width:"100%",height:"100%"})),(null==a||null===(t=a.paletesstock)||void 0===t?void 0:t.length)&&r.createElement(Y,{header:r.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between",width:"80%"}},r.createElement("div",null,r.createElement("b",null,null==a||null===(n=a.paletesstock)||void 0===n?void 0:n.length," Paletes de Stock"))),key:"3"},r.createElement("div",{style:{height:"150px",overflowY:"hidden"}},r.createElement(u.Z,null,r.createElement(re,{item:a})))))))))};const le=function(e){!function(e){if(null==e)throw new TypeError("Cannot destructure undefined")}(e);var t=(0,r.useContext)(_.OFabricoContext),n=(t.form,t.guides),a=t.schema,o=B(t,q),u=J((0,r.useState)(!0),2),s=u[0],d=u[1],y=J((0,r.useState)({show:!1,type:null}),2),b=y[0],v=y[1],E=J((0,r.useState)([]),2),h=(E[0],E[1]),w=J((0,r.useState)(),2),x=w[0],k=w[1];(0,r.useEffect)((function(){var e=(0,l.BO)();return O({agg_id:o.agg_id,token:e}),function(){return e.cancel("Form Agg Cancelled")}}),[]);var O=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"init",n=e.agg_id,r=e.token;if("lookup"===t)d(!0),W(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=h,e.next=3,ne(o.produto_id,r);case 3:e.t1=e.sent,(0,e.t0)(e.t1),d(!1);case 6:case"end":return e.stop()}}),e)})))();else s||d(!0),W(regeneratorRuntime.mark((function e(){var t,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,ne(o.produto_id,r);case 2:a=e.sent,h(a),n&&null!==(t=a[0])&&void 0!==t&&t.v&&(a[0].v.filter((function(e){return e.id==n})),k(a[0].v.filter((function(e){return e.id==n})))),d(!1);case 7:case"end":return e.stop()}}),e)})))()};return r.createElement(r.Fragment,null,r.createElement(f.Z,{spinning:s,indicator:r.createElement(g.Z,{style:{fontSize:24},spin:!0}),tip:"A carregar..."},r.createElement(te,{showWrapper:b,setShowWrapper:v,parentReload:O}),r.createElement(i.lt,{id:"LAY-AGGS",guides:n,layout:"vertical",style:{width:"100%",padding:"0px"},schema:a,field:{margin:"2px",overflow:!1,guides:n,label:{enabled:!0,pos:"top",align:"start",vAlign:"center",width:"180px",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!0},layout:{top:"",right:"",center:"",bottom:"",left:""},addons:{},required:!0,style:{alignSelf:"top"}},fieldSet:{guides:n,wide:16,margin:"2px",layout:"horizontal",overflow:!1}},r.createElement(i.C3,{margin:!1},r.createElement(c.Z,{style:{width:"100%"},right:r.createElement(p.Z,{onClick:function(){v((function(e){return G(G({},e),{},{type:null,show:!e.show})}))}},"Agrupar")})),r.createElement(i.C3,{margin:!1},x&&r.createElement(m.ZP,{style:{width:"100%"},grid:{gutter:16,xs:1,sm:1,md:2,lg:2,xl:2,xxl:2},size:"small",dataSource:x,renderItem:function(e){return r.createElement(ae,{aggItem:e,of_id:o.of_id,setShowForm:v})}})))))}}}]);
//# sourceMappingURL=7634663257f11ae053a1.chunk.js.map