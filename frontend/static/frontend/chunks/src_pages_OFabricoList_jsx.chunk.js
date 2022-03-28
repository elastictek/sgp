"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_OFabricoList_jsx"],{

/***/ "./src/components/ActionButton.jsx":
/*!*****************************************!*\
  !*** ./src/components/ActionButton.jsx ***!
  \*****************************************/
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
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/dropdown/index.js");
/* harmony import */ var react_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-icons */ "./node_modules/react-icons/lib/esm/index.js");
/* harmony import */ var react_icons_gr__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-icons/gr */ "./node_modules/react-icons/gr/index.esm.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_jss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-jss */ "./node_modules/react-jss/dist/react-jss.esm.js");



var _excluded = ["content", "trigger"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }










var useStyles = (0,react_jss__WEBPACK_IMPORTED_MODULE_6__.createUseStyles)({
  svg: {
    cursor: "pointer",
    verticalAlign: 'middle',
    '& path': {
      stroke: "#0050b3",
      strokeWidth: "2px"
    },
    '&:active': {
      transform: "scale(0.8)",
      boxShadow: "1px 1px 5px rgba(0, 0, 0, 0.24)"
    },
    '&:hover': {
      '& path': {
        stroke: "#1890ff",
        strokeWidth: "2px"
      }
    }
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var content = _ref.content,
      _ref$trigger = _ref.trigger,
      trigger = _ref$trigger === void 0 ? ["click"] : _ref$trigger,
      rest = _objectWithoutProperties(_ref, _excluded);

  var classes = useStyles();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
    overlay: content,
    placement: "bottomLeft",
    trigger: trigger
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(react_icons__WEBPACK_IMPORTED_MODULE_4__.IconContext.Provider, {
    value: {
      className: classes.svg
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(react_icons_gr__WEBPACK_IMPORTED_MODULE_8__.GrApps, null))));
});

/***/ }),

/***/ "./src/components/ProgressBar.jsx":
/*!****************************************!*\
  !*** ./src/components/ProgressBar.jsx ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-jss */ "./node_modules/react-jss/dist/react-jss.esm.js");



var useStyles = (0,react_jss__WEBPACK_IMPORTED_MODULE_2__.createUseStyles)({
  progress: {
    height: "8px",
    width: "100%",
    overflow: "hidden",
    marginTop: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "2px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
    '& span': {
      position: "absolute",
      display: "block",
      width: "100%",
      color: "black"
    },
    '& .progress-bar': {
      "float": "left",
      width: "0",
      height: "100%",
      color: "#fff",
      textAlign: "center",
      backgroundColor: "#91d5ff",
      boxShadow: "inset 0 -5px 0 rgb(0 0 0 / 15%)",
      //transition: "width .6s ease",
      '& .show': {
        fontSize: "11px",
        marginTop: "-16px",
        display: "block!important"
      }
    },
    '& .progress-bar-success': {
      boxShadow: "inset 0 -5px 0 rgb(0 0 0 / 15%)",
      backgroundColor: "#389e0d"
    }
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var value = _ref.value,
      _ref$min = _ref.min,
      min = _ref$min === void 0 ? 0 : _ref$min,
      max = _ref.max,
      r = _ref.r;
  var classes = useStyles();
  var percent = value * 100 / max;
  var css = classnames__WEBPACK_IMPORTED_MODULE_1___default()({
    "progress-bar": true,
    "progress-bar-success": value >= max
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    className: classes.progress
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    className: css,
    style: {
      width: "".concat(percent, "%")
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
    className: "show"
  }, value, "/", max)));
});

/***/ }),

/***/ "./src/components/TagButton.jsx":
/*!**************************************!*\
  !*** ./src/components/TagButton.jsx ***!
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
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "./node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tag/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_jss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-jss */ "./node_modules/react-jss/dist/react-jss.esm.js");




var _excluded = ["className", "children"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }





var useStyles = (0,react_jss__WEBPACK_IMPORTED_MODULE_6__.createUseStyles)({
  tag: {
    cursor: "pointer",
    '&:active': {
      transform: "scale(0.9)",
      boxShadow: "1px 1px 5px rgba(0, 0, 0, 0.24)"
    },
    '&:hover': {
      opacity: .8
    }
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var className = _ref.className,
      children = _ref.children,
      rest = _objectWithoutProperties(_ref, _excluded);

  var classes = useStyles();
  var css = classnames__WEBPACK_IMPORTED_MODULE_5___default()(className, classes.tag);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(antd__WEBPACK_IMPORTED_MODULE_7__["default"], _extends({
    className: css
  }, rest), children);
});

/***/ }),

/***/ "./src/pages/OFabricoList.jsx":
/*!************************************!*\
  !*** ./src/pages/OFabricoList.jsx ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
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
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_web_url_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/web.url.js */ "./node_modules/core-js/modules/web.url.js");
/* harmony import */ var core_js_modules_web_url_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_web_url_search_params_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/web.url-search-params.js */ "./node_modules/core-js/modules/web.url-search-params.js");
/* harmony import */ var core_js_modules_web_url_search_params_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url_search_params_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/web.timers.js */ "./node_modules/core-js/modules/web.timers.js");
/* harmony import */ var core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_timers_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_date_to_json_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.date.to-json.js */ "./node_modules/core-js/modules/es.date.to-json.js");
/* harmony import */ var core_js_modules_es_date_to_json_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_date_to_json_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_web_url_to_json_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/web.url.to-json.js */ "./node_modules/core-js/modules/web.url.to-json.js");
/* harmony import */ var core_js_modules_web_url_to_json_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url_to_json_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_date_to_string_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.date.to-string.js */ "./node_modules/core-js/modules/es.date.to-string.js");
/* harmony import */ var core_js_modules_es_date_to_string_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_date_to_string_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.reverse.js */ "./node_modules/core-js/modules/es.array.reverse.js");
/* harmony import */ var core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reverse_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.string.split.js */ "./node_modules/core-js/modules/es.string.split.js");
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.string.starts-with.js */ "./node_modules/core-js/modules/es.string.starts-with.js");
/* harmony import */ var core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.number.is-integer.js */ "./node_modules/core-js/modules/es.number.is-integer.js");
/* harmony import */ var core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_is_integer_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.number.constructor.js */ "./node_modules/core-js/modules/es.number.constructor.js");
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.parse-float.js */ "./node_modules/core-js/modules/es.parse-float.js");
/* harmony import */ var core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_35___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_35__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_36___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_36__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_37___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_37__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_38___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_38__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_40___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_40__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_41___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_41__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_useDataAPI__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! utils/useDataAPI */ "./src/utils/useDataAPI.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var utils__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! utils */ "./src/utils/index.js");
/* harmony import */ var components_form__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! components/form */ "./src/components/form.jsx");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_Drawer__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! components/Drawer */ "./src/components/Drawer.jsx");
/* harmony import */ var components_table__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! components/table */ "./src/components/table.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var assets_morefilters_svg__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! assets/morefilters.svg */ "./src/assets/morefilters.svg");
/* harmony import */ var components_SubLayout__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! components/SubLayout */ "./src/components/SubLayout.jsx");
/* harmony import */ var components_container__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! components/container */ "./src/components/container.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_ProgressBar__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! components/ProgressBar */ "./src/components/ProgressBar.jsx");
/* harmony import */ var components_ActionButton__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! components/ActionButton */ "./src/components/ActionButton.jsx");
/* harmony import */ var components_TagButton__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! components/TagButton */ "./src/components/TagButton.jsx");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_84__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/index.js");
/* harmony import */ var components_YScroll__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! components/YScroll */ "./src/components/YScroll.jsx");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ./App */ "./src/pages/App.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/modal/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/typography/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/menu/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/dropdown/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_83__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tag/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_85__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/alert/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_86__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FilePdfTwoTone.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FileExcelTwoTone.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FileWordTwoTone.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FileFilled.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/SearchOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/DownOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ExclamationCircleOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_79__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/InfoCircleOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_80__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/CheckOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_81__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/UnorderedListOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_82__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/SyncOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_87__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }



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



































































