"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["frontend/index"],{

/***/ "./src/config/index.js":
/*!*****************************!*\
  !*** ./src/config/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "API_URL": () => (/* binding */ API_URL),
/* harmony export */   "ARTIGOS_SPECS": () => (/* binding */ ARTIGOS_SPECS),
/* harmony export */   "BOBINE_DEFEITOS": () => (/* binding */ BOBINE_DEFEITOS),
/* harmony export */   "BOBINE_ESTADOS": () => (/* binding */ BOBINE_ESTADOS),
/* harmony export */   "CINTASPALETES_OPTIONS": () => (/* binding */ CINTASPALETES_OPTIONS),
/* harmony export */   "CONTENTORES_OPTIONS": () => (/* binding */ CONTENTORES_OPTIONS),
/* harmony export */   "CSRF": () => (/* binding */ CSRF),
/* harmony export */   "DADOSBASE_URL": () => (/* binding */ DADOSBASE_URL),
/* harmony export */   "DATETIME_FORMAT": () => (/* binding */ DATETIME_FORMAT),
/* harmony export */   "DATE_FORMAT": () => (/* binding */ DATE_FORMAT),
/* harmony export */   "DOWNLOAD_URL": () => (/* binding */ DOWNLOAD_URL),
/* harmony export */   "ENROLAMENTO_OPTIONS": () => (/* binding */ ENROLAMENTO_OPTIONS),
/* harmony export */   "FORMULACAO_EXTRUSORAS_COD": () => (/* binding */ FORMULACAO_EXTRUSORAS_COD),
/* harmony export */   "FORMULACAO_EXTRUSORAS_VAL": () => (/* binding */ FORMULACAO_EXTRUSORAS_VAL),
/* harmony export */   "FORMULACAO_MANGUEIRAS": () => (/* binding */ FORMULACAO_MANGUEIRAS),
/* harmony export */   "FORMULACAO_PONDERACAO_EXTR": () => (/* binding */ FORMULACAO_PONDERACAO_EXTR),
/* harmony export */   "FORMULACAO_TOLERANCIA": () => (/* binding */ FORMULACAO_TOLERANCIA),
/* harmony export */   "GAMAOPERATORIA": () => (/* binding */ GAMAOPERATORIA),
/* harmony export */   "GTIN": () => (/* binding */ GTIN),
/* harmony export */   "MAX_UPLOAD_SIZE": () => (/* binding */ MAX_UPLOAD_SIZE),
/* harmony export */   "MEDIA_URL": () => (/* binding */ MEDIA_URL),
/* harmony export */   "PAGE_TOOLBAR_HEIGHT": () => (/* binding */ PAGE_TOOLBAR_HEIGHT),
/* harmony export */   "PALETE_SIZES": () => (/* binding */ PALETE_SIZES),
/* harmony export */   "PALETIZACAO_ITEMS": () => (/* binding */ PALETIZACAO_ITEMS),
/* harmony export */   "ROOT_URL": () => (/* binding */ ROOT_URL),
/* harmony export */   "SCREENSIZE_OPTIMIZED": () => (/* binding */ SCREENSIZE_OPTIMIZED),
/* harmony export */   "SOCKET": () => (/* binding */ SOCKET),
/* harmony export */   "THICKNESS": () => (/* binding */ THICKNESS),
/* harmony export */   "TIME_FORMAT": () => (/* binding */ TIME_FORMAT),
/* harmony export */   "TIPOANEXOS_OF": () => (/* binding */ TIPOANEXOS_OF),
/* harmony export */   "TIPOEMENDA_OPTIONS": () => (/* binding */ TIPOEMENDA_OPTIONS)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }















var ROOT_URL = "http://localhost:8000";
var CSRF = document.cookie.replace("csrftoken=", "");
var MAX_UPLOAD_SIZE = 5; //MB

var API_URL = "/api";
var DOWNLOAD_URL = "/downloadfile";
var MEDIA_URL = "/media";
var DADOSBASE_URL = "".concat(API_URL, "/dadosbase");
var DATE_FORMAT = 'YYYY-MM-DD';
var DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var TIME_FORMAT = 'HH:mm';
var PAGE_TOOLBAR_HEIGHT = "45px";
var SOCKET = {
  url: 'ws://localhost:8000/ws'
};
var SCREENSIZE_OPTIMIZED = {
  width: 1920,
  height: 1080
}; //APP DATA
//ORDEM FABRICO TIPO ANEXOS

