"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_planeamento_ordemFabrico_FormOFabricoValidar_jsx"],{

/***/ "./src/components/Tabs.jsx":
/*!*********************************!*\
  !*** ./src/components/Tabs.jsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TabPane": () => (/* binding */ TabPane),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "./node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_jss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-jss */ "./node_modules/react-jss/dist/react-jss.esm.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tabs/index.js");





var _excluded = ["children", "className", "dark"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






var useStyles = (0,react_jss__WEBPACK_IMPORTED_MODULE_7__.createUseStyles)({
  dark1: {
    '& > .ant-tabs-nav': {
      backgroundColor: "#f0f0f0!important"
    },
    '& .ant-tabs-tab': {
      backgroundColor: "#d9d9d9!important"
    },
    '& .ant-tabs-tab-active': {
      backgroundColor: "#fff!important"
    }
  }
});
var TabPane = antd__WEBPACK_IMPORTED_MODULE_8__["default"].TabPane;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var children = _ref.children,
      className = _ref.className,
      _ref$dark = _ref.dark,
      dark = _ref$dark === void 0 ? 0 : _ref$dark,
      rest = _objectWithoutProperties(_ref, _excluded);

  var classes = useStyles();
  var css = classnames__WEBPACK_IMPORTED_MODULE_6___default()(className, _defineProperty({}, classes.dark1, dark === 1));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(antd__WEBPACK_IMPORTED_MODULE_8__["default"], _extends({
    className: css
  }, rest), children);
});

/***/ }),