var FormOFabricoValidar = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_antd_es_result_index_js"), __webpack_require__.e("vendors-node_modules_core-js_modules_es_number_to-fixed_js"), __webpack_require__.e("vendors-node_modules_antd_es_tabs_index_js"), __webpack_require__.e("src_components_resultMessage_jsx"), __webpack_require__.e("src_components_iconButton_jsx"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormOFabricoValidar_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./planeamento/ordemFabrico/FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx"));
});
var FormMenuActions = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_antd_es_tabs_index_js"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_PaperClipOutlined_js-node_modules_antd_es_card-6f0df3"), __webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_HistoryOutlined_js-node_modules_sugar_index_js"), __webpack_require__.e("src_pages_currentline_FormMenuActions_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./currentline/FormMenuActions */ "./src/pages/currentline/FormMenuActions.jsx"));
});



var Option = antd__WEBPACK_IMPORTED_MODULE_62__["default"].Option;
var confirm = antd__WEBPACK_IMPORTED_MODULE_63__["default"].confirm;

var ButtonGroup = antd__WEBPACK_IMPORTED_MODULE_64__["default"].Group;

var Title = antd__WEBPACK_IMPORTED_MODULE_65__["default"].Title;

var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_45__.getSchema)({}, keys, excludeKeys).unknown(true);
};

var filterRules = function filterRules(keys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_45__.getSchema)({//field1: Joi.string().label("Designação")
  }, keys).unknown(true);
};

var filterSchema = function filterSchema(_ref) {
  var ordersField = _ref.ordersField,
      customersField = _ref.customersField,
      itemsField = _ref.itemsField,
      ordemFabricoStatusField = _ref.ordemFabricoStatusField;
  return [{
    f_ofabrico: {
      label: "Ordem de Fabrico"
    }
  }, {
    f_agg: {
      label: "Agregação Ordem de Fabrico"
    }
  }, {
    fofstatus: {
      label: "Estado",
      field: ordemFabricoStatusField,
      initialValue: 'Todos',
      ignoreFilterTag: function ignoreFilterTag(v) {
        return v === 'Todos';
      }
    }
  }, {
    fmulti_order: {
      label: "Nº Encomenda/Nº Proforma",
      field: ordersField
    }
  }, {
    fmulti_customer: {
      label: "Nº/Nome de Cliente",
      field: customersField
    }
  }, {
    fmulti_item: {
      label: "Cód/Designação Artigo",
      field: itemsField
    }
  }, {
    forderdate: {
      label: "Data Encomenda",
      field: {
        type: "rangedate",
        size: 'small'
      }
    }
  }, {
    fstartprevdate: {
      label: "Data Prevista Início",
      field: {
        type: "rangedate",
        size: 'small'
      }
    }
  }, {
    fendprevdate: {
      label: "Data Prevista Fim",
      field: {
        type: "rangedate",
        size: 'small'
      }
    }
  }
  /* { SHIDAT_0: { label: "Data Expedição", field: { type: "rangedate" } } },
  { LASDLVNUM_0: { label: "Nº Última Expedição" } },
  { ofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, ignoreFilterTag: (v) => v === 'all' } } */
  ];
}; //const filterSchema = ({ /*field_multi, field_daterange, field*/ }) => [

/*{ field1: { label: "field", field: field } },
{ field2: { label: "Date Range", field: { type: "rangedate" } } },
{ field3: { label: "Multi", field: field_multi } }*/
//];