var TIPOANEXOS_OF = [{
  value: "Ficha de Processo",
  key: "Ficha de Processo"
}, {
  value: "Ficha Técnica",
  key: "Ficha Técnica"
}, {
  value: "Resumo de Produção",
  key: "Resumo de Produção"
}, {
  value: "Packing List",
  key: "Packing List"
}, {
  value: "Orientação Qualidade",
  key: "Orientação Qualidade"
}, {
  value: "Ordem de Fabrico",
  key: "Ordem de Fabrico"
}]; //SENTIDO ENROLAMENTO

var ENROLAMENTO_OPTIONS = [{
  label: "Anti-Horário",
  value: 1
}, {
  label: "Horário",
  value: 2
}];
var TIPOEMENDA_OPTIONS = [{
  value: "Fita Preta",
  key: 1
}, {
  value: "Fita metálica e Fita Preta",
  key: 2
}, {
  value: "Fita metálica",
  key: 3
}]; //--ARTIGO

var THICKNESS = 325; //microns

var GTIN = '560084119'; //--PALETIZAÇÃO

var PALETIZACAO_ITEMS = [{
  key: 1,
  value: "Palete"
}, {
  key: 2,
  value: "Bobines"
}, {
  key: 3,
  value: "Placa de Cartão"
}, {
  key: 4,
  value: "Placa MDF"
}, {
  key: 5,
  value: "Placa de Plástico"
}];
var PALETE_SIZES = [{
  key: '970x970',
  value: "970x970"
}, {
  key: '1080x1080',
  value: "1080x1080"
}, {
  key: '760x760',
  value: "760x760"
}];
var CONTENTORES_OPTIONS = [{
  label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_13__.createElement("b", null, "Cami\xE3o"),
  value: 'Camião'
}, {
  label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_13__.createElement("b", null, "40HC"),
  value: '40HC'
}, {
  label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_13__.createElement("b", null, "40DV"),
  value: '40DV'
}, {
  label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_13__.createElement("b", null, "20"),
  value: '20'
}];
var CINTASPALETES_OPTIONS = [{
  label: "Ambas as Paletes",
  value: 1
}, {
  label: "Palete Superior",
  value: 2
}, {
  label: "Palete Inferior",
  value: 3
}]; //--FORMULAÇÃO

var FORMULACAO_EXTRUSORAS_COD = ['A', 'C', 'B', 'C', 'A'];
var FORMULACAO_MANGUEIRAS = {
  A: [{
    key: 'A1'
  }, {
    key: 'A2'
  }, {
    key: 'A3'
  }, {
    key: 'A4'
  }, {
    key: 'A5'
  }, {
    key: 'A6'
  }],
  BC: [{
    key: 'B1'
  }, {
    key: 'B2'
  }, {
    key: 'B3'
  }, {
    key: 'B4'
  }, {
    key: 'B5'
  }, {
    key: 'B6'
  }, {
    key: 'C1'
  }, {
    key: 'C2'
  }, {
    key: 'C3'
  }, {
    key: 'C4'
  }, {
    key: 'C5'
  }, {
    key: 'C6'
  }],
  B: [{
    key: 'B1'
  }, {
    key: 'B2'
  }, {
    key: 'B3'
  }, {
    key: 'B4'
  }, {
    key: 'B5'
  }, {
    key: 'B6'
  }],
  C: [{
    key: 'C1'
  }, {
    key: 'C2'
  }, {
    key: 'C3'
  }, {
    key: 'C4'
  }, {
    key: 'C5'
  }, {
    key: 'C6'
  }]
};
var FORMULACAO_EXTRUSORAS_VAL = [5, 22.5, 45, 22.5, 5];
var FORMULACAO_TOLERANCIA = 0.5;

