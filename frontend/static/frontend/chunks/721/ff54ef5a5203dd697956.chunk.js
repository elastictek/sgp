"use strict";(self.webpackChunksgp=self.webpackChunksgp||[]).push([[721],{84721:(e,t,n)=>{n.r(t),n.d(t,{default:()=>H});n(47042),n(43371),n(33321),n(79753),n(82526),n(41817),n(32165),n(78783),n(91038),n(74916),n(69070),n(47941),n(57327),n(38880),n(89554),n(54747),n(49337),n(68309),n(66992),n(41539),n(33948);var r,a=n(67294),o=n(34144),l=(n(27484),n(42705),n(42919)),i=n(23455),c=n(84636),d=(n(63386),n(10438),n(58043),n(28479)),s=(n(75935),n(16403)),u=n(96579),f=(n(5368),n(7171),n(96974)),m=(n(75950),n(32787)),p=n(71577),b=n(60881),h=n(19650),y=n(9676),w=n(70507),v=n(92080),E=n(11382),g=n(7085),x=n(20195);function O(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function S(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?O(Object(n),!0).forEach((function(t){Z(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):O(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Z(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function z(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==n)return;var r,a,o=[],l=!0,i=!1;try{for(n=n.call(e);!(l=(r=n.next()).done)&&(o.push(r.value),!t||o.length!==t);l=!0);}catch(e){i=!0,a=e}finally{try{l||null==n.return||n.return()}finally{if(i)throw a}}return o}(e,t)||j(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function j(e,t){if(e){if("string"==typeof e)return I(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?I(e,t):void 0}}function I(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var P,A,D=m.Z.TextArea,C=(p.Z.Group,b.Z.Title,(0,o.ZP)(p.Z)(r||(P=["\n  &&& {\n    background-color: #389e0d;\n    border-color: #389e0d;\n    color:#fff;\n    &:hover{\n        background-color: #52c41a;\n        border-color: #52c41a;\n    }\n  }\n"],A||(A=P.slice(0)),r=Object.freeze(Object.defineProperties(P,{raw:{value:Object.freeze(A)}}))))),k=function(e){e.dataAPI,(0,f.s0)();var t=a.createElement(h.Z,null,a.createElement(p.Z,{type:"primary",size:"small"},"Validar"),a.createElement(C,{size:"small"},"Aprovar"),a.createElement(p.Z,{danger:!0,size:"small"},"Hold")),n=a.createElement(h.Z,null,a.createElement("div",{style:{display:"flex",flexDirection:"row",whiteSpace:"nowrap"}}),a.createElement("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",whiteSpace:"nowrap"}}));return a.createElement(u.Z,{left:t,right:n})},F=function(e){var t=e.index,n=e.data,r=e.width,o=void 0===r?"70px":r,l="st-".concat(t),c=100+t;return a.createElement(d.mg,{value:n.estado[l],name:l,tabIndex:c,style:{width:o},size:"small",options:i.av})},R=function(e){var t=e.data,n=e.name,r=e.title;return a.createElement(h.Z,null,r,a.createElement(y.Z,{checked:t["".concat(n,"-all")],name:"".concat(n,"-all")}))},_=function(e){var t=e.index,n=e.data,r=e.width,o=void 0===r?"60px":r,l="lr-".concat(t),i=200+t;return a.createElement(w.Z,{tabIndex:i,controls:!1,style:{width:o},value:n.l_real[l],name:l,size:"small"})},T=function(e){var t=e.index,n=e.data,r=e.width,o=void 0===r?"100%":r,l=e.onChange,c="defeitos-".concat(t);return a.createElement(d.O6,{onChange:function(e){return l("defeitos",e,t)},tabIndex:500+t,style:{width:o},name:c,value:n.defeitos[t],allowClear:!0,size:"small",options:i.Me})},B=function(e){var t=e.index,n=(e.data,e.width),r=void 0===n?"50px":n,o="fc-i-".concat(t),l="fc-e-".concat(t),i=300+t;return a.createElement(h.Z,null,a.createElement(w.Z,{tabIndex:i,controls:!1,style:{width:r},disabled:!0,name:o,size:"small"}),a.createElement(w.Z,{tabIndex:i,controls:!1,style:{width:r},disabled:!0,name:l,size:"small"}))},G=function(e){var t=e.index,n=(e.data,e.width),r=void 0===n?"50px":n,o="ff-i-".concat(t),l="ff-e-".concat(t),i=400+t;return a.createElement(h.Z,null,a.createElement(w.Z,{tabIndex:i,controls:!1,style:{width:r},disabled:!0,name:o,size:"small"}),a.createElement(w.Z,{tabIndex:i,controls:!1,style:{width:r},disabled:!0,name:l,size:"small"}))};const H=function(e){var t=e.data,n=z((0,a.useState)(!1),2),r=n[0],o=(n[1],z((0,a.useState)([]),2)),d=o[0],u=o[1],f=z((0,a.useState)(!1),2),m=(f[0],f[1],z((0,a.useState)({show:!1,data:{}}),2)),p=(m[0],m[1],z(v.Z.useForm(),1)[0],z((0,x.x)({"ff-all":0,"fc-all":0,"st-all":0,estado:{},l_real:{},defeitos:{},fc:{},ff:{}}),2)),b=p[0],h=p[1],y=(0,c.E)({payload:{url:"".concat(i.T5,"/validarbobineslist/"),parameters:{},pagination:{enabled:!0,page:1,pageSize:30},filter:{},sort:[{column:"nome",direction:"ASC"}]}});(0,a.useEffect)((function(){var e=t.bobinagem_id,n=(0,l.BO)();return y.first(),y.addFilters({bobinagem_id:e}),y.fetchPost({token:n}),function(){return n.cancel()}}),[]),(0,a.useEffect)((function(){if(y.hasData()){var e,t=function(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=j(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,a=function(){};return{s:a,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,l=!0,i=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return l=e.done,e},e:function(e){i=!0,o=e},f:function(){try{l||null==n.return||n.return()}finally{if(i)throw o}}}}(y.getData().rows.entries());try{var n=function(){var t=z(e.value,2),n=t[0],r=t[1];h((function(e){e.estado["st-".concat(n)]=r.estado,e.l_real["lr-".concat(n)]=r.l_real}))};for(t.s();!(e=t.n()).done;)n()}catch(e){t.e(e)}finally{t.f()}}}),[y.hasData()]);var w,O=function(e,t,n){if("defeitos"===e)h((function(e){e.defeitos[n]=t}))},Z=(0,s.B)({dataAPI:y,data:y.getData().rows,uuid:"bobineslist_validar",include:S({},(w={idx:1,optional:!1,sorter:!1},{nome:S({title:"Bobine",width:125,render:function(e){return a.createElement("span",{style:{color:"#096dd9",cursor:"pointer"}},e)}},w),A:S({title:a.createElement(R,{title:"Estado",name:"st",data:b}),width:80,render:function(e,t,n){return a.createElement(F,{width:"70px",index:n,data:b})}},w),B:S({title:"Largura Real",width:90,render:function(e,t,n){return a.createElement(_,{width:"60px",index:n,data:b})}},w),E:S({title:a.createElement(R,{title:"Outros Defeitos",name:"defeitos",data:b}),render:function(e,t,n){return a.createElement(T,{width:"100%",index:n,data:b,onChange:O})}},w),C:S({title:a.createElement(R,{title:"Falha Corte",name:"fc",data:b}),width:70,render:function(e,t,n){return a.createElement(B,{width:"50px",index:n,data:b})}},w),D:S({title:a.createElement(R,{title:"Falha Filme",name:"ff",data:b}),width:70,render:function(e,t,n){return a.createElement(G,{width:"50px",index:n,data:b})}},w),F:S({title:a.createElement(R,{title:"Prop. Obs.",name:"probs",data:b}),width:270,render:function(e,t,n){return a.createElement(D,{autoSize:{minRows:1,maxRows:6},tabIndex:500+n,name:"probs-i-".concat(n),size:"small"})}},w),G:S({title:a.createElement(R,{title:"Obs.",name:"obs",data:b}),width:270,render:function(e,t,n){return a.createElement(D,{autoSize:{minRows:1,maxRows:6},tabIndex:600+n,name:"obs-i-".concat(n),size:"small"})}},w)})),exclude:[]});return a.createElement(a.Fragment,null,a.createElement(E.Z,{spinning:r,indicator:a.createElement(g.Z,{style:{fontSize:24},spin:!0}),style:{top:"50%",left:"50%",position:"absolute"}},a.createElement(k,{dataAPI:y}),a.createElement(s.Z,{columnChooser:!1,reload:!1,header:!1,stripRows:!0,darkHeader:!0,size:"small",selection:{enabled:!1,rowKey:function(e){return function(e){return"".concat(e.id)}(e)},onSelection:u,multiple:!1,selectedRows:d,setSelectedRows:u},paginationProps:{pageSizeOptions:[10,15,20,30]},dataAPI:y,columns:Z,onFetch:y.fetchPost,components:{body:{}}})))}}}]);
//# sourceMappingURL=ff54ef5a5203dd697956.chunk.js.map