"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_bobinagens_BobinagensValidarList_jsx"],{

/***/ "./src/pages/bobinagens/BobinagensValidarList.jsx":
/*!********************************************************!*\
  !*** ./src/pages/bobinagens/BobinagensValidarList.jsx ***!
  \********************************************************/
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
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.object.freeze.js */ "./node_modules/core-js/modules/es.object.freeze.js");
/* harmony import */ var core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_web_url_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/web.url.js */ "./node_modules/core-js/modules/web.url.js");
/* harmony import */ var core_js_modules_web_url_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_web_url_search_params_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/web.url-search-params.js */ "./node_modules/core-js/modules/web.url-search-params.js");
/* harmony import */ var core_js_modules_web_url_search_params_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url_search_params_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/web.timers.js */ "./node_modules/core-js/modules/web.timers.js");
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_es_date_to_json_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/es.date.to-json.js */ "./node_modules/core-js/modules/es.date.to-json.js");
/* harmony import */ var core_js_modules_es_date_to_json_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_date_to_json_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_web_url_to_json_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/web.url.to-json.js */ "./node_modules/core-js/modules/web.url.to-json.js");
/* harmony import */ var core_js_modules_web_url_to_json_js__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url_to_json_js__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es_date_to_string_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es.date.to-string.js */ "./node_modules/core-js/modules/es.date.to-string.js");
/* harmony import */ var core_js_modules_es_date_to_string_js__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_date_to_string_js__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_jss__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! react-jss */ "./node_modules/react-jss/dist/react-jss.esm.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_useDataAPI__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! utils/useDataAPI */ "./src/utils/useDataAPI.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var utils__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! utils */ "./src/utils/index.js");
/* harmony import */ var components_form__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! components/form */ "./src/components/form.jsx");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_Drawer__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! components/Drawer */ "./src/components/Drawer.jsx");
/* harmony import */ var components_table__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! components/table */ "./src/components/table.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var assets_morefilters_svg__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! assets/morefilters.svg */ "./src/assets/morefilters.svg");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/index.js");
/* harmony import */ var components_YScroll__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! components/YScroll */ "./src/components/YScroll.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/typography/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/menu/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/dropdown/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/modal/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FilePdfTwoTone.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FileExcelTwoTone.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FileWordTwoTone.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FileFilled.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/SearchOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/DownOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ../App */ "./src/pages/App.jsx");

















var _excluded = ["index"],
    _excluded2 = ["title", "editable", "children", "dataIndex", "record", "input", "handleSave"];

var _templateObject;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }



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





































var ButtonGroup = antd__WEBPACK_IMPORTED_MODULE_47__["default"].Group;

var Title = antd__WEBPACK_IMPORTED_MODULE_48__["default"].Title;

var BobinesValidarList = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_31__.lazy)(function () {
  return __webpack_require__.e(/*! import() */ "src_pages_bobines_BobinesValidarList_jsx").then(__webpack_require__.bind(__webpack_require__, /*! ../bobines/BobinesValidarList */ "./src/pages/bobines/BobinesValidarList.jsx"));
});

var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_37__.getSchema)({}, keys, excludeKeys).unknown(true);
};

var filterRules = function filterRules(keys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_37__.getSchema)({//field1: Joi.string().label("Designação")
  }, keys).unknown(true);
};

var TipoRelation = function TipoRelation() {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
    size: "small",
    options: [{
      value: "e"
    }, {
      value: "ou"
    }, {
      value: "!e"
    }, {
      value: "!ou"
    }]
  });
};

