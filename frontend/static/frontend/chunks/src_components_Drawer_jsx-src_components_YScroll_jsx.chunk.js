"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_components_Drawer_jsx-src_components_YScroll_jsx"],{

/***/ "./src/components/Drawer.jsx":
/*!***********************************!*\
  !*** ./src/components/Drawer.jsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "./node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");






















var _excluded = ["showWrapper", "setShowWrapper", "parentReload", "children", "width"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var showWrapper = _ref.showWrapper,
      setShowWrapper = _ref.setShowWrapper,
      parentReload = _ref.parentReload,
      children = _ref.children,
      width = _ref.width,
      rest = _objectWithoutProperties(_ref, _excluded);

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      formTitle = _useState2[0],
      setFormTitle = _useState2[1];

  var iref = (0,react__WEBPACK_IMPORTED_MODULE_22__.useRef)();
  var _showWrapper$record = showWrapper.record,
      record = _showWrapper$record === void 0 ? {} : _showWrapper$record;

  var onVisible = function onVisible() {
    setShowWrapper(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        show: !prev.show
      });
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_23__.WrapperForm, _extends({
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_23__.TitleForm, {
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
    width: width,
    bodyStyle: {
      height: "450px"
      /*  paddingBottom: 80 */

      /* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */

    },
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
      ref: iref,
      id: "form-wrapper",
      style: {
        textAlign: 'right'
      }
    })
  }, rest), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.cloneElement(children, _objectSpread(_objectSpread({}, children.props), {}, {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  })));
});

/***/ }),

/***/ "./src/components/RangeTime.jsx":
/*!**************************************!*\
  !*** ./src/components/RangeTime.jsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "./node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/time-picker/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ClockCircleOutlined.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! config */ "./src/config/index.js");















var _excluded = ["value", "onChange", "startProps", "endProps", "format"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






var TimeRange = function TimeRange(_ref) {
  var _ref$value = _ref.value,
      value = _ref$value === void 0 ? {} : _ref$value,
      onChange = _ref.onChange,
      startProps = _ref.startProps,
      endProps = _ref.endProps,
      _ref$format = _ref.format,
      format = _ref$format === void 0 ? config__WEBPACK_IMPORTED_MODULE_16__.TIME_FORMAT : _ref$format,
      rest = _objectWithoutProperties(_ref, _excluded);

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_15__.useState)(false),
      _useState2 = _slicedToArray(_useState, 2),
      endOpen = _useState2[0],
      setEndOpen = _useState2[1];

  var disabledStartTime = function disabledStartTime(startValue) {
    var endValue = value.endValue;

    if (!startValue || !endValue) {
      return false;
    }

    return startValue.valueOf() > endValue.valueOf();
  };

  var disabledEndTime = function disabledEndTime(endValue) {
    var startValue = value.startValue;

    if (!endValue || !startValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  };

  var onStartChange = function onStartChange(val) {
    onChange('startValue', val);
  };

  var onEndChange = function onEndChange(val) {
    onChange('endValue', val);
  };

  var handleStartOpenChange = function handleStartOpenChange(open) {
    if (!open) {
      setEndOpen(true);
    }
  };

  var handleEndOpenChange = function handleEndOpenChange(open) {
    setEndOpen(open);
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_17__["default"], _extends({
    disabledTime: disabledStartTime,
    format: format,
    value: value === null || value === void 0 ? void 0 : value.startValue,
    placeholder: "In\xEDcio",
    onChange: onStartChange,
    onOpenChange: handleStartOpenChange,
    style: {
      marginRight: "1px"
    },
    suffixIcon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Fragment, null)
  }, rest, startProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(antd__WEBPACK_IMPORTED_MODULE_17__["default"], _extends({
    disabledTime: disabledEndTime,
    format: format,
    value: value === null || value === void 0 ? void 0 : value.endValue,
    placeholder: "Fim",
    onChange: onEndChange,
    open: endOpen,
    onOpenChange: handleEndOpenChange,
    suffixIcon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(react__WEBPACK_IMPORTED_MODULE_15__.Fragment, null)
  }, rest, endProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_15__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_18__["default"], {
    style: {
      marginLeft: "1px",
      color: 'rgba(0,0,0,.25)'
    }
  }));
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TimeRange);

/***/ }),

/***/ "./src/components/YScroll.jsx":
/*!************************************!*\
  !*** ./src/components/YScroll.jsx ***!
  \************************************/
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
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");




var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (styled_components__WEBPACK_IMPORTED_MODULE_4__["default"].div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    scrollbar-color:rgba(105,112,125,.5) transparent;\n    scrollbar-width:thin;\n    height:100%;\n    overflow-y:auto;\n    overflow-x:hidden;\n    -webkit-mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));\n    mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));\n    &::-webkit-scrollbar {\n      width:16px;\n      height:16px;\n    }\n    &::-webkit-scrollbar-thumb{\n      background-color:rgba(105,112,125,.5);\n      background-clip:content-box;\n      border-radius:16px;\n      border:6px solid transparent;\n    }\n    &::-webkit-scrollbar-corner{\n      background-color:transparent;\n    }\n    &:focus {\n        outline: none;\n    }\n    &:focus:focus-visible{\n      outline-style:auto;\n    }    \n"]))));

/***/ }),

/***/ "./src/components/formLayout.jsx":
/*!***************************************!*\
  !*** ./src/components/formLayout.jsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AddOn": () => (/* binding */ AddOn),
/* harmony export */   "AlertsContainer": () => (/* binding */ AlertsContainer),
/* harmony export */   "AutoCompleteField": () => (/* binding */ AutoCompleteField),
/* harmony export */   "CheckboxField": () => (/* binding */ CheckboxField),
/* harmony export */   "Field": () => (/* binding */ Field),
/* harmony export */   "FieldItem": () => (/* binding */ FieldItem),
/* harmony export */   "FieldSet": () => (/* binding */ FieldSet),
/* harmony export */   "FilterDrawer": () => (/* binding */ FilterDrawer),
/* harmony export */   "FormLayout": () => (/* binding */ FormLayout),
/* harmony export */   "HorizontalRule": () => (/* binding */ HorizontalRule),
/* harmony export */   "InputAddon": () => (/* binding */ InputAddon),
/* harmony export */   "Item": () => (/* binding */ Item),
/* harmony export */   "Label": () => (/* binding */ Label),
/* harmony export */   "LabelField": () => (/* binding */ LabelField),
/* harmony export */   "RangeDateField": () => (/* binding */ RangeDateField),
/* harmony export */   "RangeTimeField": () => (/* binding */ RangeTimeField),
/* harmony export */   "SelectDebounceField": () => (/* binding */ SelectDebounceField),
/* harmony export */   "SelectField": () => (/* binding */ SelectField),
/* harmony export */   "SelectMultiField": () => (/* binding */ SelectMultiField),
/* harmony export */   "SwitchField": () => (/* binding */ SwitchField),
/* harmony export */   "TitleForm": () => (/* binding */ TitleForm),
/* harmony export */   "VerticalSpace": () => (/* binding */ VerticalSpace),
/* harmony export */   "WrapperForm": () => (/* binding */ WrapperForm)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.freeze.js */ "./node_modules/core-js/modules/es.object.freeze.js");
/* harmony import */ var core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_freeze_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.number.constructor.js */ "./node_modules/core-js/modules/es.number.constructor.js");
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_math_sign_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.math.sign.js */ "./node_modules/core-js/modules/es.math.sign.js");
/* harmony import */ var core_js_modules_es_math_sign_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_math_sign_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_array_join_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.array.join.js */ "./node_modules/core-js/modules/es.array.join.js");
/* harmony import */ var core_js_modules_es_array_join_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_join_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.string.split.js */ "./node_modules/core-js/modules/es.string.split.js");
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.number.is-integer.js */ "./node_modules/core-js/modules/es.number.is-integer.js");
/* harmony import */ var core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.array.reduce.js */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! core-js/modules/es.array.find.js */ "./node_modules/core-js/modules/es.array.find.js");
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "./node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/modal/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/drawer/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/switch/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/checkbox/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/auto-complete/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/date-picker/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_36___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_36__);
/* harmony import */ var _conditionalWrapper__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./conditionalWrapper */ "./src/components/conditionalWrapper.jsx");
/* harmony import */ var _portal__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./portal */ "./src/components/portal.jsx");
/* harmony import */ var _poitingLabel__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./poitingLabel */ "./src/components/poitingLabel.jsx");
/* harmony import */ var utils__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! utils */ "./src/utils/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var react_icons_bi__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! react-icons/bi */ "./node_modules/react-icons/bi/index.esm.js");
/* harmony import */ var react_icons_ai__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! react-icons/ai */ "./node_modules/react-icons/ai/index.esm.js");
/* harmony import */ var _RangeDate__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./RangeDate */ "./src/components/RangeDate.jsx");
/* harmony import */ var _RangeTime__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./RangeTime */ "./src/components/RangeTime.jsx");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var _pages_App__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ../pages/App */ "./src/pages/App.jsx");














var _excluded = ["type", "visible", "setVisible", "children", "title", "mode", "width", "height"],
    _excluded2 = ["wide"],
    _excluded3 = ["split"],
    _excluded4 = ["split"],
    _excluded5 = ["onChange", "value", "checkedValue", "uncheckedValue"],
    _excluded6 = ["onChange", "value", "format"],
    _excluded7 = ["onChange", "value", "format"],
    _excluded8 = ["onChange", "value", "checkedValue", "uncheckedValue"],
    _excluded9 = ["fetchOptions", "debounceTimeout", "onChange", "value", "keyField", "valueField", "textField", "optionsRender", "size", "onPressEnter"],
    _excluded10 = ["fetchOptions", "debounceTimeout", "onChange", "value", "keyField", "valueField", "textField", "optionsRender"],
    _excluded11 = ["data", "keyField", "valueField", "textField", "showSearch", "optionsRender"],
    _excluded12 = ["value", "options", "onChange"],
    _excluded13 = ["children"],
    _excluded14 = ["children"],
    _excluded15 = ["children"],
    _excluded16 = ["children", "data", "keyField", "textField", "optionsRender", "labelInValue", "forViewBorder"],
    _excluded17 = ["children"],
    _excluded18 = ["fieldStatus", "nameId", "pos", "refs", "container"],
    _excluded19 = ["main", "parentPath"],
    _excluded20 = ["refs"],
    _excluded21 = ["index"],
    _excluded22 = ["children"],
    _excluded23 = ["style"],
    _excluded24 = ["className", "style", "field", "fieldSet", "schema", "children", "id", "fieldStatus"];

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11, _templateObject12, _templateObject13, _templateObject14, _templateObject15, _templateObject16, _templateObject17, _templateObject18, _templateObject19, _templateObject20, _templateObject21, _templateObject22, _templateObject23, _templateObject24, _templateObject25, _templateObject26, _templateObject27, _templateObject28, _templateObject29, _templateObject30, _templateObject31, _templateObject32, _templateObject33, _templateObject34, _templateObject35, _templateObject36, _templateObject37, _templateObject38, _templateObject39, _templateObject40, _templateObject41, _templateObject42, _templateObject43, _templateObject44, _templateObject45, _templateObject46, _templateObject47, _templateObject48, _templateObject49, _templateObject50, _templateObject51, _templateObject52, _templateObject53, _templateObject54, _templateObject55, _templateObject56, _templateObject57;