/***/ "./src/pages/planeamento/nonwovens/FormNonwovensUpsert.jsx":
/*!*****************************************************************!*\
  !*** ./src/pages/planeamento/nonwovens/FormNonwovensUpsert.jsx ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ../ordemFabrico/FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }



























function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

















var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_31__.getSchema)({
    nw_cod_sup: joi__WEBPACK_IMPORTED_MODULE_28___default().any().label("Nonwoven Superior").required(),
    nw_cod_inf: joi__WEBPACK_IMPORTED_MODULE_28___default().any().label("Nonwoven Inferiror").required()
  }, keys, excludeKeys).unknown(true);
};

var setId = function setId(id) {
  if (id) {
    return {
      key: "update",
      values: {
        id: id
      }
    };
  }

  return {
    key: "insert",
    values: {}
  };
};

var LoadMateriasPrimasLookup = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(token) {
    var _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/materiasprimaslookup/"),
              filter: {},
              parameters: {
                type: 'nonwovens'
              },
              cancelToken: token
            });

          case 2:
            _yield$fetchPost = _context.sent;
            rows = _yield$fetchPost.data.rows;
            return _context.abrupt("return", rows);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function LoadMateriasPrimasLookup(_x) {
    return _ref.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref2) {
  var record = _ref2.record,
      setFormTitle = _ref2.setFormTitle,
      parentRef = _ref2.parentRef,
      closeParent = _ref2.closeParent,
      parentReload = _ref2.parentReload,
      _ref2$wrapForm = _ref2.wrapForm,
      wrapForm = _ref2$wrapForm === void 0 ? "form" : _ref2$wrapForm,
      forInput = _ref2.forInput,
      changedValues = _ref2.changedValues,
      parentLoading = _ref2.parentLoading;
  var ctx = (0,react__WEBPACK_IMPORTED_MODULE_26__.useContext)(_ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_36__.OFabricoContext);

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_37__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      submitting = _useState4[0],
      setSubmitting = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      formStatus = _useState6[0],
      setFormStatus = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState8 = _slicedToArray(_useState7, 2),
      guides = _useState8[0],
      setGuides = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(setId(record.nonwovens_id)),
      _useState10 = _slicedToArray(_useState9, 2),
      operation = _useState10[0],
      setOperation = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    status: "none"
  }),
      _useState12 = _slicedToArray(_useState11, 2),
      resultMessage = _useState12[0],
      setResultMessage = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(),
      _useState14 = _slicedToArray(_useState13, 2),
      matPrimasLookup = _useState14[0],
      setMatPrimasLookup = _useState14[1];

  var init = function init() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var lookup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var nonwovens = record.nonwovens;
    var nonwovens_id = data.nonwovens_id,
        token = data.token;

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var _matPrimas, nData, _nonwovens$filter, _nonwovens$filter2, n;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _matPrimas = null;

              if (!(lookup || !matPrimasLookup)) {
                _context2.next = 6;
                break;
              }

              _context2.next = 4;
              return LoadMateriasPrimasLookup(token);

            case 4:
              _matPrimas = _context2.sent;
              setMatPrimasLookup(_matPrimas);

            case 6:
              nData = {};

              if (nonwovens_id) {
                if (!_matPrimas) {
                  _matPrimas = matPrimasLookup;
                }

                _nonwovens$filter = nonwovens.filter(function (v) {
                  return v.id === nonwovens_id;
                }), _nonwovens$filter2 = _slicedToArray(_nonwovens$filter, 1), n = _nonwovens$filter2[0];

                if (n) {
                  nData = {
                    nw_cod_sup: {
                      key: n.nw_cod_sup,
                      value: n.nw_cod_sup,
                      label: n.nw_des_sup
                    },
                    nw_cod_inf: {
                      key: n.nw_cod_inf,
                      value: n.nw_cod_inf,
                      label: n.nw_des_inf
                    },
                    designacao: n.designacao
                  };
                }
              }

              if (operation.key === "update") {
                setFormTitle && setFormTitle({
                  title: "Editar Nonwovens ".concat(ctx.item_cod),
                  subTitle: "".concat(ctx.item_nome)
                });
              } else {
                setFormTitle && setFormTitle({
                  title: "Definir Nonwovens ".concat(ctx.item_cod),
                  subTitle: "".concat(ctx.item_nome)
                });
              }

              form.setFieldsValue(nData);

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  };

  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.cancelToken)();

    if (!changedValues) {
      init({
        nonwovens_id: record.nonwovens_id,
        token: cancelFetch
      });
    }

    return function () {
      return cancelFetch.cancel("Form Nonwovens Upsert Cancelled");
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.cancelToken)();

    if (changedValues && !parentLoading) {
      if ("nonwovens_id" in changedValues) {
        init({
          nonwovens_id: changedValues.nonwovens_id,
          token: cancelFetch
        });
      } else {
        init({
          nonwovens_id: record.nonwovens_id,
          token: cancelFetch
        });
      }
    }

    return function () {
      return cancelFetch.cancel("Form Nonwovens Upsert Cancelled");
    };
  }, [changedValues, parentLoading]);

  var onFinish = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(values) {
      var _v$error, _v$warning;

      var status, msgKeys, v, _values$nw_cod_sup, nw_cod_sup, nw_des_sup, _values$nw_cod_inf, nw_cod_inf, nw_des_inf, response;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              msgKeys = [];
              v = schema().validate(values, {
                abortEarly: false
              });
              status.error = [].concat(_toConsumableArray(status.error), _toConsumableArray(v.error ? (_v$error = v.error) === null || _v$error === void 0 ? void 0 : _v$error.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));
              status.warning = [].concat(_toConsumableArray(status.warning), _toConsumableArray(v.warning ? (_v$warning = v.warning) === null || _v$warning === void 0 ? void 0 : _v$warning.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));

              if (v.error) {
                status.error.push({
                  message: "OS Nonwovens Superior e Inferior têm de estar preenchidos!"
                });
                setSubmitting(false);
              }

              if (!(status.error.length === 0)) {
                _context3.next = 18;
                break;
              }

              _values$nw_cod_sup = values.nw_cod_sup;
              _values$nw_cod_sup = _values$nw_cod_sup === void 0 ? {} : _values$nw_cod_sup;
              nw_cod_sup = _values$nw_cod_sup.value, nw_des_sup = _values$nw_cod_sup.label;
              _values$nw_cod_inf = values.nw_cod_inf;
              _values$nw_cod_inf = _values$nw_cod_inf === void 0 ? {} : _values$nw_cod_inf;
              nw_cod_inf = _values$nw_cod_inf.value, nw_des_inf = _values$nw_cod_inf.label;
              _context3.next = 15;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/newartigononwovens/"),
                parameters: _objectSpread(_objectSpread({}, values), {}, {
                  id: record === null || record === void 0 ? void 0 : record.nonwovens_id,
                  produto_id: ctx.produto_id,
                  nw_cod_sup: nw_cod_sup,
                  nw_des_sup: nw_des_sup,
                  nw_cod_inf: nw_cod_inf,
                  nw_des_inf: nw_des_inf
                })
              });

            case 15:
              response = _context3.sent;

              if (response.data.status !== "error") {
                parentReload({}, "lookup");
              }

              setResultMessage(response.data);

            case 18:
              setFormStatus(status);

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function onFinish(_x2) {
      return _ref4.apply(this, arguments);
    };
  }();

  var onSuccessOK = function onSuccessOK() {
    if (operation.key === "insert") {
      form.resetFields();
      init();
      setResultMessage({
        status: "none"
      });
    }

    setSubmitting(false);
  };

  var onErrorOK = function onErrorOK() {
    setSubmitting(false);
    setResultMessage({
      status: "none"
    });
  };

  var onClose = function onClose() {
    var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    closeParent();
  };

  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_26__.useCallback)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            setSubmitting(true);
            onFinish(form.getFieldsValue(true));

          case 2:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })), []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_34__["default"], {
    result: resultMessage,
    successButtonOK: operation.key === "insert" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "Definir Nonwovens"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_33__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish
    /* onValuesChange={onValuesChange} */
    ,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FormLayout, {
    id: "LAY-NONWOVENS-UPSERT",
    guides: guides,
    layout: "vertical",
    style: {
      width: "100%",
      padding: "0px"
      /* , minWidth: "700px" */

    },
    schema: schema,
    field: {
      forInput: forInput,
      wide: [16],
      margin: "2px",
      overflow: false,
      guides: guides,
      label: {
        enabled: true,
        pos: "top"
        /* pos: (forInput ? "top" : "left"), align: (forInput ? "start" : "end"), vAlign: "center", width: "140px" */
        ,
        wrap: false,
        overflow: false,
        colon: false,
        ellipsis: true
      },
      alert: {
        pos: "right",
        tooltip: true,
        container: false
        /* container: "el-external" */

      },
      layout: {
        top: "",
        right: "",
        center: "",
        bottom: "",
        left: ""
      },
      required: true,
      style: {
        alignSelf: "top"
      }
    },
    fieldSet: {
      guides: guides,
      wide: 16,
      margin: "2px",
      layout: "horizontal",
      overflow: false
    }
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    field: {
      wide: [6, 4]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "designacao",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
    placeholder: "Designa\xE7\xE3o",
    size: "small"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.VerticalSpace, {
    height: "12px"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    wide: 10,
    name: "nw_cod_sup",
    label: {
      text: "".concat(forInput ? "Nonwoven " : "", "Superior")
    },
    required: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
    size: "small",
    data: matPrimasLookup,
    keyField: "ITMREF_0",
    textField: "ITMDES1_0",
    optionsRender: function optionsRender(d, keyField, textField) {
      return {
        label: "".concat(d[textField]),
        value: d[keyField]
      };
    },
    showSearch: true,
    labelInValue: true,
    filterOption: function filterOption(input, option) {
      return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    wide: 10,
    name: "nw_cod_inf",
    label: {
      text: "".concat(forInput ? "Nonwoven " : "", "Inferior")
    },
    required: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
    size: "small",
    data: matPrimasLookup,
    keyField: "ITMREF_0",
    textField: "ITMDES1_0",
    optionsRender: function optionsRender(d, keyField, textField) {
      return {
        label: "".concat(d[textField]),
        value: d[keyField]
      };
    },
    labelInValue: true,
    showSearch: true,
    filterOption: function filterOption(input, option) {
      return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  })))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_35__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
    disabled: submitting,
    onClick: onSubmit,
    type: "primary"
  }, "Guardar")))));
});

/***/ }),

/***/ "./src/pages/planeamento/ordemFabrico/FormNonwovens.jsx":
/*!**************************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormNonwovens.jsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/EditOutlined.js");
/* harmony import */ var _nonwovens_FormNonwovensUpsert__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../nonwovens/FormNonwovensUpsert */ "./src/pages/planeamento/nonwovens/FormNonwovensUpsert.jsx");
/* harmony import */ var _FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");





