var ponderacaoExtrusoras = function ponderacaoExtrusoras() {
  var p = [0, 0];

  var _iterator = _createForOfIteratorHelper(FORMULACAO_EXTRUSORAS_COD.entries()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          index = _step$value[0],
          value = _step$value[1];

      if (value === "A") {
        p[0] += FORMULACAO_EXTRUSORAS_VAL[index];
      } else {
        p[1] += FORMULACAO_EXTRUSORAS_VAL[index];
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return p;
};

var FORMULACAO_PONDERACAO_EXTR = ponderacaoExtrusoras();
var GAMAOPERATORIA = [{
  key: "A",
  designacao: "Gramagem do filme",
  unidade: "gsm",
  nvalues: 1,
  min: 0,
  max: 999,
  tolerancia: 10
}, {
  key: "B",
  designacao: "Espessura set",
  unidade: "µm",
  nvalues: 1,
  min: 0,
  max: 999,
  tolerancia: 10
}, {
  key: "C",
  designacao: "Densidades (Extrusoras A, B, C e Total)",
  unidade: "",
  nvalues: 1,
  min: 0,
  max: 999,
  tolerancia: 10,
  disabled: true
}, {
  key: "D",
  designacao: "Velocidade da linha - Na bobinadora",
  unidade: "m/min",
  nvalues: 1,
  min: 0,
  max: 999,
  tolerancia: 10
}, {
  key: "E",
  designacao: "Temperatura na extrusora A",
  unidade: "ºC",
  nvalues: 8,
  min: -999,
  max: 999,
  tolerancia: 10
}, {
  key: "F",
  designacao: "Temperatura nas extrusoras B e C",
  unidade: "ºC",
  nvalues: 9,
  min: -999,
  max: 999,
  tolerancia: 10
}, {
  key: "G",
  designacao: "Temperatura no feed-block",
  unidade: "ºC",
  nvalues: 1,
  min: -999,
  max: 999,
  tolerancia: 10
}, {
  key: "H",
  designacao: "Temperatura na fieira",
  unidade: "ºC",
  nvalues: 1,
  min: -999,
  max: 999,
  tolerancia: 10
}, {
  key: "I",
  designacao: "Posicionamento dos parcializadores da fieira",
  unidade: "mm",
  nvalues: 2,
  min: 0,
  max: 999,
  tolerancia: 10
}, {
  key: "J",
  designacao: "Pressão na Comerio",
  unidade: "bar",
  nvalues: 2,
  min: 0,
  max: 999,
  tolerancia: 10
}, {
  key: "K",
  designacao: "Posição dos eixos na calandra LO/LA",
  unidade: "mm",
  nvalues: 2,
  min: -999,
  max: 999,
  precision: 1,
  tolerancia: 10
}, {
  key: "L",
  designacao: "Temperatura da Comerio",
  unidade: "ºC",
  nvalues: 1,
  min: -999,
  max: 999,
  tolerancia: 10
}, {
  key: "M",
  designacao: "Pick Breaker",
  unidade: "mm",
  nvalues: 1,
  min: -999,
  max: 999,
  precision: 1,
  tolerancia: 10
}, {
  key: "N",
  designacao: "Pressão do pêndulo",
  unidade: "bar",
  nvalues: 2,
  min: 0,
  max: 999,
  precision: 1,
  tolerancia: 10
}, {
  key: "O",
  designacao: "Referência da curva de tensão de Bobinagem",
  unidade: "",
  nvalues: 1,
  min: 0,
  max: 999,
  tolerancia: 10
}, {
  key: "P",
  designacao: "Rolo C",
  unidade: "ºC",
  nvalues: 1,
  min: -999,
  max: 999,
  tolerancia: 10
}, {
  key: "Q",
  designacao: "Rolo F",
  unidade: "ºC",
  nvalues: 1,
  min: -999,
  max: 999,
  tolerancia: 10
}];
var ARTIGOS_SPECS = [{
  key: "A",
  designacao: "Basis Weight",
  unidade: "gsm",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "B",
  designacao: "Tensile at peak CD",
  unidade: "N/25mm",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "C",
  designacao: "Elongation at break CD",
  unidade: "%",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "D",
  designacao: "Elongation at 9.81N CD",
  unidade: "%",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "E",
  designacao: "Load at 5% elongation 1st cycle CD",
  nvalues: 4,
  unidade: "N/50mm",
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "F",
  designacao: "Load at 10% elongation 1st cycle CD",
  nvalues: 4,
  unidade: "N/50mm",
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "G",
  designacao: "Load at 20% elongation 1st cycle CD",
  nvalues: 4,
  unidade: "N/50mm",
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "H",
  designacao: "Load at 50% elongation 1st cycle CD",
  nvalues: 4,
  unidade: "N/50mm",
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "I",
  designacao: "Permanent set 2nd cycle",
  unidade: "%",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "J",
  designacao: "Load at 100% elongation 2nd cycle",
  unidade: "N/50mm",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "K",
  designacao: "Permanent set 3rd cycle",
  unidade: "%",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "L",
  designacao: "Load at 100% elongation 3rd cycle",
  unidade: "N/50mm",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}, {
  key: "M",
  designacao: "Lamination strenght (CD)",
  unidade: "N/25mm",
  nvalues: 4,
  min: 0,
  max: 999,
  precision: 1
}]; //BOBINES

var BOBINE_ESTADOS = [{
  value: 'G'
}, {
  value: 'DM12'
}, {
  value: 'R'
}, {
  value: 'BA'
}, {
  value: 'LAB'
}, {
  value: 'IND'
}, {
  value: 'HOLD'
}, {
  value: 'SC'
}];
var BOBINE_DEFEITOS = [{
  value: 'troca_nw',
  label: 'Troca NW'
}, {
  value: 'con',
  label: 'Cónico'
}, {
  value: 'descen',
  label: 'Descentrada'
}, {
  value: 'presa',
  label: 'Presa'
}, {
  value: 'diam_insuf',
  label: 'Diâmetro Insuficiente'
}, {
  value: 'furos',
  label: 'Furos'
}, {
  value: 'outros',
  label: 'Outros'
}, {
  value: 'buraco',
  label: 'Buracos'
}, {
  value: 'nok',
  label: 'Largura NOK'
}, {
  value: 'car',
  label: 'Carro Atrás'
}, {
  value: 'fc',
  label: 'Falha Corte'
}, {
  value: 'ff',
  label: 'Falha Filme'
}, {
  value: 'fmp',
  label: 'Falha Matéria Prima'
}, {
  value: 'lac',
  label: 'Laçou'
}, {
  value: 'ncore',
  label: 'Não Colou'
}, {
  value: 'suj',
  label: 'Sujidade'
}, {
  value: 'sbrt',
  label: 'Sobretiragem'
}, {
  value: 'esp',
  label: 'Gramagem'
}];

/***/ }),