var ToolbarTable = function ToolbarTable(_ref2) {
  var form = _ref2.form,
      dataAPI = _ref2.dataAPI,
      setFlyoutStatus = _ref2.setFlyoutStatus,
      flyoutStatus = _ref2.flyoutStatus,
      ordemFabricoStatusField = _ref2.ordemFabricoStatusField;

  var onChange = function onChange() {
    form.submit();
  };

  var leftContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null);
  var rightContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_66__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      whiteSpace: "nowrap"
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_67__["default"], {
    form: form,
    initialValues: {
      fofstatus: "Todos"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FormLayout, {
    id: "tbt-of",
    schema: schema
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    name: "fofstatus",
    label: {
      enabled: true,
      width: "60px",
      text: "Estado",
      pos: "left"
    }
  }, ordemFabricoStatusField({
    onChange: onChange
  }))))));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_51__["default"], {
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
      showFilter = _ref3.showFilter,
      ordemFabricoStatusField = _ref3.ordemFabricoStatusField;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      formData = _useState2[0],
      setFormData = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      changed = _useState4[0],
      setChanged = _useState4[1];

  var _onFinish = function onFinish() {
    var _values2, _values3, _values4, _values5, _values6, _values$forderdate, _values$fstartprevdat, _values$fendprevdate;

    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "filter";
    var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (values === null || values === undefined) {
      values = form.getFieldsValue(true);
    }

    switch (type) {
      case "filter":
        !changed && setChanged(true);

        var _values = _objectSpread(_objectSpread({}, values), {}, {
          f_ofabrico: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterValue)((_values2 = values) === null || _values2 === void 0 ? void 0 : _values2.f_ofabrico, 'any'),
          f_agg: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterValue)((_values3 = values) === null || _values3 === void 0 ? void 0 : _values3.f_agg, 'any'),
          fmulti_customer: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterValue)((_values4 = values) === null || _values4 === void 0 ? void 0 : _values4.fmulti_customer, 'any'),
          fmulti_order: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterValue)((_values5 = values) === null || _values5 === void 0 ? void 0 : _values5.fmulti_order, 'any'),
          fmulti_item: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterValue)((_values6 = values) === null || _values6 === void 0 ? void 0 : _values6.fmulti_item, 'any'),
          forderdate: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterRangeValues)((_values$forderdate = values["forderdate"]) === null || _values$forderdate === void 0 ? void 0 : _values$forderdate.formatted),
          fstartprevdate: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterRangeValues)((_values$fstartprevdat = values["fstartprevdate"]) === null || _values$fstartprevdat === void 0 ? void 0 : _values$fstartprevdat.formatted),
          fendprevdate: (0,utils__WEBPACK_IMPORTED_MODULE_46__.getFilterRangeValues)((_values$fendprevdate = values["fendprevdate"]) === null || _values$fendprevdate === void 0 ? void 0 : _values$fendprevdate.formatted)
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

  var fetchCustomers = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(value) {
      var _yield$fetchPost, rows;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_43__.API_URL, "/sellcustomerslookup/"),
                pagination: {
                  limit: 10
                },
                filter: _defineProperty({}, "fmulti_customer", "%".concat(value.replaceAll(' ', '%%'), "%"))
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

    return function fetchCustomers(_x) {
      return _ref4.apply(this, arguments);
    };
  }();

  var fetchOrders = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(value) {
      var _yield$fetchPost2, rows;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_43__.API_URL, "/sellorderslookup/"),
                pagination: {
                  limit: 10
                },
                filter: _defineProperty({}, "fmulti_order", "%".concat(value.replaceAll(' ', '%%'), "%"))
              });

            case 2:
              _yield$fetchPost2 = _context2.sent;
              rows = _yield$fetchPost2.data.rows;
              console.log("FETECHED", rows);
              return _context2.abrupt("return", rows);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function fetchOrders(_x2) {
      return _ref5.apply(this, arguments);
    };
  }();

  var fetchItems = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(value) {
      var _yield$fetchPost3, rows;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_43__.API_URL, "/sellitemslookup/"),
                pagination: {
                  limit: 10
                },
                filter: _defineProperty({}, "fmulti_item", "%".concat(value.replaceAll(' ', '%%'), "%"))
              });

            case 2:
              _yield$fetchPost3 = _context3.sent;
              rows = _yield$fetchPost3.data.rows;
              return _context3.abrupt("return", rows);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function fetchItems(_x3) {
      return _ref6.apply(this, arguments);
    };
  }();

  var customersField = function customersField() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.AutoCompleteField, {
      placeholder: "Cliente",
      size: "small",
      keyField: "BPCNAM_0",
      textField: "BPCNAM_0",
      dropdownMatchSelectWidth: 250,
      allowClear: true,
      onPressEnter: _onFinish,
      fetchOptions: fetchCustomers
    });
  };

  var ordersField = function ordersField() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.AutoCompleteField, {
      placeholder: "Encomenda/Prf",
      size: "small",
      keyField: "SOHNUM_0",
      textField: "computed",
      dropdownMatchSelectWidth: 250,
      allowClear: true,
      fetchOptions: fetchOrders
    });
  };

  var itemsField = function itemsField() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.AutoCompleteField, {
      placeholder: "Artigo",
      size: "small",
      keyField: "ITMREF_0",
      textField: "computed",
      dropdownMatchSelectWidth: 250,
      allowClear: true,
      fetchOptions: fetchItems
    });
  };

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

  var menu = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_68__["default"], {
    onClick: function onClick(v) {
      return exportFile(v);
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_68__["default"].Item, {
    key: "pdf",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_69__["default"], {
      twoToneColor: "red"
    })
  }, "Pdf"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_68__["default"].Item, {
    key: "excel",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_70__["default"], {
      twoToneColor: "#52c41a"
    })
  }, "Excel"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_68__["default"].Item, {
    key: "word",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_71__["default"], null)
  }, "Word"));

  var exportFile = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(type) {
      var requestData, response;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
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
              _context4.next = 4;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.fetchPostBlob)(requestData);

            case 4:
              response = _context4.sent;
              _context4.t0 = type.key;
              _context4.next = _context4.t0 === "pdf" ? 8 : _context4.t0 === "excel" ? 10 : _context4.t0 === "word" ? 12 : 14;
              break;

            case 8:
              downloadFile(response.data, "list-".concat(new Date().toJSON().slice(0, 10), ".pdf"));
              return _context4.abrupt("break", 14);

            case 10:
              downloadFile(response.data, "list-".concat(new Date().toJSON().slice(0, 10), ".xlsx"));
              return _context4.abrupt("break", 14);

            case 12:
              downloadFile(response.data, "list-".concat(new Date().toJSON().slice(0, 10), ".docx"));
              return _context4.abrupt("break", 14);

            case 14:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function exportFile(_x4) {
      return _ref7.apply(this, arguments);
    };
  }();

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FilterDrawer, {
    schema: filterSchema({
      form: form,
      ordersField: ordersField,
      customersField: customersField,
      itemsField: itemsField,
      ordemFabricoStatusField: ordemFabricoStatusField
    }),
    filterRules: filterRules(),
    form: form,
    width: 350,
    setShowFilter: setShowFilter,
    showFilter: showFilter
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_67__["default"], {
    form: form,
    name: "fps",
    onFinish: function onFinish(values) {
      return _onFinish("filter", values);
    },
    onValuesChange: onValuesChange
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FormLayout, {
    id: "LAY-OFFLIST",
    layout: "horizontal",
    style: {
      width: "700px",
      padding: "0px"
      /* , minWidth: "700px" */

    },
    schema: schema,
    field: {
      guides: false,
      wide: [3, 3, 3, 4, 1.5, 1.5],
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    name: "fmulti_customer",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Cliente",
      pos: "top"
    }
  }, customersField()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    name: "fmulti_order",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Encomenda/Prf",
      pos: "top"
    }
  }, ordersField()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    name: "fmulti_item",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Artigo",
      pos: "top"
    }
  }, itemsField()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    name: "forderdate",
    required: false,
    layout: {
      center: "align-self:center;",
      right: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Data Encomenda",
      pos: "top"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.RangeDateField, {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FieldItem, {
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(ButtonGroup, {
    size: "small",
    style: {
      marginLeft: "5px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
    style: {
      padding: "0px 3px"
    },
    onClick: function onClick() {
      return form.submit();
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_72__["default"], null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
    style: {
      padding: "0px 3px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(assets_morefilters_svg__WEBPACK_IMPORTED_MODULE_53__["default"], {
    style: {
      fontSize: "16px",
      marginTop: "2px"
    },
    onClick: function onClick() {
      return setShowFilter(function (prev) {
        return !prev;
      });
    }
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FieldItem, {
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_73__["default"], {
    overlay: menu
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
    size: "small",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_74__["default"], null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_75__["default"], null)))))));
}; // const TitlePopup = ({ status, action, ofabrico }) => {
//     /*     if (ativa == 1 && completa == 0){
//             return <div><b>Finalizar</b> a Ordem de Fabrico?</div>
//         }
//         if (ativa == 0 && completa == 0){
//             return <div><b>Iniciar</b> a Ordem de Fabrico?</div>
//         } */
//     return (
//         <div style={{ display: "flex", flexDirection: "row" }}>
//             <div><ExclamationCircleOutlined /></div>
//             <div style={{ display: "flex", flexDirection: "column" }}>
//                 <div><h3><b style={{ textTransform: "capitalize" }}>{action}</b> a Ordem de Fabrico?</h3></div>
//                 <div style={{ color: "#1890ff" }}>{ofabrico}</div>
//             </div>
//         </div>
//     );
// }

/* const menu = (action, showPopconfirm) => {
    return (
        <Menu onClick={(k) => showPopconfirm(k.key)}>
            {action.includes('ignorar') &&
                <Menu.Item key="ignorar" icon={<FcCancel size="18px" />}>Ignorar</Menu.Item>
            }
            {action.includes('reabrir') &&
                <Menu.Item key="reabrir" icon={<FcUnlock size="18px" />}>Reabrir</Menu.Item>
            }
            {action.includes('suspender') &&
                <Menu.Item key="suspender" icon={<FcClock size="18px" />}>A Aguardar...</Menu.Item>
            }
            {action.includes('iniciar') &&
                <Menu.Item key="iniciar" icon={<FcAdvance size="18px" />}>Em Curso...</Menu.Item>
            }
        </Menu>
    );
} */


var ColumnProgress = function ColumnProgress(_ref8) {
  var record = _ref8.record,
      type = _ref8.type;
  var current, total;
  var showProgress = record.ativa == 1 && record.completa == 0 ? true : false;

  if (type === 1) {
    current = record.n_paletes_produzidas;
    total = record.num_paletes_produzir;
  } else if (type === 2) {
    current = record.n_paletes_stock_in;
    total = record.num_paletes_stock;
  } else if (type === 3) {
    current = record.n_paletes_produzidas + record.n_paletes_stock_in;
    total = record.num_paletes_produzir + record.num_paletes_stock;
  }

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, showProgress ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_ProgressBar__WEBPACK_IMPORTED_MODULE_57__["default"], {
    value: current,
    max: total
  }) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, current, "/", total));
};