function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






















function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }



















var ParentContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_35__.createContext)({});
var Title = styled_components__WEBPACK_IMPORTED_MODULE_46__["default"].div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    h4{\n        color: rgba(0, 0, 0, 0.85);\n        font-weight: 700;\n        font-size: 18px;\n        line-height: 1.4;\n        margin-bottom:0;\n    }\n    h5{\n\n    }\n"])));
var TitleForm = function TitleForm(_ref) {
  var title = _ref.title,
      subTitle = _ref.subTitle,
      toogleMaximize = _ref.toogleMaximize,
      toogleFullScreen = _ref.toogleFullScreen,
      setNormal = _ref.setNormal;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(Title, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("h4", null, title), subTitle && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("h5", null, subTitle)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
    onClick: toogleMaximize
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react_icons_bi__WEBPACK_IMPORTED_MODULE_47__.BiWindow, null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
    onClick: toogleFullScreen
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react_icons_ai__WEBPACK_IMPORTED_MODULE_48__.AiOutlineFullscreen, null))));
};
var WrapperForm = function WrapperForm(props) {
  var ctx = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(_pages_App__WEBPACK_IMPORTED_MODULE_45__.MediaContext); // // setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "mobile", orientation });
  // console.log("drawer-----",ctx);

  var _props$type = props.type,
      type = _props$type === void 0 ? 'modal' : _props$type,
      _props$visible = props.visible,
      visible = _props$visible === void 0 ? false : _props$visible,
      setVisible = props.setVisible,
      children = props.children,
      title = props.title,
      _props$mode = props.mode,
      mode = _props$mode === void 0 ? "normal" : _props$mode,
      width = props.width,
      _props$height = props.height,
      height = _props$height === void 0 ? '70vh' : _props$height,
      rest = _objectWithoutProperties(props, _excluded);

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(),
      _useState2 = _slicedToArray(_useState, 2),
      widthMode = _useState2[0],
      setWidthMode = _useState2[1];

  (0,react__WEBPACK_IMPORTED_MODULE_35__.useEffect)(function () {
    if (widthMode && !width) {
      setWidthMode({
        width: computeWitdth(mode),
        mode: mode,
        prevMode: mode
      });
    } else {
      setWidthMode({
        width: computeWitdth(mode, width),
        mode: mode,
        prevMode: mode
      });
    }
  }, [ctx]);
  (0,react__WEBPACK_IMPORTED_MODULE_35__.useEffect)(function () {
    if (width) {
      setWidthMode({
        width: computeWitdth(props.mode, width),
        mode: mode,
        prevMode: mode
      });
    } else if (widthMode) {
      setWidthMode({
        width: computeWitdth(props.mode),
        mode: mode,
        prevMode: mode
      });
    } else {
      setWidthMode({
        width: computeWitdth(props.mode),
        mode: mode,
        prevMode: mode
      });
    }
  }, [props.mode]);
  (0,react__WEBPACK_IMPORTED_MODULE_35__.useEffect)(function () {
    if (width) {
      setWidthMode({
        width: computeWitdth(props.mode, width),
        mode: mode,
        prevMode: mode
      });
    }
  }, [width, height]);

  var computeWitdth = function computeWitdth(mode, width) {
    if (width) return width;

    if (mode === "normal") {
      return "".concat(ctx.width).concat(ctx.unit);
    } else if (mode === "maximized") {
      return "".concat(ctx.maxWidth).concat(ctx.maxUnit);
    } else if (mode === "fullscreen") {
      return "100%";
    } else {
      return "".concat(ctx.width).concat(ctx.unit);
    }
  };

  var toogleMaximize = function toogleMaximize() {
    var newMode = widthMode.mode === "maximized" ? widthMode.prevMode : "maximized";
    var newWidth = computeWitdth(newMode === "fullscreen" ? "normal" : newMode);
    setWidthMode({
      width: newWidth,
      mode: newMode === "fullscreen" ? "normal" : newMode,
      prevMode: widthMode.mode
    });
  };

  var toogleFullScreen = function toogleFullScreen() {
    var newMode = widthMode.mode === "fullscreen" ? widthMode.prevMode : "fullscreen";
    setWidthMode({
      width: computeWitdth(newMode),
      mode: newMode,
      prevMode: widthMode.mode
    });
  };

  var setNormal = function setNormal() {
    setWidthMode({
      width: computeWitdth("normal"),
      mode: "normal",
      prevMode: "normal"
    });
  };

  var titleForm = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.cloneElement(title, _objectSpread(_objectSpread({}, title.props), {}, {
    toogleMaximize: toogleMaximize,
    toogleFullScreen: toogleFullScreen,
    setNormal: setNormal
  }));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, widthMode && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, type == 'modal' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_49__["default"], _extends({}, rest, {
    bodyStyle: {
      height: !height ? '70vh' : height
    },
    style: {
      width: widthMode.width,
      minWidth: widthMode.width
    },
    width: widthMode.width,
    title: titleForm,
    centered: true,
    visible: visible,
    onCancel: function onCancel() {
      return setVisible(false);
    }
  }), children) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], _extends({}, rest, {
    width: widthMode.width,
    title: titleForm,
    visible: visible,
    onClose: function onClose() {
      return setVisible(false);
    }
  }), children)));
};

Number.prototype.pad = function (size) {
  var sign = Math.sign(this) === -1 ? '-' : '';
  return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
};

var inheritSelf = function inheritSelf() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var parentProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  /**
   * Calcula "width" de acordo com o valor de "wide" or "split"
   */
  var widthValue = function widthValue(props) {
    if (props.wide) {
      return "".concat(props.wide * 6.25, "%");
    } else if (props.split) {
      return "".concat(100 / props.split, "%");
    }

    return '100%';
  };

  var wideValue = function wideValue(wide, idx) {
    if (Number.isInteger(wide)) {
      return wide;
    } else if (Array.isArray(wide)) {
      if (wide[idx] === "*") {
        var sum = wide.reduce(function (sum, x) {
          return x === '*' ? sum : sum + x;
        });
        return 16 - sum;
      } else {
        return wide[idx];
      }
    }
  };

  var wideOrSplit = function wideOrSplit() {
    var _ret, _ret2, _ret4;

    var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var ret = {};

    if (!(self !== null && self !== void 0 && self.wide) && self !== null && self !== void 0 && self.split) {
      var w = parent.wide,
          data = _objectWithoutProperties(parent, _excluded2);

      ret = _objectSpread(_objectSpread({}, data), self);
    } else if (self !== null && self !== void 0 && self.wide && !(self !== null && self !== void 0 && self.split)) {
      var s = parent.split,
          _data = _objectWithoutProperties(parent, _excluded3);

      ret = _objectSpread(_objectSpread({}, _data), self);
    } else {
      ret = _objectSpread(_objectSpread({}, parent), self);
    }

    if ((_ret = ret) !== null && _ret !== void 0 && _ret.wide && (_ret2 = ret) !== null && _ret2 !== void 0 && _ret2.split) {
      var _ret3 = ret,
          _s2 = _ret3.split,
          _data2 = _objectWithoutProperties(_ret3, _excluded4);

      ret = _objectSpread({}, _data2);
    }

    if ((_ret4 = ret) !== null && _ret4 !== void 0 && _ret4.wide) {
      ret.wide = wideValue(ret.wide, self.index);
    }
    /*         let ctrl = '0';
            if (!("wide" in self) && ("split" in self)) {
                const { wide: w, ...data } = parent;
                ret = { ...data, ...self };
                ctrl='1';
            } else if (("wide" in self) && !("split" in self)) {
                const { split: s, ...data } = parent;
                ret = { ...data, ...self };
                ctrl='2';
            } else {
                ret = { ...parent, ...self };
                ctrl='3';
            }
            if (("wide" in ret) && ("split" in ret)) {
                const { split: s, ...data } = ret;
                ret = { ...data };
                ctrl=`${ctrl}-1`;
            }
    
            if ("wide" in ret) {
                ret.wide = wideValue(ret.wide, self.index);
                ctrl=`${ctrl}-2`;
            } */
    //        if (self.name==="extr4_val"){
    //console.log("splittttt", " ret-wide -->", ret?.wide, " ret-split -->", ret?.split, " self-wide -->", self?.wide, " self-split -->", self?.split, " --- ", ctrl, " --- " , self.name);
    //console.log("splittttt", " ret-wide -->", ret?.wide?.pad(2), " ret-split -->", ret?.split?.pad(2), " self-wide -->", self?.wide?.pad(2), " self-split -->", self?.split?.pad(2), " --- ", ctrl, " --- " , self.name);
    //           }


    if (!("forInput" in ret)) {
      ret.forInput = true;
    }

    ret.width = widthValue(ret);
    return ret;
  };

  var obj = wideOrSplit(props, parentProps);

  var layout = function layout() {
    var _parent$layout, _self$layout, _parent$layout2, _self$layout2, _parent$layout3, _self$layout3, _parent$layout4, _self$layout4, _parent$layout5, _self$layout5;

    var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var ret = {
      layout: {
        top: _objectSpread(_objectSpread({}, parent === null || parent === void 0 ? void 0 : (_parent$layout = parent.layout) === null || _parent$layout === void 0 ? void 0 : _parent$layout.top), self === null || self === void 0 ? void 0 : (_self$layout = self.layout) === null || _self$layout === void 0 ? void 0 : _self$layout.top),
        right: _objectSpread(_objectSpread({}, parent === null || parent === void 0 ? void 0 : (_parent$layout2 = parent.layout) === null || _parent$layout2 === void 0 ? void 0 : _parent$layout2.right), self === null || self === void 0 ? void 0 : (_self$layout2 = self.layout) === null || _self$layout2 === void 0 ? void 0 : _self$layout2.right),
        center: _objectSpread(_objectSpread({}, parent === null || parent === void 0 ? void 0 : (_parent$layout3 = parent.layout) === null || _parent$layout3 === void 0 ? void 0 : _parent$layout3.center), self === null || self === void 0 ? void 0 : (_self$layout3 = self.layout) === null || _self$layout3 === void 0 ? void 0 : _self$layout3.center),
        left: _objectSpread(_objectSpread({}, parent === null || parent === void 0 ? void 0 : (_parent$layout4 = parent.layout) === null || _parent$layout4 === void 0 ? void 0 : _parent$layout4.left), self === null || self === void 0 ? void 0 : (_self$layout4 = self.layout) === null || _self$layout4 === void 0 ? void 0 : _self$layout4.left),
        bottom: _objectSpread(_objectSpread({}, parent === null || parent === void 0 ? void 0 : (_parent$layout5 = parent.layout) === null || _parent$layout5 === void 0 ? void 0 : _parent$layout5.bottom), self === null || self === void 0 ? void 0 : (_self$layout5 = self.layout) === null || _self$layout5 === void 0 ? void 0 : _self$layout5.bottom)
      }
    };
  };

  return _objectSpread(_objectSpread({}, obj), {}, {
    label: _objectSpread(_objectSpread({}, parentProps === null || parentProps === void 0 ? void 0 : parentProps.label), props === null || props === void 0 ? void 0 : props.label),
    alert: _objectSpread(_objectSpread({}, parentProps === null || parentProps === void 0 ? void 0 : parentProps.alert), props === null || props === void 0 ? void 0 : props.alert)
  }, layout(props, parentProps));
};
/**
 * O FieldSet pode ter "filhos", (Field, FieldSet,...), sendo necessário repassar o que vem do "pai" e sobrepor 
 * eventuais parametros que estejam definidos no próprio FieldSet
*/