var _excluded = ["form", "guides", "schema", "fieldStatus"];


function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
















var Drawer = function Drawer(_ref) {
  var showWrapper = _ref.showWrapper,
      setShowWrapper = _ref.setShowWrapper,
      parentReload = _ref.parentReload;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      formTitle = _useState2[0],
      setFormTitle = _useState2[1];

  var iref = (0,react__WEBPACK_IMPORTED_MODULE_23__.useRef)();
  var _showWrapper$record = showWrapper.record,
      record = _showWrapper$record === void 0 ? {} : _showWrapper$record,
      forInput = showWrapper.forInput;

  var onVisible = function onVisible() {
    setShowWrapper(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        show: !prev.show
      });
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.WrapperForm, {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.TitleForm, {
      title: formTitle.title,
      subTitle: formTitle.subTitle
    }),
    type: "drawer",
    destroyOnClose: true //width={width}
    ,
    mask: true
    /* style={{ maginTop: "48px" }} */
    ,
    setVisible: onVisible,
    visible: showWrapper.show,
    width: 800,
    bodyStyle: {
      height: "450px"
      /*  paddingBottom: 80 */

      /* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */

    },
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement("div", {
      ref: iref,
      id: "form-wrapper",
      style: {
        textAlign: 'right'
      }
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(_nonwovens_FormNonwovensUpsert__WEBPACK_IMPORTED_MODULE_30__["default"], {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload,
    forInput: forInput
  }));
};

var loadNonwovensLookup = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
    var produto_id, token, _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            produto_id = _ref2.produto_id, token = _ref2.token;
            _context.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_26__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_27__.API_URL, "/nonwovenslookup/"),
              filter: {
                produto_id: produto_id
              },
              sort: [],
              cancelToken: token
            });

          case 3:
            _yield$fetchPost = _context.sent;
            rows = _yield$fetchPost.data.rows;
            return _context.abrupt("return", rows);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function loadNonwovensLookup(_x) {
    return _ref3.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref4) {
  var changedValues = _ref4.changedValues;

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_23__.useContext)(_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_31__.OFabricoContext),
      form = _useContext.form,
      guides = _useContext.guides,
      schema = _useContext.schema,
      fieldStatus = _useContext.fieldStatus,
      ctx = _objectWithoutProperties(_useContext, _excluded);

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)(true),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)({
    show: false
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      showForm = _useState6[0],
      setShowForm = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)([]),
      _useState8 = _slicedToArray(_useState7, 2),
      nonwovens = _useState8[0],
      setNonwovens = _useState8[1];

  (0,react__WEBPACK_IMPORTED_MODULE_23__.useEffect)(function () {
    var produto_id = ctx.produto_id;
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_26__.cancelToken)();
    loadData({
      nonwovens_id: form.getFieldValue("nonwovens_id"),
      produto_id: produto_id,
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel("Form Nonwovens Cancelled");
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_23__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_26__.cancelToken)();

    if (changedValues) {
      if ("nonwovens_id" in changedValues) {
        /*  setLoading(true);
         loadData({ [idRefName]: changedValues[idRefName], token: cancelFetch }); */
      }
    }

    return function () {
      return cancelFetch.cancel("Form Nonwovens Cancelled");
    };
  }, [changedValues]);

  var loadData = function loadData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "init";
    var produto_id = ctx.produto_id;
    var token = data.token;

    switch (type) {
      case "lookup":
        setLoading(true);

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.t0 = setNonwovens;
                  _context2.next = 3;
                  return loadNonwovensLookup({
                    produto_id: produto_id,
                    token: token
                  });

                case 3:
                  _context2.t1 = _context2.sent;
                  (0, _context2.t0)(_context2.t1);
                  setLoading(false);

                case 6:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }))();

        break;

      default:
        if (!loading) {
          setLoading(true);
        }

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var _nonwovens;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _nonwovens = nonwovens;

                  if (!produto_id) {
                    _context3.next = 6;
                    break;
                  }

                  _context3.next = 4;
                  return loadNonwovensLookup({
                    produto_id: produto_id,
                    token: token
                  });

                case 4:
                  _nonwovens = _context3.sent;
                  setNonwovens(_nonwovens);

                case 6:
                  setLoading(false);

                case 7:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }))();

    }
  };

  var onShowForm = function onShowForm() {
    var newForm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var forInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (newForm) {
      setShowForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: {},
          forInput: forInput
        });
      });
    } else {
      setShowForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: _objectSpread(_objectSpread({}, form.getFieldsValue(["nonwovens_id"])), {}, {
            nonwovens: nonwovens
          }),
          forInput: forInput
        });
      });
    }
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(react__WEBPACK_IMPORTED_MODULE_23__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_32__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_33__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(Drawer, {
    showWrapper: showForm,
    setShowWrapper: setShowForm,
    parentReload: loadData
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FormLayout, {
    id: "LAY-NONWOVENS",
    guides: guides,
    layout: "vertical",
    style: {
      width: "100%"
      /* padding: "5px", border: "solid 1px #dee2e6", borderRadius: "3px" */

      /* , minWidth: "700px" */

    },
    schema: schema,
    field: {
      //wide: [3, 2, 1, '*'],
      margin: "2px",
      overflow: false,
      guides: guides,
      label: {
        enabled: true,
        pos: "top",
        align: "start",
        vAlign: "center",
        width: "80px",
        wrap: false,
        overflow: false,
        colon: false,
        ellipsis: true
      },
      alert: {
        pos: "right",
        tooltip: true,
        container: true
        /* container: "el-external" */

      },
      layout: {
        top: "",
        right: "",
        center: "",
        bottom: "",
        left: ""
      },
      addons: {},
      //top|right|center|bottom|left
      required: true,
      style: {
        alignSelf: "top"
      }
    },
    fieldSet: {
      guides: guides,
      wide: 16,
      margin: "2px",
      layout: "horizontal",
      overflow: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.VerticalSpace, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.HorizontalRule, {
    title: "1. Nonwovens"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.VerticalSpace, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FieldSet, {
    margin: false,
    field: {
      wide: [6, 2]
    },
    style: {
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.Field, {
    name: "nonwovens_id",
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: false,
      text: "Nonwovens",
      pos: "left"
    },
    addons: _objectSpread({}, form.getFieldValue("nonwovens_id") && {
      right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_34__["default"], {
        onClick: function onClick() {
          return onShowForm(false, true);
        },
        style: {
          marginLeft: "3px"
        },
        size: "small"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_35__["default"], {
        style: {
          fontSize: "16px"
        }
      }))
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.SelectField, {
    allowClear: true,
    size: "small",
    data: nonwovens,
    keyField: "id",
    textField: "designacao",
    optionsRender: function optionsRender(d, keyField, textField) {
      return {
        label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement("div", {
          style: {
            display: "flex"
          }
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement("div", {
          style: {
            minWidth: "150px"
          }
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement("b", null, d[textField])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement("div", null, "v.", d["versao"])),
        value: d[keyField]
      };
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.Item, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_34__["default"], {
    onClick: function onClick() {
      return onShowForm(true, true);
    },
    size: "small"
  }, "Novo"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(_nonwovens_FormNonwovensUpsert__WEBPACK_IMPORTED_MODULE_30__["default"], {
    parentLoading: loading,
    record: _objectSpread({
      nonwovens: nonwovens
    }, form.getFieldsValue(["nonwovens_id"])),
    wrapForm: false,
    forInput: false,
    parentReload: loadData,
    changedValues: changedValues
  })))));
});

/***/ }),

/***/ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx":
/*!********************************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OFabricoContext": () => (/* binding */ OFabricoContext),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.number.to-fixed.js */ "./node_modules/core-js/modules/es.number.to-fixed.js");
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_useDataAPI__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! utils/useDataAPI */ "./src/utils/useDataAPI.js");
/* harmony import */ var utils__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! utils */ "./src/utils/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_Tabs__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! components/Tabs */ "./src/components/Tabs.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_iconButton__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! components/iconButton */ "./src/components/iconButton.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _FormRequirements__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./FormRequirements */ "./src/pages/planeamento/ordemFabrico/FormRequirements.jsx");
/* harmony import */ var _FormNonwovens__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./FormNonwovens */ "./src/pages/planeamento/ordemFabrico/FormNonwovens.jsx");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }











































var Option = antd__WEBPACK_IMPORTED_MODULE_40__["default"].Option,
    OptGroup = antd__WEBPACK_IMPORTED_MODULE_40__["default"].OptGroup;




var FormPaletizacao = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_react-icons_cg_index_esm_js"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormPaletizacao_jsx"), __webpack_require__.e("src_pages_planeamento_paletizacaoSchema_SvgSchema_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./FormPaletizacao */ "./src/pages/planeamento/ordemFabrico/FormPaletizacao.jsx"));
});
var FormFormulacao = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_react-icons_cg_index_esm_js"), __webpack_require__.e("vendors-node_modules_react-icons_md_index_esm_js"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormFormulacao_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./FormFormulacao */ "./src/pages/planeamento/ordemFabrico/FormFormulacao.jsx"));
});
var FormGamaOperatoria = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return __webpack_require__.e(/*! import() */ "src_pages_planeamento_ordemFabrico_FormGamaOperatoria_jsx").then(__webpack_require__.bind(__webpack_require__, /*! ./FormGamaOperatoria */ "./src/pages/planeamento/ordemFabrico/FormGamaOperatoria.jsx"));
});
var FormSpecs = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return __webpack_require__.e(/*! import() */ "src_pages_planeamento_ordemFabrico_FormSpecs_jsx").then(__webpack_require__.bind(__webpack_require__, /*! ./FormSpecs */ "./src/pages/planeamento/ordemFabrico/FormSpecs.jsx"));
});
var FormAgg = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_PaperClipOutlined_js-node_modules_antd_es_card-6f0df3"), __webpack_require__.e("vendors-node_modules_antd_es_list_Item_js-node_modules_antd_es_list_index_js"), __webpack_require__.e("src_pages_planeamento_paletizacaoSchema_SvgSchema_jsx"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormAgg_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./FormAgg */ "./src/pages/planeamento/ordemFabrico/FormAgg.jsx"));
});
var FormNwsCore = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return __webpack_require__.e(/*! import() */ "src_pages_planeamento_ordemFabrico_FormNwsCore_jsx").then(__webpack_require__.bind(__webpack_require__, /*! ./FormNwsCore */ "./src/pages/planeamento/ordemFabrico/FormNwsCore.jsx"));
});
var FormCortes = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_core-js_modules_es_array_every_js-node_modules_core-js_modules_es_array_-51ed75"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormCortes_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./FormCortes */ "./src/pages/planeamento/ordemFabrico/FormCortes.jsx"));
});
var OFabricoContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createContext({});