var filterSchema = function filterSchema(_ref) {
  var ordersField = _ref.ordersField,
      customersField = _ref.customersField,
      itemsField = _ref.itemsField,
      ordemFabricoStatusField = _ref.ordemFabricoStatusField;
  return [{
    fbobinagem: {
      label: "Nº Bobinagem",
      field: {
        type: 'input',
        size: 'small'
      }
    }
  }, {
    fdata: {
      label: "Data Bobinagem",
      field: {
        type: "rangedate",
        size: 'small'
      }
    }
  }, {
    ftime: {
      label: "Início/Fim",
      field: {
        type: "rangetime",
        size: 'small'
      }
    }
  }, {
    fduracao: {
      label: "Duração",
      field: {
        type: 'input',
        size: 'small'
      },
      span: 12
    }
  }, {
    farea: {
      label: "Área",
      field: {
        type: 'input',
        size: 'small'
      },
      span: 12
    },
    fdiam: {
      label: "Diâmetro",
      field: {
        type: 'input',
        size: 'small'
      },
      span: 12
    }
  }, {
    fcore: {
      label: "Core",
      field: {
        type: 'input',
        size: 'small'
      },
      span: 12
    },
    fcomp: {
      label: "Comprimento",
      field: {
        type: 'input',
        size: 'small'
      },
      span: 12
    }
  }, //Defeitos
  {
    freldefeitos: {
      label: " ",
      field: TipoRelation,
      span: 4
    },
    fdefeitos: {
      label: 'Defeitos',
      field: {
        type: 'selectmulti',
        size: 'small',
        options: config__WEBPACK_IMPORTED_MODULE_35__.BOBINE_DEFEITOS
      },
      span: 20
    }
  }, //Estados
  {
    festados: {
      label: 'Estados',
      field: {
        type: 'selectmulti',
        size: 'small',
        options: config__WEBPACK_IMPORTED_MODULE_35__.BOBINE_ESTADOS
      }
    }
  }, {
    fcliente: {
      label: "Cliente",
      field: {
        type: 'input',
        size: 'small'
      }
    }
  }, {
    fdestino: {
      label: "Destino",
      field: {
        type: 'input',
        size: 'small'
      }
    }
  } //{ f_ofabrico: { label: "Ordem de Fabrico" } },
  //{ f_agg: { label: "Agregação Ordem de Fabrico" } },
  //{ fofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, initialValue: 'all', ignoreFilterTag: (v) => v === 'all' } },
  //{ fmulti_order: { label: "Nº Encomenda/Nº Proforma", field: ordersField } },
  //{ fmulti_customer: { label: "Nº/Nome de Cliente", field: customersField } },
  //{ fmulti_item: { label: "Cód/Designação Artigo", field: itemsField } },
  //{ forderdate: { label: "Data Encomenda", field: { type: "rangedate", size: 'small' } } },
  //{ fstartprevdate: { label: "Data Prevista Início", field: { type: "rangedate", size: 'small' } } },
  //{ fendprevdate: { label: "Data Prevista Fim", field: { type: "rangedate", size: 'small' } } },

  /* { SHIDAT_0: { label: "Data Expedição", field: { type: "rangedate" } } },
  { LASDLVNUM_0: { label: "Nº Última Expedição" } },
  { ofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, ignoreFilterTag: (v) => v === 'all' } } */
  ];
};

var ToolbarTable = function ToolbarTable(_ref2) {
  var form = _ref2.form,
      dataAPI = _ref2.dataAPI;
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_51__.useNavigate)();
  var leftContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(react__WEBPACK_IMPORTED_MODULE_31__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("button", {
    onClick: function onClick() {
      return navigate(-1);
    }
  }, "go back"));
  var rightContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      whiteSpace: "nowrap"
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], {
    form: form,
    initialValues: {}
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.FormLayout, {
    id: "tbt-of",
    schema: schema
  }))));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_43__["default"], {
    left: leftContent,
    right: rightContent
  });
};