var propsToChildren = function propsToChildren() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var parentProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var refMainAlertContainer = arguments.length > 2 ? arguments[2] : undefined;
  var _parentProps$field = parentProps.field,
      pField = _parentProps$field === void 0 ? {} : _parentProps$field,
      _parentProps$fieldSet = parentProps.fieldSet,
      pFieldSet = _parentProps$fieldSet === void 0 ? {} : _parentProps$fieldSet,
      schema = parentProps.schema,
      layoutId = parentProps.layoutId,
      fieldStatus = parentProps.fieldStatus,
      updateFieldStatus = parentProps.updateFieldStatus,
      clearFieldStatus = parentProps.clearFieldStatus;
  var _props$field = props.field,
      field = _props$field === void 0 ? {} : _props$field,
      _props$fieldSet = props.fieldSet,
      fieldSet = _props$fieldSet === void 0 ? {} : _props$fieldSet;
  return {
    field: _objectSpread(_objectSpread({}, pField), field),
    fieldSet: _objectSpread(_objectSpread({}, pFieldSet), fieldSet),
    schema: schema,
    layoutId: layoutId,
    refMainAlertContainer: refMainAlertContainer,
    fieldStatus: fieldStatus,
    updateFieldStatus: updateFieldStatus,
    clearFieldStatus: clearFieldStatus
  };
};