var schemaConfirm = function schemaConfirm(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_45__.getSchema)({
    produto_cod: joi__WEBPACK_IMPORTED_MODULE_41___default().string().label("Designação do Produto").required(),
    artigo_formu: joi__WEBPACK_IMPORTED_MODULE_41___default().string().label("Fórmula").required(),
    artigo_nw1: joi__WEBPACK_IMPORTED_MODULE_41___default().string().label("Nonwoven 1").required(),
    artigo_width: joi__WEBPACK_IMPORTED_MODULE_41___default().number().integer().min(1).max(5000).label("Largura").required(),
    artigo_diam: joi__WEBPACK_IMPORTED_MODULE_41___default().number().integer().min(1).max(5000).label("Diâmetro").required(),
    artigo_core: joi__WEBPACK_IMPORTED_MODULE_41___default().number().integer().valid(3, 6).label("Core").required(),
    artigo_gram: joi__WEBPACK_IMPORTED_MODULE_41___default().number().integer().min(1).max(1000).label("Gramagem").required(),
    artigo_thickness: joi__WEBPACK_IMPORTED_MODULE_41___default().number().integer().min(0).max(5000).label("Espessura").required()
  }, keys, excludeKeys).unknown(true);
};

var TitleConfirm = function TitleConfirm(_ref9) {
  var status = _ref9.status,
      action = _ref9.action,
      ofabrico = _ref9.ofabrico;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_76__["default"], {
    style: {
      color: "#faad14"
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      fontSize: "14px",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", {
    style: {
      textTransform: "capitalize"
    }
  }, action), " Ordem de Fabrico?"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      color: "#1890ff"
    }
  }, ofabrico)));
};

var ContentConfirm = function ContentConfirm(_ref10) {
  var status = _ref10.status,
      temp_ofabrico = _ref10.temp_ofabrico,
      cliente_cod = _ref10.cliente_cod,
      cliente_nome = _ref10.cliente_nome,
      iorder = _ref10.iorder,
      item = _ref10.item,
      item_nome = _ref10.item_nome,
      ofabrico = _ref10.ofabrico,
      produto_id = _ref10.produto_id,
      produto_cod = _ref10.produto_cod,
      action = _ref10.action;

  /*     
      useEffect(() => {
          console.log("ENTREIIII NO CONTENT CONFIRM")
  
      },[ofabrico]); */
  if (produto_id) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", null, "Confirmar a Ordem de Fabrico:", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("ul", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Produto ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, produto_cod)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Artigo ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, item)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Des.Artigo ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, item_nome)), iorder && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Encomenda ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, iorder)), iorder && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Cliente ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, cliente_nome))));
  }

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("ul", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, " Artigo ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, item)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Des.Artigo ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, item_nome)), iorder && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Encomenda ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, iorder)), iorder && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("li", null, "Cliente ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, cliente_nome))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", null, "Para Validar a Ordem de Fabrico tem de Confirmar/Preencher os seguintes dados:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.VerticalSpace, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FormLayout, {
    id: "LAY-PROD",
    guides: false,
    layout: "vertical",
    style: {
      width: "100%",
      padding: "0px"
    },
    schema: schemaConfirm,
    fieldStatus: {},
    field: {
      forInput: true,
      wide: [16],
      alert: {
        pos: "right",
        tooltip: true,
        container: false
      }
    },
    fieldSet: {
      guides: false,
      wide: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    name: "produto_cod",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_77__["default"], {
    placeholder: "Designa\xE7\xE3o do Produto",
    size: "small"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FieldSet, {
    field: {
      wide: [4, 4, 4, 4],
      margin: "2px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: false,
    label: {
      text: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_78__["default"], {
        title: "O c\xF3digo Gtin se deixado em branco ser\xE1 calculado autom\xE1ticamente",
        color: "blue"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "3px"
        }
      }, "Gtin", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_79__["default"], {
        style: {
          color: "#096dd9"
        }
      })))
    },
    name: "artigo_gtin"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_77__["default"], {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: "Fórmula"
    },
    name: "artigo_formu"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_77__["default"], {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: "Nw1"
    },
    name: "artigo_nw1"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_77__["default"], {
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: false,
    label: {
      text: "Nw2"
    },
    name: "artigo_nw2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_77__["default"], {
    size: "small"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.FieldSet, {
    field: {
      wide: [3, 3, 3, 3, 3, '*']
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: "Largura"
    },
    name: "artigo_width"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, "mm"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: "Diâmetro"
    },
    name: "artigo_diam"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, "mm"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: "Core"
    },
    name: "artigo_core"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, "''"),
    maxLength: 1
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: "Gramagem"
    },
    name: "artigo_gram"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, "mm"),
    maxLength: 4
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.Field, {
    required: true,
    label: {
      text: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_78__["default"], {
        title: "A espessura \xE9 usada como valor de refer\xEAncia, na convers\xE3o de metros\xB2 -> metros lineares.",
        color: "blue"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "3px"
        }
      }, "Espessura", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_79__["default"], {
        style: {
          color: "#096dd9"
        }
      })))
    },
    name: "artigo_thickness"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.InputAddon, {
    size: "small",
    addonAfter: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, "\xB5"),
    maxLength: 4
  })))));
};

