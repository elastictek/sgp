"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_bobines_BobinesValidarList_jsx"],{

/***/ "./src/pages/bobines/BobinesValidarList.jsx":
/*!**************************************************!*\
  !*** ./src/pages/bobines/BobinesValidarList.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.freeze.js */ "./node_modules/core-js/modules/es.object.freeze.js");
/* harmony import */ var core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_useDataAPI__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! utils/useDataAPI */ "./src/utils/useDataAPI.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var utils__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! utils */ "./src/utils/index.js");
/* harmony import */ var components_form__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! components/form */ "./src/components/form.jsx");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_Drawer__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! components/Drawer */ "./src/components/Drawer.jsx");
/* harmony import */ var components_table__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! components/table */ "./src/components/table.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var assets_morefilters_svg__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! assets/morefilters.svg */ "./src/assets/morefilters.svg");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/index.js");
/* harmony import */ var components_YScroll__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! components/YScroll */ "./src/components/YScroll.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/typography/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/checkbox/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var use_immer__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! use-immer */ "./node_modules/use-immer/dist/use-immer.module.js");


















var _templateObject;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }







function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }






















var TextArea = antd__WEBPACK_IMPORTED_MODULE_38__["default"].TextArea;


var ButtonGroup = antd__WEBPACK_IMPORTED_MODULE_39__["default"].Group;


var Title = antd__WEBPACK_IMPORTED_MODULE_40__["default"].Title;
var ApproveButton = (0,styled_components__WEBPACK_IMPORTED_MODULE_41__["default"])(antd__WEBPACK_IMPORTED_MODULE_39__["default"])(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  &&& {\n    background-color: #389e0d;\n    border-color: #389e0d;\n    color:#fff;\n    &:hover{\n        background-color: #52c41a;\n        border-color: #52c41a;\n    }\n  }\n"])));

var ToolbarTable = function ToolbarTable(_ref) {
  var dataAPI = _ref.dataAPI,
      onSubmit = _ref.onSubmit;
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_42__.useNavigate)();
  var leftContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
    type: "primary",
    size: "small",
    onClick: function onClick() {
      return onSubmit("validar");
    }
  }, "Validar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(ApproveButton, {
    size: "small",
    onClick: function onClick() {
      return onSubmit("aprovar");
    }
  }, "Aprovar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
    danger: true,
    size: "small",
    onClick: function onClick() {
      return onSubmit("hold");
    }
  }, "Hold"));
  var rightContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      whiteSpace: "nowrap"
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      whiteSpace: "nowrap"
    }
  }));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_34__["default"], {
    left: leftContent,
    right: rightContent
  });
};

var FEstado = function FEstado(_ref2) {
  var index = _ref2.index,
      data = _ref2.data,
      _ref2$width = _ref2.width,
      width = _ref2$width === void 0 ? "70px" : _ref2$width;
  var name = "st-".concat(index);
  var tabIndex = 100 + index;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_31__.SelectField, {
    value: data.estado[name],
    name: name,
    tabIndex: tabIndex,
    style: {
      width: width
    },
    size: "small",
    options: config__WEBPACK_IMPORTED_MODULE_26__.BOBINE_ESTADOS
  });
};

var HeaderCol = function HeaderCol(_ref3) {
  var data = _ref3.data,
      name = _ref3.name,
      title = _ref3.title,
      _onChange = _ref3.onChange;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], null, title, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_44__["default"], {
    onChange: function onChange(v) {
      return _onChange("".concat(name, "-all"), v);
    },
    checked: data["".concat(name, "-all")],
    name: "".concat(name, "-all")
  }));
};

var FLarguraReal = function FLarguraReal(_ref4) {
  var index = _ref4.index,
      data = _ref4.data,
      _ref4$width = _ref4.width,
      width = _ref4$width === void 0 ? "60px" : _ref4$width;
  var name = "lr-".concat(index);
  var tabIndex = 200 + index;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], {
    tabIndex: tabIndex,
    controls: false,
    style: {
      width: width
    },
    value: data.l_real[name],
    name: name,
    size: "small"
  });
};

var FDefeitos = function FDefeitos(_ref5) {
  var index = _ref5.index,
      data = _ref5.data,
      _ref5$width = _ref5.width,
      width = _ref5$width === void 0 ? "100%" : _ref5$width,
      _onChange2 = _ref5.onChange;
  var name = "defeitos-".concat(index);
  var tabIndex = 300 + index;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_31__.SelectMultiField, {
    onChange: function onChange(v) {
      return _onChange2("defeitos", v, index);
    },
    tabIndex: tabIndex,
    style: {
      width: width
    },
    name: name,
    value: data.defeitos[index],
    allowClear: true,
    size: "small",
    options: config__WEBPACK_IMPORTED_MODULE_26__.BOBINE_DEFEITOS
  });
};