var StyledHorizontalRule = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('hr').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    border: none;\n    height: 1px;\n    background-color: #dcdddf;\n    flex-shrink: 0;\n    flex-grow: 0;\n    width: 100%;\n    margin: 0px;\n"])));
var StyledHRuleTitle = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    display: flex;\n    flex-direction: row;\n    justify-content: space-between;\n    background:#f3f3f3;\n\n    .title{\n        font-weight: 700;\n        font-size:14px;\n        margin: 0px;\n        margin-right:5px;\n    }\n\n    .description{\n        align-self: center;\n        color:#595959;\n    }\n\n    \n"])));
var FilterDrawer = function FilterDrawer(_ref2) {
  var schema = _ref2.schema,
      filterRules = _ref2.filterRules,
      _ref2$width = _ref2.width,
      width = _ref2$width === void 0 ? 400 : _ref2$width,
      showFilter = _ref2.showFilter,
      setShowFilter = _ref2.setShowFilter,
      form = _ref2.form,
      _ref2$mask = _ref2.mask,
      mask = _ref2$mask === void 0 ? false : _ref2$mask;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
    title: "Filtros",
    width: width,
    mask: false
    /* style={{ top: "48px" }} */
    ,
    onClose: function onClose() {
      return setShowFilter(false);
    },
    visible: showFilter,
    bodyStyle: {
      paddingBottom: 80
    },
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_51__["default"], {
      onClick: function onClick() {
        return form.resetFields();
      },
      style: {
        marginRight: 8
      }
    }, "Limpar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_51__["default"], {
      onClick: function onClick() {
        return form.submit();
      },
      type: "primary"
    }, "Aplicar"))
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"], {
    form: form,
    name: "search-form",
    layout: "vertical",
    hideRequiredMark: true
  }, schema.map(function (line, ridx) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_53__["default"], {
      key: "rf-".concat(ridx),
      gutter: 16
    }, Object.keys(line).map(function (col, cidx) {
      var span = "span" in line[col] ? line[col].span : 24;
      var itemWidth = "itemWidth" in line[col] ? {
        width: line[col].itemWidth
      } : {};
      var label = "label" in line[col] ? line[col].label : filterRules.$_mapLabels([col]);
      var labelChk = "labelChk" in line[col] ? line[col].labelChk : filterRules.$_mapLabels([col]);
      var field = "field" in line[col] ? line[col].field : {
        type: "input"
      };
      var initialValue = "initialValue" in line[col] ? line[col].initialValue : undefined;
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_54__["default"], {
        key: "cf-".concat(cidx),
        span: span,
        style: {
          paddingLeft: "1px",
          paddingRight: "1px"
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"].Item, _extends({
        style: {
          marginBottom: "0px"
        },
        key: "fd-".concat(col),
        name: "".concat(col),
        label: label
      }, initialValue !== undefined && {
        initialValue: initialValue
      }, {
        labelCol: {
          style: {
            padding: "0px"
          }
        }
      }), typeof field === 'function' ? field() : {
        autocomplete: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(AutoCompleteField, _extends({
          allowClear: true
        }, field)),
        rangedate: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(RangeDateField, _extends({
          allowClear: true
        }, field)),
        rangetime: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(RangeTimeField, _extends({
          allowClear: true
        }, field)),
        selectmulti: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(SelectMultiField, _extends({
          allowClear: true
        }, field)),
        checkbox: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(CheckboxField, field, labelChk)
      }[field === null || field === void 0 ? void 0 : field.type] || /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_55__["default"], _extends({
        style: _objectSpread({}, itemWidth),
        allowClear: true
      }, field))));
    }));
  }))));
};
var AddOn = styled_components__WEBPACK_IMPORTED_MODULE_46__["default"].div(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\nmargin: 2px;\nbackground-color: #fafafa; \nborder: 1px solid #d9d9d9;\nborder-radius: 2px;\nalign-self: center;\ntext-align: center; \nwidth: 45px; \nfont-weight: 500;\nfont-size: 10px;\n"])));
var HorizontalRule = function HorizontalRule(_ref3) {
  var _ref3$margin = _ref3.margin,
      margin = _ref3$margin === void 0 ? false : _ref3$margin,
      title = _ref3.title,
      description = _ref3.description,
      props = _ref3.props;
  var parentProps = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext);
  var myProps = inheritSelf(_objectSpread(_objectSpread({}, props), {}, {
    margin: margin
  }), parentProps === null || parentProps === void 0 ? void 0 : parentProps.field);
  /* const classes = useFieldStyles(myProps); */

  var refMainAlertContainer = parentProps.refMainAlertContainer;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledField, _extends({
    className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("field", {
      "padding": !(myProps !== null && myProps !== void 0 && myProps.margin)
    })
  }, myProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_conditionalWrapper__WEBPACK_IMPORTED_MODULE_37__.ConditionalWrapper, {
    condition: myProps === null || myProps === void 0 ? void 0 : myProps.margin,
    wrapper: function wrapper(children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
        className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("margin", "padding", myProps === null || myProps === void 0 ? void 0 : myProps.className)
      }, children);
    }
  }, title && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledHRuleTitle, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
    className: "title"
  }, title), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
    className: "description"
  }, description)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledHorizontalRule, null)));
};
var StyledVerticalSpace = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    ", "\n    width: 100%;\n"])), function (_ref4) {
  var height = _ref4.height;
  return "height: ".concat(height ? height : "12px", ";");
});
var VerticalSpace = function VerticalSpace(_ref5) {
  var _ref5$margin = _ref5.margin,
      margin = _ref5$margin === void 0 ? "0px" : _ref5$margin,
      _ref5$height = _ref5.height,
      height = _ref5$height === void 0 ? "12px" : _ref5$height,
      props = _ref5.props;
  var parentProps = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext);
  var myProps = inheritSelf(_objectSpread(_objectSpread({}, props), {}, {
    margin: margin
  }), parentProps === null || parentProps === void 0 ? void 0 : parentProps.field);
  /* const classes = useFieldStyles(myProps); */

  var refMainAlertContainer = parentProps.refMainAlertContainer;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledField, _extends({
    className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("field", {
      "padding": !(myProps !== null && myProps !== void 0 && myProps.margin)
    })
  }, myProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_conditionalWrapper__WEBPACK_IMPORTED_MODULE_37__.ConditionalWrapper, {
    condition: myProps === null || myProps === void 0 ? void 0 : myProps.margin,
    wrapper: function wrapper(children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
        className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("margin", "padding", myProps === null || myProps === void 0 ? void 0 : myProps.className)
      }, children);
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledVerticalSpace, {
    height: height
  })));
};
var SwitchField = function SwitchField(_ref6) {
  var onChange = _ref6.onChange,
      value = _ref6.value,
      _ref6$checkedValue = _ref6.checkedValue,
      checkedValue = _ref6$checkedValue === void 0 ? 1 : _ref6$checkedValue,
      _ref6$uncheckedValue = _ref6.uncheckedValue,
      uncheckedValue = _ref6$uncheckedValue === void 0 ? 0 : _ref6$uncheckedValue,
      rest = _objectWithoutProperties(_ref6, _excluded5);

  var parseToBool = function parseToBool(v) {
    return v === checkedValue ? true : false;
  };

  var parseFromBool = function parseFromBool(v) {
    return v === true ? checkedValue : uncheckedValue;
  };

  var onSwitch = function onSwitch(checked) {
    onChange === null || onChange === void 0 ? void 0 : onChange(parseFromBool(checked));
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_56__["default"], _extends({
    checked: parseToBool(value),
    onChange: onSwitch
  }, rest)));
};
var RangeTimeField = function RangeTimeField(_ref7) {
  var onChange = _ref7.onChange,
      value = _ref7.value,
      _ref7$format = _ref7.format,
      format = _ref7$format === void 0 ? config__WEBPACK_IMPORTED_MODULE_44__.TIME_FORMAT : _ref7$format,
      rest = _objectWithoutProperties(_ref7, _excluded6);

  var onRangeTimeChange = function onRangeTimeChange(field, v) {
    var _objectSpread3;

    var _ref8 = value === undefined ? {} : value,
        _ref8$formatted = _ref8.formatted,
        formatted = _ref8$formatted === void 0 ? {} : _ref8$formatted;

    onChange === null || onChange === void 0 ? void 0 : onChange(_objectSpread(_objectSpread({}, value), {}, (_objectSpread3 = {}, _defineProperty(_objectSpread3, field, v), _defineProperty(_objectSpread3, "formatted", _objectSpread(_objectSpread({}, formatted), {}, _defineProperty({}, field, v === null || v === void 0 ? void 0 : v.format(format)))), _objectSpread3)));
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_RangeTime__WEBPACK_IMPORTED_MODULE_43__["default"], _extends({
    value: value,
    onChange: onRangeTimeChange
  }, rest));
};
var RangeDateField = function RangeDateField(_ref9) {
  var onChange = _ref9.onChange,
      value = _ref9.value,
      _ref9$format = _ref9.format,
      format = _ref9$format === void 0 ? config__WEBPACK_IMPORTED_MODULE_44__.DATE_FORMAT : _ref9$format,
      rest = _objectWithoutProperties(_ref9, _excluded7);

  var onRangeDateChange = function onRangeDateChange(field, v) {
    var _objectSpread5;

    var _ref10 = value === undefined ? {} : value,
        _ref10$formatted = _ref10.formatted,
        formatted = _ref10$formatted === void 0 ? {} : _ref10$formatted;

    onChange === null || onChange === void 0 ? void 0 : onChange(_objectSpread(_objectSpread({}, value), {}, (_objectSpread5 = {}, _defineProperty(_objectSpread5, field, v), _defineProperty(_objectSpread5, "formatted", _objectSpread(_objectSpread({}, formatted), {}, _defineProperty({}, field, v === null || v === void 0 ? void 0 : v.format(format)))), _objectSpread5)));
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_RangeDate__WEBPACK_IMPORTED_MODULE_42__["default"], _extends({
    value: value,
    onChange: onRangeDateChange
  }, rest));
};
var CheckboxField = function CheckboxField(_ref11) {
  var onChange = _ref11.onChange,
      value = _ref11.value,
      _ref11$checkedValue = _ref11.checkedValue,
      checkedValue = _ref11$checkedValue === void 0 ? 1 : _ref11$checkedValue,
      _ref11$uncheckedValue = _ref11.uncheckedValue,
      uncheckedValue = _ref11$uncheckedValue === void 0 ? 0 : _ref11$uncheckedValue,
      rest = _objectWithoutProperties(_ref11, _excluded8);

  var parseToBool = function parseToBool(v) {
    return v === checkedValue ? true : false;
  };

  var parseFromBool = function parseFromBool(v) {
    return v === true ? checkedValue : uncheckedValue;
  };

  var onSwitch = function onSwitch(v) {
    onChange === null || onChange === void 0 ? void 0 : onChange(parseFromBool(v.target.checked));
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_57__["default"], _extends({
    checked: parseToBool(value),
    onChange: onSwitch
  }, rest)));
};
var AutoCompleteField = function AutoCompleteField(_ref12) {
  var fetchOptions = _ref12.fetchOptions,
      _ref12$debounceTimeou = _ref12.debounceTimeout,
      debounceTimeout = _ref12$debounceTimeou === void 0 ? 800 : _ref12$debounceTimeou,
      onChange = _ref12.onChange,
      value = _ref12.value,
      keyField = _ref12.keyField,
      valueField = _ref12.valueField,
      textField = _ref12.textField,
      _ref12$optionsRender = _ref12.optionsRender,
      optionsRender = _ref12$optionsRender === void 0 ? false : _ref12$optionsRender,
      _ref12$size = _ref12.size,
      size = _ref12$size === void 0 ? "small" : _ref12$size,
      onPressEnter = _ref12.onPressEnter,
      rest = _objectWithoutProperties(_ref12, _excluded9);

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      fetching = _useState4[0],
      setFetching = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)([]),
      _useState6 = _slicedToArray(_useState5, 2),
      options = _useState6[0],
      setOptions = _useState6[1];

  var fetchRef = (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(0);
  keyField = keyField ? keyField : valueField;
  valueField = valueField ? valueField : keyField;

  var _optionsRender = optionsRender ? optionsRender : function (d) {
    return {
      label: d[textField],
      key: d[keyField],
      value: d[valueField]
    };
  };

  var debounceFetcher = react__WEBPACK_IMPORTED_MODULE_35__.useMemo(function () {
    var loadOptions = function loadOptions(v) {
      fetchRef.current += 1;
      var fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(v).then(function (newOptions) {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        var opts = newOptions.map(function (d) {
          return _optionsRender(d);
        });
        setOptions(opts);
        setFetching(false);
      });
    };

    return (0,utils__WEBPACK_IMPORTED_MODULE_40__.debounce)(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  var onSelectChange = function onSelectChange(v) {
    onChange === null || onChange === void 0 ? void 0 : onChange(v);
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_58__["default"], _extends({
    value: value,
    onSearch: debounceFetcher,
    onChange: onSelectChange,
    options: options
  }, rest), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_55__["default"], {
    size: size
  }));
};
var SelectDebounceField = function SelectDebounceField(_ref13) {
  var fetchOptions = _ref13.fetchOptions,
      _ref13$debounceTimeou = _ref13.debounceTimeout,
      debounceTimeout = _ref13$debounceTimeou === void 0 ? 800 : _ref13$debounceTimeou,
      onChange = _ref13.onChange,
      value = _ref13.value,
      keyField = _ref13.keyField,
      valueField = _ref13.valueField,
      textField = _ref13.textField,
      _ref13$optionsRender = _ref13.optionsRender,
      optionsRender = _ref13$optionsRender === void 0 ? false : _ref13$optionsRender,
      rest = _objectWithoutProperties(_ref13, _excluded10);

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(false),
      _useState8 = _slicedToArray(_useState7, 2),
      fetching = _useState8[0],
      setFetching = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)([]),
      _useState10 = _slicedToArray(_useState9, 2),
      options = _useState10[0],
      setOptions = _useState10[1];

  var fetchRef = (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(0);
  keyField = keyField ? keyField : valueField;
  valueField = valueField ? valueField : keyField;

  var _optionsRender = optionsRender ? optionsRender : function (d) {
    return {
      label: d[textField],
      key: d[keyField],
      value: d[valueField]
    };
  };

  var debounceFetcher = react__WEBPACK_IMPORTED_MODULE_35__.useMemo(function () {
    var loadOptions = function loadOptions(v) {
      fetchRef.current += 1;
      var fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(v).then(function (newOptions) {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        var opts = newOptions.map(function (d) {
          return _optionsRender(d);
        });
        setOptions(opts);
        setFetching(false);
      });
    };

    return (0,utils__WEBPACK_IMPORTED_MODULE_40__.debounce)(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  var onSelectChange = function onSelectChange(v) {
    onChange === null || onChange === void 0 ? void 0 : onChange(v);
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_59__["default"], _extends({
    labelInValue: true,
    filterOption: false,
    onSearch: debounceFetcher,
    value: value,
    onChange: onSelectChange,
    notFoundContent: fetching ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_60__["default"], {
      indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_61__["default"], {
        style: {
          fontSize: 24
        },
        spin: true
      }),
      size: "small"
    }) : null
  }, rest, {
    options: options
  }));
};
var SelectField = function SelectField(_ref14) {
  var data = _ref14.data,
      keyField = _ref14.keyField,
      valueField = _ref14.valueField,
      textField = _ref14.textField,
      _ref14$showSearch = _ref14.showSearch,
      showSearch = _ref14$showSearch === void 0 ? false : _ref14$showSearch,
      optionsRender = _ref14.optionsRender,
      rest = _objectWithoutProperties(_ref14, _excluded11);

  //const options = data.map((d,i) => <Option disabled={(i<5) ? true :false} key={d[keyField]} value={valueField ? d[valueField] : d[keyField]}>111{d[textField]}</Option>);
  var _optionsRender = optionsRender ? optionsRender : function (d) {
    return {
      label: d[textField],
      value: d[keyField]
    };
  };

  var options = data ? data.map(function (d) {
    return _optionsRender(d, keyField, textField);
  }) : [];

  var onChange = function onChange(v, option) {
    /*  if (v !== undefined) {
         onChange?.(("key" in option) ? option.key : option[keyField]);
     } */
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_59__["default"], _extends({
    showSearch: showSearch,
    options: options
  }, rest));
};

var _filterOptions = function _filterOptions(arr1, arr2) {
  var res = [];
  res = arr1.filter(function (el) {
    return !arr2.find(function (element) {
      return element.value === el.value;
    });
  });
  return res;
};

var SelectMultiField = function SelectMultiField(_ref15) {
  var value = _ref15.value,
      options = _ref15.options,
      onChange = _ref15.onChange,
      rest = _objectWithoutProperties(_ref15, _excluded12);

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(value || []),
      _useState12 = _slicedToArray(_useState11, 2),
      selectedItems = _useState12[0],
      setSelectedItems = _useState12[1];

  var onItemsChange = function onItemsChange(v) {
    setSelectedItems(v);
    onChange === null || onChange === void 0 ? void 0 : onChange(v.length == 0 ? undefined : v);
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_59__["default"], _extends({
    labelInValue: true,
    mode: "multiple",
    value: value
  }, rest, {
    onChange: onItemsChange
  }), _filterOptions(options, selectedItems).map(function (item) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_59__["default"].Option, {
      key: item.value,
      value: item.value
    }, item.label);
  }));
};
/* export const ViewField = ({ value, ...rest }) => {
    console.log("VIEWFIELD-->",value, rest);
    return (<div>{value}</div>);
} */

/* const useFieldStyles = createUseStyles({
    field: ({ grow = false, width, overflow, guides = false }) => ({
        ...(grow ?
            {
                "minWidth": width
            }
            : {
                "minWidth": width,
                "maxWidth": width
            }),
        "overflow": overflow ? "visible" : "hidden",
        ...(guides && { "border": "1px dashed blue" })
    }),
    padding: ({ padding }) => ({ ...(padding && { "padding": padding }) }),
    margin: ({ margin, guides }) => ({ ...(margin && { "margin": margin }), ...(guides && { "border": "1px solid red" }) }),
    rowTop: ({ guides, layout = {} }) => ({
        ...{ ...layout.top },
        ...(guides && { "margin": "2px", "border": "1px solid green" }),
    }),
    rowBottom: ({ guides, layout = {} }) => ({
        ...{ ...layout.bottom },
        ...(guides && { "margin": "2px", "border": "1px solid green" }),
    }),
    rowMiddle: ({ guides }) => ({
        "display": "flex",
        "flexDirection": 'row',
        "flexGrow": 0,
        "flexShrink": 0,
        "flexWrap": "nowrap",
        "alignItems": "stretch",
        ...(guides && { "margin": "2px", "border": "1px solid green" })
    }),
    left: ({ guides, layout = {} }) => ({
        ...{ ...layout.left },
        ...(guides && { "margin": "2px", "border": "1px solid blue" })
    }),
    right: ({ guides, layout = {} }) => ({
        ...{ ...layout.right },
        ...(guides && { "margin": "2px", "border": "1px solid blue" })
    }),
    center: ({ guides, layout = {} }) => ({
        ...{ flex: 1, ...layout.center },
        ...(guides && { "margin": "2px", "border": "1px solid blue" })
    }),
    error: () => ({
        "& input": {
            "color": "#9f3a38",
            "background": "#fff6f6",
            "borderColor": "#e0b4b4"
        }
    }),
    warning: () => ({
        "& input": {
            "borderColor": "#c9ba9b",
            "background": "#fffaf3",
            "color": "#573a08"
        }
    })
});
 */

var StyledField = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n    \n    ", "\n    ", "\n    ", "\n\n    &.padding, .padding{\n        ", "\n    }\n\n    .margin{\n        ", "\n        ", "\n    }\n\n    .error input{\n        color: #9f3a38;\n        background: #fff6f6;\n        border-color: #e0b4b4;\n    }\n    .warning input{\n        border-color: #c9ba9b;\n        background: #fffaf3;\n        color: #573a08;\n    }\n    .error .ant-input-number{\n        color: #9f3a38;\n        background: #fff6f6;\n        border-color: #e0b4b4;\n    }\n    .error .ant-select-selector{\n        color: #9f3a38!important;\n        background: #fff6f6!important;\n        border-color: #e0b4b4!important;\n    }\n    .warning .ant-input-number{\n        border-color: #c9ba9b;\n        background: #fffaf3;\n        color: #573a08;\n    }\n    .ant-picker{\n        width: 100%;\n    }\n    .ant-input-number{\n        width: 100%;\n    }\n    .ant-select{\n        width: 100%;\n    }\n"])), function (_ref16) {
  var _ref16$grow = _ref16.grow,
      grow = _ref16$grow === void 0 ? false : _ref16$grow,
      width = _ref16.width;
  return grow ? (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n        min-width: ", ";\n    "])), width) : (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n        min-width: ", ";\n        max-width: ", ";\n    "])), width, width);
}, function (_ref17) {
  var guides = _ref17.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["border: 1px dashed blue;"])));
}, function (_ref18) {
  var overflow = _ref18.overflow;
  return "overflow: ".concat(overflow ? "visible" : "hidden", ";");
}, function (_ref19) {
  var padding = _ref19.padding;
  return padding && {
    "padding": padding
  };
}, function (_ref20) {
  var margin = _ref20.margin;
  return margin && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["margin: ", ";"])), margin);
}, function (_ref21) {
  var guides = _ref21.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["border: 1px solid red;"])));
});
var FieldRowTop = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children', 'ref'].includes(prop);
  }
})(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["\n    ", "\n    ", " \n"])), function (_ref22) {
  var guides = _ref22.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["\n        margin: 2px;\n        border: 1px solid green;\n    "])));
}, function (_ref23) {
  var _ref23$layout = _ref23.layout,
      layout = _ref23$layout === void 0 ? {} : _ref23$layout;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject14 || (_templateObject14 = _taggedTemplateLiteral(["", ""])), layout === null || layout === void 0 ? void 0 : layout.top);
});
var FieldRowMiddle = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children', 'ref'].includes(prop);
  }
})(_templateObject15 || (_templateObject15 = _taggedTemplateLiteral(["\n    ", "\n    display: flex;\n    flex-direction: row;\n    flex-grow: 0;\n    flex-shrink: 0;\n    flex-wrap: nowrap;\n    align-items: stretch;\n"])), function (_ref24) {
  var guides = _ref24.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject16 || (_templateObject16 = _taggedTemplateLiteral(["\n    margin: 2px;\n    border: 1px solid green;\n    "])));
});
var FieldLeft = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children', 'ref'].includes(prop);
  }
})(_templateObject17 || (_templateObject17 = _taggedTemplateLiteral(["\n    ", "\n    ", " \n"])), function (_ref25) {
  var guides = _ref25.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject18 || (_templateObject18 = _taggedTemplateLiteral(["\n    margin: 2px;\n    border: 1px solid blue;\n    "])));
}, function (_ref26) {
  var _ref26$layout = _ref26.layout,
      layout = _ref26$layout === void 0 ? {} : _ref26$layout;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject19 || (_templateObject19 = _taggedTemplateLiteral(["", ""])), layout === null || layout === void 0 ? void 0 : layout.left);
});
var FieldCenter = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children', 'ref'].includes(prop);
  }
})(_templateObject20 || (_templateObject20 = _taggedTemplateLiteral(["\n    ", "\n    flex: 1; \n    ", " \n"])), function (_ref27) {
  var guides = _ref27.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject21 || (_templateObject21 = _taggedTemplateLiteral(["\n    margin: 2px;\n    border: 1px solid blue;\n    "])));
}, function (_ref28) {
  var _ref28$layout = _ref28.layout,
      layout = _ref28$layout === void 0 ? {} : _ref28$layout;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject22 || (_templateObject22 = _taggedTemplateLiteral(["", ""])), layout === null || layout === void 0 ? void 0 : layout.center);
});
var FieldRight = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children', 'ref'].includes(prop);
  }
})(_templateObject23 || (_templateObject23 = _taggedTemplateLiteral(["\n    ", "\n    ", " \n"])), function (_ref29) {
  var guides = _ref29.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject24 || (_templateObject24 = _taggedTemplateLiteral(["\n    margin: 2px;\n    border: 1px solid blue;\n    "])));
}, function (_ref30) {
  var _ref30$layout = _ref30.layout,
      layout = _ref30$layout === void 0 ? {} : _ref30$layout;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject25 || (_templateObject25 = _taggedTemplateLiteral(["", ""])), layout === null || layout === void 0 ? void 0 : layout.right);
});
var FieldBottom = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children', 'ref'].includes(prop);
  }
})(_templateObject26 || (_templateObject26 = _taggedTemplateLiteral(["\n    ", "\n    ", " \n"])), function (_ref31) {
  var guides = _ref31.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject27 || (_templateObject27 = _taggedTemplateLiteral(["\n    margin: 2px;\n    border: 1px solid green;\n    "])));
}, function (_ref32) {
  var _ref32$layout = _ref32.layout,
      layout = _ref32$layout === void 0 ? {} : _ref32$layout;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject28 || (_templateObject28 = _taggedTemplateLiteral(["", ""])), layout === null || layout === void 0 ? void 0 : layout.bottom);
});
/**
 * 
 * @param {*} name Nome do campo
 * @param {*} wide Tamanho do Field, tipo de dados: {int entre 1 e 16 | array no formato [int,int,'*'] }  (Atenção! wide(default) e split são mutuamente exclusivos)
 * @param {*} split Tamanho do Field, divide o espaço (16) pelo número de vezes indicada (Atenção! wide(default) e split são mutuamente exclusivos)
 * 
 * @returns 
 */

