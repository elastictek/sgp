"use strict";(self.webpackChunksgp=self.webpackChunksgp||[]).push([[295],{5295:(e,t,r)=>{r.r(t),r.d(t,{default:()=>Y});r(82526),r(41817),r(32165),r(78783),r(47042),r(68309),r(91038),r(74916),r(69070),r(47941),r(38880),r(89554),r(54747),r(49337),r(33321),r(88674),r(82772),r(57327),r(41539),r(66992),r(33948),r(92222),r(79753),r(35666);var n=r(67294),o=(r(27484),r(42705),r(42919)),a=r(23455),i=r(19258),l=r(96579),c=r(11382),u=r(71577),s=r(7085),f=r(8212),d=(r(15306),r(27207),r(21249),r(63386)),p=r(54397),m=r(26402),y=r(5368),g=r(41003),v=r(32787),h=r(70507),b=r(19650),w=r(66204);function E(e){return function(e){if(Array.isArray(e))return C(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||_(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function k(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=_(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,i=!0,l=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return i=e.done,e},e:function(e){l=!0,a=e},f:function(){try{i||null==r.return||r.return()}finally{if(l)throw a}}}}function S(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function O(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?S(Object(r),!0).forEach((function(t){j(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):S(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function x(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==r)return;var n,o,a=[],i=!0,l=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(a.push(n.value),!t||a.length!==t);i=!0);}catch(e){l=!0,o=e}finally{try{i||null==r.return||r.return()}finally{if(l)throw o}}return a}(e,t)||_(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _(e,t){if(e){if("string"==typeof e)return C(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?C(e,t):void 0}}function C(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function j(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function F(e,t,r,n,o,a,i){try{var l=e[a](i),c=l.value}catch(e){return void r(e)}l.done?t(c):Promise.resolve(c).then(n,o)}function P(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var a=e.apply(t,r);function i(e){F(a,n,o,i,l,"next",e)}function l(e){F(a,n,o,i,l,"throw",e)}i(void 0)}))}}var A=a.Zh.filter((function(e){return!(null!=e&&e.disabled)})),R=function(e,t){return(0,d.J1)({},e,t).unknown(!0)},I=function(){var e=P(regeneratorRuntime.mark((function e(t){var r,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,o.SD)({url:"".concat(a.T5,"/sellcustomerslookup/"),pagination:{limit:10},filter:j({},"fmulti_customer","%".concat(t.replaceAll(" ","%%"),"%"))});case 2:return r=e.sent,n=r.data.rows,e.abrupt("return",n);case 5:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();const Z=function(e){var t,r=e.record,l=e.setFormTitle,c=e.parentRef,s=e.closeParent,f=e.parentReload,d=e.wrapForm,S=void 0===d?"form":d,_=e.forInput,C=void 0===_||_,j=(0,n.useContext)(w.d),F=x(g.Z.useForm(),1)[0],Z=x((0,n.useState)(!0),2),T=(Z[0],Z[1]),N=x((0,n.useState)({}),2),D=(N[0],N[1]),V=x((0,n.useState)({error:[],warning:[],info:[],success:[]}),2),z=V[0],B=V[1],q=x((0,n.useState)(!1),2),M=q[0],L=q[1],U=x((0,n.useState)((t=r.artigospecs_id)?{key:"update",values:{id:t}}:{key:"insert",values:{}}),2),W=U[0],G=(U[1],x((0,n.useState)({status:"none"}),2)),J=G[0],K=G[1],Y=x((0,n.useState)([]),2),$=(Y[0],Y[1],function(){P(regeneratorRuntime.mark((function e(){var t,n,o,a,i,c;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("update"===W.key)l&&l({title:"Editar Especificações"}),F.setFieldsValue(O(O({},r.artigoSpecs),r.artigoSpecsItems));else{l&&l({title:"Novas Especificações ".concat(j.item_cod),subTitle:"".concat(j.item_nome)}),(t={}).nitems=A.length,n=k(A.entries());try{for(n.s();!(o=n.n()).done;)a=x(o.value,2),i=a[0],c=a[1],t["key-".concat(i)]=c.key,t["des-".concat(i)]=c.designacao}catch(e){n.e(e)}finally{n.f()}F.setFieldsValue(t)}T(!1);case 3:case"end":return e.stop()}}),e)})))()});(0,n.useEffect)((function(){$(!0)}),[]);var H=function(){var e=P(regeneratorRuntime.mark((function e(t){var n,i,l,c,u,s,d;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n={error:[],warning:[],info:[],success:[]},R().validate(t,{abortEarly:!1}).error){e.next=22;break}i=!1,e.t0=regeneratorRuntime.keys(t);case 5:if((e.t1=e.t0()).done){e.next=12;break}if(l=e.t1.value,void 0!==t[l]||"cliente_cod"===l||"designacao"===l){e.next=10;break}return i=!0,e.abrupt("break",12);case 10:e.next=5;break;case 12:if(i&&n.error.push({message:"Os items têm de estar preenchidos!"}),0!==n.error.length){e.next=22;break}return c=t.cliente_cod,u=(c=void 0===c?{}:c).value,s=c.label,e.next=19,(0,o.SD)({url:"".concat(a.T5,"/newartigospecs/"),parameters:O(O({},F.getFieldsValue(!0)),{},{produto_id:j.produto_id,cliente_cod:u,cliente_nome:s})});case 19:"error"!==(d=e.sent).data.status&&f({artigospecs_id:r.artigospecs_id},"init"),K(d.data);case 22:B(n);case 23:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),Q=function(){s()};return n.createElement(n.Fragment,null,n.createElement(m.Z,{result:J,successButtonOK:"insert"===W.key&&n.createElement(u.Z,{type:"primary",key:"goto-of",onClick:function(){"insert"===W.key&&(F.resetFields(),$(),K({status:"none"}))}},"Criar Novas Especificações"),successButtonClose:n.createElement(u.Z,{key:"goto-close",onClick:function(){return Q(!0)}},"Fechar"),errorButtonOK:n.createElement(u.Z,{type:"primary",key:"goto-ok",onClick:function(){K({status:"none"})}},"OK"),errorButtonClose:n.createElement(u.Z,{key:"goto-close",onClick:Q},"Fechar")},n.createElement(i.NH,{id:"el-external"}),n.createElement(p.Z,{formStatus:z}),n.createElement(g.Z,{form:F,name:"fps",onFinish:H,onValuesChange:function(e){D(e)},component:S},n.createElement(i.lt,{id:"LAY-SPECS-UPSERT",guides:M,layout:"vertical",style:{width:"100%",padding:"0px"},schema:R,field:{forInput:C,wide:[16],margin:"2px",overflow:!1,guides:M,label:{enabled:!0,pos:"top",align:"start",vAlign:"center",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!1},layout:{top:"",right:"",center:"",bottom:"",left:""},required:!0,style:{alignSelf:"top"}},fieldSet:{guides:M,wide:16,margin:"2px",layout:"horizontal",overflow:!1}},C&&n.createElement(n.Fragment,null,n.createElement(i.C3,{margin:!1,field:{wide:[6,8]}},n.createElement(i.gN,{name:"designacao",label:{enabled:!1}},n.createElement(v.Z,{placeholder:"Designação",size:"small"})),n.createElement(i.gN,{name:"cliente_cod",required:!1,layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!1,text:"Cliente",pos:"left"}},n.createElement(i.Fb,{placeholder:"Cliente",size:"small",keyField:"BPCNUM_0",textField:"BPCNAM_0",showSearch:!0,showArrow:!0,allowClear:!0,fetchOptions:I}))),n.createElement(i.qL,{height:"24px"})),!C&&n.createElement(n.Fragment,null,n.createElement(i.C3,{margin:!1,field:{wide:[9,7]}},n.createElement(i.gN,{name:"cliente_cod",required:!1,layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!1,text:"Cliente",pos:"left"}},n.createElement(i.Fb,{placeholder:"Cliente",size:"small",keyField:"BPCNUM_0",textField:"BPCNAM_0",showSearch:!0,showArrow:!0,allowClear:!0,fetchOptions:I}))),n.createElement(i.qL,{height:"24px"})),n.createElement(i.C3,{wide:16,margin:!1,layout:"vertical"},A.map((function(e,t){return n.createElement(i.C3,{key:"gop-".concat(t),wide:16,field:{wide:[7,9]},margin:!1},n.createElement(i.mZ,{label:{enabled:!1},style:{fontSize:"11px"}},n.createElement("b",null,e.designacao)," (",e.unidade,")"),n.createElement(i.C3,{wide:9,margin:!1},E(Array(e.nvalues)).map((function(t,r){return n.createElement(i.gN,{split:9,key:"".concat(e.key,"-").concat(r),name:"v".concat(e.key,"-").concat(r),label:{enabled:!1}},n.createElement(h.Z,{min:e.min,max:e.max,controls:!1,size:"small",precision:null==e?void 0:e.precision}))}))))}))))),c&&n.createElement(y.Z,{elId:c.current},n.createElement(b.Z,null,n.createElement(u.Z,{type:"primary",onClick:function(){return F.submit()}},"Guardar"),n.createElement(u.Z,{onClick:function(){return L(!M)}},M?"No Guides":"Guides")))))};var T=["form","guides","schema","fieldStatus"];function N(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=U(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,i=!0,l=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return i=e.done,e},e:function(e){l=!0,a=e},f:function(){try{i||null==r.return||r.return()}finally{if(l)throw a}}}}function D(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function V(e,t,r,n,o,a,i){try{var l=e[a](i),c=l.value}catch(e){return void r(e)}l.done?t(c):Promise.resolve(c).then(n,o)}function z(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var a=e.apply(t,r);function i(e){V(a,n,o,i,l,"next",e)}function l(e){V(a,n,o,i,l,"throw",e)}i(void 0)}))}}function B(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function q(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?B(Object(r),!0).forEach((function(t){M(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):B(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function M(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function L(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==r)return;var n,o,a=[],i=!0,l=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(a.push(n.value),!t||a.length!==t);i=!0);}catch(e){l=!0,o=e}finally{try{i||null==r.return||r.return()}finally{if(l)throw o}}return a}(e,t)||U(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function U(e,t){if(e){if("string"==typeof e)return W(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?W(e,t):void 0}}function W(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var G=function(e){var t=e.showWrapper,r=e.setShowWrapper,o=e.parentReload,a=L((0,n.useState)({}),2),l=a[0],c=a[1],u=(0,n.useRef)(),s=t.record,f=void 0===s?{}:s,d=function(){r((function(e){return q(q({},e),{},{show:!e.show})}))};return n.createElement(i.JE,{title:n.createElement(i.QF,{title:l.title,subTitle:l.subTitle}),type:"drawer",destroyOnClose:!0,mask:!0,setVisible:d,visible:t.show,width:800,bodyStyle:{height:"450px"},footer:n.createElement("div",{ref:u,id:"form-wrapper",style:{textAlign:"right"}})},n.createElement(Z,{setFormTitle:c,record:f,parentRef:u,closeParent:d,parentReload:o}))},J=function(){var e=z(regeneratorRuntime.mark((function e(t){var r,n,i,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.produto_id,n=t.token,e.next=3,(0,o.SD)({url:"".concat(a.T5,"/artigosspecslookup/"),filter:{produto_id:r},sort:[],cancelToken:n});case 3:return i=e.sent,l=i.data.rows,e.abrupt("return",l);case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),K=function(){var e=z(regeneratorRuntime.mark((function e(t){var r,n,i,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=t.artigospecs_id,n=t.token,r){e.next=3;break}return e.abrupt("return",[]);case 3:return e.next=5,(0,o.SD)({url:"".concat(a.T5,"/artigospecsitemsget/"),filter:{artigospecs_id:r},sort:[],cancelToken:n});case 5:return i=e.sent,l=i.data.rows,e.abrupt("return",l);case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();const Y=function(e){var t=e.changedValues,r=void 0===t?{}:t,a=(0,n.useContext)(w.d),d=a.form,p=a.guides,m=a.schema,y=(a.fieldStatus,D(a,T)),g=L((0,n.useState)(!0),2),v=g[0],h=g[1],b=L((0,n.useState)({show:!1}),2),E=b[0],k=b[1],S=L((0,n.useState)([]),2),O=S[0],x=S[1];(0,n.useEffect)((function(){var e=(0,o.BO)();return _({artigospecs_id:d.getFieldValue("artigospecs_id"),token:e}),function(){return e.cancel("Form Specs Cancelled")}}),[]),(0,n.useEffect)((function(){var e=(0,o.BO)();return"artigospecs_id"in r&&(h(!0),_({artigospecs_id:r.artigospecs_id,token:e})),function(){return e.cancel("Form Specs Cancelled")}}),[r]);var _=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"init",r=e.artigospecs_id,n=e.token;if("lookup"===t)h(!0),z(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=x,e.next=3,J({produto_id:y.produto_id,token:n});case 3:e.t1=e.sent,(0,e.t0)(e.t1),h(!1);case 6:case"end":return e.stop()}}),e)})))();else v||h(!0),z(regeneratorRuntime.mark((function e(){var t,o,a,i,l,c,u,s,f,p,m,g,v,b,w,E,k;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=O,!y.produto_id){e.next=6;break}return e.next=4,J({produto_id:y.produto_id,token:n});case 4:t=e.sent,x(t);case 6:if(!r){e.next=16;break}return o=t.filter((function(e){return e.id===r})),a=L(o,1),i=a[0],e.next=10,K({artigospecs_id:r,token:n});case 10:l=e.sent,c={nitems:l.length},u=N(l.entries());try{for(u.s();!(s=u.n()).done;){f=L(s.value,2),p=f[0],m=f[1],c["key-".concat(p)]=m.item_key,c["des-".concat(p)]=m.item_des,g="string"==typeof m.item_values?JSON.parse(m.item_values):m.item_values,v=N(g.entries());try{for(v.s();!(b=v.n()).done;)w=L(b.value,2),E=w[0],k=w[1],c["v".concat(m.item_key,"-").concat(E)]=k}catch(e){v.e(e)}finally{v.f()}}}catch(e){u.e(e)}finally{u.f()}i=q(q({},i),{},{cliente_cod:{key:i.cliente_cod,value:i.cliente_cod,label:i.cliente_nome}}),d.setFieldsValue({artigoSpecs:i,artigoSpecsItems:c});case 16:h(!1);case 17:case"end":return e.stop()}}),e)})))()},C=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];k(e?function(e){return q(q({},e),{},{show:!e.show,record:{},forInput:t})}:function(e){return q(q({},e),{},{show:!e.show,record:q({},d.getFieldsValue(["artigospecs_id","artigoSpecs","artigoSpecsItems"])),forInput:t})})};return n.createElement(n.Fragment,null,n.createElement(c.Z,{spinning:v,indicator:n.createElement(s.Z,{style:{fontSize:24},spin:!0}),tip:"A carregar..."},n.createElement(G,{showWrapper:E,setShowWrapper:k,parentReload:_}),n.createElement(i.lt,{id:"LAY-ARTIGOSPECS",guides:p,layout:"vertical",style:{width:"100%",padding:"0px"},schema:m,field:{margin:"2px",overflow:!1,guides:p,label:{enabled:!0,pos:"top",align:"start",vAlign:"center",width:"120px",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!0},layout:{top:"",right:"",center:"",bottom:"",left:""},addons:{},required:!0,style:{alignSelf:"top"}},fieldSet:{guides:p,wide:16,margin:"2px",layout:"horizontal",overflow:!1}},n.createElement(i.C3,null,n.createElement(l.Z,{style:{width:"100%"},left:n.createElement(i.C3,null,n.createElement(i.gN,{name:"artigospecs_id",layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!0,text:"Especificações",pos:"left"},addons:q({},d.getFieldValue("artigospecs_id")&&{right:n.createElement(u.Z,{onClick:function(){return C(!1,!0)},style:{marginLeft:"3px"},size:"small"},n.createElement(f.Z,{style:{fontSize:"16px"}}))})},n.createElement(i.mg,{size:"small",data:O,keyField:"id",textField:"designacao",optionsRender:function(e,t,r){return{label:n.createElement("div",{style:{display:"flex"}},n.createElement("div",{style:{minWidth:"150px"}},n.createElement("b",null,e[r])),n.createElement("div",null,"v.",e.versao)),value:e[t]}}}))),right:n.createElement(u.Z,{onClick:function(){return C(!0,!0)}},"Novas Especificações")})),n.createElement(i.C3,null,!v&&d.getFieldValue("artigospecs_id")&&n.createElement(Z,{record:d.getFieldsValue(!0),wrapForm:!1,forInput:!1,parentReload:_})))))}}}]);