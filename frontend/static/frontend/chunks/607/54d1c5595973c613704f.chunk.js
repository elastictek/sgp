"use strict";(self.webpackChunksgp=self.webpackChunksgp||[]).push([[607],{62607:(e,r,t)=>{t.r(r),t.d(r,{default:()=>K});t(69070),t(47941),t(82526),t(47042),t(91038),t(78783),t(41817),t(32165),t(79753),t(38880),t(89554),t(54747),t(49337),t(33321),t(19601),t(88674),t(35666),t(92222),t(66992),t(41539),t(33948),t(68309),t(21249),t(82772),t(56977),t(74916),t(15306),t(27207),t(57327),t(69826),t(26699),t(85827),t(32023);var n=t(67294),a=(t(27484),t(42705)),l=t.n(a),o=t(42919),i=t(23455),u=t(63386),c=t(28479),m=t(54397),s=t(96641),d=(t(75950),t(26402)),f=t(5368),p=t(96579),b=t(92080),g=t(70507),v=t(71577),E=t(32787),y=t(19650),_=t(49101),h=t(5434),x=t(80471),C=["formu_materiasprimas_A","formu_materiasprimas_BC"],w=["formu_materiasprimas_A","formu_materiasprimas_BC"];function A(e){return function(e){if(Array.isArray(e))return P(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||j(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function k(e,r,t,n,a,l,o){try{var i=e[l](o),u=i.value}catch(e){return void t(e)}i.done?r(u):Promise.resolve(u).then(n,a)}function B(e){return function(){var r=this,t=arguments;return new Promise((function(n,a){var l=e.apply(r,t);function o(e){k(l,n,a,o,i,"next",e)}function i(e){k(l,n,a,o,i,"throw",e)}o(void 0)}))}}function O(){return O=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e},O.apply(this,arguments)}function S(e,r){return function(e){if(Array.isArray(e))return e}(e)||function(e,r){var t=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==t)return;var n,a,l=[],o=!0,i=!1;try{for(t=t.call(e);!(o=(n=t.next()).done)&&(l.push(n.value),!r||l.length!==r);o=!0);}catch(e){i=!0,a=e}finally{try{o||null==t.return||t.return()}finally{if(i)throw a}}return l}(e,r)||j(e,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function F(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function N(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?F(Object(t),!0).forEach((function(r){T(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):F(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function q(e,r){var t="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=j(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var l,o=!0,i=!1;return{s:function(){t=t.call(e)},n:function(){var e=t.next();return o=e.done,e},e:function(e){i=!0,l=e},f:function(){try{o||null==t.return||t.return()}finally{if(i)throw l}}}}function j(e,r){if(e){if("string"==typeof e)return P(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?P(e,r):void 0}}function P(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function Z(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}function T(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}var L=function(e,r){return(0,u.J1)({formu_materiasprimas_A:l().array().label("Matérias Primas da Extrusora A").min(1).required(),formu_materiasprimas_BC:l().array().label("Matérias Primas das Extrusoras B & C").min(1).required(),matprima_cod_A:l().string().label("Matéria Prima").required(),densidade_A:l().number().label("Densidade").required(),arranque_A:l().number().label("Arranque").required(),matprima_cod_BC:l().string().label("Matéria Prima").required(),densidade_BC:l().number().label("Densidade").required(),arranque_BC:l().number().label("Arranque").required()},e,r).unknown(!0)},R=function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"",n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"";return e?"".concat(t).concat(e).concat(r):n},z=function(e){var r,t=e.backgroundColor,a=void 0===t?"#f5f5f5":t,l=e.color,o=void 0===l?"#000":l,i=e.border,u=void 0===i?"solid 1px #d9d9d9":i;return n.createElement(c.C3,{wide:16,layout:"horizontal",margin:!1,style:{backgroundColor:"".concat(a),color:"".concat(o),fontWeight:500,textAlign:"center"},field:{noItemWrap:!0,label:{enabled:!1}}},n.createElement(c.C3,{wide:7,margin:!1,field:{wide:[13,3],style:{border:u,borderLeft:"none",alignSelf:"stretch",display:"flex",flexDirection:"column",justifyContent:"center"}}},n.createElement(c.gN,{style:{border:u,alignSelf:"stretch",display:"flex",flexDirection:"column",justifyContent:"center"}},"Matérias Primas"),n.createElement(c.gN,null,"Densidade")),n.createElement(c.C3,(T(r={margin:!1,wide:9},"margin",!1),T(r,"layout","vertical"),T(r,"field",{style:{border:u,borderLeft:"none"}}),r),n.createElement(c.C3,{field:{wide:[16]},margin:!1},n.createElement(c.gN,null,"Distribuição por Extrusora")),n.createElement(c.C3,{margin:!1,field:{wide:[4,4,4,3,1],style:{fontSize:"10px",border:u,borderLeft:"none",borderTop:"none",fontWeight:400}}},n.createElement(c.gN,null,"%A"),n.createElement(c.gN,null,"Arranque"),n.createElement(c.gN,null,"Tolerância"),n.createElement(c.gN,null,"% Global"),n.createElement(c.gN,null))))},I=function(e){var r=e.backgroundColor,t=void 0===r?"#f5f5f5":r,a=e.color,l=void 0===a?"#000":a,o=e.border,i=void 0===o?"solid 1px #d9d9d9":o;return n.createElement(c.C3,{wide:16,layout:"horizontal",margin:!1,field:{noItemWrap:!0,label:{enabled:!1}},style:{fontSize:"10px",backgroundColor:"".concat(t),color:"".concat(l),textAlign:"center"}},n.createElement(c.C3,{wide:7,margin:!1,field:{wide:[13,3],style:{border:i,borderLeft:"none"}}},n.createElement(c.gN,{style:{border:i}}),n.createElement(c.gN,null)),n.createElement(c.C3,T({margin:!1,wide:9},"margin",!1),n.createElement(c.C3,{margin:!1,field:{wide:[4,4,4,3,1],label:{enabled:!1},style:{border:i,borderLeft:"none"}}},n.createElement(c.gN,null,"%B e C"),n.createElement(c.gN,null,"Arranque"),n.createElement(c.gN,null,"Tolerância"),n.createElement(c.gN,null,"% Global"),n.createElement(c.gN,null))))},D=function(e){var r,t=e.values,n=void 0===t?{}:t,a=e.adjust,l=void 0===a?{extrusora:null,index:null}:a,o=e.action,u=void 0===o?"adjust":o,c=n.formu_materiasprimas_A,m=void 0===c?[]:c,s=n.formu_materiasprimas_BC,d=void 0===s?[]:s,f=Z(n,C),p=i.VA[0],b=i.VA[1],g=0,v=0,E=0,y=0,_=q(m.entries());try{for(_.s();!(r=_.n()).done;){var h=S(r.value,2),x=h[0],w=h[1],A=w.arranque_A?w.arranque_A:0,k=p*A/100;("adjust"===u&&"A"!==l.extrusora||"adjust"!==u||"adjust"===u&&l.index!==x&&"A"===l.extrusora)&&(g+=k,E+=A),w.global=k}}catch(e){_.e(e)}finally{_.f()}var B,O=q(d.entries());try{for(O.s();!(B=O.n()).done;){var F=S(B.value,2),j=F[0],P=F[1],T=P.arranque_BC?P.arranque_BC:0,L=b*T/100;("adjust"===u&&"BC"!==l.extrusora||"adjust"!==u||"adjust"===u&&l.index!==j&&"BC"===l.extrusora)&&(v+=L,y+=T),P.global=L}}catch(e){O.e(e)}finally{O.f()}return"adjust"===u&&("A"===l.extrusora?(m[l.index].arranque_A=100-E<0?0:100-E,m[l.index].global=p*m[l.index].arranque_A/100,g+=m[l.index].global):(d[l.index].arranque_BC=100-y<0?0:100-y,d[l.index].global=b*d[l.index].arranque_BC/100,v+=d[l.index].global)),N(N({},f),{},{formu_materiasprimas_A:m,formu_materiasprimas_BC:d,totalGlobal:g+v})},M=function(e){var r=e.form,t=e.forInput,a=e.name,l=e.matPrimasLookup,o=e.sum,u=void 0!==o&&o,m=e.border,d=void 0===m?"solid 1px #d9d9d9":m,f=e.id;return n.createElement(b.Z.List,{name:a},(function(e,o){var m=o.add,p=o.remove;o.move;return n.createElement(n.Fragment,null,e.map((function(e,o){var i;return n.createElement(c.C3,{key:e.key,wide:16,layout:"horizontal",margin:!1,field:{label:{enabled:!1}}},n.createElement(c.C3,{wide:7,margin:!1,field:{wide:[13,3],style:{border:"solid 1px #fff",borderLeft:"none",fontWeight:"10px"}}},n.createElement(c.gN,{name:[e.name,"matprima_cod_".concat(f)]},n.createElement(c.mg,{size:"small",data:l,keyField:"ITMREF_0",textField:"ITMDES1_0",optionsRender:function(e,r,t){return{label:"".concat(e[t]),value:e[r]}},showSearch:!0,filterOption:function(e,r){return r.label.toLowerCase().indexOf(e.toLowerCase())>=0}})),n.createElement(c.gN,{name:[e.name,"densidade_".concat(f)]},n.createElement(g.Z,{controls:!1,size:"small",min:0,max:50,precision:3,step:.025}))),n.createElement(c.C3,T({margin:!1,wide:9},"margin",!1),n.createElement(c.C3,{margin:!1,field:{wide:[4,4,4,3,1],label:{enabled:!1},style:{border:"solid 1px #fff",borderLeft:"none",borderTop:"none"}}},n.createElement(c.gN,null),n.createElement(c.gN,{name:[e.name,"arranque_".concat(f)]},n.createElement(g.Z,O({size:"small",controls:!1},t&&{addonBefore:n.createElement(s.Z,{onClick:function(){return e=o,t=f,n=D({values:r.getFieldsValue(!0),adjust:{extrusora:t,index:e},action:"adjust"}),void r.setFieldsValue(n);var e,t,n}},n.createElement(h.fan,null))},{addonAfter:n.createElement("b",null,"%"),precision:2,min:0,max:100}))),n.createElement(c.gN,{name:[e.name,"tolerancia_".concat(f)]},n.createElement(g.Z,{size:"small",controls:!1,addonBefore:"±",addonAfter:n.createElement("b",null,"%"),maxLength:4,precision:1,min:0,max:100})),n.createElement(c.gN,{style:{textAlign:"center",border:"solid 1px #fff",borderLeft:"none",borderTop:"none"}},R(null===(i=r.getFieldValue([a,e.name,"global"]))||void 0===i?void 0:i.toFixed(2),"%")),n.createElement(c.mZ,{label:{enabled:!1}},t&&n.createElement(s.Z,{onClick:function(){return r=e.name,void p(r);var r},style:{alignSelf:"center"}},n.createElement(x.dc5,null))))))})),u&&r.getFieldValue("totalGlobal")>0&&n.createElement(c.C3,{wide:16,layout:"horizontal",margin:!1,field:{label:{enabled:!1}}},n.createElement(c.C3,{wide:7,margin:!1}),n.createElement(c.C3,T({margin:!1,wide:9},"margin",!1),n.createElement(c.C3,{margin:!1,field:{wide:[12,4],label:{enabled:!1},style:{border:"solid 1px #fff",borderLeft:"none",borderTop:"none"}}},n.createElement(c.gN,null),n.createElement(c.gN,{style:{marginTop:"4px",textAlign:"center",fontWeight:500,border:d}},R(r.getFieldValue("totalGlobal").toFixed(2),"%"))))),n.createElement(c.C3,null,t&&n.createElement(v.Z,{type:"dashed",onClick:function(){var e;m((T(e={},"tolerancia_".concat(f),i.d4),T(e,"removeCtrl",!0),e))},style:{width:"100%"}},n.createElement(_.Z,null),"Adicionar")))}))},V=function(){var e=B(regeneratorRuntime.mark((function e(r){var t,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,o.SD)({url:"".concat(i.T5,"/materiasprimaslookup/"),filter:{}});case 2:return t=e.sent,n=t.data.rows,e.abrupt("return",n);case 5:case"end":return e.stop()}}),e)})));return function(r){return e.apply(this,arguments)}}(),G=function(){var e=B(regeneratorRuntime.mark((function e(r){var t,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,o.SD)({url:"".concat(i.T5,"/sellcustomerslookup/"),pagination:{limit:10},filter:T({},"fmulti_customer","%".concat(r.replaceAll(" ","%%"),"%"))});case 2:return t=e.sent,n=t.data.rows,e.abrupt("return",n);case 5:case"end":return e.stop()}}),e)})));return function(r){return e.apply(this,arguments)}}(),W=function(){var e=B(regeneratorRuntime.mark((function e(r){var t,n,a,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=r.produto_id,n=r.token,e.next=3,(0,o.SD)({url:"".concat(i.T5,"/formulacoeslookup/"),filter:{produto_id:t},sort:[],cancelToken:n});case 3:return a=e.sent,l=a.data.rows,e.abrupt("return",l);case 6:case"end":return e.stop()}}),e)})));return function(r){return e.apply(this,arguments)}}(),U=function(){var e=B(regeneratorRuntime.mark((function e(r){var t,n,a,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=r.formulacao_id,n=r.token,t){e.next=3;break}return e.abrupt("return",[]);case 3:return e.next=5,(0,o.SD)({url:"".concat(i.T5,"/formulacaomateriasprimasget/"),filter:{formulacao_id:t},sort:[],cancelToken:n});case 5:return a=e.sent,l=a.data.rows,e.abrupt("return",l);case 8:case"end":return e.stop()}}),e)})));return function(r){return e.apply(this,arguments)}}();const K=function(e){var r,t=e.record,a=e.setFormTitle,l=e.parentRef,u=e.closeParent,s=(e.parentReload,e.wrapForm),_=void 0===s?"form":s,h=e.forInput,x=void 0===h||h,C=S(b.Z.useForm(),1)[0],k=S((0,n.useState)(!0),2),O=(k[0],k[1]),F=S((0,n.useState)({}),2),j=(F[0],F[1]),P=S((0,n.useState)(!1),2),T=P[0],R=P[1],K=S((0,n.useState)({error:[],warning:[],info:[],success:[]}),2),H=K[0],J=K[1],Y=S((0,n.useState)(!1),2),$=Y[0],Q=(Y[1],S((0,n.useState)((r=t.formulacao.id)?{key:"update",values:{id:r}}:{key:"insert",values:{}}),2)),X=Q[0],ee=(Q[1],S((0,n.useState)({status:"none"}),2)),re=ee[0],te=ee[1],ne=S((0,n.useState)([]),2),ae=ne[0],le=ne[1],oe=S((0,n.useState)([]),2),ie=oe[0],ue=oe[1],ce=function(e){var r,n=e.items,a=e.formulacao,l=null==n?void 0:n.filter((function(e){return"A"===e.extrusora})).map((function(e){return{global:e.vglobal,matprima_cod_A:e.matprima_cod,densidade_A:e.densidade,arranque_A:e.arranque,tolerancia_A:e.tolerancia,removeCtrl:!0}})),o=null==n?void 0:n.filter((function(e){return"BC"===e.extrusora})).map((function(e){return{global:e.vglobal,matprima_cod_BC:e.matprima_cod,densidade_BC:e.densidade,arranque_BC:e.arranque,tolerancia_BC:e.tolerancia,removeCtrl:!0}})),i={key:null===(r=t.formulacao)||void 0===r?void 0:r.cliente_cod,value:null==a?void 0:a.cliente_cod,label:null==a?void 0:a.cliente_nome};return N(N({},a),{},{cliente_cod:i,formu_materiasprimas_A:l,formu_materiasprimas_BC:o,totalGlobal:100})},me=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],r=arguments.length>1?arguments[1]:void 0;B(regeneratorRuntime.mark((function n(){var l,o,i;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(!e){n.next=6;break}return n.t0=le,n.next=4,V(t);case 4:n.t1=n.sent,(0,n.t0)(n.t1);case 6:if("update"!==X.key){n.next=15;break}return l=t.formulacao,o=l.items,i=l.produto_id,a&&a({title:"Formulação"}),n.t2=ue,n.next=12,W({produto_id:i,token:r});case 12:n.t3=n.sent,(0,n.t2)(n.t3),C.setFieldsValue(ce({items:o,formulacao:null==t?void 0:t.formulacao}));case 15:O(!1);case 16:case"end":return n.stop()}}),n)})))()};(0,n.useEffect)((function(){var e=(0,o.BO)();return me(!0,e),function(){return e.cancel("Form Formulação Cancelled")}}),[]);var se=function(){var e=B(regeneratorRuntime.mark((function e(r,t){var n,a,l,o,i,u,c,m,s,d;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.formu_materiasprimas_A,a=void 0===n?[]:n,l=t.formu_materiasprimas_BC,o=void 0===l?[]:l,i=Z(t,w),!("id"in r)){e.next=9;break}return u=ie.find((function(e){return e.id===r.id})),e.next=5,U({formulacao_id:r.id});case 5:c=e.sent,C.setFieldsValue(ce({items:c,formulacao:u})),e.next=13;break;case 9:m=a.filter((function(e){return!0===e.removeCtrl})),s=o.filter((function(e){return!0===e.removeCtrl})),d=D({values:N(N({},i),{},{formu_materiasprimas_A:m,formu_materiasprimas_BC:s}),action:"valueschange"}),C.setFieldsValue(d);case 13:R(!0),j(r);case 15:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}(),de=function(){var e=B(regeneratorRuntime.mark((function e(r){var n,a,l,u,c,m,s,d,f,p,b,g,v,E,y,_,h,x,C,w,k;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(T){e.next=2;break}return e.abrupt("return");case 2:if(l=[],u={error:[],warning:[],info:[],success:[]},c=["formu_materiasprimas_A","formu_materiasprimas_BC"],m=L(!1,["matprima_cod_A","densidade_A","arranque_A","matprima_cod_BC","densidade_BC","arranque_BC"]).validate(r,{abortEarly:!1}),u.error=[].concat(A(u.error),A(m.error?null===(n=m.error)||void 0===n?void 0:n.details.filter((function(e){return c.includes(e.context.key)})):[])),u.warning=[].concat(A(u.warning),A(m.warning?null===(a=m.warning)||void 0===a?void 0:a.details.filter((function(e){return c.includes(e.context.key)})):[])),m.error||(s=D({values:r,action:"finish"}),d=s.formu_materiasprimas_A.reduce((function(e,r){return e+(r.arranque_A||0)}),0),f=s.formu_materiasprimas_BC.reduce((function(e,r){return e+(r.arranque_BC||0)}),0),100!==Math.round(s.totalGlobal)?u.error.push({message:"O Total Global das Matérias Primas tem de ser 100%!"}):100!==d?u.error.push({message:"O Total das Matérias Primas da Extrusora A tem de ser 100%!"}):100!==f&&u.error.push({message:"O Total das Matérias Primas das Extrusoras B&C tem de ser 100%!"})),0!==u.error.length||!s){e.next=23;break}g=q(null===(p=s)||void 0===p?void 0:p.formu_materiasprimas_A);try{for(E=function(){var e,r=v.value,t=null===(e=ae.find((function(e){return e.ITMREF_0===r.matprima_cod_A})))||void 0===e?void 0:e.ITMDES1_0;l.push({tolerancia:r.tolerancia_A,arranque:r.arranque_A,vglobal:r.global,densidade:r.densidade_A,extrusora:"A",matprima_cod:r.matprima_cod_A,matprima_des:t})},g.s();!(v=g.n()).done;)E()}catch(e){g.e(e)}finally{g.f()}y=q(null===(b=s)||void 0===b?void 0:b.formu_materiasprimas_BC);try{for(h=function(){var e,r=_.value,t=null===(e=ae.find((function(e){return e.ITMREF_0===r.matprima_cod_BC})))||void 0===e?void 0:e.ITMDES1_0;l.push({tolerancia:r.tolerancia_BC,arranque:r.arranque_BC,vglobal:r.global,densidade:r.densidade_BC,extrusora:"BC",matprima_cod:r.matprima_cod_BC,matprima_des:t})},y.s();!(_=y.n()).done;)h()}catch(e){y.e(e)}finally{y.f()}return x=r.cliente_cod,C=(x=void 0===x?{}:x).value,w=x.label,e.next=19,(0,o.SD)({url:"".concat(i.T5,"/updatecurrentsettings/"),filter:{csid:t.id},parameters:{type:"formulacao",formulacao:N(N({},r),{},{items:l,produto_id:t.formulacao.produto_id,cliente_cod:C,cliente_nome:w})}});case 19:if(k=e.sent,te(k.data),"error"===k.data.status){e.next=23;break}throw"TODO RELOAD PARENT";case 23:J(u);case 24:case"end":return e.stop()}}),e)})));return function(r){return e.apply(this,arguments)}}(),fe=function(){u()};return n.createElement(n.Fragment,null,n.createElement(d.Z,{result:re,successButtonOK:"insert"===X.key&&n.createElement(v.Z,{type:"primary",key:"goto-of",onClick:function(){"insert"===X.key&&(C.resetFields(),me(),te({status:"none"}))}},"Criar Nova Formulação"),successButtonClose:n.createElement(v.Z,{key:"goto-close",onClick:function(){return fe(!0)}},"Fechar"),errorButtonOK:n.createElement(v.Z,{type:"primary",key:"goto-ok",onClick:function(){te({status:"none"})}},"OK"),errorButtonClose:n.createElement(v.Z,{key:"goto-close",onClick:fe},"Fechar")},n.createElement(c.NH,{id:"el-external"}),n.createElement(m.Z,{formStatus:H}),n.createElement(b.Z,{form:C,name:"fps",onFinish:de,onValuesChange:se,component:_},n.createElement(c.lt,{id:"LAY-FORMULACAO-UPSERT",guides:$,layout:"vertical",style:{width:"100%",padding:"0px",height:"65vh"},schema:L,field:{forInput:x,wide:[16],margin:"2px",overflow:!1,guides:$,label:{enabled:!0,pos:"top",align:"start",vAlign:"center",wrap:!1,overflow:!1,colon:!0,ellipsis:!0},alert:{pos:"right",tooltip:!0,container:!1},layout:{top:"",right:"",center:"",bottom:"",left:""},required:!0,style:{alignSelf:"top"}},fieldSet:{guides:$,wide:16,margin:"2px",layout:"horizontal",overflow:!1}},x&&n.createElement(n.Fragment,null,n.createElement(c.C3,null,n.createElement(p.Z,{style:{width:"100%"},left:n.createElement(c.C3,null,n.createElement(c.gN,{name:"id",layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!1,text:"Formulacao",pos:"left"}},n.createElement(c.mg,{size:"small",data:ie,keyField:"id",textField:"designacao",optionsRender:function(e,r,t){return{label:n.createElement("div",{style:{display:"flex"}},n.createElement("div",{style:{minWidth:"150px"}},n.createElement("b",null,e[t])),n.createElement("div",null,"v.",e.versao)),value:e[r]}}}))),right:n.createElement("div",{style:{display:"flex",flexDirection:"row"}},n.createElement(c.C3,{style:{minWidth:"300px"},margin:!1,field:{wide:[16]}},n.createElement(c.gN,{name:"cliente_cod",required:!1,layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!1,text:"Cliente",pos:"left"}},n.createElement(c.Fb,{placeholder:"Cliente",size:"small",keyField:"BPCNUM_0",textField:"BPCNAM_0",showSearch:!0,showArrow:!0,allowClear:!0,fetchOptions:G}))))}))),!x&&n.createElement(n.Fragment,null,n.createElement(c.C3,{margin:!1,field:{wide:[16]}},n.createElement(c.gN,{name:"cliente_cod",required:!1,layout:{center:"align-self:center;",right:"align-self:center;"},label:{enabled:!1,text:"Cliente",pos:"left"}},n.createElement(c.Fb,{placeholder:"Cliente",size:"small",keyField:"BPCNUM_0",textField:"BPCNAM_0",showSearch:!0,showArrow:!0,allowClear:!0,fetchOptions:G}))),n.createElement(c.qL,{height:"6px"})),x&&n.createElement(n.Fragment,null,n.createElement(c.C3,{wide:16,margin:!1},n.createElement(c.C3,{wide:3}),n.createElement(c.C3,{wide:10,margin:!1,layout:"vertical",field:{split:5,wide:void 0}},n.createElement(c.C3,{margin:!1},n.createElement(c.gN,{name:"extr0",label:{enabled:!1}},n.createElement(E.Z,{disabled:!0,size:"small"})),n.createElement(c.gN,{name:"extr1",label:{enabled:!1}},n.createElement(E.Z,{disabled:!0,size:"small"})),n.createElement(c.gN,{name:"extr2",label:{enabled:!1}},n.createElement(E.Z,{disabled:!0,size:"small"})),n.createElement(c.gN,{name:"extr3",label:{enabled:!1}},n.createElement(E.Z,{disabled:!0,size:"small"})),n.createElement(c.gN,{name:"extr4",label:{enabled:!1}},n.createElement(E.Z,{disabled:!0,size:"small"}))),n.createElement(c.C3,{margin:!1},n.createElement(c.gN,{name:"extr0_val",label:{enabled:!1}},n.createElement(g.Z,{disabled:!0,size:"small",addonAfter:n.createElement("b",null,"%"),maxLength:4})),n.createElement(c.gN,{name:"extr1_val",label:{enabled:!1}},n.createElement(g.Z,{disabled:!0,size:"small",addonAfter:n.createElement("b",null,"%"),maxLength:4})),n.createElement(c.gN,{name:"extr2_val",label:{enabled:!1}},n.createElement(g.Z,{disabled:!0,size:"small",addonAfter:n.createElement("b",null,"%"),maxLength:4})),n.createElement(c.gN,{name:"extr3_val",label:{enabled:!1}},n.createElement(g.Z,{disabled:!0,size:"small",addonAfter:n.createElement("b",null,"%"),maxLength:4})),n.createElement(c.gN,{name:"extr4_val",label:{enabled:!1}},n.createElement(g.Z,{disabled:!0,size:"small",addonAfter:n.createElement("b",null,"%"),maxLength:4})))),n.createElement(c.C3,{wide:3})),n.createElement(c.qL,{height:"12px"})),n.createElement(z,null),n.createElement(M,{form:C,name:"formu_materiasprimas_A",forInput:x,matPrimasLookup:ae,id:"A"}),n.createElement(I,null),n.createElement(M,{form:C,name:"formu_materiasprimas_BC",forInput:x,matPrimasLookup:ae,sum:!0,id:"BC"}))),l&&n.createElement(f.Z,{elId:l.current},n.createElement(y.Z,null,T&&n.createElement(v.Z,{type:"primary",onClick:function(){return de(C.getFieldsValue(!0))}},"Guardar"),n.createElement(v.Z,{onClick:fe},"Fechar")))))}}}]);
//# sourceMappingURL=54d1c5595973c613704f.chunk.js.map