var Field = function Field(_ref33) {
  var children = _ref33.children,
      props = _objectWithoutProperties(_ref33, _excluded13);

  /* const [localStatus, setLocalStatus] = useState({ status: "none", messages: [] }); */
  var parentProps = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext);
  var myProps = inheritSelf(props, parentProps === null || parentProps === void 0 ? void 0 : parentProps.field);
  /* const classes = useFieldStyles(myProps); */

  var refMainAlertContainer = parentProps.refMainAlertContainer;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledField, _extends({
    className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("field", {
      "padding": !(myProps !== null && myProps !== void 0 && myProps.margin)
    })
  }, myProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_conditionalWrapper__WEBPACK_IMPORTED_MODULE_37__.ConditionalWrapper, {
    condition: myProps === null || myProps === void 0 ? void 0 : myProps.margin,
    wrapper: function wrapper(children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
        className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("margin", "padding", myProps === null || myProps === void 0 ? void 0 : myProps.className)
      }, children);
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(InnerField, _extends({}, myProps, {
    /* localStatus={localStatus} setLocalStatus={setLocalStatus} */
    refMainAlertContainer: refMainAlertContainer
  }), function () {
    if (!children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, children);
    } else if (myProps.forInput) {
      return children;
    } else if (children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(ForView, _extends({}, children === null || children === void 0 ? void 0 : children.props, {
        forViewBorder: myProps === null || myProps === void 0 ? void 0 : myProps.forViewBorder
      }), children);
    }
  }())));
}; // export const Field = ({ children, ...props }) => {
//     const [localStatus, setLocalStatus] = useState({ status: "none", messages: [] });
//     const parentProps = useContext(ParentContext);
//     const myProps = inheritSelf(props, parentProps?.field);
//     /* const classes = useFieldStyles(myProps); */
//     const { refMainAlertContainer } = parentProps;
//     return (
//         <StyledField className={classNames("field", { "padding": !myProps?.margin })} {...myProps}>
//         </StyledField>
//     );
// }

var FieldItem = function FieldItem(_ref34) {
  var children = _ref34.children,
      props = _objectWithoutProperties(_ref34, _excluded14);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(Field, _extends({
    noItemWrap: true
  }, props), children);
};
var Item = function Item(_ref35) {
  var _ref35$children = _ref35.children,
      children = _ref35$children === void 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null) : _ref35$children,
      props = _objectWithoutProperties(_ref35, _excluded15);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"].Item, _extends({
    noStyle: true
  }, props), children);
};

var ForView = function ForView(_ref36) {
  var children = _ref36.children,
      data = _ref36.data,
      keyField = _ref36.keyField,
      textField = _ref36.textField,
      optionsRender = _ref36.optionsRender,
      labelInValue = _ref36.labelInValue,
      _ref36$forViewBorder = _ref36.forViewBorder,
      forViewBorder = _ref36$forViewBorder === void 0 ? true : _ref36$forViewBorder,
      rest = _objectWithoutProperties(_ref36, _excluded16);

  var type = null; //'any' //children.props.tpy;
  //console.log("zzzzzzz->",children.type === DatePicker, children.type === InputAddon, children.type === Input,children.props)

  if (!type || type === 'C') {
    if (children.type === antd__WEBPACK_IMPORTED_MODULE_62__["default"]) {
      console.log("FIELD-> PICKER");
      type = 'Picker';
    } else if (children.type === antd__WEBPACK_IMPORTED_MODULE_55__["default"]) {
      console.log("FIELD-> INPUT");
      type = 'Input';
    } else if (children.type === antd__WEBPACK_IMPORTED_MODULE_63__["default"]) {
      console.log("FIELD-> INPUTNUMBER");
      type = 'any';
    } else if (children.type === InputAddon) {
      console.log("FIELD-> INPUTADDON");
      type = 'any';
    } else if (children.type === CheckboxField) {
      console.log("FIELD-> CHECKBOXFIELD");
      type = 'CheckboxField';
    } else if (children.type === SwitchField) {
      console.log("FIELD-> SWITCHFIELD");
      type = 'SwitchField';
    } else if (children.type === SelectDebounceField) {
      console.log("FIELD-> SELECTDEBOUNCEFIELD");
      type = 'SelectDebounceField';
    } else if (children.type === SelectField) {
      console.log("FIELD-> SELECTFIELD");
      type = 'SelectField';
    } else {
      console.log("FIELD-> OTHER", children.props);
      type = 'any';
    }
  } //console.log("zzzzzzz->",type)


  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, "value" in rest ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, function () {
    var _children$props;

    var value = rest.value;

    switch (type) {
      case 'Input':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
          style: _objectSpread(_objectSpread({
            padding: "2px"
          }, forViewBorder && {
            border: "dashed 1px #d9d9d9"
          }), {}, {
            minHeight: "25px"
          })
        }, value);

      case 'CheckboxField':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(CheckboxField, _extends({}, children.props, {
          value: value,
          disabled: true
        }));

      case 'SwitchField':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(SwitchField, _extends({}, children.props, {
          value: value,
          disabled: true
        }));

      case 'SelectDebounceField':
        /* const r = data.find(v => v[keyField] === value);
        let text = "";
        if (r !== undefined) {
            text = (typeof optionsRender === 'function') ? optionsRender(r, keyField, textField).label : r[textField];
        }
        return (
            <div style={{ padding: "2px", border: "dashed 1px #d9d9d9" }}>{text}</div>
        ) */
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
          style: _objectSpread(_objectSpread({
            padding: "2px"
          }, forViewBorder && {
            border: "dashed 1px #d9d9d9"
          }), {}, {
            minHeight: "25px"
          })
        }, value === null || value === void 0 ? void 0 : value.label);

      case 'Picker':
        var format = (_children$props = children.props) !== null && _children$props !== void 0 && _children$props.format ? children.props.format : config__WEBPACK_IMPORTED_MODULE_44__.DATETIME_FORMAT;
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
          style: _objectSpread(_objectSpread({
            padding: "2px"
          }, forViewBorder && {
            border: "dashed 1px #d9d9d9"
          }), {}, {
            minHeight: "25px"
          })
        }, value ? value.format(format) : '');

      case 'SelectField':
        var text = "";

        if (labelInValue) {
          text = value === null || value === void 0 ? void 0 : value.label;
        } else {
          var r = data.find(function (v) {
            return v[keyField] === value;
          });

          if (r !== undefined) {
            text = typeof optionsRender === 'function' ? optionsRender(r, keyField, textField).label : r[textField];
          }
        }

        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
          style: _objectSpread(_objectSpread({
            padding: "2px"
          }, forViewBorder && {
            border: "dashed 1px #d9d9d9"
          }), {}, {
            minHeight: "25px",
            whiteSpace: "nowrap"
          })
        }, text);

      default:
        if ("addonAfter" in children.props || "addonAfter" in children.props) {
          return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
            style: _objectSpread(_objectSpread({
              padding: "2px"
            }, forViewBorder && {
              border: "dashed 1px #d9d9d9"
            }), {}, {
              display: "flex",
              flexDirection: "row"
            })
          }, "addonBefore" in children.props && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
            style: {
              marginRight: "2px"
            }
          }, children.props.addonBefore), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
            style: {
              flex: 1
            }
          }, value), "addonAfter" in children.props && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
            style: {
              marginLeft: "2px"
            }
          }, children.props.addonAfter));
        }

        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
          style: _objectSpread(_objectSpread({
            padding: "2px"
          }, forViewBorder && {
            border: "dashed 1px #d9d9d9"
          }), {}, {
            minHeight: "25px"
          })
        }, value);
    }
  }()) : children);
};