var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_33__.getSchema)({
    start_prev_date: joi__WEBPACK_IMPORTED_MODULE_28___default().any().label("Data de Início"),
    end_prev_date: joi__WEBPACK_IMPORTED_MODULE_28___default().any().label("Data de Fim")
  }, keys, excludeKeys).unknown(true);
};

var LoadOFabricoTemp = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(record, token) {
    var iorder, item, cliente_cod, ofabrico, _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            iorder = record.iorder, item = record.item, cliente_cod = record.cliente_cod, ofabrico = record.ofabrico;
            _context.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/tempofabricoget/"),
              filter: {
                of_id: ofabrico,
                item_cod: item,
                cliente_cod: cliente_cod,
                order_cod: iorder
              },
              cancelToken: token
            });

          case 3:
            _yield$fetchPost = _context.sent;
            rows = _yield$fetchPost.data.rows;
            return _context.abrupt("return", rows);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function LoadOFabricoTemp(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref2) {
  var record = _ref2.record,
      setFormTitle = _ref2.setFormTitle,
      parentRef = _ref2.parentRef,
      closeParent = _ref2.closeParent,
      parentReload = _ref2.parentReload;

  /*     const { temp_ofabrico_agg, temp_ofabrico, item_id, produto_id, produto_cod, ofabrico } = record; */
  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_43__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var submitting = (0,utils__WEBPACK_IMPORTED_MODULE_32__.useSubmitting)();

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState4 = _slicedToArray(_useState3, 2),
      fieldStatus = _useState4[0],
      setFieldStatus = _useState4[1];

  var submitForProduction = (0,react__WEBPACK_IMPORTED_MODULE_26__.useRef)(false);

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)("1"),
      _useState6 = _slicedToArray(_useState5, 2),
      activeTab = _useState6[0],
      setActiveTab = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState8 = _slicedToArray(_useState7, 2),
      paletizacaoChangedValues = _useState8[0],
      setPaletizacaoChangedValues = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState10 = _slicedToArray(_useState9, 2),
      formulacaoChangedValues = _useState10[0],
      setFormulacaoChangedValues = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState12 = _slicedToArray(_useState11, 2),
      gamaOperatoriaChangedValues = _useState12[0],
      setGamaOperatoriaChangedValues = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState14 = _slicedToArray(_useState13, 2),
      artigoSpecsChangedValues = _useState14[0],
      setArtigoSpecsChangedValues = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState16 = _slicedToArray(_useState15, 2),
      nonwovensChangedValues = _useState16[0],
      setNonwovensChangedValues = _useState16[1];

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState18 = _slicedToArray(_useState17, 2),
      requirementsChangedValues = _useState18[0],
      setRequirementsChangedValues = _useState18[1];

  var _useState19 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState20 = _slicedToArray(_useState19, 2),
      aggChangedValues = _useState20[0],
      setAggChangedValues = _useState20[1];

  var _useState21 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState22 = _slicedToArray(_useState21, 2),
      cortesOrdemChangedValues = _useState22[0],
      setCortesOrdemChangedValues = _useState22[1];

  var _useState23 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState24 = _slicedToArray(_useState23, 2),
      formStatus = _useState24[0],
      setFormStatus = _useState24[1];

  var _useState25 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState26 = _slicedToArray(_useState25, 2),
      guides = _useState26[0],
      setGuides = _useState26[1];

  var _useState27 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    status: "none"
  }),
      _useState28 = _slicedToArray(_useState27, 2),
      resultMessage = _useState28[0],
      setResultMessage = _useState28[1];

  var contextValue = {
    agg_id: record.temp_ofabrico_agg,
    of_id: record.temp_ofabrico,
    of_cod: record.ofabrico,
    produto_id: record.produto_id,
    produto_cod: record.produto_cod,
    item_id: record.item_id,
    item_cod: record.item,
    item_nome: record.item_nome,
    order: record.iorder,
    cliente_cod: record.cliente_cod,
    cliente_nome: record.cliente_nome,
    qty_item: record.qty_item,
    sage_start_date: record.start_date,
    sage_end_date: record.end_date,
    start_prev_date: record.start_prev_date,
    end_prev_date: record.end_prev_date,
    fieldStatus: fieldStatus,
    setFieldStatus: setFieldStatus,
    form: form,
    guides: guides,
    schema: schema
  };
  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.cancelToken)();
    setFormTitle({
      title: "Planear Ordem de Fabrico ".concat(record.ofabrico),
      subTitle: "".concat(record.item, " - ").concat(record.item_nome)
    });

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var _yield$LoadOFabricoTe, _yield$LoadOFabricoTe2, oFabricoTemp;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return LoadOFabricoTemp(record, cancelFetch);

            case 2:
              _yield$LoadOFabricoTe = _context2.sent;
              _yield$LoadOFabricoTe2 = _slicedToArray(_yield$LoadOFabricoTe, 1);
              oFabricoTemp = _yield$LoadOFabricoTe2[0];
              oFabricoTemp = _objectSpread({}, oFabricoTemp);
              form.setFieldsValue(_objectSpread(_objectSpread({}, oFabricoTemp), {}, {
                nbobines: (record.qty_item / oFabricoTemp.sqm_bobine).toFixed(2)
              }));
              setLoading(false);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();

    return function () {
      return cancelFetch.cancel("Form OFabrico Plannig Cancelled");
    };
  }, []);

  var onValuesChange = function onValuesChange(changedValues, allValues) {
    if ("paletizacao_id" in changedValues) {
      setPaletizacaoChangedValues(changedValues);
    } else if ("formulacao_id" in changedValues) {
      setFormulacaoChangedValues(changedValues);
    } else if ("gamaoperatoria_id" in changedValues) {
      setGamaOperatoriaChangedValues(changedValues);
    } else if ("artigospecs_id" in changedValues) {
      setArtigoSpecsChangedValues(changedValues);
    } else if ("nonwovens_id" in changedValues) {
      setNonwovensChangedValues(changedValues);
    }
    /* else if ("core_id" in changedValues) {
      setCoreChangedValues(changedValues);
    } */
    else if ("agg_id" in changedValues) {
      setAggChangedValues(changedValues);
    } else if ("cortesordem_id" in changedValues || "cortes" in changedValues) {
      setCortesOrdemChangedValues(changedValues);
    } else {
      setRequirementsChangedValues(changedValues);
    }
  };

  var onFinish = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(values) {
      var _v$error, _v$warning;

      var forproduction, status, msgKeys, cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, produto_cod, item_id, temp_ofabrico, _values$core_cod, core_cod, core_des, _form$getFieldsValue, cortes_id, diff, v, start_prev_date, end_prev_date, response;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (submitting.init()) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return");

            case 2:
              forproduction = submitForProduction.current;
              submitForProduction.current = false;
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              msgKeys = ["start_prev_date", "end_prev_date"];
              cliente_cod = record.cliente_cod, cliente_nome = record.cliente_nome, iorder = record.iorder, item = record.item, ofabrico = record.ofabrico, produto_id = record.produto_id, produto_cod = record.produto_cod, item_id = record.item_id, temp_ofabrico = record.temp_ofabrico;
              _values$core_cod = values.core_cod;
              _values$core_cod = _values$core_cod === void 0 ? {} : _values$core_cod;
              core_cod = _values$core_cod.value, core_des = _values$core_cod.label;
              _form$getFieldsValue = form.getFieldsValue(true), cortes_id = _form$getFieldsValue.cortes_id;
              diff = {};
              v = schema().custom(function (v, h) {
                var start_prev_date = v.start_prev_date,
                    end_prev_date = v.end_prev_date;
                diff = (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_33__.dateTimeDiffValidator)(start_prev_date, end_prev_date);

                if (diff.errors == true) {
                  return h.message("A Data de Fim tem de ser Maior que a Data de Início", {
                    key: "start_date",
                    label: "start_date"
                  });
                }
              }).validate(values, {
                abortEarly: false
              });
              status.error = [].concat(_toConsumableArray(status.error), _toConsumableArray(v.error ? (_v$error = v.error) === null || _v$error === void 0 ? void 0 : _v$error.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));
              status.warning = [].concat(_toConsumableArray(status.warning), _toConsumableArray(v.warning ? (_v$warning = v.warning) === null || _v$warning === void 0 ? void 0 : _v$warning.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));

              if (!v.error) {}

              if (!(status.error.length === 0)) {
                _context3.next = 28;
                break;
              }

              start_prev_date = values.start_prev_date, end_prev_date = values.end_prev_date;

              if ("nonwovens_id" in values && values["nonwovens_id"] === undefined) {
                values["nonwovens_id"] = -1;
              }

              if ("artigospecs_id" in values && values["artigospecs_id"] === undefined) {
                values["artigospecs_id"] = -1;
              }

              if ("formulacao_id" in values && values["formulacao_id"] === undefined) {
                values["formulacao_id"] = -1;
              }

              if ("gamaoperatoria_id" in values && values["gamaoperatoria_id"] === undefined) {
                values["gamaoperatoria_id"] = -1;
              }

              if ("cortesordem_id" in values && values["cortesordem_id"] === undefined) {
                values["cortesordem_id"] = -1;
              }

              _context3.next = 25;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/savetempordemfabrico/"),
                parameters: _objectSpread(_objectSpread({}, values), {}, {
                  ofabrico_cod: ofabrico,
                  ofabrico_id: temp_ofabrico,
                  forproduction: forproduction,
                  qty_item: record.qty_item,
                  start_prev_date: start_prev_date.format('YYYY-MM-DD HH:mm:ss'),

                  /* end_prev_date: end_prev_date.format('YYYY-MM-DD HH:mm:ss'), */
                  cliente_cod: cliente_cod,
                  cliente_nome: cliente_nome,
                  iorder: iorder,
                  item: item,
                  item_id: item_id,
                  core_cod: core_cod,
                  core_des: core_des,
                  produto_id: produto_id,
                  produto_cod: produto_cod,
                  cortes_id: cortes_id
                  /* , cortesordem_id */

                })
              });

            case 25:
              response = _context3.sent;
              setResultMessage(response.data);

              if (forproduction) {
                parentReload();
              }

            case 28:
              setFieldStatus(diff.fields);
              setFormStatus(status);

            case 30:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function onFinish(_x3) {
      return _ref4.apply(this, arguments);
    };
  }();

  var onSuccessOK = function onSuccessOK() {
    submitting.end();
    setResultMessage({
      status: "none"
    });
  };

  var onErrorOK = function onErrorOK() {
    submitting.end();
    setResultMessage({
      status: "none"
    });
  };

  var onClose = function onClose() {
    var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    closeParent();
  };

  var onSubmitForProduction = (0,react__WEBPACK_IMPORTED_MODULE_26__.useCallback)(function () {
    submitting.trigger(); //setSubmitting(true);

    submitForProduction.current = true;
    form.submit();
  }, []);
  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_26__.useCallback)(function () {
    submitting.trigger();
    form.submit();
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_44__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_45__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_37__["default"], {
    result: resultMessage,
    successButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "Continuar"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_36__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(OFabricoContext.Provider, {
    value: contextValue
    /* value={{ temp_ofabrico_agg, temp_ofabrico, item_id, produto_id, produto_cod, ofabrico, form, guides, schema }} */

  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], {
    form: form,
    name: "form-of-validar",
    onFinish: onFinish,
    onValuesChange: onValuesChange
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__["default"]
  /* onChange={() => { }} */
  , {
    type: "card",
    dark: 1,
    defaultActiveKey: "1",
    activeKey: activeTab,
    onChange: function onChange(k) {
      return setActiveTab(k);
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Requisitos",
    key: "1",
    forceRender: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_FormRequirements__WEBPACK_IMPORTED_MODULE_41__["default"], {
    changedValues: requirementsChangedValues
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Ordens Fabrico",
    key: "2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(FormAgg, {
    changedValues: aggChangedValues
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Nonwovens",
    key: "8"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_FormNonwovens__WEBPACK_IMPORTED_MODULE_42__["default"], {
    changedValues: nonwovensChangedValues
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Especifica\xE7\xF5es",
    key: "3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(FormSpecs, {
    changedValues: artigoSpecsChangedValues
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Formula\xE7\xE3o",
    key: "4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(FormFormulacao, {
    changedValues: formulacaoChangedValues
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Gama Operat\xF3ria",
    key: "5"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(FormGamaOperatoria, {
    changedValues: gamaOperatoriaChangedValues
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_Tabs__WEBPACK_IMPORTED_MODULE_35__.TabPane, {
    tab: "Cortes",
    key: "7"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(FormCortes, {
    changedValues: cortesOrdemChangedValues
  }))))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_39__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
    disabled: submitting.state,
    type: "primary",
    onClick: onSubmitForProduction
  }, "Submeter para Produ\xE7\xE3o"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
    disabled: submitting.state,
    onClick: onSubmit
  }, "Guardar Ordem de Fabrico")))));
});