/***/ "./src/index.jsx":
/*!***********************!*\
  !*** ./src/index.jsx ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pages_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pages/App */ "./src/pages/App.jsx");


/***/ }),

/***/ "./src/pages/App.jsx":
/*!***************************!*\
  !*** ./src/pages/App.jsx ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppContext": () => (/* binding */ AppContext),
/* harmony export */   "MediaContext": () => (/* binding */ MediaContext),
/* harmony export */   "SocketContext": () => (/* binding */ SocketContext),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var react_responsive__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! react-responsive */ "./node_modules/react-responsive/dist/react-responsive.js");
/* harmony import */ var react_responsive__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(react_responsive__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var _app_css__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./app.css */ "./src/pages/app.css");
/* harmony import */ var antd_dist_antd_compact_less__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! antd/dist/antd.compact.less */ "./node_modules/antd/dist/antd.compact.less");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var react_use_websocket__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! react-use-websocket */ "./node_modules/react-use-websocket/dist/index.js");
/* harmony import */ var use_immer__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! use-immer */ "./node_modules/use-immer/dist/use-immer.module.js");
/* harmony import */ var utils_useWindowDimensions__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! utils/useWindowDimensions */ "./src/utils/useWindowDimensions.js");
var _excluded = ["titleId", "auth"];

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



























