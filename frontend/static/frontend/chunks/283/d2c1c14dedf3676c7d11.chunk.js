"use strict";(self.webpackChunksgp=self.webpackChunksgp||[]).push([[283],{84283:(e,t,r)=>{r.r(t),r.d(t,{default:()=>U});r(82526),r(41817),r(32165),r(78783),r(47042),r(68309),r(91038),r(74916),r(69070),r(47941),r(38880),r(89554),r(54747),r(49337),r(33321),r(88674),r(82772),r(57327),r(41539),r(66992),r(33948),r(92222),r(79753),r(35666);var n=r(67294),a=(r(27484),r(42705),r(42919)),o=r(23455),i=r(19258),l=r(96579),c=r(11382),u=r(71577),s=r(7085),f=r(8212),m=(r(21249),r(63386)),d=r(54397),p=(r(96641),r(26402)),y=r(5368),g=r(41003),v=r(32787),b=r(70507),h=r(19650),w=r(66204);function O(e){return function(e){if(Array.isArray(e))return C(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||P(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function E(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=P(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,i=!0,l=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return i=e.done,e},e:function(e){l=!0,o=e},f:function(){try{i||null==r.return||r.return()}finally{if(l)throw o}}}}function k(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function x(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?k(Object(r),!0).forEach((function(t){S(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):k(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function S(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function j(e,t,r,n,a,o,i){try{var l=e[o](i),c=l.value}catch(e){return void r(e)}l.done?t(c):Promise.resolve(c).then(n,a)}function A(e){return function(){var t=this,r=arguments;return new Promise((function(n,a){var o=e.apply(t,r);function i(e){j(o,n,a,i,l,"next",e)}function l(e){j(o,n,a,i,l,"throw",e)}i(void 0)}))}}function _(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==r)return;var n,a,o=[],i=!0,l=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(o.push(n.value),!t||o.length!==t);i=!0);}catch(e){l=!0,a=e}finally{try{i||null==r.return||r.return()}finally{if(l)throw a}}return o}(e,t)||P(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function P(e,t){if(e){if("string"==typeof e)return C(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?C(e,t):void 0}}function C(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var R=o.KR.filter((function(e){return!(null!=e&&e.disabled)})),F=function(e,t){return(0,m.J1)({},e,t).unknown(!0)};const I=function(e){var t,r=e.record,l=e.setFormTitle,c=e.parentRef,s=e.closeParent,f=e.parentReload,m=e.wrapForm,k=void 0===m?"form":m,S=e.forInput,j=void 0===S||S,P=(0,n.useContext)(w.d),C=_(g.Z.useForm(),1)[0],I=_((0,n.useState)(!0),2),Z=(I[0],I[1]),T=_((0,n.useState)({}),2),G=(T[0],T[1]),D=_((0,n.useState)({error:[],warning:[],info:[],success:[]}),2),V=D[0],z=D[1],N=_((0,n.useState)(!1),2),B=N[0],W=N[1],K=_((0,n.useState)((t=r.gamaoperatoria_id)?{key:"update",values:{id:t}}:{key:"insert",values:{}}),2),L=K[0],M=(K[1],_((0,n.useState)({status:"none"}),2)),q=M[0],J=M[1],U=function(){A(regeneratorRuntime.mark((function e(){var t,n,a,o,i,c;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("update"===L.key)l&&l({title:"Editar Gama Operatória"}),C.setFieldsValue(x(x({},r.gamaOperatoria),r.gamaOperatoriaItems));else{l&&l({title:"Nova Gama Operatória ".concat(P.item_cod),subTitle:"".concat(P.item_nome)}),(t={}).nitems=R.length,n=E(R.entries());try{for(n.s();!(a=n.n()).done;)o=_(a.value,2),i=o[0],c=o[1],t["key-".concat(i)]=c.key,t["des-".concat(i)]=c.designacao,t["tolerancia-".concat(i)]=c.tolerancia}catch(e){n.e(e)}finally{n.f()}C.setFieldsValue(t)}Z(!1);case 3:case"end":return e.stop()}}),e)})))()};(0,n.useEffect)((function(){U(!0)}),[]);var Y=function(){var e=A(regeneratorRuntime.mark((function e(t){var n,i,l,c;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n={error:[],warning:[],info:[],success:[]},F().validate(t,{abortEarly:!1}).error){e.next=20;break}i=!1,e.t0=regeneratorRuntime.keys(t);case 6:if((e.t1=e.t0()).done){e.next=13;break}if("designacao"===(l=e.t1.value)||void 0!==t[l]){e.next=11;break}return i=!0,e.abrupt("break",13);case 11:e.next=6;break;case 13:if(i&&n.error.push({message:"Os items da Gama Operatória têm de estar preenchidos!"}),0!==n.error.length){e.next=20;break}return e.next=17,(0,a.SD)({url:"".concat(o.T5,"/newgamaoperatoria/"),parameters:x(x({},C.getFieldsValue(!0)),{},{produto_id:P.produto_id})});case 17:"error"!==(c=e.sent).data.status&&f({gamaoperatoria_id:r.gamaoperatoria_id},"init"),J(c.data);case 20:z(n);case 21:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),$=function(){s()};return n.createElement(n.Fragment,null,n.createElement(p.Z,{result:q,successButtonOK:"insert"===L.key&&n.createElement(u.Z,{type:"primary",key:"goto-of",onClick:function(){"insert"===L.key&&(C.resetFields(),U(),J({status:"none"}))}},"Criar Nova Gama Operatória"),successButtonClose:n.createElement(u.Z,{key:"goto-close",onClick:function(){return $(!0)}},"Fechar"),errorButtonOK:n.createElement(u.Z,{type:"primary",key:"goto-ok",onClick:function(){J({status:"none"})}},"OK"),errorButtonClose:n.createElement(u.Z,{key:"goto-close",onClick:$},"Fechar")},n.createElement(i.NH,{id:"el-external"}),n.createElement(d.Z,{formStatus:V}),n.createElement(g.Z,{form:C,name:"fps",onFinish:Y,onValuesChange:function(e){G(e)},component:k},n.createElement(i.lt,{id:"LAY-GAMAOPERATORIA-UPSERT",guides:B,layout:"vertical",style:{width:"100%",padding:"0px"},schema:F,field:{forInput:j,wide:[16],margin:"2px",overflow:!1,guides:B,label:{enabled:!0,pos:"top",align:"start",vAlign:"center",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!1},layout:{top:"",right:"",center:"",bottom:"",left:""},required:!0,style:{alignSelf:"top"}},fieldSet:{guides:B,wide:16,margin:"2px",layout:"horizontal",overflow:!1}},j&&n.createElement(n.Fragment,null,n.createElement(i.C3,{margin:!1,field:{wide:[6,4]}},n.createElement(i.gN,{name:"designacao",label:{enabled:!1}},n.createElement(v.Z,{placeholder:"Designação",size:"small"}))),n.createElement(i.qL,{height:"24px"})),n.createElement(i.C3,{wide:16,margin:!1,layout:"vertical"},R.map((function(e,t){return n.createElement(i.C3,{key:"gop-".concat(t),wide:16,field:{wide:[5,9,2]},margin:!1},n.createElement(i.mZ,{label:{enabled:!1},style:{fontSize:"11px"}},n.createElement("b",null,e.designacao)," (",e.unidade,")"),n.createElement(i.C3,{wide:9,margin:!1},O(Array(e.nvalues)).map((function(t,r){return n.createElement(i.gN,{split:9,key:"".concat(e.key,"-").concat(r),name:"v".concat(e.key,"-").concat(r),label:{enabled:!1}},n.createElement(b.Z,{min:e.min,max:e.max,controls:!1,size:"small",precision:null==e?void 0:e.precision}))}))),n.createElement(i.gN,{name:"tolerancia-".concat(t),label:{enabled:!1}},n.createElement(b.Z,{style:{maxWidth:"70px"},addonBefore:"±",min:0,max:100,controls:!1,size:"small"})))}))))),c&&n.createElement(y.Z,{elId:c.current},n.createElement(h.Z,null,n.createElement(u.Z,{type:"primary",onClick:function(){return C.submit()}},"Guardar"),n.createElement(u.Z,{onClick:function(){return W(!B)}},B?"No Guides":"Guides")))))};var Z=["form","guides","schema","fieldStatus"];function T(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=K(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,i=!0,l=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return i=e.done,e},e:function(e){l=!0,o=e},f:function(){try{i||null==r.return||r.return()}finally{if(l)throw o}}}}function G(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}function D(e,t,r,n,a,o,i){try{var l=e[o](i),c=l.value}catch(e){return void r(e)}l.done?t(c):Promise.resolve(c).then(n,a)}function V(e){return function(){var t=this,r=arguments;return new Promise((function(n,a){var o=e.apply(t,r);function i(e){D(o,n,a,i,l,"next",e)}function l(e){D(o,n,a,i,l,"throw",e)}i(void 0)}))}}function z(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function N(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?z(Object(r),!0).forEach((function(t){B(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):z(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function B(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function W(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==r)return;var n,a,o=[],i=!0,l=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(o.push(n.value),!t||o.length!==t);i=!0);}catch(e){l=!0,a=e}finally{try{i||null==r.return||r.return()}finally{if(l)throw a}}return o}(e,t)||K(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function K(e,t){if(e){if("string"==typeof e)return L(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?L(e,t):void 0}}function L(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var M=function(e){var t=e.showWrapper,r=e.setShowWrapper,a=e.parentReload,o=W((0,n.useState)({}),2),l=o[0],c=o[1],u=(0,n.useRef)(),s=t.record,f=void 0===s?{}:s,m=function(){r((function(e){return N(N({},e),{},{show:!e.show})}))};return n.createElement(i.JE,{title:n.createElement(i.QF,{title:l.title,subTitle:l.subTitle}),type:"drawer",destroyOnClose:!0,mask:!0,setVisible:m,visible:t.show,width:800,bodyStyle:{height:"450px"},footer:n.createElement("div",{ref:u,id:"form-wrapper",style:{textAlign:"right"}})},n.createElement(I,{setFormTitle:c,record:f,parentRef:u,closeParent:m,parentReload:a}))},q=function(){var e=V(regeneratorRuntime.mark((function e(t){var r,n,i,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.produto_id,n=t.token,e.next=3,(0,a.SD)({url:"".concat(o.T5,"/gamasoperatoriaslookup/"),filter:{produto_id:r},sort:[],cancelToken:n});case 3:return i=e.sent,l=i.data.rows,e.abrupt("return",l);case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),J=function(){var e=V(regeneratorRuntime.mark((function e(t){var r,n,i,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=t.gamaoperatoria_id,n=t.token,r){e.next=3;break}return e.abrupt("return",[]);case 3:return e.next=5,(0,a.SD)({url:"".concat(o.T5,"/gamaoperatoriaitemsget/"),filter:{gamaoperatoria_id:r},sort:[],cancelToken:n});case 5:return i=e.sent,l=i.data.rows,e.abrupt("return",l);case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();const U=function(e){var t=e.changedValues,r=(0,n.useContext)(w.d),o=r.form,m=r.guides,d=r.schema,p=(r.fieldStatus,G(r,Z)),y=W((0,n.useState)(!0),2),g=y[0],v=y[1],b=W((0,n.useState)({show:!1}),2),h=b[0],O=b[1],E=W((0,n.useState)([]),2),k=E[0],x=E[1];(0,n.useEffect)((function(){var e=(0,a.BO)();return S({gamaoperatoria_id:o.getFieldValue("gamaoperatoria_id"),token:e}),function(){return e.cancel("Form Gama Operatória Cancelled")}}),[]),(0,n.useEffect)((function(){var e=(0,a.BO)();return t&&"gamaoperatoria_id"in t&&(v(!0),S({gamaoperatoria_id:t.gamaoperatoria_id,token:e})),function(){return e.cancel("Form Gama Operatória Cancelled")}}),[t]);var S=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"init",r=e.gamaoperatoria_id,n=e.token;if("lookup"===t)v(!0),V(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=x,e.next=3,q({produto_id:p.produto_id,token:n});case 3:e.t1=e.sent,(0,e.t0)(e.t1),v(!1);case 6:case"end":return e.stop()}}),e)})))();else g||v(!0),V(regeneratorRuntime.mark((function e(){var t,a,i,l,c,u,s,f,m,d,y,g,b,h,w,O,E;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=k,!p.produto_id){e.next=6;break}return e.next=4,q({produto_id:p.produto_id,token:n});case 4:t=e.sent,x(t);case 6:if(!r){e.next=15;break}return a=t.filter((function(e){return e.id===r})),i=W(a,1),l=i[0],e.next=10,J({gamaoperatoria_id:r,token:n});case 10:c=e.sent,u={nitems:c.length},s=T(c.entries());try{for(s.s();!(f=s.n()).done;){m=W(f.value,2),d=m[0],y=m[1],u["key-".concat(d)]=y.item_key,u["des-".concat(d)]=y.item_des,u["tolerancia-".concat(d)]=y.tolerancia,g="string"==typeof y.item_values?JSON.parse(y.item_values):y.item_values,b=T(g.entries());try{for(b.s();!(h=b.n()).done;)w=W(h.value,2),O=w[0],E=w[1],u["v".concat(y.item_key,"-").concat(O)]=E}catch(e){b.e(e)}finally{b.f()}}}catch(e){s.e(e)}finally{s.f()}o.setFieldsValue({gamaOperatoria:l,gamaOperatoriaItems:u});case 15:v(!1);case 16:case"end":return e.stop()}}),e)})))()},j=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];O(e?function(e){return N(N({},e),{},{show:!e.show,record:{},forInput:t})}:function(e){return N(N({},e),{},{show:!e.show,record:N(N({},o.getFieldsValue(["gamaoperatoria_id","gamaOperatoria","gamaOperatoriaItems"])),{},{forInput:t})})})};return n.createElement(n.Fragment,null,n.createElement(c.Z,{spinning:g,indicator:n.createElement(s.Z,{style:{fontSize:24},spin:!0}),tip:"A carregar..."},n.createElement(M,{showWrapper:h,setShowWrapper:O,parentReload:S}),n.createElement(i.lt,{id:"LAY-GAMAOPERATORIA",guides:m,layout:"vertical",style:{width:"100%",padding:"0px"},schema:d,field:{margin:"2px",overflow:!1,guides:m,label:{enabled:!0,pos:"top",align:"start",vAlign:"center",width:"120px",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!0},layout:{top:"",right:"",center:"",bottom:"",left:""},addons:{},required:!0,style:{alignSelf:"top"}},fieldSet:{guides:m,wide:16,margin:"2px",layout:"horizontal",overflow:!1}},n.createElement(i.C3,null,n.createElement(l.Z,{style:{width:"100%"},left:n.createElement(i.C3,null,n.createElement(i.gN,{name:"gamaoperatoria_id",layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!0,text:"Gama Operatória",pos:"left"},addons:N({},o.getFieldValue("gamaoperatoria_id")&&{right:n.createElement(u.Z,{onClick:function(){return j(!1,!0)},style:{marginLeft:"3px"},size:"small"},n.createElement(f.Z,{style:{fontSize:"16px"}}))})},n.createElement(i.mg,{size:"small",data:k,keyField:"id",textField:"designacao",optionsRender:function(e,t,r){return{label:n.createElement("div",{style:{display:"flex"}},n.createElement("div",{style:{minWidth:"150px"}},n.createElement("b",null,e[r])),n.createElement("div",null,"v.",e.versao)),value:e[t]}}}))),right:n.createElement(u.Z,{onClick:function(){return j(!0,!0)}},"Nova Gama Operatória")})),n.createElement(i.C3,null,!g&&o.getFieldValue("gamaoperatoria_id")&&n.createElement(I,{record:o.getFieldsValue(!0),wrapForm:!1,forInput:!1,parentReload:S})))))}}}]);