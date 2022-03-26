"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_components_resultMessage_jsx"],{

/***/ "./src/components/resultMessage.jsx":
/*!******************************************!*\
  !*** ./src/components/resultMessage.jsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/result/index.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref) {
  var result = _ref.result,
      successButtonOK = _ref.successButtonOK,
      successButtonClose = _ref.successButtonClose,
      errorButtonOK = _ref.errorButtonOK,
      errorButtonClose = _ref.errorButtonClose,
      children = _ref.children;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, result.status === "none" && children, result.status === "success" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
    status: result.status,
    title: result.title,
    subTitle: result.subTitle,
    extra: [successButtonOK, successButtonClose]
  }), result.status === "error" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
    status: result.status,
    title: result.title,
    subTitle: result.subTitle,
    extra: [errorButtonOK, errorButtonClose]
  }));
});

/***/ })

}]);
//# sourceMappingURL=src_components_resultMessage_jsx.chunk.js.map