var FormItemWrapper = function FormItemWrapper(_ref37) {
  var children = _ref37.children,
      _ref37$forInput = _ref37.forInput,
      forInput = _ref37$forInput === void 0 ? true : _ref37$forInput,
      _ref37$noItemWrap = _ref37.noItemWrap,
      noItemWrap = _ref37$noItemWrap === void 0 ? false : _ref37$noItemWrap,
      name = _ref37.name,
      nameId = _ref37.nameId,
      shouldUpdate = _ref37.shouldUpdate,
      rule = _ref37.rule,
      _ref37$allValues = _ref37.allValues,
      allValues = _ref37$allValues === void 0 ? {} : _ref37$allValues;

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext),
      schema = _useContext.schema,
      fieldStatus = _useContext.fieldStatus,
      updateFieldStatus = _useContext.updateFieldStatus;

  var validator = /*#__PURE__*/function () {
    var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(r, v) {
      var _rule;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _rule = rule ? rule : Array.isArray(name) ? schema([name[name.length - 1]]) : schema([name]);

              _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var _yield$_rule$validate, value, warning;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _rule.validateAsync(_objectSpread(_objectSpread({}, allValues), {}, _defineProperty({}, Array.isArray(name) ? name[name.length - 1] : name, v)), {
                          abortEarly: false,
                          warnings: true
                        });

                      case 3:
                        _yield$_rule$validate = _context.sent;
                        value = _yield$_rule$validate.value;
                        warning = _yield$_rule$validate.warning;
                        updateFieldStatus(nameId, warning === undefined ? {
                          status: "none",
                          messages: []
                        } : {
                          status: "warning",
                          messages: _toConsumableArray(warning.details)
                        });
                        _context.next = 12;
                        break;

                      case 9:
                        _context.prev = 9;
                        _context.t0 = _context["catch"](0);
                        updateFieldStatus(nameId, {
                          status: "error",
                          messages: _toConsumableArray(_context.t0.details)
                        });

                      case 12:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, null, [[0, 9]]);
              }))();

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function validator(_x, _x2) {
      return _ref38.apply(this, arguments);
    };
  }();

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_conditionalWrapper__WEBPACK_IMPORTED_MODULE_37__.ConditionalWrapper, {
    condition: !noItemWrap,
    wrapper: function wrapper(children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_52__["default"].Item, _extends({
        rules: [{
          validator: validator
        }],
        validateTrigger: ["onBlur"],
        shouldUpdate: shouldUpdate,
        noStyle: true
      }, nameId && {
        name: nameId
      }), children);
    }
  }, children));
};

var AddOns = function AddOns(_ref40) {
  var refs = _ref40.refs,
      _ref40$addons = _ref40.addons,
      addons = _ref40$addons === void 0 ? {} : _ref40$addons;
  var top = addons.top,
      right = addons.right,
      left = addons.left,
      bottom = addons.bottom,
      center = addons.center;

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(false),
      _useState14 = _slicedToArray(_useState13, 2),
      domReady = _useState14[0],
      setDomReady = _useState14[1];

  react__WEBPACK_IMPORTED_MODULE_35__.useEffect(function () {
    setDomReady(true);
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, top && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: refs["top"].current
  }, top), right && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: refs["right"].current
  }, right), left && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: refs["left"].current
  }, left), bottom && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: refs["bottom"].current
  }, bottom), center && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: refs["center"].current
  }, center));
};

var InnerField = function InnerField(_ref41) {
  var children = _ref41.children,
      props = _objectWithoutProperties(_ref41, _excluded17);

  /* const classes = useFieldStyles(props); */
  var _useContext2 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext),
      fieldStatus = _useContext2.fieldStatus,
      updateFieldStatus = _useContext2.updateFieldStatus,
      clearFieldStatus = _useContext2.clearFieldStatus;

  var name = props.name,
      alias = props.alias,
      label = props.label,
      alert = props.alert,
      required = props.required,
      guides = props.guides,
      _props$forInput = props.forInput,
      forInput = _props$forInput === void 0 ? true : _props$forInput,
      _props$noItemWrap = props.noItemWrap,
      noItemWrap = _props$noItemWrap === void 0 ? false : _props$noItemWrap,
      rule = props.rule,
      allValues = props.allValues,
      refMainAlertContainer = props.refMainAlertContainer,
      shouldUpdate = props.shouldUpdate,
      layout = props.layout,
      addons = props.addons;
  var refs = {
    top: (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(),
    left: (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(),
    right: (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(),
    bottom: (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(),
    center: (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)(),
    container: refMainAlertContainer
  };
  /* const cssCenter = classNames("center", {"error": localStatus.status == "error" }, {"warning": localStatus.status == "warning" });
          const tooltipColor = (localStatus?.status == "warning" ? "orange" : "red"); */

  var nameId = !alias ? name : alias;
  var localStatus = fieldStatus[nameId];
  var cssCenter = classnames__WEBPACK_IMPORTED_MODULE_36___default()({
    "error": (localStatus === null || localStatus === void 0 ? void 0 : localStatus.status) === "error"
  }, {
    "warning": (localStatus === null || localStatus === void 0 ? void 0 : localStatus.status) === "warning"
  });
  var tooltipColor = (localStatus === null || localStatus === void 0 ? void 0 : localStatus.status) === "warning" ? "orange" : "red";
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldRowTop, {
    ref: refs.top,
    guides: guides,
    layout: layout
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldRowMiddle, {
    guides: guides,
    layout: layout
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldLeft, {
    ref: refs.left,
    guides: guides,
    layout: layout
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldCenter, {
    className: cssCenter,
    ref: refs.center,
    guides: guides,
    layout: layout
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
    title: (alert === null || alert === void 0 ? void 0 : alert.tooltip) && ((localStatus === null || localStatus === void 0 ? void 0 : localStatus.status) === "error" || (localStatus === null || localStatus === void 0 ? void 0 : localStatus.status) === "warning") && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(InnerAlertFieldMessages, {
      nameId: nameId,
      messages: localStatus === null || localStatus === void 0 ? void 0 : localStatus.messages
    }),
    color: tooltipColor
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FormItemWrapper, {
    nameId: nameId,
    name: name,
    shouldUpdate: shouldUpdate,
    forInput: forInput,
    rule: rule,
    allValues: allValues,
    noItemWrap: noItemWrap
  }, children)))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldRight, {
    ref: refs.right,
    guides: guides,
    layout: layout
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldBottom, {
    ref: refs.bottom,
    guides: guides,
    layout: layout
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(LabelRef, _extends({
    refs: refs
  }, label, {
    nameId: nameId,
    required: required,
    guides: guides
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(AddOns, {
    refs: refs,
    addons: addons
  }), (alert === null || alert === void 0 ? void 0 : alert.container) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(AlertField, _extends({
    refs: refs,
    fieldStatus: localStatus
    /* fieldStatus={localStatus} */
    ,
    nameId: nameId
  }, alert)));
}; // const useAlertFieldStyles = createUseStyles({
//     alert: () => ({
//         "display": "flex",
//         "width": "100%",
//         /* "height": "100%", */
//         "alignItems": "center"
//     })
// });


var StyledAlertField = styled_components__WEBPACK_IMPORTED_MODULE_46__["default"].div(_templateObject29 || (_templateObject29 = _taggedTemplateLiteral(["\n            display: flex;\n            width: 100%;\n            align-items: center;\n            "])));

var InnerAlertFieldMessages = function InnerAlertFieldMessages(_ref42) {
  var nameId = _ref42.nameId,
      messages = _ref42.messages;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", null, messages.map(function (v, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", {
      key: "fmsg-".concat(nameId, "-").concat(i)
    }, v.message);
  }));
};
/* const ContainerAlert = ({status, name})=>{
    const [errors,setErrors] = useState([]);
            const [warnings,setWarnings] = useState([]);
            const [infos,setInfos] = useState([]);
    
    useEffect(()=>{
                console.log("CONTAINER-ALERT-LIST->", name, "--", status);
    },[])


            return(<></>);

} */

/* const useAlerts = ({name, status}) => {
    const [errors, setErrors] = useState([]);
            const [warnings, setWarnings] = useState([]);
            const [infos, setInfos] = useState([]);

    useEffect(() => {
                console.log("USE - CONTAINER-ALERT-LIST->", name, "--", status);
    }, [])

            return {errors, warnings, infos};

} */


var AlertField = function AlertField(_ref43) {
  var fieldStatus = _ref43.fieldStatus,
      nameId = _ref43.nameId,
      _ref43$pos = _ref43.pos,
      pos = _ref43$pos === void 0 ? "bottom" : _ref43$pos,
      refs = _ref43.refs,
      container = _ref43.container,
      props = _objectWithoutProperties(_ref43, _excluded18);

  /*     const classes = useAlertFieldStyles(props); */
  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(false),
      _useState16 = _slicedToArray(_useState15, 2),
      domReady = _useState16[0],
      setDomReady = _useState16[1];

  react__WEBPACK_IMPORTED_MODULE_35__.useEffect(function () {
    setDomReady(true);
  }, []);
  var ref = container === true ? refs["container"].current : container in refs ? refs[pos].current : container;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: ref
  }, ((fieldStatus === null || fieldStatus === void 0 ? void 0 : fieldStatus.status) === "error" || (fieldStatus === null || fieldStatus === void 0 ? void 0 : fieldStatus.status) === "warning") && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, pos !== "none" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledAlertField, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_poitingLabel__WEBPACK_IMPORTED_MODULE_39__["default"], {
    status: fieldStatus === null || fieldStatus === void 0 ? void 0 : fieldStatus.status,
    text: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(InnerAlertFieldMessages, {
      name: nameId,
      messages: fieldStatus === null || fieldStatus === void 0 ? void 0 : fieldStatus.messages
    }),
    position: pos
  }))));
};