var GlobalSearch = function GlobalSearch() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      form = _ref3.form,
      dataAPI = _ref3.dataAPI,
      columns = _ref3.columns,
      setShowFilter = _ref3.setShowFilter,
      showFilter = _ref3.showFilter;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_31__.useState)(false),
      _useState2 = _slicedToArray(_useState, 2),
      changed = _useState2[0],
      setChanged = _useState2[1];

  var _onFinish = function onFinish(type, values) {
    var _values$fdata, _values$ftime;

    switch (type) {
      case "filter":
        !changed && setChanged(true);
        console.log(values);

        var _values = _objectSpread(_objectSpread({}, values), {}, {
          fbobinagem: (0,utils__WEBPACK_IMPORTED_MODULE_38__.getFilterValue)(values === null || values === void 0 ? void 0 : values.fbobinagem, 'any'),
          fdata: (0,utils__WEBPACK_IMPORTED_MODULE_38__.getFilterRangeValues)((_values$fdata = values["fdata"]) === null || _values$fdata === void 0 ? void 0 : _values$fdata.formatted),
          ftime: (0,utils__WEBPACK_IMPORTED_MODULE_38__.getFilterRangeValues)((_values$ftime = values["ftime"]) === null || _values$ftime === void 0 ? void 0 : _values$ftime.formatted),
          fduracao: (0,utils__WEBPACK_IMPORTED_MODULE_38__.getFilterValue)(values === null || values === void 0 ? void 0 : values.fduracao, '=='),
          fcliente: (0,utils__WEBPACK_IMPORTED_MODULE_38__.getFilterValue)(values === null || values === void 0 ? void 0 : values.fcliente, 'any'),
          fdestino: (0,utils__WEBPACK_IMPORTED_MODULE_38__.getFilterValue)(values === null || values === void 0 ? void 0 : values.fdestino, 'any') //f_ofabrico: getFilterValue(values?.f_ofabrico, 'exact'),
          //f_agg: getFilterValue(values?.f_agg, 'exact'),
          //fmulti_customer: getFilterValue(values?.fmulti_customer, 'any'),
          //fmulti_order: getFilterValue(values?.fmulti_order, 'any'),
          //fmulti_item: getFilterValue(values?.fmulti_item, 'any'),
          //forderdate: getFilterRangeValues(values["forderdate"]?.formatted),
          //fstartprevdate: getFilterRangeValues(values["fstartprevdate"]?.formatted),
          //fendprevdate: getFilterRangeValues(values["fendprevdate"]?.formatted)

        });

        dataAPI.addFilters(_values);
        dataAPI.first();
        dataAPI.fetchPost();
        break;
    }
  };

  var onValuesChange = function onValuesChange(type, changedValues, allValues) {
    switch (type) {
      case "filter":
        form.setFieldsValue(allValues);
        break;
    }
  };
  /*     const fetchCustomers = async (value) => {
          const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
          return rows;
      }
      const fetchOrders = async (value) => {
          const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellorderslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_order"]: `%${value.replaceAll(' ', '%%')}%` } });
          console.log("FETECHED", rows)
          return rows;
      }
      const fetchItems = async (value) => {
          const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellitemslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_item"]: `%${value.replaceAll(' ', '%%')}%` } });
          return rows;
      }
   */

  /* const customersField = () => (
      <AutoCompleteField
          placeholder="Cliente"
          size="small"
          keyField="BPCNAM_0"
          textField="BPCNAM_0"
          dropdownMatchSelectWidth={250}
          allowClear
          fetchOptions={fetchCustomers}
      />
  );
  const ordersField = () => (
      <AutoCompleteField
          placeholder="Encomenda/Prf"
          size="small"
          keyField="SOHNUM_0"
          textField="computed"
          dropdownMatchSelectWidth={250}
          allowClear
          fetchOptions={fetchOrders}
      />
  );
  const itemsField = () => (
      <AutoCompleteField
          placeholder="Artigo"
          size="small"
          keyField="ITMREF_0"
          textField="computed"
          dropdownMatchSelectWidth={250}
          allowClear
          fetchOptions={fetchItems}
      />
  ); */


  var downloadFile = function downloadFile(data, filename, mime, bom) {
    var blobData = typeof bom !== 'undefined' ? [bom, data] : [data];
    var blob = new Blob(blobData, {
      type: mime || 'application/octet-stream'
    });

    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // IE workaround for "HTML7007: One or more blob URLs were
      // revoked by closing the blob for which they were created.
      // These URLs will no longer resolve as the data backing
      // the URL has been freed."
      window.navigator.msSaveBlob(blob, filename);
    } else {
      var blobURL = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
      var tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobURL;
      tempLink.setAttribute('download', filename); // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking
      // is enabled.

      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }

      document.body.appendChild(tempLink);
      tempLink.click(); // Fixes "webkit blob resource error 1"

      setTimeout(function () {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
      }, 200);
    }
  };

  var menu = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_54__["default"], {
    onClick: function onClick(v) {
      return exportFile(v);
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_54__["default"].Item, {
    key: "pdf",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_55__["default"], {
      twoToneColor: "red"
    })
  }, "Pdf"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_54__["default"].Item, {
    key: "excel",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_56__["default"], {
      twoToneColor: "#52c41a"
    })
  }, "Excel"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_54__["default"].Item, {
    key: "word",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_57__["default"], null)
  }, "Word"));

  var exportFile = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type) {
      var requestData, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              requestData = dataAPI.getPostRequest();
              requestData.parameters = _objectSpread(_objectSpread({}, requestData.parameters), {}, {
                "config": "default",
                "orientation": "landscape",
                "template": "TEMPLATES-LIST/LIST-A4-${orientation}",
                "title": "Ordens de Fabrico",
                "export": type.key,
                cols: columns
              });
              delete requestData.parameters.cols.bobines;
              requestData.parameters.cols.area.title = "Área m2";
              _context.next = 6;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_34__.fetchPostBlob)(requestData);

            case 6:
              response = _context.sent;
              _context.t0 = type.key;
              _context.next = _context.t0 === "pdf" ? 10 : _context.t0 === "excel" ? 12 : _context.t0 === "word" ? 14 : 16;
              break;

            case 10:
              downloadFile(response.data, "list-".concat(new Date().toJSON().slice(0, 10), ".pdf"));
              return _context.abrupt("break", 16);

            case 12:
              downloadFile(response.data, "list-".concat(new Date().toJSON().slice(0, 10), ".xlsx"));
              return _context.abrupt("break", 16);

            case 14:
              downloadFile(response.data, "list-".concat(new Date().toJSON().slice(0, 10), ".docx"));
              return _context.abrupt("break", 16);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function exportFile(_x) {
      return _ref4.apply(this, arguments);
    };
  }();

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(react__WEBPACK_IMPORTED_MODULE_31__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.FilterDrawer, {
    schema: filterSchema({
      form: form
      /* ordersField, customersField, itemsField */

    }),
    filterRules: filterRules(),
    form: form,
    width: 350,
    setShowFilter: setShowFilter,
    showFilter: showFilter
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], {
    form: form,
    name: "fps",
    onFinish: function onFinish(values) {
      return _onFinish("filter", values);
    },
    onValuesChange: onValuesChange
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.FormLayout, {
    id: "LAY-BOBINAGENS",
    layout: "horizontal",
    style: {
      width: "700px",
      padding: "0px"
      /* , minWidth: "700px" */

    },
    schema: schema,
    field: {
      guides: false,
      wide: [3, 4, 3, 1.5, 1.5],
      style: {
        marginLeft: "2px",
        alignSelf: "end"
      }
    },
    fieldSet: {
      guides: false,
      wide: 16,
      margin: false,
      layout: "horizontal",
      overflow: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.Field, {
    name: "fbobinagem",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Nº Bobinagem",
      pos: "top"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_58__["default"], {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.Field, {
    name: "fdata",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Data Bobinagem",
      pos: "top"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.RangeDateField, {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.Field, {
    name: "ftime",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Início/Fim",
      pos: "top"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.RangeTimeField, {
    size: "small",
    format: config__WEBPACK_IMPORTED_MODULE_35__.TIME_FORMAT
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.FieldItem, {
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(ButtonGroup, {
    size: "small",
    style: {
      marginLeft: "5px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    style: {
      padding: "0px 3px"
    },
    onClick: function onClick() {
      return form.submit();
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_59__["default"], null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    style: {
      padding: "0px 3px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(assets_morefilters_svg__WEBPACK_IMPORTED_MODULE_45__["default"], {
    style: {
      fontSize: "16px",
      marginTop: "2px"
    },
    onClick: function onClick() {
      return setShowFilter(function (prev) {
        return !prev;
      });
    }
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_40__.FieldItem, {
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_60__["default"], {
    overlay: menu
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], {
    size: "small",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_61__["default"], null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_62__["default"], null)))))));
};

var StyledBobine = styled_components__WEBPACK_IMPORTED_MODULE_63__["default"].div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    border:dashed 1px #000;\n    background-color:", ";\n    border-radius:3px;\n    margin-right:1px;\n    text-align:center;\n    width:25px;\n    font-size:9px;\n    cursor:pointer;\n    &:hover {\n        border-color: #d9d9d9;\n    }\n"])), function (props) {
  return props.color;
});
var useStyles = (0,react_jss__WEBPACK_IMPORTED_MODULE_64__.createUseStyles)({
  columnBobines: {
    width: '25px',
    textAlign: "center",
    marginRight: "1px"
  }
});

var ColumnBobines = function ColumnBobines(_ref5) {
  var n = _ref5.n;
  var classes = useStyles();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row"
    }
  }, _toConsumableArray(Array(n)).map(function (x, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
      className: classes.columnBobines,
      key: "bh-".concat(i)
    }, i + 1);
  }));
};

var bColors = function bColors(estado) {
  if (estado === "G") {
    return "#237804"; //"green";
  } else if (estado === "DM") {
    return "#fadb14"; //"gold";
  } else if (estado === "R") {
    return "#ff1100"; //"red";
  } else if (estado === "LAB") {
    return "#13c2c2"; //"cyan";
  } else if (estado === "BA") {
    return "#ff1100"; //"red";
  } else if (estado === "IND") {
    return "#0050b3"; //"blue";
  } else if (estado === "HOLD") {
    return "#391085"; //"purple";
  }
};

var Bobines = function Bobines(_ref6) {
  var b = _ref6.b,
      bm = _ref6.bm,
      setShow = _ref6.setShow;
  var bobines = b;

  var handleClick = function handleClick() {
    console.log("OI", bm.id);
    setShow({
      show: true,
      data: {
        bobinagem_id: bm.id,
        bobinagem_nome: bm.nome
      }
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row"
    }
  }, bobines.map(function (v, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(StyledBobine, {
      onClick: handleClick,
      color: bColors(v.estado),
      key: "bob-".concat(v.id)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("b", null, v.estado), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", null, v.lar));
  }));
};

var EditableContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createContext(null);

var EditableRow = function EditableRow(_ref7) {
  var index = _ref7.index,
      props = _objectWithoutProperties(_ref7, _excluded);

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_53__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], {
    form: form,
    component: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(EditableContext.Provider, {
    value: form
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("tr", props)));
};

var EditableCell = function EditableCell(_ref8) {
  var title = _ref8.title,
      editable = _ref8.editable,
      children = _ref8.children,
      dataIndex = _ref8.dataIndex,
      record = _ref8.record,
      input = _ref8.input,
      handleSave = _ref8.handleSave,
      restProps = _objectWithoutProperties(_ref8, _excluded2);

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_31__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      editing = _useState4[0],
      setEditing = _useState4[1];

  var inputRef = (0,react__WEBPACK_IMPORTED_MODULE_31__.useRef)(null);
  var form = (0,react__WEBPACK_IMPORTED_MODULE_31__.useContext)(EditableContext);
  (0,react__WEBPACK_IMPORTED_MODULE_31__.useEffect)(function () {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  var toggleEdit = function toggleEdit() {
    setEditing(!editing);
    form.setFieldsValue(_defineProperty({}, dataIndex, record[dataIndex]));
  };

  var save = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var values;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return form.validateFields();

            case 3:
              values = _context2.sent;
              toggleEdit();
              handleSave(_objectSpread(_objectSpread({}, record), values));
              _context2.next = 11;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](0);
              console.log('Save failed:', _context2.t0);

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 8]]);
    }));

    return function save() {
      return _ref9.apply(this, arguments);
    };
  }();

  var childNode = children;

  if (editable) {
    childNode = editing ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"].Item, {
      style: {
        margin: 0
      },
      name: dataIndex,
      rules: [{
        required: true,
        message: "".concat(title, " is required.")
      }]
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.isValidElement(input) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.cloneElement(input, _objectSpread({
      ref: inputRef,
      onPressEnter: save,
      onBlur: save
    }, input.props)) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_58__["default"], {
      ref: inputRef,
      onPressEnter: save,
      onBlur: save
    })) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
      className: "editable-cell-value-wrap",
      style: {
        paddingRight: 24
      },
      onClick: toggleEdit
    }, children);
  }

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("td", restProps, childNode);
};