/***/ }),

/***/ "./src/pages/planeamento/ordemFabrico/FormRequirements.jsx":
/*!*****************************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormRequirements.jsx ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.array.reverse.js */ "./node_modules/core-js/modules/es.array.reverse.js");
/* harmony import */ var core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.string.split.js */ "./node_modules/core-js/modules/es.string.split.js");
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/es.string.starts-with.js */ "./node_modules/core-js/modules/es.string.starts-with.js");
/* harmony import */ var core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/es.number.is-integer.js */ "./node_modules/core-js/modules/es.number.is-integer.js");
/* harmony import */ var core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es.number.constructor.js */ "./node_modules/core-js/modules/es.number.constructor.js");
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! core-js/modules/es.parse-float.js */ "./node_modules/core-js/modules/es.parse-float.js");
/* harmony import */ var core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! core-js/modules/web.timers.js */ "./node_modules/core-js/modules/web.timers.js");
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var core_js_modules_es_parse_int_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! core-js/modules/es.parse-int.js */ "./node_modules/core-js/modules/es.parse-int.js");
/* harmony import */ var core_js_modules_es_parse_int_js__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_int_js__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_36___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_36__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_37___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_37__);
/* harmony import */ var utils__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! utils */ "./src/utils/index.js");
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/date-picker/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/InfoCircleOutlined.js");
/* harmony import */ var _FormNonwovens__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./FormNonwovens */ "./src/pages/planeamento/ordemFabrico/FormNonwovens.jsx");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var _FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ../../App */ "./src/pages/App.jsx");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_48___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_48__);



