var AlertsContainer = function AlertsContainer(_ref44) {
  var _ref44$main = _ref44.main,
      main = _ref44$main === void 0 ? false : _ref44$main,
      parentPath = _ref44.parentPath,
      props = _objectWithoutProperties(_ref44, _excluded19);

  var parentProps = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext);
  var refMainAlertContainer = parentProps.refMainAlertContainer;

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(false),
      _useState18 = _slicedToArray(_useState17, 2),
      domReady = _useState18[0],
      setDomReady = _useState18[1];

  react__WEBPACK_IMPORTED_MODULE_35__.useEffect(function () {
    setDomReady(true);
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("div", _extends({}, main && {
    ref: refMainAlertContainer
  }, props));
};
var StyledLabel = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject30 || (_templateObject30 = _taggedTemplateLiteral(["\n            ", "\n            ", "\n\n            ", ";\n\n            label{\n                ", "\n            ", "\n            ", "\n    }\n\n\n            "])), function (_ref45) {
  var width = _ref45.width,
      _ref45$align = _ref45.align,
      align = _ref45$align === void 0 ? "start" : _ref45$align,
      _ref45$vAlign = _ref45.vAlign,
      vAlign = _ref45$vAlign === void 0 ? "start" : _ref45$vAlign,
      _ref45$padding = _ref45.padding,
      padding = _ref45$padding === void 0 ? "5px" : _ref45$padding;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject31 || (_templateObject31 = _taggedTemplateLiteral(["\n            display: flex;\n            flex-direction: row;\n            align-items: ", ";\n            justify-content: ", ";\n            padding: ", ";\n            width: ", ";\n            height: 100%;\n            font-weight: 600;\n            font-size: 12px;\n            line-height: 20px;\n        "])), vAlign, align, padding, width);
}, function (_ref46) {
  var guides = _ref46.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject32 || (_templateObject32 = _taggedTemplateLiteral(["\n        margin: 2px;\n        border: 1px dotted orange;\n    "])));
}, function (_ref47) {
  var pos = _ref47.pos,
      required = _ref47.required,
      colon = _ref47.colon;
  return pos == "right" ? (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject33 || (_templateObject33 = _taggedTemplateLiteral(["\n        &:before{\n            ", "   \n        }    \n        &:after{\n            ", "   \n        }\n    "])), colon && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject34 || (_templateObject34 = _taggedTemplateLiteral(["\n                content: \":\";\n                display: inline-block;\n                margin-left: 1px;\n            "]))), required && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject35 || (_templateObject35 = _taggedTemplateLiteral(["\n                content: \"*\";\n                display: inline-block;\n                color: red;\n                margin-right: 4px;\n            "])))) : (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject36 || (_templateObject36 = _taggedTemplateLiteral(["\n        &:before{\n            ", "   \n        }    \n        &:after{\n            ", "   \n        }\n    "])), required && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject37 || (_templateObject37 = _taggedTemplateLiteral(["\n                content: \"*\";\n                display: inline-block;\n                color: red;\n                margin-right: 4px;\n            "]))), colon && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject38 || (_templateObject38 = _taggedTemplateLiteral(["\n                content: \":\";\n                display: inline-block;\n                margin-left: 1px;\n            "]))));
}, function (_ref48) {
  var wrap = _ref48.wrap,
      ellipsis = _ref48.ellipsis;
  return !wrap && !ellipsis && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject39 || (_templateObject39 = _taggedTemplateLiteral(["white-space: nowrap;"])));
}, function (_ref49) {
  var overflow = _ref49.overflow,
      ellipsis = _ref49.ellipsis;
  return !ellipsis && "overflow: ".concat(overflow ? "visible" : "hidden", ";");
}, function (_ref50) {
  var ellipsis = _ref50.ellipsis;
  return ellipsis && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject40 || (_templateObject40 = _taggedTemplateLiteral(["\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n        "])));
});
/* const useLabelStyles = createUseStyles({
                wrapper: ({pos, wrap = false, overflow = true, colon = true, ellipsis = true, width, align = "start", vAlign = "start", padding = "5px", required = false, guides}) => {
        return {
                "display": "flex",
            "flexDirection": "row",
            "alignItems": vAlign,
            "justifyContent": align,
            "padding": padding,
            "width": width,
            "height": "100%",
            "fontWeight": 600,
            "fontSize": "12px",
            "lineHeight": "20px",
            ...(guides && {"margin": "2px", "border": "1px dotted orange" }),

            '& label': {
                ...((!wrap && !ellipsis) && { "whiteSpace": "nowrap" }),
                ...(!ellipsis && {"overflow": overflow ? "visible" : "hidden" }),
            ...(ellipsis && {
                "whiteSpace": "nowrap",
            "overflow": "hidden",
            "textOverflow": "ellipsis"
                })
            },


            ...(pos === "right" ? {
                '&:after': {
                ...(required && {
                    content: '"*"',
                    display: "inline-block",
                    color: "red",
                    marginRight: "4px"
                })
            },
            '&:before': {
                ...(colon && {
                    content: '":"',
                    display: "inline-block",
                    marginLeft: "1px"
                })
            }
            } : {
                '&:before': {
                ...(required && {
                    content: '"*"',
                    display: "inline-block",
                    color: "red",
                    marginRight: "4px"
                })
            },
            '&:after': {
                ...(colon && {
                    content: '":"',
                    display: "inline-block",
                    marginLeft: "1px"
                })
            }
            })
        }
    }
}); */

var LabelRef = function LabelRef(_ref51) {
  var refs = _ref51.refs,
      props = _objectWithoutProperties(_ref51, _excluded20);

  var _props$pos = props.pos,
      pos = _props$pos === void 0 ? "top" : _props$pos,
      _props$enabled = props.enabled,
      enabled = _props$enabled === void 0 ? true : _props$enabled;

  var _useState19 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)(false),
      _useState20 = _slicedToArray(_useState19, 2),
      domReady = _useState20[0],
      setDomReady = _useState20[1];

  react__WEBPACK_IMPORTED_MODULE_35__.useEffect(function () {
    setDomReady(true);
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, enabled && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_portal__WEBPACK_IMPORTED_MODULE_38__["default"], {
    elId: refs[pos].current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(Label, props)));
};

var Label = function Label(_ref52) {
  var props = Object.assign({}, _ref52);
  var _props$pos2 = props.pos,
      pos = _props$pos2 === void 0 ? "top" : _props$pos2,
      _props$text = props.text,
      text = _props$text === void 0 ? "" : _props$text,
      _props$enabled2 = props.enabled,
      enabled = _props$enabled2 === void 0 ? true : _props$enabled2,
      _props$colon = props.colon,
      colon = _props$colon === void 0 ? true : _props$colon,
      _props$required = props.required,
      required = _props$required === void 0 ? false : _props$required,
      className = props.className,
      style = props.style,
      _props$container = props.container,
      container = _props$container === void 0 ? {} : _props$container,
      nameId = props.nameId;
  var _props$width = props.width,
      width = _props$width === void 0 ? (pos === "left" || pos === "right") && "100px" : _props$width; //const classes = useLabelStyles({...props, width});

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledLabel, _extends({}, props, {
    width: width,
    ellipsis: false,
    overflow: true
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement("label", {
    htmlFor: nameId,
    title: text
  }, text));
};
var LabelField = function LabelField(_ref53) {
  var index = _ref53.index,
      props = _objectWithoutProperties(_ref53, _excluded21);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(FieldItem, {
    forInput: false,
    label: _objectSpread({
      enabled: true,
      padding: "0px",
      pos: "center"
    }, props),
    index: index
  });
};
/* const useFieldSetStyles = createUseStyles({
                fieldSet: ({grow = false, width, guides}) => ({
                ...(grow ?
                    {
                        "minWidth": width
                    }
                    : {
                        "minWidth": width,
                        "maxWidth": width
                    }),
        ...(guides && {"border": "1px solid green" })
    }),
            padding: ({padding}) => ({...(padding && { "padding": padding })}),
            margin: ({margin}) => ({...(margin && { "margin": margin })}),
            flex: ({layout = "horizontal", overflow = false}) => ({
                "display": "flex",
            "flexDirection": layout == "vertical" ? 'column' : 'row',
            "flexGrow": 0,
            "flexShrink": 0,
            "flexWrap": "nowrap",
            "overflow": overflow ? "visible" : "hidden"
    })
}); */

var StyledFieldSet = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject41 || (_templateObject41 = _taggedTemplateLiteral(["\n            ", "\n\n            ", "\n            ", "\n            ", "\n\n            ", "\n            "])), function (_ref54) {
  var _ref54$grow = _ref54.grow,
      grow = _ref54$grow === void 0 ? false : _ref54$grow,
      width = _ref54.width;
  return grow ? (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject42 || (_templateObject42 = _taggedTemplateLiteral(["\n            min-width: ", ";\n        "])), width) : (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject43 || (_templateObject43 = _taggedTemplateLiteral(["\n            min-width: ", ";\n            max-width: ", ";\n        "])), width, width);
}, function (_ref55) {
  var margin = _ref55.margin,
      _ref55$layout = _ref55.layout,
      layout = _ref55$layout === void 0 ? "horizontal" : _ref55$layout,
      _ref55$overflow = _ref55.overflow,
      overflow = _ref55$overflow === void 0 ? false : _ref55$overflow;
  return !margin && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject44 || (_templateObject44 = _taggedTemplateLiteral(["\n        display: flex;\n        flex-direction:  ", ";\n        flex-grow: 0;\n        flex-shrink: 0;\n        flex-wrap: nowrap;\n        overflow: ", ";\n    "])), layout == "vertical" ? 'column' : 'row', overflow ? "visible" : "hidden");
}, function (_ref56) {
  var padding = _ref56.padding,
      margin = _ref56.margin;
  return padding && !margin && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject45 || (_templateObject45 = _taggedTemplateLiteral(["padding: ", ";"])), padding);
}, function (_ref57) {
  var margin = _ref57.margin;
  return margin && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject46 || (_templateObject46 = _taggedTemplateLiteral(["margin: ", ";"])), margin);
}, function (_ref58) {
  var guides = _ref58.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject47 || (_templateObject47 = _taggedTemplateLiteral(["\n        border: 1px solid green;\n    "])));
});
var StyledWrapperFieldSet = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['className', 'style', 'children'].includes(prop);
  }
})(_templateObject48 || (_templateObject48 = _taggedTemplateLiteral(["\n            ", "\n            "])), function (_ref59) {
  var margin = _ref59.margin,
      padding = _ref59.padding,
      _ref59$layout = _ref59.layout,
      layout = _ref59$layout === void 0 ? "horizontal" : _ref59$layout,
      _ref59$overflow = _ref59.overflow,
      overflow = _ref59$overflow === void 0 ? false : _ref59$overflow;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject49 || (_templateObject49 = _taggedTemplateLiteral(["\n    ", "\n    display: flex;\n    flex-grow: 0;\n    flex-shrink: 0;\n    flex-wrap: nowrap;\n    overflow: ", ";\n    ", "\n    ", "\n    "])), layout == "vertical" ? (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject50 || (_templateObject50 = _taggedTemplateLiteral(["flex-direction:column;"]))) : (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject51 || (_templateObject51 = _taggedTemplateLiteral(["flex-direction:row;"]))), overflow ? "visible" : "hidden", padding && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject52 || (_templateObject52 = _taggedTemplateLiteral(["padding: ", ";"])), padding), margin && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject53 || (_templateObject53 = _taggedTemplateLiteral(["margin: ", ";"])), margin));
});