var TitleValidar = function TitleValidar(_ref10) {
  var data = _ref10.data;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", {
    style: {
      fontSize: "14px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("b", {
    style: {
      textTransform: "capitalize"
    }
  }), "Validar/Classificar a Bobinagem ", data.bobinagem_nome))));
};

var ModalValidar = function ModalValidar(_ref11) {
  var show = _ref11.show,
      setShow = _ref11.setShow;

  var _React$useState = react__WEBPACK_IMPORTED_MODULE_31__.useState(false),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      confirmLoading = _React$useState2[0],
      setConfirmLoading = _React$useState2[1];

  var handleCancel = function handleCancel() {
    setShow({
      show: false,
      data: {}
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(react__WEBPACK_IMPORTED_MODULE_31__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_65__["default"], {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(TitleValidar, {
      data: show.data
      /* aggCod={aggCod} */

    }),
    visible: show.show,
    centered: true,
    onCancel: handleCancel,
    confirmLoading: confirmLoading,
    maskClosable: true,
    footer: null,
    destroyOnClose: true,
    bodyStyle: {
      height: "calc(100vh - 60px)"
      /* , backgroundColor: "#f0f0f0" */

    },
    width: "100%"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_YScroll__WEBPACK_IMPORTED_MODULE_46__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(react__WEBPACK_IMPORTED_MODULE_31__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(react__WEBPACK_IMPORTED_MODULE_31__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(BobinesValidarList, {
    data: show.data
  })))));
}; // const formSchema = (keys, excludeKeys) => {
//     return getSchema({
//         /* npaletes: Joi.number().positive().label("Paletes/Contentor").required(),
//         palete_maxaltura: Joi.number().positive().precision(2).label("Altura Máx. Palete (metros)").required(),
//         //designacao: Joi.string().label("Designação").required(),
//         netiquetas_bobine: Joi.number().positive().precision(2).label("Etiqueta/Bobine").required(),
//         netiquetas_lote: Joi.number().positive().precision(2).label("Etiqueta do Lote da Palete").required(),
//         netiquetas_final: Joi.number().positive().precision(2).label("Etiqueta Final da Palete").required(),
//         folha_identificativa: Joi.number().min(0).precision(2).label("Folha Identificativa Palete").required(),
//         cintas: Joi.number().valid(0, 1),
//         ncintas: Joi.when('cintas', { is: 1, then: Joi.number().positive().required() }),
//         paletizacao: Joi.array().min(1).label("Items da Paletização").required() */
//     }, keys, excludeKeys).unknown(true);
// };
// const BobinagemValidarForm = ({ data, wrapForm = "form", forInput = true }) => {
//     const { bobinagem, bobines } = data;
//     const [form] = Form.useForm();
//     const [resultMessage, setResultMessage] = useState({ status: "none" });
//     const [changedValues, setChangedValues] = useState({});
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
//     const onValuesChange = (changedValues, allValues) => {
//         console.log("chv-------", changedValues)
//         setChangedValues(changedValues);
//     }
//     const onFinish = async (values) => {
//         const status = { error: [], warning: [], info: [], success: [] };
//         setFormStatus(status);
//     }
//     return (
//         <Form form={form} name={`fpv`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
//             <FormLayout
//                 id="LAY-VALIDAR-BM"
//                 guides={false}
//                 layout="vertical"
//                 style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
//                 schema={formSchema}
//                 field={{
//                     forInput,
//                     wide: [16],
//                     margin: "0px", overflow: false, guides: false,
//                     label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
//                     alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
//                     layout: { top: "", right: "", center: "", bottom: "", left: "" },
//                     required: true,
//                     style: { alignSelf: "center" }
//                 }}
//                 fieldSet={{
//                     guides: false,
//                     wide: 16, margin: "0px", layout: "horizontal", overflow: false
//                 }}
//             >
//                 <FieldSet layout="vertical" wide={16}>
//                     <Form.List name="validacao_bobines_list">
//                         {(fields, { add, remove, move }) => {
//                             const addRow = (fields) => {
//                                 add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0);
//                             }
//                             /*const removeRow = (fieldName) => {
//                                 remove(fieldName);
//                             }
//                             const moveRow = (from, to) => {
//                                 move(from, to);
//                             } */
//                             return (
//                                 <>
//                                     <FieldSet margin="5px">
//                                         {forInput && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><UserOutlined />Adicionar</Button>}
//                                     </FieldSet>
//                                     {fields.map((field, index) => (
//                                         <FieldSet layout="vertical" field={{ wide: [16] }} key={field.key}>
//                                             <FieldSet layout="horizontal" field={{ wide: [1, 15] }} style={{ justifyContent: "center" }}>
//                                                 <Button style={{ alignSelf: "center" }} icon={<MdAdjust />} />
//                                                 <div style={{ display: "flex", flexDirection: "row" }}>{data.bobines.map((v, i) => {
//                                                     return (
//                                                         <div key={`bl-${i}`}>
//                                                             {/* <div style={{ textAlign: "center" }}>{i}</div> */}
//                                                             <StyledBobine color={bColors(v.estado)}>
//                                                                 <Field label={{ enabled: false }} name={[field.name, `bobine_id_${i}`]}>
//                                                                     <CheckboxField />
//                                                                 </Field>
//                                                                 <b>{v.estado}</b><b>{i}</b><div>{v.lar}</div>
//                                                                 <Field label={{ enabled: false }} name={[field.name, `largura_${i}`]}>
//                                                                     <Input />
//                                                                 </Field>
//                                                             </StyledBobine>
//                                                         </div>
//                                                     );
//                                                 })}</div>
//                                             </FieldSet>
//                                             {/*                                             <FieldSet layout="vertical" field={{ wide: [16] }}>
//                                                 <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid" }}>
//                                                     <tr>
//                                                         <th style={{ border: "1px solid" }}>Classificação</th>
//                                                         <th style={{ border: "1px solid" }}>Lastname</th>
//                                                     </tr>
//                                                     <tr>
//                                                         <td style={{ border: "1px solid" }}>Peter</td>
//                                                         <td style={{ border: "1px solid" }}><Field name={[field.name, `nok`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field></td>
//                                                     </tr>
//                                                     <tr>
//                                                         <td style={{ border: "1px solid" }}>Lois</td>
//                                                         <td style={{ border: "1px solid" }}>Griffin</td>
//                                                     </tr>
//                                                 </table>
//                                             </FieldSet> */}
//                                             <FieldSet layout="vertical" field={{ wide: [15] }} style={{ marginTop: "5px" }}>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Largura NOK</FieldItem>
//                                                     <Field name={[field.name, `nok`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Cónico</FieldItem>
//                                                     <Field name={[field.name, `con`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Descentrada</FieldItem>
//                                                     <Field name={[field.name, `desc`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Presa</FieldItem>
//                                                     <Field name={[field.name, `presa`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Diâmetro</FieldItem>
//                                                     <Field name={[field.name, `diam`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Sujidade</FieldItem>
//                                                     <Field name={[field.name, `suj`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Carro Atrás</FieldItem>
//                                                     <Field name={[field.name, `carro`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Não Colou</FieldItem>
//                                                     <Field name={[field.name, `ncolou`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Sobretiragem</FieldItem>
//                                                     <Field name={[field.name, `sobr`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Falha Corte</FieldItem>
//                                                     <Field name={[field.name, `falhacorte`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Inicio Diam. (mm)</FieldItem>
//                                                     <Field name={[field.name, `inicio_diam`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Fim Diam. (mm)</FieldItem>
//                                                     <Field name={[field.name, `fim_diam`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Falha Filme</FieldItem>
//                                                     <Field name={[field.name, `falhafilme`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Início Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `iniciodesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Fim Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `fimdesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Falha M.P.</FieldItem>
//                                                     <Field name={[field.name, `falha_mp`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Furos</FieldItem>
//                                                     <Field name={[field.name, `furos`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Buracos Gram.</FieldItem>
//                                                     <Field name={[field.name, `buracos`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Início Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `iniciodesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Fim Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `fimdesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                             </FieldSet>
//                                         </FieldSet>
//                                     ))}
//                                 </>
//                             );
//                         }}
//                     </Form.List>
//                 </FieldSet>
//             </FormLayout>
//         </Form>
//     );
// }


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function () {
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_31__.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      loading = _useState6[0],
      setLoading = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_31__.useState)([]),
      _useState8 = _slicedToArray(_useState7, 2),
      selectedRows = _useState8[0],
      setSelectedRows = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_31__.useState)(false),
      _useState10 = _slicedToArray(_useState9, 2),
      showFilter = _useState10[0],
      setShowFilter = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_31__.useState)({
    show: false,
    data: {}
  }),
      _useState12 = _slicedToArray(_useState11, 2),
      showValidar = _useState12[0],
      setShowValidar = _useState12[1];

  var _Form$useForm3 = antd__WEBPACK_IMPORTED_MODULE_53__["default"].useForm(),
      _Form$useForm4 = _slicedToArray(_Form$useForm3, 1),
      formFilter = _Form$useForm4[0];

  var dataAPI = (0,utils_useDataAPI__WEBPACK_IMPORTED_MODULE_36__.useDataAPI)({
    payload: {
      url: "".concat(config__WEBPACK_IMPORTED_MODULE_35__.API_URL, "/validarbobinagenslist/"),
      parameters: {},
      pagination: {
        enabled: true,
        page: 1,
        pageSize: 10
      },
      filter: {},
      sort: [{
        column: 'data',
        direction: 'DESC'
      }]
    }
  });
  var elFilterTags = document.getElementById('filter-tags');

  var _ref12 = (0,react__WEBPACK_IMPORTED_MODULE_31__.useContext)(_App__WEBPACK_IMPORTED_MODULE_49__.SocketContext) || {},
      dataSocket = _ref12.data;
  /*     useEffect(() => {
          const cancelFetch = cancelToken();
          dataAPI.first();
          dataAPI.fetchPost({token: cancelFetch });
          return (() => cancelFetch.cancel());
      }, []); */


  (0,react__WEBPACK_IMPORTED_MODULE_31__.useEffect)(function () {
    console.log("NOVA BOBINAGEM DETETADA...", dataSocket);
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_34__.cancelToken)();
    dataAPI.first();
    dataAPI.fetchPost({
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel();
    };
  }, [dataSocket]);

  var selectionRowKey = function selectionRowKey(record) {
    return "".concat(record.id);
  };

  var components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };
  var columns = (0,components_table__WEBPACK_IMPORTED_MODULE_42__.setColumns)({
    dataAPI: dataAPI,
    data: dataAPI.getData().rows,
    uuid: "bobinagenslist_validar",
    include: _objectSpread({}, function (common) {
      return {
        nome: _objectSpread({
          title: "Bobinagem",
          width: 60,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("span", {
              style: {
                color: "#096dd9",
                cursor: "pointer"
              }
            }, v);
          }
        }, common),

        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
        inico: _objectSpread({
          title: "Início",
          render: function render(v, r) {
            return dayjs__WEBPACK_IMPORTED_MODULE_32___default()('01-01-1970 ' + v).format(config__WEBPACK_IMPORTED_MODULE_35__.TIME_FORMAT);
          }
        }, common),
        fim: _objectSpread({
          title: "Fim",
          render: function render(v, r) {
            return dayjs__WEBPACK_IMPORTED_MODULE_32___default()('01-01-1970 ' + v).format(config__WEBPACK_IMPORTED_MODULE_35__.TIME_FORMAT);
          }
        }, common),
        duracao: _objectSpread({
          title: "Duração",
          width: 20,
          render: function render(v, r) {
            return v;
          }
        }, common),
        core: _objectSpread({
          title: "Core",
          width: 5,
          render: function render(v, r) {
            return v;
          }
        }, common),
        comp: _objectSpread({
          title: "Comp.",
          render: function render(v, r) {
            return v;
          },
          editable: true,
          input: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_66__["default"], null)
        }, common),
        comp_par: _objectSpread({
          title: "Comp. Emenda",
          render: function render(v, r) {
            return v;
          }
        }, common),
        comp_cli: _objectSpread({
          title: "Comp. Cliente",
          render: function render(v, r) {
            return v;
          }
        }, common),
        area: _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement("span", null, "\xC1rea m\xB2"),
          render: function render(v, r) {
            return v;
          }
        }, common),
        diam: _objectSpread({
          title: "Diâmetro mm",
          render: function render(v, r) {
            return v;
          }
        }, common),
        nwinf: _objectSpread({
          title: "Nw Inf. m",
          render: function render(v, r) {
            return v;
          }
        }, common),
        nwsup: _objectSpread({
          title: "Nw Sup. m",
          render: function render(v, r) {
            return v;
          }
        }, common),
        bobines: _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(ColumnBobines, {
            n: 28
          }),
          sorter: false,
          render: function render(v, r) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(Bobines, {
              b: JSON.parse(v),
              bm: r,
              setShow: setShowValidar
            });
          }
        }, common) //cod: { title: "Agg", width: 140, render: v => <span style={{ color: "#096dd9" }}>{v}</span>, ...common },
        //ofabrico: { title: "Ordem Fabrico", width: 140, render: v => <b>{v}</b>, ...common },
        //prf: { title: "PRF", width: 140, render: v => <b>{v}</b>, ...common },
        //iorder: { title: "Encomenda(s)", width: 140, ...common },

        /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
        //estado: { title: "", width: 125, ...common },

        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
        //item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
        //cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },
        //start_date: { title: "Início Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.start_prev_date) ? r.start_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
        //end_date: { title: "Fim Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.end_prev_date) ? r.end_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
        //produzidas: { title: "Produzidas", width: 100, render: (v, r) => <ColumnProgress type={1} record={r} />, ...common },
        //pstock: { title: "Para Stock", width: 100, render: (v, r) => <ColumnProgress type={2} record={r} />, ...common },
        //total: { title: "Total", width: 100, render: (v, r) => <ColumnProgress type={3} record={r} />, ...common },

        /* details: {
            title: "", width: 50, render: (v, r) => <Space>
                {r.stock == 1 && <GrStorage title="Para Stock" />}
                {r.retrabalho == 1 && <RiRefreshLine title="Para Retrabalho" />}
            </Space>, table: "sgp_op", ...common
        } */
        //PRFNUM_0: { title: "Prf", width: '160px', ...common },
        //DSPTOTQTY_0: { title: "Quantidade", width: '160px', ...common }
        //COLUNA2: { title: "Coluna 2", width: '160px', render: v => dayjs(v).format(DATE_FORMAT), ...common },
        //COLUNA3: { title: "Coluna 3", width: '20%', render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common }

      };
    }({
      idx: 1,
      optional: false
    })),
    exclude: []
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(react__WEBPACK_IMPORTED_MODULE_31__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(antd__WEBPACK_IMPORTED_MODULE_67__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_68__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    style: {
      top: "50%",
      left: "50%",
      position: "absolute"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(ModalValidar, {
    show: showValidar,
    setShow: setShowValidar
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(ToolbarTable, {
    form: formFilter,
    dataAPI: dataAPI
  }), elFilterTags && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_44__["default"], {
    elId: elFilterTags
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_form__WEBPACK_IMPORTED_MODULE_39__.FilterTags, {
    form: formFilter,
    filters: dataAPI.getAllFilter(),
    schema: filterSchema,
    rules: filterRules()
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(components_table__WEBPACK_IMPORTED_MODULE_42__["default"], {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(Title, {
      level: 4
    }, "Validar Bobinagens da Linha 1"),
    columnChooser: false,
    reload: true,
    stripRows: true,
    darkHeader: true,
    size: "small",
    toolbar: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_31__.createElement(GlobalSearch, {
      columns: columns === null || columns === void 0 ? void 0 : columns.report,
      form: formFilter,
      dataAPI: dataAPI,
      setShowFilter: setShowFilter,
      showFilter: showFilter
    }),
    selection: {
      enabled: false,
      rowKey: function rowKey(record) {
        return selectionRowKey(record);
      },
      onSelection: setSelectedRows,
      multiple: false,
      selectedRows: selectedRows,
      setSelectedRows: setSelectedRows
    },
    paginationProps: {
      pageSizeOptions: [10, 15, 20, 30]
    },
    dataAPI: dataAPI,
    columns: columns,
    onFetch: dataAPI.fetchPost,
    components: components //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}

  })));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_bobinagens_BobinagensValidarList_jsx.chunk.js.map