var _excluded = ["form", "guides", "schema", "fieldStatus"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

















function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }












var TextArea = antd__WEBPACK_IMPORTED_MODULE_43__["default"].TextArea;








var loadArtigoDetail = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref, token) {
    var item_cod, item_nome, produto_cod, artigo, exists, _yield$fetchPost, rows, designacao, _iterator, _step, v;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            item_cod = _ref.item_cod, item_nome = _ref.item_nome, produto_cod = _ref.produto_cod;
            artigo = {};
            exists = false;
            _context.next = 5;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_39__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_40__.API_URL, "/sellitemsdetailsget/"),
              filter: {
                "cod": item_cod
              },
              cancelToken: token
            });

          case 5:
            _yield$fetchPost = _context.sent;
            rows = _yield$fetchPost.data.rows;

            if (!(rows.length > 0)) {
              _context.next = 12;
              break;
            }

            exists = true;
            artigo = {
              "artigo_id": rows[0].id,
              "artigo_nw1": rows[0].nw1,
              "artigo_nw2": rows[0].nw2,
              "artigo_width": rows[0].lar,
              "artigo_formula": rows[0].formu,
              "artigo_diam": rows[0].diam_ref,
              "artigo_core": rows[0].core,
              "artigo_gram": rows[0].gsm,
              "artigo_gtin": rows[0].gtin,
              "artigo_thickness": rows[0].thickness,
              "produto_cod": rows[0].produto_cod
            };
            _context.next = 42;
            break;

          case 12:
            designacao = item_nome.split(' ').reverse();
            artigo["produto_cod"] = produto_cod;
            artigo["artigo_thickness"] = config__WEBPACK_IMPORTED_MODULE_40__.THICKNESS;
            _iterator = _createForOfIteratorHelper(designacao);
            _context.prev = 16;

            _iterator.s();

          case 18:
            if ((_step = _iterator.n()).done) {
              _context.next = 34;
              break;
            }

            v = _step.value;

            if (!(v.includes("''") || v.includes("'"))) {
              _context.next = 23;
              break;
            }

            artigo["artigo_core"] = v.replaceAll("'", "");
            return _context.abrupt("continue", 32);

          case 23:
            if (!v.toLowerCase().startsWith('l')) {
              _context.next = 26;
              break;
            }

            artigo["artigo_width"] = v.toLowerCase().replaceAll("l", "");
            return _context.abrupt("continue", 32);

          case 26:
            if (!v.toLowerCase().startsWith('d')) {
              _context.next = 29;
              break;
            }

            artigo["artigo_diam"] = v.toLowerCase().replaceAll("d", "");
            return _context.abrupt("continue", 32);

          case 29:
            if (!(v.toLowerCase().startsWith('g') || !isNaN(v) && Number.isInteger(parseFloat(v)))) {
              _context.next = 32;
              break;
            }

            artigo["artigo_gram"] = v.toLowerCase().replaceAll("g", "");
            return _context.abrupt("continue", 32);

          case 32:
            _context.next = 18;
            break;

          case 34:
            _context.next = 39;
            break;

          case 36:
            _context.prev = 36;
            _context.t0 = _context["catch"](16);

            _iterator.e(_context.t0);

          case 39:
            _context.prev = 39;

            _iterator.f();

            return _context.finish(39);

          case 42:
            return _context.abrupt("return", {
              artigo: artigo,
              exists: exists
            });

          case 43:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[16, 36, 39, 42]]);
  }));

  return function loadArtigoDetail(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref3) {
  var changedValues = _ref3.changedValues;

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_46__.OFabricoContext),
      form = _useContext.form,
      guides = _useContext.guides,
      schema = _useContext.schema,
      fieldStatus = _useContext.fieldStatus,
      ctx = _objectWithoutProperties(_useContext, _excluded);
  /* const mediaCtx = useContext(MediaContext); */


  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)([]),
      _useState4 = _slicedToArray(_useState3, 2),
      coresLookup = _useState4[0],
      setCoresLookup = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(true),
      _useState6 = _slicedToArray(_useState5, 2),
      artigoExists = _useState6[0],
      setArtigoExists = _useState6[1];

  (0,react__WEBPACK_IMPORTED_MODULE_35__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_39__.cancelToken)();
    loadData({
      token: cancelFetch
    });
    /* const { item } = record;
    loadData({ artigospecs_id: id, item }); */

    return function () {
      return cancelFetch.cancel("Form Requirements Cancelled");
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_35__.useEffect)(function () {
    if (changedValues) {
      /* if ("start_date" in changedValues || "start_hour" in changedValues || "end_date" in changedValues || "end_hour" in changedValues) {
          const { start_date, start_hour, end_date, end_hour } = form.getFieldsValue(true);
          setFieldStatus(dateTimeDiffValidator(start_date, start_hour, end_date, end_hour).fields);
      } */
    }
  }, [changedValues]);

  var loadData = function loadData(_ref4) {
    var token = _ref4.token;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "init";

    switch (type) {
      case "lookup":
        setLoading(true);

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  setLoading(false);

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }))();

        break;

      default:
        if (!loading) {
          setLoading(true);
        }

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var _yield$loadArtigoDeta, artigo, exists, sd, ed, plan;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return loadArtigoDetail(ctx, token);

                case 2:
                  _yield$loadArtigoDeta = _context3.sent;
                  artigo = _yield$loadArtigoDeta.artigo;
                  exists = _yield$loadArtigoDeta.exists;
                  artigo["qty_item"] = ctx.qty_item;
                  setArtigoExists(exists);
                  sd = (0,utils__WEBPACK_IMPORTED_MODULE_38__.noValue)(form.getFieldValue("start_prev_date"), ctx.start_prev_date);
                  ed = (0,utils__WEBPACK_IMPORTED_MODULE_38__.noValue)(form.getFieldValue("end_prev_date"), ctx.end_prev_date);
                  plan = {
                    start_prev_date: sd ? moment__WEBPACK_IMPORTED_MODULE_48___default()(sd, 'YYYY-MM-DD HH:mm') : null,
                    end_prev_date: ed ? moment__WEBPACK_IMPORTED_MODULE_48___default()(ed, 'YYYY-MM-DD HH:mm') : null,
                    f_amostragem: form.getFieldValue("amostragem") ? form.getFieldValue("amostragem") : 4,
                    sentido_enrolamento: form.getFieldValue("sentido_enrolamento") ? parseInt(form.getFieldValue("sentido_enrolamento")) : 1,
                    observacoes: form.getFieldValue("observacoes") ? form.getFieldValue("observacoes") : ''
                  };
                  _context3.next = 12;
                  return sleep(600);

                case 12:
                  form.setFieldsValue(_objectSpread(_objectSpread({}, artigo), plan));
                  setLoading(false);

                case 14:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }))();

    }
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_49__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_50__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, !loading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FormLayout, {
    id: "LAY-REQ",
    guides: guides,
    layout: "vertical",
    style: {
      width: "100%",
      padding: "0px"
      /* , minWidth: "700px" */

    },
    schema: schema,
    fieldStatus: fieldStatus,
    field: {
      wide: [4, 4, '*'],
      margin: "2px",
      overflow: true,
      guides: guides,
      label: {
        enabled: true,
        pos: "top",
        align: "start",
        vAlign: "center",

        /* width: "80px", */
        wrap: false,
        overflow: false,
        colon: false,
        ellipsis: true
      },
      alert: {
        pos: "alert",
        tooltip: false,
        container: true
        /* container: "el-external"*/

      },
      layout: {
        top: "",
        right: "",
        center: "align-self: center;",
        bottom: "",
        left: ""
      },
      required: true,
      style: {
        alignSelf: "center"
      }
    },
    fieldSet: {
      guides: guides,
      wide: 16,
      margin: false,
      layout: "horizontal",
      overflow: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FieldSet, {
    margin: false,
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.HorizontalRule, {
    title: "1. Artigo",
    description: form.getFieldValue("produto_cod")
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: !artigoExists,
    required: false,
    label: {
      text: "Gtin"
    },
    name: "artigo_gtin"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.AlertsContainer, {
    style: {
      alignSelf: "end",
      paddingBottom: "2px"
    },
    main: true
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FieldSet, {
    field: {
      wide: [2, 2, 1, 2, 2, '*']
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: !artigoExists,
    required: false,
    label: {
      text: "Largura"
    },
    name: "artigo_width"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("b", null, "mm"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: !artigoExists,
    required: false,
    label: {
      text: "Diâmetro"
    },
    name: "artigo_diam"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("b", null, "mm"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: !artigoExists,
    required: false,
    label: {
      text: "Core"
    },
    name: "artigo_core"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("b", null, "''"),
    maxLength: 1
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: !artigoExists,
    required: false,
    label: {
      text: "Gramagem"
    },
    name: "artigo_gram"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("b", null, "gsm"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: !artigoExists,
    required: false,
    label: {
      text: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_51__["default"], {
        title: "A espessura \xE9 usada como valor de refer\xEAncia, na convers\xE3o de metros\xB2 -> metros lineares.",
        color: "blue"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "3px"
        }
      }, "Espessura", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_52__["default"], {
        style: {
          color: "#096dd9"
        }
      })))
    },
    name: "artigo_thickness"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("b", null, "\xB5"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.AlertsContainer, {
    style: {
      alignSelf: "end",
      paddingBottom: "2px"
    },
    main: true
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.VerticalSpace, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.HorizontalRule, {
    title: "2. Planifica\xE7\xE3o"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FieldSet, {
    field: {
      wide: [3, 3, 4],
      label: {
        pos: "top",
        wrap: true,
        ellipsis: false,
        width: "130px"
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    required: true,
    label: {
      text: "Data Prevista Início"
    },
    name: "start_prev_date"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], {
    showTime: true,
    size: "small",
    format: "YYYY-MM-DD HH:mm"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    forInput: false,
    required: true,
    label: {
      text: "Data Prevista Fim"
    },
    name: "end_prev_date"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], {
    showTime: true,
    size: "small",
    format: "YYYY-MM-DD HH:mm"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.AlertsContainer, {
    style: {
      alignSelf: "end",
      paddingBottom: "6px"
    },
    main: true
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.VerticalSpace, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.HorizontalRule, {
    title: "3. Amostragem, Enrolamento e Observa\xE7\xF5es"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.VerticalSpace, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FieldSet, {
    margin: false,
    field: {
      wide: 4,
      style: {
        alignSelf: "left"
      },
      label: {
        pos: "top",
        wrap: false,
        ellipsis: false,
        width: "130px"
      }
    },
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    wide: 4,
    name: "sentido_enrolamento",
    label: {
      enabled: true,
      text: "Sentido Enrolamento"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.SelectField, {
    size: "small",
    data: config__WEBPACK_IMPORTED_MODULE_40__.ENROLAMENTO_OPTIONS,
    keyField: "value",
    textField: "label",
    optionsRender: function optionsRender(d, keyField, textField) {
      return {
        label: d[textField],
        value: d[keyField]
      };
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    wide: 2,
    label: {
      text: "Amostragem"
    },
    name: "f_amostragem"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_54__["default"], {
    size: "small",
    min: 0,
    max: 100
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_41__.Field, {
    required: false,
    wide: 16,
    label: {
      text: "Observações"
    },
    name: "observacoes"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(TextArea, {
    autoSize: {
      minRows: 4,
      maxRows: 6
    },
    allowClear: true,
    maxLength: 3000
  }))))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_planeamento_ordemFabrico_FormOFabricoValidar_jsx.chunk.js.map