var NotFound = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_15__.lazy)(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_antd_es_result_index_js"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_CheckCircleFilled_js-node_modules_ant-design_i-46370c"), __webpack_require__.e("src_pages_404_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./404 */ "./src/pages/404.jsx"));
});
var SOrders = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_15__.lazy)(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_CheckCircleFilled_js-node_modules_ant-design_i-46370c"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_components_Icon_js-node_modules_ant-design_icons_es_-369dd9"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_FullscreenOutlined_js-node_modules_ant-design_-e9c150"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_UserOutlined_js"), __webpack_require__.e("src_components_form_jsx-src_components_portal_jsx-src_components_table_jsx-src_utils_schemaVa-000b1c"), __webpack_require__.e("src_components_SubLayout_jsx-src_components_container_jsx"), __webpack_require__.e("src_pages_SOrders_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./SOrders */ "./src/pages/SOrders.jsx"));
});
var OFabricoList = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_15__.lazy)(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("app_styles"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_CheckCircleFilled_js-node_modules_ant-design_i-46370c"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_components_Icon_js-node_modules_ant-design_icons_es_-369dd9"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_FileExcelTwoTone_js-node_modules_ant-design_ic-b9903b"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_FullscreenOutlined_js-node_modules_ant-design_-e9c150"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_UnorderedListOutlined_js-node_modules_core-js_-57d5d3"), __webpack_require__.e("src_components_form_jsx-src_components_portal_jsx-src_components_table_jsx-src_utils_schemaVa-000b1c"), __webpack_require__.e("src_components_Drawer_jsx-src_components_YScroll_jsx"), __webpack_require__.e("src_components_SubLayout_jsx-src_components_container_jsx"), __webpack_require__.e("src_pages_OFabricoList_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./OFabricoList */ "./src/pages/OFabricoList.jsx"));
});
var BobinagensValidarList = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_15__.lazy)(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("app_styles"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_CheckCircleFilled_js-node_modules_ant-design_i-46370c"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_components_Icon_js-node_modules_ant-design_icons_es_-369dd9"), __webpack_require__.e("vendors-node_modules_core-js_modules_es_number_to-fixed_js"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_FileExcelTwoTone_js-node_modules_ant-design_ic-b9903b"), __webpack_require__.e("src_components_form_jsx-src_components_portal_jsx-src_components_table_jsx-src_utils_schemaVa-000b1c"), __webpack_require__.e("src_components_Drawer_jsx-src_components_YScroll_jsx"), __webpack_require__.e("src_pages_bobinagens_BobinagensValidarList_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./bobinagens/BobinagensValidarList */ "./src/pages/bobinagens/BobinagensValidarList.jsx"));
});
var LayoutPage = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_15__.lazy)(function () {
  return __webpack_require__.e(/*! import() */ "src_pages_LayoutPage_jsx").then(__webpack_require__.bind(__webpack_require__, /*! ./LayoutPage */ "./src/pages/LayoutPage.jsx"));
});
/* const OFDetails = lazy(() => import('./ordemFabrico/FormDetails')); */

var MediaContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createContext({});
var SocketContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createContext({});
var AppContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createContext({});

var WrapperRouteComponent = function WrapperRouteComponent(_ref) {
  var titleId = _ref.titleId,
      auth = _ref.auth,
      props = _objectWithoutProperties(_ref, _excluded);

  //const { formatMessage } = useIntl();
  //const WitchRoute = auth ? PrivateRoute : Route;
  var WitchRoute = react_router_dom__WEBPACK_IMPORTED_MODULE_22__.Route; //if (titleId) {document.title = formatMessage({id: titleId});}

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(WitchRoute, props);
};

var RenderRouter = function RenderRouter() {
  var element = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_22__.useRoutes)([{
    path: '/app',
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Suspense, {
      fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_23__["default"], null)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(LayoutPage, null)),
    children: [{
      path: "validateReellings",
      element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Suspense, {
        fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_23__["default"], null)
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(BobinagensValidarList, null))
    }, {
      path: "ofabricolist",
      element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Suspense, {
        fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_23__["default"], null)
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(OFabricoList, null))
    }, {
      path: "sorders",
      element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Suspense, {
        fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_23__["default"], null)
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(SOrders, null))
    }
    /*  { path: "ordemfabrico/formdetails", element: <Suspense fallback={<Spin />}><OFDetails /></Suspense> }, */
    ]
  }, {
    path: "*",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Suspense, {
      fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_23__["default"], null)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(NotFound, null))
  }]);
  return element;
};

var useMedia = function useMedia() {
  var isBigScreen = (0,react_responsive__WEBPACK_IMPORTED_MODULE_24__.useMediaQuery)({
    minWidth: 1824
  });
  var isDesktop = (0,react_responsive__WEBPACK_IMPORTED_MODULE_24__.useMediaQuery)({
    minWidth: 992
  });
  var isTablet = (0,react_responsive__WEBPACK_IMPORTED_MODULE_24__.useMediaQuery)({
    minWidth: 768,
    maxWidth: 991
  });
  var isMobile = (0,react_responsive__WEBPACK_IMPORTED_MODULE_24__.useMediaQuery)({
    maxWidth: 767
  });
  var isPortrait = (0,react_responsive__WEBPACK_IMPORTED_MODULE_24__.useMediaQuery)({
    orientation: 'portrait'
  });
  var windowDimension = (0,utils_useWindowDimensions__WEBPACK_IMPORTED_MODULE_21__["default"])();

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_15__.useState)(),
      _useState2 = _slicedToArray(_useState, 2),
      width = _useState2[0],
      setWidth = _useState2[1];

  (0,react__WEBPACK_IMPORTED_MODULE_15__.useEffect)(function () {
    var orientation = isPortrait ? "portrait" : "landscape";

    if (isBigScreen) {
      setWidth({
        width: 900,
        unit: "px",
        maxWidth: 80,
        maxUnit: "%",
        device: "bigscreen",
        orientation: orientation,
        windowDimension: windowDimension
      });
    } else if (isDesktop) {
      setWidth({
        width: 800,
        unit: "px",
        maxWidth: 80,
        maxUnit: "%",
        device: "desktop",
        orientation: orientation,
        windowDimension: windowDimension
      });
    } else if (isTablet) {
      setWidth({
        width: 100,
        unit: "%",
        maxWidth: 100,
        maxUnit: "%",
        device: "tablet",
        orientation: orientation,
        windowDimension: windowDimension
      });
    } else {
      setWidth({
        width: 100,
        unit: "%",
        maxWidth: 100,
        maxUnit: "%",
        device: "mobile",
        orientation: orientation,
        windowDimension: windowDimension
      });
    }
  }, [isDesktop, isTablet, isMobile, isBigScreen]);
  return [width];
};

