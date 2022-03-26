"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_currentline_FormFormulacaoUpsert_jsx"],{

/***/ "./src/pages/currentline/FormFormulacaoUpsert.jsx":
/*!********************************************************!*\
  !*** ./src/pages/currentline/FormFormulacaoUpsert.jsx ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "./node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.number.to-fixed.js */ "./node_modules/core-js/modules/es.number.to-fixed.js");
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es.array.find.js */ "./node_modules/core-js/modules/es.array.find.js");
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! core-js/modules/es.array.reduce.js */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_35___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_35__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_iconButton__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! components/iconButton */ "./src/components/iconButton.jsx");
/* harmony import */ var components_YScroll__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! components/YScroll */ "./src/components/YScroll.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/PlusOutlined.js");
/* harmony import */ var react_icons_md__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! react-icons/md */ "./node_modules/react-icons/md/index.esm.js");
/* harmony import */ var react_icons_cg__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! react-icons/cg */ "./node_modules/react-icons/cg/index.esm.js");
















var _excluded = ["formu_materiasprimas_A", "formu_materiasprimas_BC"],
    _excluded2 = ["formu_materiasprimas_A", "formu_materiasprimas_BC"];

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






































var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_38__.getSchema)({
    formu_materiasprimas_A: joi__WEBPACK_IMPORTED_MODULE_35___default().array().label("Matérias Primas da Extrusora A").min(1).required(),
    formu_materiasprimas_BC: joi__WEBPACK_IMPORTED_MODULE_35___default().array().label("Matérias Primas das Extrusoras B & C").min(1).required(),
    matprima_cod_A: joi__WEBPACK_IMPORTED_MODULE_35___default().string().label("Matéria Prima").required(),
    densidade_A: joi__WEBPACK_IMPORTED_MODULE_35___default().number().label("Densidade").required(),

    /* mangueira_A: Joi.string().label("Mangueira Extrusora A").required(), */
    arranque_A: joi__WEBPACK_IMPORTED_MODULE_35___default().number().label("Arranque").required(),
    matprima_cod_BC: joi__WEBPACK_IMPORTED_MODULE_35___default().string().label("Matéria Prima").required(),
    densidade_BC: joi__WEBPACK_IMPORTED_MODULE_35___default().number().label("Densidade").required(),
    arranque_BC: joi__WEBPACK_IMPORTED_MODULE_35___default().number().label("Arranque").required()
    /*  mangueira_BC: Joi.string().label("Mangueira Extrusora BC").required() */

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

var append = function append(value) {
  var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var onUndefined = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  if (value) {
    return "".concat(prefix).concat(value).concat(suffix);
  }

  return onUndefined;
};

var HeaderA = function HeaderA(_ref) {
  var _React$createElement;

  var _ref$backgroundColor = _ref.backgroundColor,
      backgroundColor = _ref$backgroundColor === void 0 ? "#f5f5f5" : _ref$backgroundColor,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? "#000" : _ref$color,
      _ref$border = _ref.border,
      border = _ref$border === void 0 ? "solid 1px #d9d9d9" : _ref$border;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 16,
    layout: "horizontal",
    margin: false,
    style: {
      backgroundColor: "".concat(backgroundColor),
      color: "".concat(color),
      fontWeight: 500,
      textAlign: "center"
    },
    field: {
      noItemWrap: true,
      label: {
        enabled: false
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 7,
    margin: false,
    field: {
      wide: [13, 3],
      style: {
        border: border,
        borderLeft: "none",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    style: {
      border: border,
      alignSelf: "stretch",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, "Mat\xE9rias Primas"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "Densidade")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, (_React$createElement = {
    margin: false,
    wide: 9
  }, _defineProperty(_React$createElement, "margin", false), _defineProperty(_React$createElement, "layout", "vertical"), _defineProperty(_React$createElement, "field", {
    style: {
      border: border,
      borderLeft: "none"
    }
  }), _React$createElement), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    field: {
      wide: [16]
    },
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "Distribui\xE7\xE3o por Extrusora")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    margin: false,
    field: {
      wide: [
      /* 3,  */
      4, 4, 4, 3, 1
      /* , 2, 3 */
      ],
      style: {
        fontSize: "10px",
        border: border,
        borderLeft: "none",
        borderTop: "none",
        fontWeight: 400
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "%A"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "Arranque"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "Toler\xE2ncia"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "% Global"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null))));
};

var HeaderBC = function HeaderBC(_ref2) {
  var _ref2$backgroundColor = _ref2.backgroundColor,
      backgroundColor = _ref2$backgroundColor === void 0 ? "#f5f5f5" : _ref2$backgroundColor,
      _ref2$color = _ref2.color,
      color = _ref2$color === void 0 ? "#000" : _ref2$color,
      _ref2$border = _ref2.border,
      border = _ref2$border === void 0 ? "solid 1px #d9d9d9" : _ref2$border;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 16,
    layout: "horizontal",
    margin: false,
    field: {
      noItemWrap: true,
      label: {
        enabled: false
      }
    },
    style: {
      fontSize: "10px",
      backgroundColor: "".concat(backgroundColor),
      color: "".concat(color),
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 7,
    margin: false,
    field: {
      wide: [13, 3],
      style: {
        border: border,
        borderLeft: "none"
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    style: {
      border: border
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, _defineProperty({
    margin: false,
    wide: 9
  }, "margin", false), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    margin: false,
    field: {
      wide: [
      /* 3,  */
      4, 4, 4, 3, 1
      /*  2, 3 */
      ],
      label: {
        enabled: false
      },
      style: {
        border: border,
        borderLeft: "none"
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "%B e C"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "Arranque"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "Toler\xE2ncia"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null, "% Global"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null))));
};

var updateGlobals = function updateGlobals(_ref3) {
  var _ref3$values = _ref3.values,
      values = _ref3$values === void 0 ? {} : _ref3$values,
      _ref3$adjust = _ref3.adjust,
      adjust = _ref3$adjust === void 0 ? {
    extrusora: null,
    index: null
  } : _ref3$adjust,
      _ref3$action = _ref3.action,
      action = _ref3$action === void 0 ? "adjust" : _ref3$action;

  var _values$formu_materia = values.formu_materiasprimas_A,
      listA = _values$formu_materia === void 0 ? [] : _values$formu_materia,
      _values$formu_materia2 = values.formu_materiasprimas_BC,
      listBC = _values$formu_materia2 === void 0 ? [] : _values$formu_materia2,
      rest = _objectWithoutProperties(values, _excluded);

  var ponderacaoA = config__WEBPACK_IMPORTED_MODULE_37__.FORMULACAO_PONDERACAO_EXTR[0];
  var ponderacaoBC = config__WEBPACK_IMPORTED_MODULE_37__.FORMULACAO_PONDERACAO_EXTR[1];
  var globalA = 0;
  var globalBC = 0;
  var sumArranqueA = 0;
  var sumArranqueBC = 0;

  var _iterator = _createForOfIteratorHelper(listA.entries()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          i = _step$value[0],
          v = _step$value[1];

      var arranque = v.arranque_A ? v.arranque_A : 0;
      var global = ponderacaoA * arranque / 100;

      if (action === "adjust" && adjust.extrusora !== 'A' || action !== 'adjust' || action === "adjust" && adjust.index !== i && adjust.extrusora === 'A') {
        globalA += global;
        sumArranqueA += arranque;
      }

      v.global = global;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var _iterator2 = _createForOfIteratorHelper(listBC.entries()),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _step2$value = _slicedToArray(_step2.value, 2),
          _i2 = _step2$value[0],
          _v = _step2$value[1];

      var _arranque = _v.arranque_BC ? _v.arranque_BC : 0;

      var _global = ponderacaoBC * _arranque / 100;

      if (action === "adjust" && adjust.extrusora !== 'BC' || action !== 'adjust' || action === "adjust" && adjust.index !== _i2 && adjust.extrusora === 'BC') {
        globalBC += _global;
        sumArranqueBC += _arranque;
      }

      _v.global = _global;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  if (action === "adjust") {
    if (adjust.extrusora === 'A') {
      listA[adjust.index].arranque_A = 100 - sumArranqueA < 0 ? 0 : 100 - sumArranqueA;
      listA[adjust.index].global = ponderacaoA * listA[adjust.index].arranque_A / 100;
      globalA += listA[adjust.index].global;
    } else {
      listBC[adjust.index].arranque_BC = 100 - sumArranqueBC < 0 ? 0 : 100 - sumArranqueBC;
      listBC[adjust.index].global = ponderacaoBC * listBC[adjust.index].arranque_BC / 100;
      globalBC += listBC[adjust.index].global;
    }
  }

  return _objectSpread(_objectSpread({}, rest), {}, {
    formu_materiasprimas_A: listA,
    formu_materiasprimas_BC: listBC,
    totalGlobal: globalA + globalBC
  });
};

var SubFormMateriasPrimas = function SubFormMateriasPrimas(_ref4) {
  var form = _ref4.form,
      forInput = _ref4.forInput,
      name = _ref4.name,
      matPrimasLookup = _ref4.matPrimasLookup,
      _ref4$sum = _ref4.sum,
      sum = _ref4$sum === void 0 ? false : _ref4$sum,
      _ref4$border = _ref4.border,
      border = _ref4$border === void 0 ? "solid 1px #d9d9d9" : _ref4$border,
      id = _ref4.id;

  var adjust = function adjust(idx, extrusora) {
    var fieldValues = updateGlobals({
      values: form.getFieldsValue(true),
      adjust: {
        extrusora: extrusora,
        index: idx
      },
      action: "adjust"
    });
    form.setFieldsValue(fieldValues);
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"].List, {
    name: name
  }, function (fields, _ref5) {
    var add = _ref5.add,
        remove = _ref5.remove,
        move = _ref5.move;

    var addRow = function addRow(fields) {
      var _add;

      add((_add = {}, _defineProperty(_add, "tolerancia_".concat(id), config__WEBPACK_IMPORTED_MODULE_37__.FORMULACAO_TOLERANCIA), _defineProperty(_add, "removeCtrl", true), _add));
      /* add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0); */
    };

    var removeRow = function removeRow(fieldName, field) {
      remove(fieldName);
    };

    var moveRow = function moveRow(from, to) {
      move(from, to);
    };

    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react__WEBPACK_IMPORTED_MODULE_33__.Fragment, null, fields.map(function (field, index) {
      var _form$getFieldValue;

      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
        key: field.key,
        wide: 16,
        layout: "horizontal",
        margin: false,
        field: {
          label: {
            enabled: false
          }
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
        wide: 7,
        margin: false,
        field: {
          wide: [13, 3],
          style: {
            border: "solid 1px #fff",
            borderLeft: "none",
            fontWeight: "10px"
          }
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
        name: [field.name, "matprima_cod_".concat(id)]
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.SelectField, {
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
        filterOption: function filterOption(input, option) {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
        name: [field.name, "densidade_".concat(id)]
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
        controls: false,
        size: "small",
        min: 0,
        max: 50,
        precision: 3,
        step: .025
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, _defineProperty({
        margin: false,
        wide: 9
      }, "margin", false), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
        margin: false,
        field: {
          wide: [
          /* 3,  */
          4, 4, 4, 3, 1
          /* , 2, 3 */
          ],
          label: {
            enabled: false
          },
          style: {
            border: "solid 1px #fff",
            borderLeft: "none",
            borderTop: "none"
          }
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
        name: [field.name, "arranque_".concat(id)]
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], _extends({
        size: "small",
        controls: false
      }, forInput && {
        addonBefore: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_iconButton__WEBPACK_IMPORTED_MODULE_41__["default"], {
          onClick: function onClick() {
            return adjust(index, id);
          }
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react_icons_md__WEBPACK_IMPORTED_MODULE_48__.MdAdjust, null))
      }, {
        addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
        precision: 2,
        min: 0,
        max: 100
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
        name: [field.name, "tolerancia_".concat(id)]
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
        size: "small",
        controls: false,
        addonBefore: "\xB1",
        addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
        maxLength: 4,
        precision: 1,
        min: 0,
        max: 100
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
        style: {
          textAlign: "center",
          border: "solid 1px #fff",
          borderLeft: "none",
          borderTop: "none"
        }
      }, append((_form$getFieldValue = form.getFieldValue([name, field.name, "global"])) === null || _form$getFieldValue === void 0 ? void 0 : _form$getFieldValue.toFixed(2), '%')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldItem, {
        label: {
          enabled: false
        }
      }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_iconButton__WEBPACK_IMPORTED_MODULE_41__["default"], {
        onClick: function onClick() {
          return removeRow(field.name, field);
        },
        style: {
          alignSelf: "center"
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react_icons_cg__WEBPACK_IMPORTED_MODULE_49__.CgCloseO, null))))));
    }), sum && form.getFieldValue("totalGlobal") > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
      wide: 16,
      layout: "horizontal",
      margin: false,
      field: {
        label: {
          enabled: false
        }
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
      wide: 7,
      margin: false
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, _defineProperty({
      margin: false,
      wide: 9
    }, "margin", false), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
      margin: false,
      field: {
        wide: [12, 4],
        label: {
          enabled: false
        },
        style: {
          border: "solid 1px #fff",
          borderLeft: "none",
          borderTop: "none"
        }
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
      style: {
        marginTop: "4px",
        textAlign: "center",
        fontWeight: 500,
        border: border
      }
    }, append(form.getFieldValue("totalGlobal").toFixed(2), '%'))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, null, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
      type: "dashed",
      onClick: function onClick() {
        return addRow(fields);
      },
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_51__["default"], null), "Adicionar")));
  });
};

var LoadMateriasPrimasLookup = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(record) {
    var _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_36__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_37__.API_URL, "/materiasprimaslookup/"),
              filter: {}
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
    return _ref6.apply(this, arguments);
  };
}();