var PromiseConfirm = function PromiseConfirm(_ref11) {
  var showConfirm = _ref11.showConfirm,
      setShowConfirm = _ref11.setShowConfirm;

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_67__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _React$useState = react__WEBPACK_IMPORTED_MODULE_39__.useState(false),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      confirmLoading = _React$useState2[0],
      setConfirmLoading = _React$useState2[1];

  var _React$useState3 = react__WEBPACK_IMPORTED_MODULE_39__.useState('Content of the modal'),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      modalText = _React$useState4[0],
      setModalText = _React$useState4[1];

  var _showConfirm$data = showConfirm.data,
      status = _showConfirm$data.status,
      temp_ofabrico = _showConfirm$data.temp_ofabrico,
      cliente_cod = _showConfirm$data.cliente_cod,
      cliente_nome = _showConfirm$data.cliente_nome,
      iorder = _showConfirm$data.iorder,
      item = _showConfirm$data.item,
      item_nome = _showConfirm$data.item_nome,
      ofabrico = _showConfirm$data.ofabrico,
      produto_id = _showConfirm$data.produto_id,
      produto_cod = _showConfirm$data.produto_cod,
      action = _showConfirm$data.action,
      onAction = _showConfirm$data.onAction;

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({}),
      _useState6 = _slicedToArray(_useState5, 2),
      formStatus = _useState6[0],
      setFormStatus = _useState6[1];

  (0,react__WEBPACK_IMPORTED_MODULE_39__.useEffect)(function () {
    if (!produto_id && ofabrico) {
      var artigo = {
        artigo_thickness: config__WEBPACK_IMPORTED_MODULE_43__.THICKNESS,
        produto_cod: undefined,
        artigo_gtin: undefined,
        artigo_core: undefined,
        artigo_formu: undefined,
        artigo_nw1: undefined,
        artigo_nw2: undefined,
        artigo_width: undefined,
        artigo_diam: undefined,
        artigo_gram: undefined
      };
      var designacao = item_nome.split(' ').reverse();

      var _iterator = _createForOfIteratorHelper(designacao),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var v = _step.value;

          if (v.includes("''") || v.includes("'")) {
            artigo["artigo_core"] = v.replaceAll("'", "");
            continue;
          }

          if (v.toUpperCase().startsWith('H')) {
            artigo["artigo_formu"] = v.toUpperCase();
            continue;
          }

          if (v.toUpperCase().startsWith('ELA-')) {
            artigo["artigo_nw1"] = v.toUpperCase();
            continue;
          }

          if (v.toLowerCase().startsWith('l')) {
            artigo["artigo_width"] = v.toLowerCase().replaceAll("l", "");
            continue;
          }

          if (v.toLowerCase().startsWith('d')) {
            artigo["artigo_diam"] = v.toLowerCase().replaceAll("d", "");
            continue;
          }

          if (v.toLowerCase().startsWith('g') || !isNaN(v) && Number.isInteger(parseFloat(v))) {
            artigo["artigo_gram"] = v.toLowerCase().replaceAll("g", "");
            continue;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      setFormStatus({});
      form.setFieldsValue(_objectSpread({}, artigo));
    }
  }, [ofabrico]); // const confirm = async () => {
  //     setConfirmLoading(true);
  //     const response = await onAction(rowKey, record, action, () => { });
  //     //const { ofabrico, ofabrico_sgp, ativa, completa } = record;
  //     //const response = await fetchPost({ url: `${API_URL}/setofabricostatus/`, parameters: { ofabrico, ofabrico_sgp, ativa, completa } });
  //     setConfirmLoading(false);
  //     setEstadoRecord(false);
  //     /*         if (response.data.status !== "error") {
  //                 reloadParent();
  //             } */
  //     //openNotificationWithIcon(response.data);
  // }
  // const handleOk = (values) => {
  //     console.log(values);
  //     /* setModalText('The modal will be closed after two seconds');
  //     setConfirmLoading(true);
  //     setTimeout(() => {
  //         setShowConfirm({ show: false, data: {} });
  //         setConfirmLoading(false);
  //     }, 2000); */
  // };

  var handleCancel = function handleCancel() {
    setShowConfirm({
      show: false,
      data: {}
    });
  };

  var onFinish = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(values) {
      var _response, _response$data;

      var response, v, _v;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(form.getFieldValue('type') === 'ignorar' && ofabrico)) {
                _context5.next = 6;
                break;
              }

              _context5.next = 3;
              return onAction(showConfirm.data, 'ignorar');

            case 3:
              response = _context5.sent;
              _context5.next = 17;
              break;

            case 6:
              if (!(!produto_id && ofabrico)) {
                _context5.next = 14;
                break;
              }

              v = schemaConfirm().validate(values, {
                abortEarly: false
              });

              if (v.error) {
                _context5.next = 12;
                break;
              }

              _context5.next = 11;
              return onAction(showConfirm.data, action, _objectSpread(_objectSpread({}, values), {}, {
                artigo_nome: item_nome,
                main_gtin: config__WEBPACK_IMPORTED_MODULE_43__.GTIN
              }));

            case 11:
              response = _context5.sent;

            case 12:
              _context5.next = 17;
              break;

            case 14:
              _context5.next = 16;
              return onAction(showConfirm.data, action);

            case 16:
              response = _context5.sent;

            case 17:
              if (((_response = response) === null || _response === void 0 ? void 0 : (_response$data = _response.data) === null || _response$data === void 0 ? void 0 : _response$data.status) === "error") {
                setFormStatus({
                  error: [{
                    message: response.data.title
                  }]
                });
              } else {
                if (!((_v = v) !== null && _v !== void 0 && _v.error)) {
                  setShowConfirm({
                    show: false,
                    data: {}
                  });
                }
              }

            case 18:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function onFinish(_x5) {
      return _ref12.apply(this, arguments);
    };
  }();

  var onSubmit = function onSubmit() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'validar';
    form.setFieldsValue({
      type: type
    });
    form.submit();
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_63__["default"], {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(TitleConfirm, {
      status: status,
      action: action,
      ofabrico: ofabrico
    }),
    visible: showConfirm.show //onOk={() => form.submit()}
    ,
    centered: true,
    confirmLoading: confirmLoading //onCancel={handleCancel}
    ,
    maskClosable: false,
    footer: [/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
      key: "1",
      danger: true,
      type: "primary",
      onClick: function onClick() {
        return onSubmit('ignorar');
      }
    }, "Ignorar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
      key: "2",
      onClick: handleCancel
    }, "Cancelar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
      key: "3",
      type: "primary",
      onClick: onSubmit
    }, "Validar")]
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_67__["default"], {
    form: form,
    name: "fpi",
    onFinish: onFinish,
    component: "form"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_56__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(ContentConfirm, showConfirm.data))));
};