var FFalhaCorte = function FFalhaCorte(_ref6) {
  var index = _ref6.index,
      data = _ref6.data,
      _ref6$width = _ref6.width,
      width = _ref6$width === void 0 ? "50px" : _ref6$width;
  var name1 = "fc-i-".concat(index);
  var name2 = "fc-e-".concat(index);
  var tabIndex = 400 + index;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], {
    tabIndex: tabIndex,
    controls: false,
    style: {
      width: width
    },
    disabled: true,
    name: name1,
    size: "small"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], {
    tabIndex: tabIndex,
    controls: false,
    style: {
      width: width
    },
    disabled: true,
    name: name2,
    size: "small"
  }));
};

var FFalhaFilme = function FFalhaFilme(_ref7) {
  var index = _ref7.index,
      data = _ref7.data,
      _ref7$width = _ref7.width,
      width = _ref7$width === void 0 ? "50px" : _ref7$width;
  var name1 = "ff-i-".concat(index);
  var name2 = "ff-e-".concat(index);
  var tabIndex = 500 + index;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], {
    tabIndex: tabIndex,
    controls: false,
    style: {
      width: width
    },
    disabled: true,
    name: name1,
    size: "small"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], {
    tabIndex: tabIndex,
    controls: false,
    style: {
      width: width
    },
    disabled: true,
    name: name2,
    size: "small"
  }));
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref8) {
  var data = _ref8.data;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)(false),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)([]),
      _useState4 = _slicedToArray(_useState3, 2),
      selectedRows = _useState4[0],
      setSelectedRows = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      showFilter = _useState6[0],
      setShowFilter = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)({
    show: false,
    data: {}
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      showValidar = _useState8[0],
      setShowValidar = _useState8[1];

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_46__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      formFilter = _Form$useForm2[0];

  var _useImmer = (0,use_immer__WEBPACK_IMPORTED_MODULE_47__.useImmer)({
    'defeitos-all': 0,
    'ff-all': 0,
    'fc-all': 0,
    'st-all': 0,
    estado: {},
    l_real: {},
    defeitos: [],
    fc: {},
    ff: {}
  }),
      _useImmer2 = _slicedToArray(_useImmer, 2),
      formData = _useImmer2[0],
      setFormData = _useImmer2[1];

  var dataAPI = (0,utils_useDataAPI__WEBPACK_IMPORTED_MODULE_27__.useDataAPI)({
    payload: {
      url: "".concat(config__WEBPACK_IMPORTED_MODULE_26__.API_URL, "/validarbobineslist/"),
      parameters: {},
      pagination: {
        enabled: true,
        page: 1,
        pageSize: 30
      },
      filter: {},
      sort: [{
        column: 'nome',
        direction: 'ASC'
      }]
    }
  });
  (0,react__WEBPACK_IMPORTED_MODULE_22__.useEffect)(function () {
    var bobinagem_id = data.bobinagem_id;
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_25__.cancelToken)();
    dataAPI.first();
    dataAPI.addFilters({
      bobinagem_id: bobinagem_id
    });
    dataAPI.fetchPost({
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel();
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_22__.useEffect)(function () {
    if (dataAPI.hasData()) {
      var _iterator = _createForOfIteratorHelper(dataAPI.getData().rows.entries()),
          _step;

      try {
        var _loop = function _loop() {
          var _step$value = _slicedToArray(_step.value, 2),
              i = _step$value[0],
              v = _step$value[1];

          setFormData(function (draft) {
            draft.estado["st-".concat(i)] = v.estado;
            draft.l_real["lr-".concat(i)] = v.l_real;
            draft.defeitos[i] = [];
          });
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } //setFormData(draft => {
    //    draft.profile.bio = newBio;
    //  });
    //console.log("dataAPI.getData().rows");
    //console.log(dataAPI.getData().rows);

  }, [dataAPI.hasData()]);

  var onChange = function onChange(type, value, index) {
    switch (type) {
      case 'defeitos-all':
        console.log("---------------", value);
        setFormData(function (draft) {
          draft['defeitos-all'] = value.target.checked;
        });
        break;

      case "defeitos":
        if (formData['defeitos-all']) {
          setFormData(function (draft) {
            draft.defeitos = formData.defeitos.map(function () {
              return value;
            });
          });
        } else {
          setFormData(function (draft) {
            draft.defeitos[index] = value;
          });
        }

        break;
    }

    console.log(formData);
  };

  var onSubmit = function onSubmit(type) {
    var _defeitos = [];

    for (var key in formData.defeitos) {
      console.log(key, dataAPI.getData().rows[key], formData.defeitos["".concat(dataAPI.getData().rows[key].id)]);

      var _t = formData.defeitos[key].map(function (v) {
        return _defineProperty({}, v.key, 1);
      });

      console.log(dataAPI.getData().rows[key].id);

      _defeitos.push({
        id: dataAPI.getData().rows[key].id
      });

      console.log(_t);
    }

    switch (type) {
      case "validar":
        break;

      case "hold":
        break;

      case "aprovar":
        break;
    }
  };

  var selectionRowKey = function selectionRowKey(record) {
    return "".concat(record.id);
  };

  var components = {
    body: {//row: EditableRow,
      //cell: EditableCell,
    }
  };
  var columns = (0,components_table__WEBPACK_IMPORTED_MODULE_33__.setColumns)({
    dataAPI: dataAPI,
    data: dataAPI.getData().rows,
    uuid: "bobineslist_validar",
    include: _objectSpread({}, function (common) {
      return {
        nome: _objectSpread({
          title: "Bobine",
          width: 125,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("span", {
              style: {
                color: "#096dd9",
                cursor: "pointer"
              }
            }, v);
          }
        }, common),
        "A": _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(HeaderCol, {
            title: "Estado",
            name: "st",
            data: formData,
            onChange: onChange
          }),
          width: 80,
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(FEstado, {
              width: "70px",
              index: i,
              data: formData
            });
          }
        }, common),
        "B": _objectSpread({
          title: "Largura Real",
          width: 90,
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(FLarguraReal, {
              width: "60px",
              index: i,
              data: formData
            });
          }
        }, common),
        "E": _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(HeaderCol, {
            title: "Outros Defeitos",
            name: "defeitos",
            data: formData,
            onChange: onChange
          }),
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(FDefeitos, {
              width: "100%",
              index: i,
              data: formData,
              onChange: onChange
            });
          }
        }, common),
        "C": _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(HeaderCol, {
            title: "Falha Corte",
            name: "fc",
            data: formData,
            onChange: onChange
          }),
          width: 70,
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(FFalhaCorte, {
              width: "50px",
              index: i,
              data: formData
            });
          }
        }, common),
        "D": _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(HeaderCol, {
            title: "Falha Filme",
            name: "ff",
            data: formData,
            onChange: onChange
          }),
          width: 70,
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(FFalhaFilme, {
              width: "50px",
              index: i,
              data: formData
            });
          }
        }, common),
        "F": _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(HeaderCol, {
            title: "Prop. Obs.",
            name: "probs",
            data: formData,
            onChange: onChange
          }),
          width: 270,
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(TextArea, {
              style: {
                height: "22px",
                minHeight: "22px",
                maxHeight: "122px",
                overflowY: "hidden",
                resize: "none"
              },
              tabIndex: 600 + i,
              name: "probs-i-".concat(i),
              size: "small"
            });
          }
        }, common),
        "G": _objectSpread({
          title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(HeaderCol, {
            title: "Obs.",
            name: "obs",
            data: formData,
            onChange: onChange
          }),
          width: 270,
          render: function render(v, r, i) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(TextArea, {
              autoSize: {
                minRows: 1,
                maxRows: 6
              },
              style: {
                height: "22px",
                minHeight: "22px",
                maxHeight: "122px",
                overflowY: "hidden",
                resize: "none"
              },
              tabIndex: 700 + i,
              name: "obs-i-".concat(i),
              size: "small"
            });
          }
        }, common)
      };
    }({
      idx: 1,
      optional: false,
      sorter: false
    })),
    exclude: []
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(react__WEBPACK_IMPORTED_MODULE_22__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_48__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_49__["default"], {
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(ToolbarTable, {
    dataAPI: dataAPI,
    onSubmit: onSubmit
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_table__WEBPACK_IMPORTED_MODULE_33__["default"], {
    columnChooser: false,
    reload: false,
    header: false,
    stripRows: true,
    darkHeader: true,
    size: "small"
    /* toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />} */
    ,
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
//# sourceMappingURL=src_pages_bobines_BobinesValidarList_jsx.chunk.js.map