var loadCustomersLookup = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(value) {
    var _yield$fetchPost2, rows;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_36__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_37__.API_URL, "/sellcustomerslookup/"),
              pagination: {
                limit: 10
              },
              filter: _defineProperty({}, "fmulti_customer", "%".concat(value.replaceAll(' ', '%%'), "%"))
            });

          case 2:
            _yield$fetchPost2 = _context2.sent;
            rows = _yield$fetchPost2.data.rows;
            return _context2.abrupt("return", rows);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function loadCustomersLookup(_x2) {
    return _ref7.apply(this, arguments);
  };
}();

var loadFormulacaoesLookup = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref8) {
    var produto_id, token, _yield$fetchPost3, rows;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            produto_id = _ref8.produto_id, token = _ref8.token;
            _context3.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_36__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_37__.API_URL, "/formulacoeslookup/"),
              filter: {
                produto_id: produto_id
              },
              sort: [],
              cancelToken: token
            });

          case 3:
            _yield$fetchPost3 = _context3.sent;
            rows = _yield$fetchPost3.data.rows;
            return _context3.abrupt("return", rows);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function loadFormulacaoesLookup(_x3) {
    return _ref9.apply(this, arguments);
  };
}();

var getFormulacaoMateriasPrimas = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref10) {
    var formulacao_id, token, _yield$fetchPost4, rows;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            formulacao_id = _ref10.formulacao_id, token = _ref10.token;

            if (formulacao_id) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", []);

          case 3:
            _context4.next = 5;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_36__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_37__.API_URL, "/formulacaomateriasprimasget/"),
              filter: {
                formulacao_id: formulacao_id
              },
              sort: [],
              cancelToken: token
            });

          case 5:
            _yield$fetchPost4 = _context4.sent;
            rows = _yield$fetchPost4.data.rows;
            return _context4.abrupt("return", rows);

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getFormulacaoMateriasPrimas(_x4) {
    return _ref11.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref12) {
  var record = _ref12.record,
      setFormTitle = _ref12.setFormTitle,
      parentRef = _ref12.parentRef,
      closeParent = _ref12.closeParent,
      parentReload = _ref12.parentReload,
      _ref12$wrapForm = _ref12.wrapForm,
      wrapForm = _ref12$wrapForm === void 0 ? "form" : _ref12$wrapForm,
      _ref12$forInput = _ref12.forInput,
      forInput = _ref12$forInput === void 0 ? true : _ref12$forInput;

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_46__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)({}),
      _useState4 = _slicedToArray(_useState3, 2),
      changedValues = _useState4[0],
      setChangedValues = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      isTouched = _useState6[0],
      setIsTouched = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      formStatus = _useState8[0],
      setFormStatus = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)(false),
      _useState10 = _slicedToArray(_useState9, 2),
      guides = _useState10[0],
      setGuides = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)(setId(record.formulacao.id)),
      _useState12 = _slicedToArray(_useState11, 2),
      operation = _useState12[0],
      setOperation = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)({
    status: "none"
  }),
      _useState14 = _slicedToArray(_useState13, 2),
      resultMessage = _useState14[0],
      setResultMessage = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)([]),
      _useState16 = _slicedToArray(_useState15, 2),
      matPrimasLookup = _useState16[0],
      setMatPrimasLookup = _useState16[1];

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_33__.useState)([]),
      _useState18 = _slicedToArray(_useState17, 2),
      formulacoes = _useState18[0],
      setFormulacoes = _useState18[1];

  var transformData = function transformData(_ref13) {
    var _record$formulacao;

    var items = _ref13.items,
        formulacao = _ref13.formulacao;
    var formu_materiasprimas_A = items === null || items === void 0 ? void 0 : items.filter(function (v) {
      return v.extrusora === 'A';
    }).map(function (v) {
      return {
        global: v.vglobal,
        matprima_cod_A: v.matprima_cod,
        densidade_A: v.densidade,
        arranque_A: v.arranque,
        tolerancia_A: v.tolerancia,
        removeCtrl: true
      };
    });
    var formu_materiasprimas_BC = items === null || items === void 0 ? void 0 : items.filter(function (v) {
      return v.extrusora === 'BC';
    }).map(function (v) {
      return {
        global: v.vglobal,
        matprima_cod_BC: v.matprima_cod,
        densidade_BC: v.densidade,
        arranque_BC: v.arranque,
        tolerancia_BC: v.tolerancia,
        removeCtrl: true
      };
    });
    var cliente_cod = {
      key: (_record$formulacao = record.formulacao) === null || _record$formulacao === void 0 ? void 0 : _record$formulacao.cliente_cod,
      value: formulacao === null || formulacao === void 0 ? void 0 : formulacao.cliente_cod,
      label: formulacao === null || formulacao === void 0 ? void 0 : formulacao.cliente_nome
    };
    return _objectSpread(_objectSpread({}, formulacao), {}, {
      cliente_cod: cliente_cod,
      formu_materiasprimas_A: formu_materiasprimas_A,
      formu_materiasprimas_BC: formu_materiasprimas_BC,
      totalGlobal: 100
    });
  };

  var init = function init() {
    var lookup = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var token = arguments.length > 1 ? arguments[1] : undefined;

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var _record$formulacao2, items, produto_id;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!lookup) {
                _context5.next = 6;
                break;
              }

              _context5.t0 = setMatPrimasLookup;
              _context5.next = 4;
              return LoadMateriasPrimasLookup(record);

            case 4:
              _context5.t1 = _context5.sent;
              (0, _context5.t0)(_context5.t1);

            case 6:
              if (!(operation.key === "update")) {
                _context5.next = 15;
                break;
              }

              _record$formulacao2 = record.formulacao, items = _record$formulacao2.items, produto_id = _record$formulacao2.produto_id;
              setFormTitle && setFormTitle({
                title: "Formula\xE7\xE3o"
              });
              _context5.t2 = setFormulacoes;
              _context5.next = 12;
              return loadFormulacaoesLookup({
                produto_id: produto_id,
                token: token
              });

            case 12:
              _context5.t3 = _context5.sent;
              (0, _context5.t2)(_context5.t3);
              form.setFieldsValue(transformData({
                items: items,
                formulacao: record === null || record === void 0 ? void 0 : record.formulacao
              }));

            case 15:
              setLoading(false);

            case 16:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
  };

  (0,react__WEBPACK_IMPORTED_MODULE_33__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_36__.cancelToken)();
    init(true, cancelFetch);
    return function () {
      return cancelFetch.cancel("Form Formulação Cancelled");
    };
  }, []);

  var onValuesChange = /*#__PURE__*/function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(changedValues, _ref15) {
      var _ref15$formu_materias, allA, _ref15$formu_materias2, allBC, allValues, formulacao, items, formu_materiasprimas_A, formu_materiasprimas_BC, fieldValues;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _ref15$formu_materias = _ref15.formu_materiasprimas_A, allA = _ref15$formu_materias === void 0 ? [] : _ref15$formu_materias, _ref15$formu_materias2 = _ref15.formu_materiasprimas_BC, allBC = _ref15$formu_materias2 === void 0 ? [] : _ref15$formu_materias2, allValues = _objectWithoutProperties(_ref15, _excluded2);

              if (!('id' in changedValues)) {
                _context6.next = 9;
                break;
              }

              formulacao = formulacoes.find(function (v) {
                return v.id === changedValues.id;
              });
              _context6.next = 5;
              return getFormulacaoMateriasPrimas({
                formulacao_id: changedValues.id
              });

            case 5:
              items = _context6.sent;
              form.setFieldsValue(transformData({
                items: items,
                formulacao: formulacao
              }));
              _context6.next = 13;
              break;

            case 9:
              formu_materiasprimas_A = allA.filter(function (v) {
                return v.removeCtrl === true;
              });
              formu_materiasprimas_BC = allBC.filter(function (v) {
                return v.removeCtrl === true;
              });
              fieldValues = updateGlobals({
                values: _objectSpread(_objectSpread({}, allValues), {}, {
                  formu_materiasprimas_A: formu_materiasprimas_A,
                  formu_materiasprimas_BC: formu_materiasprimas_BC
                }),
                action: "valueschange"
              });
              form.setFieldsValue(fieldValues);

            case 13:
              setIsTouched(true);
              setChangedValues(changedValues);

            case 15:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function onValuesChange(_x5, _x6) {
      return _ref16.apply(this, arguments);
    };
  }();

  var onFinish = /*#__PURE__*/function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(values) {
      var _v$error, _v$warning;

      var items, status, msgKeys, v, fieldValues, sumA, sumBC, _fieldValues, _fieldValues2, _iterator3, _step3, _loop, _iterator4, _step4, _loop2, _values$cliente_cod, cliente_cod, cliente_nome, response;

      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (isTouched) {
                _context7.next = 2;
                break;
              }

              return _context7.abrupt("return");

            case 2:
              items = [];
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              msgKeys = ["formu_materiasprimas_A", "formu_materiasprimas_BC"];
              v = schema(false, ['matprima_cod_A', 'densidade_A', 'arranque_A', 'matprima_cod_BC', 'densidade_BC', 'arranque_BC']).validate(values, {
                abortEarly: false
              });
              status.error = [].concat(_toConsumableArray(status.error), _toConsumableArray(v.error ? (_v$error = v.error) === null || _v$error === void 0 ? void 0 : _v$error.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));
              status.warning = [].concat(_toConsumableArray(status.warning), _toConsumableArray(v.warning ? (_v$warning = v.warning) === null || _v$warning === void 0 ? void 0 : _v$warning.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));

              if (!v.error) {
                fieldValues = updateGlobals({
                  values: values,
                  action: "finish"
                });
                sumA = fieldValues.formu_materiasprimas_A.reduce(function (a, b) {
                  return a + (b["arranque_A"] || 0);
                }, 0);
                sumBC = fieldValues.formu_materiasprimas_BC.reduce(function (a, b) {
                  return a + (b["arranque_BC"] || 0);
                }, 0);

                if (Math.round(fieldValues.totalGlobal) !== 100) {
                  status.error.push({
                    message: "O Total Global das Matérias Primas tem de ser 100%!"
                  });
                } else if (sumA !== 100) {
                  status.error.push({
                    message: "O Total das Matérias Primas da Extrusora A tem de ser 100%!"
                  });
                } else if (sumBC !== 100) {
                  status.error.push({
                    message: "O Total das Matérias Primas das Extrusoras B&C tem de ser 100%!"
                  });
                }
              }

              if (!(status.error.length === 0 && fieldValues)) {
                _context7.next = 23;
                break;
              }

              _iterator3 = _createForOfIteratorHelper((_fieldValues = fieldValues) === null || _fieldValues === void 0 ? void 0 : _fieldValues.formu_materiasprimas_A);

              try {
                _loop = function _loop() {
                  var _matPrimasLookup$find;

                  var v = _step3.value;
                  var matprima_des = (_matPrimasLookup$find = matPrimasLookup.find(function (val) {
                    return val.ITMREF_0 === v.matprima_cod_A;
                  })) === null || _matPrimasLookup$find === void 0 ? void 0 : _matPrimasLookup$find.ITMDES1_0;
                  items.push({
                    tolerancia: v.tolerancia_A,
                    arranque: v.arranque_A,
                    vglobal: v.global,
                    densidade: v.densidade_A,
                    extrusora: 'A',
                    matprima_cod: v.matprima_cod_A,
                    matprima_des: matprima_des
                  });
                };

                for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                  _loop();
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }

              _iterator4 = _createForOfIteratorHelper((_fieldValues2 = fieldValues) === null || _fieldValues2 === void 0 ? void 0 : _fieldValues2.formu_materiasprimas_BC);

              try {
                _loop2 = function _loop2() {
                  var _matPrimasLookup$find2;

                  var v = _step4.value;
                  var matprima_des = (_matPrimasLookup$find2 = matPrimasLookup.find(function (val) {
                    return val.ITMREF_0 === v.matprima_cod_BC;
                  })) === null || _matPrimasLookup$find2 === void 0 ? void 0 : _matPrimasLookup$find2.ITMDES1_0;
                  items.push({
                    tolerancia: v.tolerancia_BC,
                    arranque: v.arranque_BC,
                    vglobal: v.global,
                    densidade: v.densidade_BC,
                    extrusora: 'BC',
                    matprima_cod: v.matprima_cod_BC,
                    matprima_des: matprima_des
                  });
                };

                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  _loop2();
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }

              _values$cliente_cod = values.cliente_cod;
              _values$cliente_cod = _values$cliente_cod === void 0 ? {} : _values$cliente_cod;
              cliente_cod = _values$cliente_cod.value, cliente_nome = _values$cliente_cod.label;
              _context7.next = 19;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_36__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_37__.API_URL, "/updatecurrentsettings/"),
                filter: {
                  csid: record.id
                },
                parameters: {
                  type: 'formulacao',
                  formulacao: _objectSpread(_objectSpread({}, values), {}, {
                    items: items,
                    produto_id: record.formulacao.produto_id,
                    cliente_cod: cliente_cod,
                    cliente_nome: cliente_nome
                  })
                }
              });

            case 19:
              response = _context7.sent;
              setResultMessage(response.data);

              if (!(response.data.status !== "error")) {
                _context7.next = 23;
                break;
              }

              throw 'TODO RELOAD PARENT';

            case 23:
              setFormStatus(status);

            case 24:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function onFinish(_x7) {
      return _ref17.apply(this, arguments);
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
  };

  var onErrorOK = function onErrorOK() {
    setResultMessage({
      status: "none"
    });
  };

  var onClose = function onClose() {
    var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    closeParent();
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react__WEBPACK_IMPORTED_MODULE_33__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_43__["default"], {
    result: resultMessage,
    successButtonOK: operation.key === "insert" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "Criar Nova Formula\xE7\xE3o"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_40__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish,
    onValuesChange: onValuesChange,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FormLayout, {
    id: "LAY-FORMULACAO-UPSERT",
    guides: guides,
    layout: "vertical",
    style: {
      width: "100%",
      padding: "0px",
      height: "65vh"
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
        pos: "top",
        align: "start",
        vAlign: "center",

        /* width: "80px", */
        wrap: false,
        overflow: false,
        colon: true,
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
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react__WEBPACK_IMPORTED_MODULE_33__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_45__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
      name: "id",
      layout: {
        center: "align-self:center;",
        right: "align-self:center;"
      },
      label: {
        enabled: false,
        text: "Formulacao",
        pos: "left"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.SelectField, {
      size: "small",
      data: formulacoes,
      keyField: "id",
      textField: "designacao",
      optionsRender: function optionsRender(d, keyField, textField) {
        return {
          label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("div", {
            style: {
              display: "flex"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("div", {
            style: {
              minWidth: "150px"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, d[textField])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("div", null, "v.", d["versao"])),
          value: d[keyField]
        };
      }
    }))),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
      style: {
        minWidth: "300px"
      },
      margin: false,
      field: {
        wide: [16]
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
      name: "cliente_cod",
      required: false,
      layout: {
        center: "align-self:center;",
        right: "align-self:center;"
      },
      label: {
        enabled: false,
        text: "Cliente",
        pos: "left"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.SelectDebounceField, {
      placeholder: "Cliente",
      size: "small",
      keyField: "BPCNUM_0",
      textField: "BPCNAM_0",
      showSearch: true,
      showArrow: true,
      allowClear: true,
      fetchOptions: loadCustomersLookup
    }))))
  }))), !forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react__WEBPACK_IMPORTED_MODULE_33__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    margin: false,
    field: {
      wide: [16]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "cliente_cod",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: false,
      text: "Cliente",
      pos: "left"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.SelectDebounceField, {
    placeholder: "Cliente",
    size: "small",
    keyField: "BPCNUM_0",
    textField: "BPCNAM_0",
    showSearch: true,
    showArrow: true,
    allowClear: true,
    fetchOptions: loadCustomersLookup
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.VerticalSpace, {
    height: "6px"
  })), forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(react__WEBPACK_IMPORTED_MODULE_33__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 16,
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 3
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 10,
    margin: false,
    layout: "vertical",
    field: {
      split: 5,
      wide: undefined
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr0",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], {
    disabled: true,
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr1",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], {
    disabled: true,
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr2",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], {
    disabled: true,
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr3",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], {
    disabled: true,
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr4",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], {
    disabled: true,
    size: "small"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr0_val",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    disabled: true,
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr1_val",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    disabled: true,
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr2_val",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    disabled: true,
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr3_val",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    disabled: true,
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.Field, {
    name: "extr4_val",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    disabled: true,
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement("b", null, "%"),
    maxLength: 4
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.FieldSet, {
    wide: 3
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_39__.VerticalSpace, {
    height: "12px"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(HeaderA, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(SubFormMateriasPrimas, {
    form: form,
    name: "formu_materiasprimas_A",
    forInput: forInput,
    matPrimasLookup: matPrimasLookup,
    id: "A"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(HeaderBC, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(SubFormMateriasPrimas, {
    form: form,
    name: "formu_materiasprimas_BC",
    forInput: forInput,
    matPrimasLookup: matPrimasLookup,
    sum: true,
    id: "BC"
  }))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_44__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], null, isTouched && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
    type: "primary",
    onClick: function onClick() {
      return onFinish(form.getFieldsValue(true));
    }
  }, "Guardar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_33__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
    onClick: onClose
  }, "Fechar")))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_currentline_FormFormulacaoUpsert_jsx.chunk.js.map