var App = function App() {
  var _useMedia = useMedia(),
      _useMedia2 = _slicedToArray(_useMedia, 1),
      width = _useMedia2[0];

  var _useImmer = (0,use_immer__WEBPACK_IMPORTED_MODULE_25__.useImmer)({}),
      _useImmer2 = _slicedToArray(_useImmer, 2),
      appState = _useImmer2[0],
      updateAppState = _useImmer2[1];

  var _useWebSocket = (0,react_use_websocket__WEBPACK_IMPORTED_MODULE_20__["default"])("".concat(config__WEBPACK_IMPORTED_MODULE_19__.SOCKET.url, "/realtimealerts"), {
    onOpen: function onOpen() {
      return console.log("Connected to Web Socket");
    },

    /*         onMessage: (v) => {
                if (lastJsonMessage) {
                    console.log(v,lastJsonMessage);
                }
            }, */
    queryParams: {
      'token': '123456'
    },
    onError: function onError(event) {
      console.error(event);
    },
    shouldReconnect: function shouldReconnect(closeEvent) {
      return true;
    },
    reconnectInterval: 3000
  }),
      lastJsonMessage = _useWebSocket.lastJsonMessage,
      sendJsonMessage = _useWebSocket.sendJsonMessage;

  (0,react__WEBPACK_IMPORTED_MODULE_15__.useEffect)(function () {
    console.log("RECIVING", lastJsonMessage);
  }, [lastJsonMessage === null || lastJsonMessage === void 0 ? void 0 : lastJsonMessage.hash]);
  (0,react__WEBPACK_IMPORTED_MODULE_15__.useEffect)(function () {//sendJsonMessage({ cmd: 'initAlerts' });
  }, []); //    useEffect(()=>{
  //
  //   },[lastJsonMessage])

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_26__.BrowserRouter, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(MediaContext.Provider, {
    value: width
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(AppContext.Provider, {
    value: {}
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(SocketContext.Provider, {
    value: lastJsonMessage
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(RenderRouter, null)))));
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);
var container = document.getElementById("app");
react_dom__WEBPACK_IMPORTED_MODULE_16__.render( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(App, null), container);

/***/ }),

/***/ "./src/utils/index.js":
/*!****************************!*\
  !*** ./src/utils/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "debounce": () => (/* binding */ debounce),
/* harmony export */   "deepMerge": () => (/* binding */ deepMerge),
/* harmony export */   "getFilterRangeValues": () => (/* binding */ getFilterRangeValues),
/* harmony export */   "getFilterValue": () => (/* binding */ getFilterValue),
/* harmony export */   "groupBy": () => (/* binding */ groupBy),
/* harmony export */   "gtinCheckdigit": () => (/* binding */ gtinCheckdigit),
/* harmony export */   "hasValue": () => (/* binding */ hasValue),
/* harmony export */   "isValue": () => (/* binding */ isValue),
/* harmony export */   "noValue": () => (/* binding */ noValue),
/* harmony export */   "useSubmitting": () => (/* binding */ useSubmitting)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_regexp_constructor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.regexp.constructor.js */ "./node_modules/core-js/modules/es.regexp.constructor.js");
/* harmony import */ var core_js_modules_es_regexp_constructor_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_constructor_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_regexp_to_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.regexp.to-string.js */ "./node_modules/core-js/modules/es.regexp.to-string.js");
/* harmony import */ var core_js_modules_es_regexp_to_string_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_to_string_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.string.match.js */ "./node_modules/core-js/modules/es.string.match.js");
/* harmony import */ var core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/web.timers.js */ "./node_modules/core-js/modules/web.timers.js");
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.reverse.js */ "./node_modules/core-js/modules/es.array.reverse.js");
/* harmony import */ var core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.string.split.js */ "./node_modules/core-js/modules/es.string.split.js");
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_parse_int_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.parse-int.js */ "./node_modules/core-js/modules/es.parse-int.js");
/* harmony import */ var core_js_modules_es_parse_int_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_int_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.array.reduce.js */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var ramda__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ramda */ "./node_modules/ramda/es/index.js");

























