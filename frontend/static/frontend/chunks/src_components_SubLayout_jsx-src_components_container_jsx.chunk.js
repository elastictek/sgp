"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_components_SubLayout_jsx-src_components_container_jsx"],{

/***/ "./src/components/SubLayout.jsx":
/*!**************************************!*\
  !*** ./src/components/SubLayout.jsx ***!
  \**************************************/
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
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");






var _excluded = ["flyoutStatus", "flyoutWidth", "children"],
    _excluded2 = ["children"],
    _excluded3 = ["children"];

var _templateObject, _templateObject2, _templateObject3;



function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }



var StyledSubLayout = styled_components__WEBPACK_IMPORTED_MODULE_8__["default"].div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    display: flex;\n    flex-direction: row;\n"])));

var SubLayout = function SubLayout(_ref) {
  var _ref$flyoutStatus = _ref.flyoutStatus,
      flyoutStatus = _ref$flyoutStatus === void 0 ? {
    visible: false,
    fullscreen: false
  } : _ref$flyoutStatus,
      _ref$flyoutWidth = _ref.flyoutWidth,
      flyoutWidth = _ref$flyoutWidth === void 0 ? "300px" : _ref$flyoutWidth,
      children = _ref.children,
      rest = _objectWithoutProperties(_ref, _excluded);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.createElement(StyledSubLayout, rest, react__WEBPACK_IMPORTED_MODULE_7__.Children.map(children, function (child, i) {
    if (child.type == SubLayout.flyout && flyoutStatus.visible) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.cloneElement(child, {
        width: flyoutWidth,
        fullScreen: flyoutStatus.fullscreen
      });
    } else if (child.type == SubLayout.content) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.cloneElement(child, {
        width: flyoutStatus.visible ? "calc(100% - ".concat(flyoutWidth, ")") : '100%'
      });
    }
  }));
};

var StyledContent = styled_components__WEBPACK_IMPORTED_MODULE_8__["default"].div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    transition: width .2s ease-in-out;\n    ", "\n"])), function (props) {
  return props.width && "\n        width:".concat(props.width, ";\n    ");
});
var StyledFlyout = styled_components__WEBPACK_IMPORTED_MODULE_8__["default"].div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    ", "\n    ", "\n    background:#ffffff;\n    flex-grow: 1;\n    display: flex;\n    flex-direction:column;\n    border-left: 1px solid #f0f0f0;\n    margin-left:5px;\n    box-shadow: 0px 0px 2px 1px #f0f0f0;\n\n"])), function (props) {
  return props.width && !props.fullScreen && "\n        width:".concat(props.width, ";\n    ");
}, function (props) {
  return props.fullScreen && "\n        z-index: 9999; \n        width: 100%; \n        height: 100%; \n        position: fixed; \n        top: 0; \n        left: 0; \n    ";
});

SubLayout.content = function (_ref2) {
  var children = _ref2.children,
      rest = _objectWithoutProperties(_ref2, _excluded2);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.createElement(StyledContent, rest, children);
};

SubLayout.flyout = function (_ref3) {
  var children = _ref3.children,
      rest = _objectWithoutProperties(_ref3, _excluded3);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.createElement(StyledFlyout, rest, children);
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SubLayout);

/***/ }),

/***/ "./src/components/container.jsx":
/*!**************************************!*\
  !*** ./src/components/container.jsx ***!
  \**************************************/
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
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FullscreenOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/CloseOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");













var _templateObject, _templateObject2, _templateObject3;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }






var Container = function Container(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement("div", null, children);
};

var StyledHeader = styled_components__WEBPACK_IMPORTED_MODULE_13__["default"].div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: relative;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 16px 24px;\n    color: rgba(0, 0, 0, 0.85);\n    background: #fff;\n    border-bottom: 1px solid #f0f0f0;\n    border-radius: 2px 2px 0 0;\n"])));

Container.Header = function (_ref2) {
  var icon = _ref2.icon,
      left = _ref2.left,
      right = _ref2.right,
      _ref2$close = _ref2.close,
      close = _ref2$close === void 0 ? true : _ref2$close,
      _ref2$fullScreen = _ref2.fullScreen,
      fullScreen = _ref2$fullScreen === void 0 ? true : _ref2$fullScreen,
      setStatus = _ref2.setStatus;

  var onClose = function onClose() {
    setStatus(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        visible: false
      });
    });
  };

  var onFullscreen = function onFullscreen() {
    setStatus(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        fullscreen: !prev.fullscreen
      });
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(StyledHeader, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(antd__WEBPACK_IMPORTED_MODULE_14__["default"], null, icon && icon, left && left), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(antd__WEBPACK_IMPORTED_MODULE_14__["default"], null, right && right, fullScreen && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(antd__WEBPACK_IMPORTED_MODULE_15__["default"], {
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_16__["default"], null),
    onClick: onFullscreen
  }), close && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(antd__WEBPACK_IMPORTED_MODULE_15__["default"], {
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_17__["default"], null),
    onClick: onClose
  })));
};

Container.Body = styled_components__WEBPACK_IMPORTED_MODULE_13__["default"].div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    flex-grow: 1;\n    padding: 24px;\n    overflow: auto;\n    font-size: 14px;\n    line-height: 1.5715;\n    word-wrap: break-word;\n"])));

Container.Footer = function (_ref3) {
  var left = _ref3.left,
      right = _ref3.right;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement(StyledFooter, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement("div", null, left && left), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_12__.createElement("div", null, right && right));
};

var StyledFooter = styled_components__WEBPACK_IMPORTED_MODULE_13__["default"].div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    flex-shrink: 0;\n    display: flex;\n    align-items: center;\n    background: #f8f9fa;\n    justify-content: space-between;\n    padding: 10px 16px;\n    border-top: 1px solid #f0f0f0;\n"])));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Container);

/***/ })

}]);
//# sourceMappingURL=src_components_SubLayout_jsx-src_components_container_jsx.chunk.js.map