var ColumnEstado = function ColumnEstado(_ref13) {
  var record = _ref13.record,
      onAction = _ref13.onAction,
      showConfirm = _ref13.showConfirm,
      setShowConfirm = _ref13.setShowConfirm,
      showMenuActions = _ref13.showMenuActions,
      setShowMenuActions = _ref13.setShowMenuActions;
  var status = record.status,
      temp_ofabrico = record.temp_ofabrico;

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)(),
      _useState8 = _slicedToArray(_useState7, 2),
      action = _useState8[0],
      setAction = _useState8[1];

  var onShowConfirm = function onShowConfirm(action) {
    var status = record.status,
        temp_ofabrico = record.temp_ofabrico,
        cliente_cod = record.cliente_cod,
        cliente_nome = record.cliente_nome,
        iorder = record.iorder,
        item = record.item,
        item_nome = record.item_nome,
        ofabrico = record.ofabrico,
        produto_id = record.produto_id,
        produto_cod = record.produto_cod,
        qty_item = record.qty_item,
        item_thickness = record.item_thickness,
        item_diam = record.item_diam,
        item_core = record.item_core,
        item_width = record.item_width,
        item_id = record.item_id;
    setShowConfirm({
      show: true,
      data: {
        status: status,
        temp_ofabrico: temp_ofabrico,
        cliente_cod: cliente_cod,
        cliente_nome: cliente_nome,
        iorder: iorder,
        item: item,
        item_nome: item_nome,
        ofabrico: ofabrico,
        produto_id: produto_id,
        produto_cod: produto_cod,
        action: action,
        qty_item: qty_item,
        item_thickness: item_thickness,
        item_diam: item_diam,
        item_core: item_core,
        item_width: item_width,
        item_id: item_id,
        onAction: onAction
      }
    });
  };

  var onShowMenuActions = function onShowMenuActions() {
    var status = record.status,
        cod = record.cod,
        temp_ofabrico_agg = record.temp_ofabrico_agg;
    setShowMenuActions({
      show: true,
      data: {
        status: status,
        aggCod: cod,
        aggId: temp_ofabrico_agg,
        onAction: onAction
      }
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row"
    }
  }, (status == 0 || !status) && !temp_ofabrico && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_TagButton__WEBPACK_IMPORTED_MODULE_59__["default"], {
    onClick: function onClick() {
      return onShowConfirm('validar');
    },
    style: {
      width: "98px",
      textAlign: "center"
    },
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_80__["default"], null),
    color: "#108ee9"
  }, "Validar")), (status == 1 || !status) && temp_ofabrico && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_TagButton__WEBPACK_IMPORTED_MODULE_59__["default"], {
    onClick: function onClick() {
      return onAction(record, "inpreparation", function () {});
    },
    style: {
      width: "110px",
      textAlign: "center"
    },
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_81__["default"], null),
    color: "warning"
  }, "Em Elabora\xE7\xE3o")), status == 2 && temp_ofabrico && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_TagButton__WEBPACK_IMPORTED_MODULE_59__["default"], {
    onClick: function onClick() {
      return onShowMenuActions();
    },
    style: {
      width: "110px",
      textAlign: "center"
    },
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_81__["default"], null),
    color: "orange"
  }, "Na Produ\xE7\xE3o")), status == 3 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_TagButton__WEBPACK_IMPORTED_MODULE_59__["default"], {
    onClick: function onClick() {
      return onShowMenuActions();
    },
    style: {
      width: "105px",
      textAlign: "center"
    },
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_82__["default"], {
      spin: true
    }),
    color: "success"
  }, "Em Produ\xE7\xE3o")), status == 9 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_83__["default"]
  /* onClick={showPopConfirm}  */
  , {
    style: {
      width: "98px",
      textAlign: "center"
    },
    color: "error"
  }, "Finalizada")));
};

var TitleMenuActions = function TitleMenuActions(_ref14) {
  var aggCod = _ref14.aggCod;
  var v = (0,react__WEBPACK_IMPORTED_MODULE_39__.useContext)(_App__WEBPACK_IMPORTED_MODULE_61__.SocketContext);
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_84__.useNavigate)();
  (0,react__WEBPACK_IMPORTED_MODULE_39__.useEffect)(function () {}, [v]);

  var onValidate = function onValidate() {
    navigate('/app/validateReellings', {
      state: {}
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
    style: {
      fontSize: "14px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_66__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", {
    style: {
      textTransform: "capitalize"
    }
  }), aggCod), v !== null && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_85__["default"], {
    onClick: onValidate,
    style: {
      cursor: "pointer",
      padding: "1px 15px"
    },
    message: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("span", {
      style: {
        fontSize: "14px",
        fontWeight: 700
      }
    }, JSON.parse(v.data).cnt), " Bobinagens por ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_64__["default"], {
      size: "small",
      style: {
        paddingLeft: "0px"
      },
      onClick: onValidate,
      type: "link"
    }, "Validar.")),
    type: "warning",
    showIcon: true
  }))));
};