function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



var useSubmitting = function useSubmitting() {
  var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_24__.useState)(val),
      _useState2 = _slicedToArray(_useState, 2),
      state = _useState2[0],
      setState = _useState2[1];

  var currentState = (0,react__WEBPACK_IMPORTED_MODULE_24__.useRef)(val);

  var trigger = function trigger() {
    setState(true);
  };

  var init = function init() {
    var ret = false;

    if (!currentState.current) {
      ret = true;
      currentState.current = true;
    }

    return ret;
  };

  var end = function end() {
    currentState.current = false;
    setState(false);
  };

  var initiated = function initiated() {
    return currentState.current;
  };

  return {
    trigger: trigger,
    init: init,
    end: end,
    initiated: initiated,
    state: state
  };
};
var getFilterRangeValues = function getFilterRangeValues(data) {
  var ret = [];

  if (!(data !== null && data !== void 0 && data.startValue) && !(data !== null && data !== void 0 && data.endValue)) {
    return undefined;
  }

  if (data !== null && data !== void 0 && data.startValue) {
    ret.push(">=".concat(data.startValue));
  } else {
    ret.push(null);
  }

  if (data !== null && data !== void 0 && data.endValue) {
    ret.push("<=".concat(data.endValue));
  } else {
    ret.push(null);
  }

  return ret;
}; //type = any | start | end | exact

var getFilterValue = function getFilterValue(v) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'exact';
  var val = v === undefined ? v : (v === null || v === void 0 ? void 0 : v.value) === undefined ? v : v.value;

  if (val !== '' && val !== undefined) {
    var re = new RegExp('(^==|^=|^!==|^!=|^>=|^<=|^>|^<|^between:|^in:|^!between:|^!in:|isnull|!isnull)(.*)', 'i');
    var matches = val.match(re);

    if (matches !== null && matches.length > 0) {
      return "".concat(val);
    } else {
      switch (type) {
        case 'any':
          return "%".concat(val.replaceAll(' ', '%%'), "%");

        case 'start':
          return "".concat(val, "%");

        case 'end':
          return "".concat(val, "%");

        case '==':
          return "==".concat(val);

        case '<':
          return "<".concat(val);

        case '>':
          return ">".concat(val);

        case '<=':
          return "<=".concat(val);

        case '>=':
          return ">=".concat(val);

        default:
          return "==".concat(val, "%");
      }
    }
  }

  return undefined;
};
var isValue = function isValue(value, compare) {
  var ret = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (value === compare) {
    return ret;
  }

  return value;
};
var hasValue = function hasValue(value, compare) {
  var ret = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (value === compare) {
    return ret;
  }

  return value;
};
var noValue = function noValue(value) {
  var ret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (!value) {
    return ret;
  }

  return value;
};
var deepMerge = function deepMerge(a, b) {
  return ramda__WEBPACK_IMPORTED_MODULE_25__.is(Object, a) && ramda__WEBPACK_IMPORTED_MODULE_25__.is(Object, b) ? ramda__WEBPACK_IMPORTED_MODULE_25__.mergeWith(deepMerge, a, b) : b;
};
var debounce = function debounce(fn, time) {
  var timeoutId;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(function () {
      timeoutId = null;
      fn.apply(void 0, args);
    }, time);
  };
};
var gtinCheckdigit = function gtinCheckdigit(input) {
  var array = input.split('').reverse();
  var total = 0;
  var i = 1;
  array.forEach(function (number) {
    number = parseInt(number);

    if (i % 2 === 0) {
      total = total + number;
    } else {
      total = total + number * 3;
    }

    i++;
  });
  return Math.ceil(total / 10) * 10 - total;
};
var groupBy = function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/***/ }),

