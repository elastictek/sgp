"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_LayoutPage_jsx"],{

/***/ "./src/pages/LayoutPage.jsx":
/*!**********************************!*\
  !*** ./src/pages/LayoutPage.jsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/index.js");





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function () {
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_2__.useNavigate)();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    style: {
      height: config__WEBPACK_IMPORTED_MODULE_1__.PAGE_TOOLBAR_HEIGHT,
      maxHeight: config__WEBPACK_IMPORTED_MODULE_1__.PAGE_TOOLBAR_HEIGHT,
      overflow: "hidden",
      overflowY: "auto"
    }
  }, "LAYOUT PAGE", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", {
    style: {
      listStyleType: "none",
      margin: 0,
      padding: 0
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginLeft: "10px",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      navigate('/app');
      window.location.reload();
    }
  }, "Refresh")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      return navigate('/app');
    }
  }, "Home")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      return navigate('/app/sorders');
    }
  }, "Encomendas")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      return navigate('/app/ofabricolist');
    }
  }, "Ordens Fabrico")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      return navigate('/app/validateReellings');
    }
  }, "Validar Bobinagens")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      return navigate('/app/ordemfabrico/formdetails', {
        state: {
          id: 48
        }
      });
    }
  }, "Form Ordem Fabrico")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    style: {
      "float": "left",
      cursor: "pointer",
      color: "blue",
      marginRight: "10px",
      backgroundColor: "lightgray",
      width: "120px",
      textAlign: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
    onClick: function onClick() {
      return navigate('/notexists');
    }
  }, "Not Found")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_2__.Outlet, null));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_LayoutPage_jsx.chunk.js.map