var MenuActions = function MenuActions(_ref15) {
  var showMenuActions = _ref15.showMenuActions,
      setShowMenuActions = _ref15.setShowMenuActions;

  var _Form$useForm3 = antd__WEBPACK_IMPORTED_MODULE_67__["default"].useForm(),
      _Form$useForm4 = _slicedToArray(_Form$useForm3, 1),
      form = _Form$useForm4[0];

  var _React$useState5 = react__WEBPACK_IMPORTED_MODULE_39__.useState(false),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      confirmLoading = _React$useState6[0],
      setConfirmLoading = _React$useState6[1];

  var _React$useState7 = react__WEBPACK_IMPORTED_MODULE_39__.useState('Content of the modal'),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      modalText = _React$useState8[0],
      setModalText = _React$useState8[1];

  var _showMenuActions$data = showMenuActions.data,
      aggId = _showMenuActions$data.aggId,
      aggCod = _showMenuActions$data.aggCod;

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({}),
      _useState10 = _slicedToArray(_useState9, 2),
      formStatus = _useState10[0],
      setFormStatus = _useState10[1];

  (0,react__WEBPACK_IMPORTED_MODULE_39__.useEffect)(function () {}, []);

  var handleCancel = function handleCancel() {
    setShowMenuActions({
      show: false,
      data: {}
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_63__["default"], {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(TitleMenuActions, {
      aggCod: aggCod
    }),
    visible: showMenuActions.show,
    centered: true,
    onCancel: handleCancel,
    confirmLoading: confirmLoading,
    maskClosable: true,
    footer: null,
    destroyOnClose: true,
    bodyStyle: {
      height: "calc(100vh - 60px)",
      backgroundColor: "#f0f0f0"
    },
    width: "100%"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_YScroll__WEBPACK_IMPORTED_MODULE_60__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(FormMenuActions, {
    aggId: aggId
  })))));
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function () {
  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)(false),
      _useState12 = _slicedToArray(_useState11, 2),
      loading = _useState12[0],
      setLoading = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)([]),
      _useState14 = _slicedToArray(_useState13, 2),
      selectedRows = _useState14[0],
      setSelectedRows = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)(false),
      _useState16 = _slicedToArray(_useState15, 2),
      showFilter = _useState16[0],
      setShowFilter = _useState16[1];

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({
    show: false
  }),
      _useState18 = _slicedToArray(_useState17, 2),
      showValidar = _useState18[0],
      setShowValidar = _useState18[1];

  var _Form$useForm5 = antd__WEBPACK_IMPORTED_MODULE_67__["default"].useForm(),
      _Form$useForm6 = _slicedToArray(_Form$useForm5, 1),
      formFilter = _Form$useForm6[0];

  var dataAPI = (0,utils_useDataAPI__WEBPACK_IMPORTED_MODULE_44__.useDataAPI)({
    payload: {
      url: "".concat(config__WEBPACK_IMPORTED_MODULE_43__.API_URL, "/ofabricolist/"),
      parameters: {},
      pagination: {
        enabled: true,
        page: 1,
        pageSize: 20
      },
      filter: {},
      sort: [
      /* { column: 'status', direction: 'ASC', options: "NULLS FIRST" },  */
      {
        column: 'ofabrico',
        direction: 'DESC'
      }
      /* { column: 'completa' }, { column: 'end_date', direction: 'DESC' } */
      ]
    }
  });
  var elFilterTags = document.getElementById('filter-tags');

  var _useState19 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({
    visible: false,
    fullscreen: false
  }),
      _useState20 = _slicedToArray(_useState19, 2),
      flyoutStatus = _useState20[0],
      setFlyoutStatus = _useState20[1];

  var flyoutFooterRef = (0,react__WEBPACK_IMPORTED_MODULE_39__.useRef)();

  var _useState21 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)(false),
      _useState22 = _slicedToArray(_useState21, 2),
      estadoRecord = _useState22[0],
      setEstadoRecord = _useState22[1];

  var _useState23 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({
    show: false,
    data: {}
  }),
      _useState24 = _slicedToArray(_useState23, 2),
      showConfirm = _useState24[0],
      setShowConfirm = _useState24[1];

  var _useState25 = (0,react__WEBPACK_IMPORTED_MODULE_39__.useState)({
    show: false,
    data: {}
  }),
      _useState26 = _slicedToArray(_useState25, 2),
      showMenuActions = _useState26[0],
      setShowMenuActions = _useState26[1];

  (0,react__WEBPACK_IMPORTED_MODULE_39__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.cancelToken)();
    dataAPI.first();
    dataAPI.fetchPost({
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel();
    };
  }, []);

  var selectionRowKey = function selectionRowKey(record) {
    return "".concat(record.ofabrico, "-").concat((0,utils__WEBPACK_IMPORTED_MODULE_46__.isValue)(record.item, undefined), "-").concat((0,utils__WEBPACK_IMPORTED_MODULE_46__.isValue)(record.iorder, undefined));
  };

  var reloadFromChild = function reloadFromChild() {
    dataAPI.fetchPost();
  };

  var onEstadoChange = /*#__PURE__*/function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(record, action, data) {
      var cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, qty_item, item_diam, item_core, item_thickness, item_width, item_id, response;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              cliente_cod = record.cliente_cod, cliente_nome = record.cliente_nome, iorder = record.iorder, item = record.item, ofabrico = record.ofabrico, produto_id = record.produto_id, qty_item = record.qty_item, item_diam = record.item_diam, item_core = record.item_core, item_thickness = record.item_thickness, item_width = record.item_width, item_id = record.item_id;
              _context6.t0 = action;
              _context6.next = _context6.t0 === 'validar' ? 4 : _context6.t0 === 'ignorar' ? 11 : _context6.t0 === 'inpreparation' ? 18 : _context6.t0 === 'reabrir' ? 20 : _context6.t0 === 'iniciar' ? 22 : _context6.t0 === 'finalizar' ? 24 : _context6.t0 === 'suspender' ? 26 : 28;
              break;

            case 4:
              setLoading(true);
              _context6.next = 7;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_43__.API_URL, "/savetempordemfabrico/"),
                parameters: {
                  cliente_cod: cliente_cod,
                  cliente_nome: cliente_nome,
                  iorder: iorder,
                  item: item,
                  ofabrico_cod: ofabrico,
                  produto_id: produto_id,
                  artigo: data,
                  qty_item: qty_item,
                  artigo_diam: item_diam,
                  artigo_core: item_core,
                  artigo_width: item_width,
                  item_id: item_id,
                  artigo_thickness: item_thickness
                }
              });

            case 7:
              response = _context6.sent;

              if (response.data.status !== "error") {
                dataAPI.fetchPost();
              }

              setLoading(false);
              return _context6.abrupt("return", response);

            case 11:
              setLoading(true);
              _context6.next = 14;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_42__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_43__.API_URL, "/ignorarordemfabrico/"),
                parameters: {
                  ofabrico: ofabrico
                }
              });

            case 14:
              response = _context6.sent;

              if (response.data.status !== "error") {
                dataAPI.fetchPost();
              }

              setLoading(false);
              return _context6.abrupt("return", response);

            case 18:
              setShowValidar(function (prev) {
                return _objectSpread(_objectSpread({}, prev), {}, {
                  show: !prev.show,
                  record: record
                });
              });
              return _context6.abrupt("break", 28);

            case 20:
              console.log('reabrir', record);
              return _context6.abrupt("break", 28);

            case 22:
              console.log('iniciar', record);
              return _context6.abrupt("break", 28);

            case 24:
              console.log('finalizar', record);
              return _context6.abrupt("break", 28);

            case 26:
              console.log('suspender', record);
              return _context6.abrupt("break", 28);

            case 28:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function onEstadoChange(_x6, _x7, _x8) {
      return _ref16.apply(this, arguments);
    };
  }();

  var columns = (0,components_table__WEBPACK_IMPORTED_MODULE_50__.setColumns)({
    dataAPI: dataAPI,
    data: dataAPI.getData().rows,
    uuid: "ofabricolist",
    include: _objectSpread({}, function (common) {
      return {
        ofabrico: _objectSpread({
          title: "Ordem Fabrico",
          fixed: 'left',
          width: 140,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, v);
          }
        }, common),
        prf: _objectSpread({
          title: "PRF",
          fixed: 'left',
          width: 140,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, v);
          }
        }, common),
        iorder: _objectSpread({
          title: "Encomenda(s)",
          fixed: 'left',
          width: 140
        }, common),
        cod: _objectSpread({
          title: "Agg",
          width: 140,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("span", {
              style: {
                color: "#096dd9"
              }
            }, v);
          }
        }, common),

        /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
        estado: _objectSpread({
          title: "",
          width: 125,
          render: function render(v, r) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(ColumnEstado, {
              record: r,
              showMenuActions: showMenuActions,
              setShowMenuActions: setShowMenuActions,
              showConfirm: showConfirm,
              setShowConfirm: setShowConfirm,
              onAction: onEstadoChange
              /*    setEstadoRecord={setEstadoRecord} estadoRecord={estadoRecord} reloadParent={reloadFromChild} rowKey={selectionRowKey(r)} record={r} */

            });
          }
        }, common),

        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
        item_nome: _objectSpread({
          title: "Artigo(s)",
          ellipsis: true,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
              style: {
                /* overflow:"hidden", textOverflow:"ellipsis" */
                whiteSpace: 'nowrap'
              }
            }, v);
          }
        }, common),
        cliente_nome: _objectSpread({
          title: "Cliente(s)",
          ellipsis: true,
          render: function render(v) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
              style: {
                whiteSpace: 'nowrap'
              }
            }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("b", null, v));
          }
        }, common),
        start_date: _objectSpread({
          title: "Início Previsto",
          ellipsis: true,
          render: function render(v, r) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
              style: {
                whiteSpace: 'nowrap'
              }
            }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("span", null, dayjs__WEBPACK_IMPORTED_MODULE_40___default()(r.start_prev_date ? r.start_prev_date : v).format(config__WEBPACK_IMPORTED_MODULE_43__.DATETIME_FORMAT)));
          }
        }, common),
        end_date: _objectSpread({
          title: "Fim Previsto",
          ellipsis: true,
          render: function render(v, r) {
            return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("div", {
              style: {
                whiteSpace: 'nowrap'
              }
            }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement("span", null, r.end_prev_date && dayjs__WEBPACK_IMPORTED_MODULE_40___default()(r.end_prev_date).format(config__WEBPACK_IMPORTED_MODULE_43__.DATETIME_FORMAT)));
          }
        }, common) //produzidas: { title: "Produzidas", width: 100, render: (v, r) => <ColumnProgress type={1} record={r} />, ...common },
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

  var closeFlyout = function closeFlyout() {
    setFlyoutStatus(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        visible: false
      });
    });
  };

  var ordemFabricoStatusField = function ordemFabricoStatusField() {
    var _ref17 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        onChange = _ref17.onChange;

    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_48__.SelectField, {
      onChange: onChange,
      keyField: "value",
      valueField: "label",
      style: {
        width: 150
      },
      options: [{
        value: "Todos",
        label: "Todos"
      }, {
        value: "Por Validar",
        label: "Por validar"
      }, {
        value: "Em Elaboração",
        label: "Em Elaboração"
      }, {
        value: "Na Produção",
        label: "Na Produção"
      }, {
        value: "Em Produção",
        label: "Em Produção"
      }, {
        value: "Finalizada",
        label: "Finalizada"
      }]
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(antd__WEBPACK_IMPORTED_MODULE_86__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_87__["default"], {
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(MenuActions, {
    showMenuActions: showMenuActions,
    setShowMenuActions: setShowMenuActions
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(PromiseConfirm, {
    showConfirm: showConfirm,
    setShowConfirm: setShowConfirm
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(react__WEBPACK_IMPORTED_MODULE_39__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_Drawer__WEBPACK_IMPORTED_MODULE_49__["default"], {
    showWrapper: showValidar,
    setShowWrapper: setShowValidar,
    parentReload: dataAPI.fetchPost
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(FormOFabricoValidar, null))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(ToolbarTable, {
    form: formFilter,
    dataAPI: dataAPI,
    setFlyoutStatus: setFlyoutStatus,
    flyoutStatus: flyoutStatus,
    ordemFabricoStatusField: ordemFabricoStatusField
  }), elFilterTags && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_52__["default"], {
    elId: elFilterTags
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_form__WEBPACK_IMPORTED_MODULE_47__.FilterTags, {
    form: formFilter,
    filters: dataAPI.getAllFilter(),
    schema: filterSchema,
    rules: filterRules()
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(components_table__WEBPACK_IMPORTED_MODULE_50__["default"], {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(Title, {
      level: 4
    }, "Ordens de Fabrico"),
    columnChooser: false,
    reload: true,
    stripRows: true,
    darkHeader: true,
    size: "small",
    toolbar: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_39__.createElement(GlobalSearch, {
      columns: columns === null || columns === void 0 ? void 0 : columns.report,
      form: formFilter,
      dataAPI: dataAPI,
      setShowFilter: setShowFilter,
      showFilter: showFilter,
      ordemFabricoStatusField: ordemFabricoStatusField
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
    scroll: {
      x: config__WEBPACK_IMPORTED_MODULE_43__.SCREENSIZE_OPTIMIZED.width - 20,
      y: '70vh',
      scrollToFirstRowOnChange: true
    } //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}

  })));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_OFabricoList_jsx.chunk.js.map