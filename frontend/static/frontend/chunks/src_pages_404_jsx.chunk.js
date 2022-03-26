"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_404_jsx"],{

/***/ "./src/pages/404.jsx":
/*!***************************!*\
  !*** ./src/pages/404.jsx ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/result/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/index.js");




var NotFoundPage = function NotFoundPage() {
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_1__.useNavigate)();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
    status: "404",
    title: "404",
    subTitle: "A p\xE1gina que tentou aceder est\xE1 indispon\xEDvel ou n\xE3o existe!",
    extra: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
      type: "primary",
      onClick: function onClick() {
        return navigate('/app');
      }
    }, "Ir para a p\xE1gina inicial")
  });
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NotFoundPage);

/***/ })

}]);
//# sourceMappingURL=src_pages_404_jsx.chunk.js.map