/***/ "./src/utils/useWindowDimensions.js":
/*!******************************************!*\
  !*** ./src/utils/useWindowDimensions.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./index */ "./src/utils/index.js");













function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }




var getWindowDimensions = function getWindowDimensions() {
  var _window = window,
      width = _window.innerWidth,
      height = _window.innerHeight;
  return {
    width: width,
    height: height
  };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function () {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_12__.useState)(getWindowDimensions()),
      _useState2 = _slicedToArray(_useState, 2),
      windowDimensions = _useState2[0],
      setWindowDimensions = _useState2[1];

  (0,react__WEBPACK_IMPORTED_MODULE_12__.useEffect)(function () {
    var handleResize = function handleResize() {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener('resize', handleResize);
    return function () {
      return window.removeEventListener('resize', handleResize);
    };
  }, []);
  return windowDimensions;
});

/***/ }),

/***/ "./src/pages/app.css":
/*!***************************!*\
  !*** ./src/pages/app.css ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQuNSAyLjVoLTEzQS41LjUgMCAwIDAgMSAzdjEwYS41LjUgMCAwIDAgLjUuNWgxM2EuNS41IDAgMCAwIC41LS41VjNhLjUuNSAwIDAgMC0uNS0uNXpNNS4yODEgNC43NWExIDEgMCAwIDEgMCAyIDEgMSAwIDAgMSAwLTJ6bTguMDMgNi44M2EuMTI3LjEyNyAwIDAgMS0uMDgxLjAzSDIuNzY5YS4xMjUuMTI1IDAgMCAxLS4wOTYtLjIwN2wyLjY2MS0zLjE1NmEuMTI2LjEyNiAwIDAgMSAuMTc3LS4wMTZsLjAxNi4wMTZMNy4wOCAxMC4wOWwyLjQ3LTIuOTNhLjEyNi4xMjYgMCAwIDEgLjE3Ny0uMDE2bC4wMTUuMDE2IDMuNTg4IDQuMjQ0YS4xMjcuMTI3IDAgMCAxLS4wMi4xNzV6IiBmaWxsPSIjOEM4QzhDIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQuNSAyLjVoLTEzQS41LjUgMCAwIDAgMSAzdjEwYS41LjUgMCAwIDAgLjUuNWgxM2EuNS41IDAgMCAwIC41LS41VjNhLjUuNSAwIDAgMC0uNS0uNXpNNS4yODEgNC43NWExIDEgMCAwIDEgMCAyIDEgMSAwIDAgMSAwLTJ6bTguMDMgNi44M2EuMTI3LjEyNyAwIDAgMS0uMDgxLjAzSDIuNzY5YS4xMjUuMTI1IDAgMCAxLS4wOTYtLjIwN2wyLjY2MS0zLjE1NmEuMTI2LjEyNiAwIDAgMSAuMTc3LS4wMTZsLjAxNi4wMTZMNy4wOCAxMC4wOWwyLjQ3LTIuOTNhLjEyNi4xMjYgMCAwIDEgLjE3Ny0uMDE2bC4wMTUuMDE2IDMuNTg4IDQuMjQ0YS4xMjcuMTI3IDAgMCAxLS4wMi4xNzV6IiBmaWxsPSIjOEM4QzhDIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4= ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQuNSAyLjVoLTEzQS41LjUgMCAwIDAgMSAzdjEwYS41LjUgMCAwIDAgLjUuNWgxM2EuNS41IDAgMCAwIC41LS41VjNhLjUuNSAwIDAgMC0uNS0uNXpNNS4yODEgNC43NWExIDEgMCAwIDEgMCAyIDEgMSAwIDAgMSAwLTJ6bTguMDMgNi44M2EuMTI3LjEyNyAwIDAgMS0uMDgxLjAzSDIuNzY5YS4xMjUuMTI1IDAgMCAxLS4wOTYtLjIwN2wyLjY2MS0zLjE1NmEuMTI2LjEyNiAwIDAgMSAuMTc3LS4wMTZsLjAxNi4wMTZMNy4wOCAxMC4wOWwyLjQ3LTIuOTNhLjEyNi4xMjYgMCAwIDEgLjE3Ny0uMDE2bC4wMTUuMDE2IDMuNTg4IDQuMjQ0YS4xMjcuMTI3IDAgMCAxLS4wMi4xNzV6IiBmaWxsPSIjOEM4QzhDIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=";

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["app_styles","vendors"], () => (__webpack_exec__("./src/index.jsx")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map