var isChildrenType = function isChildrenType(children) {
  if (children.type === AlertsContainer) {
    return true;
  } else if (children.type === FieldItem) {
    return true;
  } else if (children.type === Item) {
    return true;
  } else if (children.type === Field) {
    return true;
  } else if (children.type === AddOn) {
    return true;
  } else if (children.type === LabelField) {
    return true;
  }

  return false;
};
/**
 *
 * @param {*} wide Tamanho do FieldSet, tipo de dados: {int entre 1 e 16 | array no formato [int,int,'*'] }  (Atenção! wide(default) e split são mutuamente exclusivos)
            * @param {*} split Tamanho do FieldSet, divide o espaço (16) pelo número de vezes indicada (Atenção! wide(default) e split são mutuamente exclusivos)
            *
            * @returns
            */


var FieldSet = function FieldSet(_ref60) {
  var children = _ref60.children,
      props = _objectWithoutProperties(_ref60, _excluded22);

  var parentProps = (0,react__WEBPACK_IMPORTED_MODULE_35__.useContext)(ParentContext);

  var _inheritSelf = inheritSelf(props, parentProps === null || parentProps === void 0 ? void 0 : parentProps.fieldSet),
      style = _inheritSelf.style,
      myProps = _objectWithoutProperties(_inheritSelf, _excluded23);
  /*     const classes = useFieldSetStyles(myProps); */


  var refMainAlertContainer = (0,react__WEBPACK_IMPORTED_MODULE_35__.useRef)();
  var _props$parentPath = props.parentPath,
      parentPath = _props$parentPath === void 0 ? '' : _props$parentPath;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledFieldSet, _extends({}, myProps, !(myProps !== null && myProps !== void 0 && myProps.margin) && {
    style: _objectSpread({}, style)
  }, {
    className: "fieldset"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(ParentContext.Provider, {
    value: propsToChildren(props, parentProps, refMainAlertContainer)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(_conditionalWrapper__WEBPACK_IMPORTED_MODULE_37__.ConditionalWrapper, {
    condition: myProps === null || myProps === void 0 ? void 0 : myProps.margin,
    wrapper: function wrapper(children) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledWrapperFieldSet, _extends({}, myProps, {
        className: classnames__WEBPACK_IMPORTED_MODULE_36___default()(myProps === null || myProps === void 0 ? void 0 : myProps.className, "inner")
        /* className={classNames(classes.flex, classes.margin, classes.padding, myProps?.className)} */
        ,
        style: _objectSpread({}, style)
      }), children);
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, react__WEBPACK_IMPORTED_MODULE_35__.Children.map(Array.isArray(children) ? children.filter(function (v) {
    return v;
  }) : children, function (child, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.isValidElement(child) && isChildrenType(child) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.cloneElement(child, _objectSpread(_objectSpread({}, child.props), {}, {
      index: i,
      parentPath: "".concat(parentPath, "-").concat(props.index)
    })) : child);
  })))));
}; //['AlertsContainer', 'FieldItem', 'Item', 'Field', 'AddOn', 'LabelField'].includes(child.type.name)

/* const useFormLayoutStyles = createUseStyles({
                formLayout: ({layout = 'vertical', wrap = false, guides}) => ({
                ...(guides && { "border": "2px solid blue" }),
                "display": "flex",
            "flexDirection": layout == "horizontal" ? 'row' : 'column',
            "flexWrap": wrap ? "wrap" : "nowrap"
    })
}); */

var StyledFormLayout = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])('div').withConfig({
  shouldForwardProp: function shouldForwardProp(prop) {
    return ['style', 'className', 'children'].includes(prop);
  }
})(_templateObject54 || (_templateObject54 = _taggedTemplateLiteral(["\n            ", "\n            ", "\n            "])), function (_ref61) {
  var _ref61$layout = _ref61.layout,
      layout = _ref61$layout === void 0 ? 'vertical' : _ref61$layout,
      _ref61$wrap = _ref61.wrap,
      wrap = _ref61$wrap === void 0 ? false : _ref61$wrap;
  return (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject55 || (_templateObject55 = _taggedTemplateLiteral(["\n        display: flex;\n        flex-direction: ", ";\n        flex-wrap: ", ";\n    "])), layout == "horizontal" ? 'row' : 'column', wrap ? 'wrap' : 'nowrap');
}, function (_ref62) {
  var guides = _ref62.guides;
  return guides && (0,styled_components__WEBPACK_IMPORTED_MODULE_46__.css)(_templateObject56 || (_templateObject56 = _taggedTemplateLiteral(["\n        border: 2px solid blue;\n    "])));
});
/**
 *
 * @param {*} layout Disposição dos elementos [vertical,horizontal]
            * @param {*} field Parametros Globais a herdar pelo elemento Field (No override)
            * @param {*} fieldSet Parametros Globais a herdar pelo elemento FieldSet (No override)
            *
            * @returns
            */
// export const FormLayout = ({className, style, field, fieldSet, schema, children, id, ...props }) => {
//     /*     const classes = useFormLayoutStyles(props); */
//     const dataContext = {field, fieldSet, schema, layoutId: id };
//     if (!id) { throw new Error(`FormLayout key is Required!`) }
//     return (
//         <StyledFormLayout {...props} className={classNames("formlayout", className)} style={style}>
//             {/* <div className={classNames(classes.formLayout, className)} style={style}> */}
//             <ParentContext.Provider value={dataContext}>
//                 {
//                     React.Children.map(children, (child, i) => (
//                         <>
//                             {(React.isValidElement(child)) ? React.cloneElement(child, { ...child.props, index: i, parentPath: id }) : child}
//                         </>
//                     ))
//                 }
//             </ParentContext.Provider>
//         </StyledFormLayout>
//     );
// }

var InputAddon = (0,styled_components__WEBPACK_IMPORTED_MODULE_46__["default"])(antd__WEBPACK_IMPORTED_MODULE_55__["default"])(_templateObject57 || (_templateObject57 = _taggedTemplateLiteral(["\n    .ant-input{\n        text-align: right;\n    }\n    .ant-input-group-addon{\n        background: #f5f5f5;\n    }\n "])));
var FormLayout = function FormLayout(_ref63) {
  var className = _ref63.className,
      style = _ref63.style,
      field = _ref63.field,
      fieldSet = _ref63.fieldSet,
      schema = _ref63.schema,
      children = _ref63.children,
      id = _ref63.id,
      fieldStatus = _ref63.fieldStatus,
      props = _objectWithoutProperties(_ref63, _excluded24);

  if (!id) {
    throw new Error("FormLayout key is Required!");
  }

  var _useState21 = (0,react__WEBPACK_IMPORTED_MODULE_35__.useState)({}),
      _useState22 = _slicedToArray(_useState21, 2),
      localFieldStatus = _useState22[0],
      setLocalFieldStatus = _useState22[1];

  var updateLocalFieldStatus = function updateLocalFieldStatus(field, status) {
    setLocalFieldStatus(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, field, status));
    });
  };

  var clearLocalFieldStatus = function clearLocalFieldStatus() {
    setLocalFieldStatus({});
  };

  (0,react__WEBPACK_IMPORTED_MODULE_35__.useEffect)(function () {
    if (fieldStatus) {
      setLocalFieldStatus(fieldStatus);
    }
  }, [fieldStatus]);
  var dataContext = {
    field: field,
    fieldSet: fieldSet,
    schema: schema ? schema : {},
    layoutId: id,
    fieldStatus: localFieldStatus,
    updateFieldStatus: updateLocalFieldStatus,
    clearFieldStatus: clearLocalFieldStatus
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(StyledFormLayout, _extends({}, props, {
    className: classnames__WEBPACK_IMPORTED_MODULE_36___default()("formlayout", className),
    style: style
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(ParentContext.Provider, {
    value: dataContext
  }, react__WEBPACK_IMPORTED_MODULE_35__.Children.map(children, function (child, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.createElement(react__WEBPACK_IMPORTED_MODULE_35__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.isValidElement(child) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_35__.cloneElement(child, _objectSpread(_objectSpread({}, child.props), {}, {
      index: i,
      parentPath: id
    })) : child);
  })));
};

/***/ }),

/***/ "./src/components/poitingLabel.jsx":
/*!*****************************************!*\
  !*** ./src/components/poitingLabel.jsx ***!
  \*****************************************/
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
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var ramda__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ramda */ "./node_modules/ramda/es/index.js");
/* harmony import */ var _conditionalWrapper__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./conditionalWrapper */ "./src/components/conditionalWrapper.jsx");
/* harmony import */ var _portal__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/alert/index.js");
/* harmony import */ var _css_label_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./css/label.css */ "./src/components/css/label.css");




var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }











var pointer = function pointer(pos) {
  switch (pos) {
    case "left":
      return "right";

    case "right":
      return "left";

    case "top":
      return "bottom";
  }

  return "";
};

var StyledAlert = (0,styled_components__WEBPACK_IMPORTED_MODULE_9__["default"])(antd__WEBPACK_IMPORTED_MODULE_10__["default"])(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    padding: 0px 0px;\n    background-color: transparent;\n    &.ant-alert-warning > .ant-alert-content > .ant-alert-message{\n        color: #d46b08;\n    }\n    &.ant-alert-error > .ant-alert-content > .ant-alert-message{\n        color: #cf1322;\n    }\n"])));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var _ref$alert = _ref.alert,
      alert = _ref$alert === void 0 ? true : _ref$alert,
      _ref$status = _ref.status,
      status = _ref$status === void 0 ? "error" : _ref$status,
      _ref$position = _ref.position,
      position = _ref$position === void 0 ? "bottom" : _ref$position,
      text = _ref.text;
  var css = classnames__WEBPACK_IMPORTED_MODULE_4___default()("ui", "mini", "".concat(pointer(position)), "pointing", {
    "red": status == "error"
  }, {
    "orange": status == "warning"
  }, "basic", "label");
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(react__WEBPACK_IMPORTED_MODULE_3__.Fragment, null, !alert && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement("div", {
    className: css
  }, text), alert && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(StyledAlert, {
    banner: true,
    message: text,
    type: status
  }));
});

/***/ }),

/***/ "./src/components/css/label.css":
/*!**************************************!*\
  !*** ./src/components/css/label.css ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

}]);
//# sourceMappingURL=src_components_Drawer_jsx-src_components_YScroll_jsx.chunk.js.map