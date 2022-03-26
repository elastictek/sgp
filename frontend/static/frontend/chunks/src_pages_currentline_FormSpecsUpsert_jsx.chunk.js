"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_currentline_FormSpecsUpsert_jsx"],{

/***/ "./src/pages/currentline/FormSpecsUpsert.jsx":
/*!***************************************************!*\
  !*** ./src/pages/currentline/FormSpecsUpsert.jsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.array.find.js */ "./node_modules/core-js/modules/es.array.find.js");
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");

















var _excluded = ["items"];

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


























var artigoSpecsItems = config__WEBPACK_IMPORTED_MODULE_32__.ARTIGOS_SPECS.filter(function (v) {
  return !(v !== null && v !== void 0 && v.disabled);
});

var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_33__.getSchema)({}, keys, excludeKeys).unknown(true);
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

var loadCustomersLookup = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(value) {
    var _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_31__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_32__.API_URL, "/sellcustomerslookup/"),
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

  return function loadCustomersLookup(_x) {
    return _ref.apply(this, arguments);
  };
}();

var loadArtigosSpecsLookup = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref2) {
    var produto_id, token, _yield$fetchPost2, rows;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            produto_id = _ref2.produto_id, token = _ref2.token;
            _context2.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_31__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_32__.API_URL, "/artigosspecslookup/"),
              filter: {
                produto_id: produto_id
              },
              sort: [],
              cancelToken: token
            });

          case 3:
            _yield$fetchPost2 = _context2.sent;
            rows = _yield$fetchPost2.data.rows;
            return _context2.abrupt("return", rows);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function loadArtigosSpecsLookup(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var getArtigoSpecsItems = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
    var artigospecs_id, token, _yield$fetchPost3, rows;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            artigospecs_id = _ref4.artigospecs_id, token = _ref4.token;

            if (artigospecs_id) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", []);

          case 3:
            _context3.next = 5;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_31__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_32__.API_URL, "/artigospecsitemsget/"),
              filter: {
                artigospecs_id: artigospecs_id
              },
              sort: [],
              cancelToken: token
            });

          case 5:
            _yield$fetchPost3 = _context3.sent;
            rows = _yield$fetchPost3.data.rows;
            return _context3.abrupt("return", rows);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function getArtigoSpecsItems(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref6) {
  var record = _ref6.record,
      setFormTitle = _ref6.setFormTitle,
      parentRef = _ref6.parentRef,
      closeParent = _ref6.closeParent,
      parentReload = _ref6.parentReload,
      _ref6$wrapForm = _ref6.wrapForm,
      wrapForm = _ref6$wrapForm === void 0 ? "form" : _ref6$wrapForm,
      _ref6$forInput = _ref6.forInput,
      forInput = _ref6$forInput === void 0 ? true : _ref6$forInput;

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_39__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isTouched = _useState4[0],
      setIsTouched = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)({}),
      _useState6 = _slicedToArray(_useState5, 2),
      changedValues = _useState6[0],
      setChangedValues = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      formStatus = _useState8[0],
      setFormStatus = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)(false),
      _useState10 = _slicedToArray(_useState9, 2),
      guides = _useState10[0],
      setGuides = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)(setId(record.artigospecs.id)),
      _useState12 = _slicedToArray(_useState11, 2),
      operation = _useState12[0],
      setOperation = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)({
    status: "none"
  }),
      _useState14 = _slicedToArray(_useState13, 2),
      resultMessage = _useState14[0],
      setResultMessage = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)([]),
      _useState16 = _slicedToArray(_useState15, 2),
      customerLookup = _useState16[0],
      setCustomerLookup = _useState16[1];

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_28__.useState)([]),
      _useState18 = _slicedToArray(_useState17, 2),
      artigosSpecs = _useState18[0],
      setArtigosSpecs = _useState18[1];

  var transformData = function transformData(_ref7) {
    var items = _ref7.items,
        artigospecs = _ref7.artigospecs;
    var fieldsValue = {
      nitems: items.length
    };

    var _iterator = _createForOfIteratorHelper(items.entries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            i = _step$value[0],
            v = _step$value[1];

        fieldsValue["key-".concat(i)] = v.item_key;
        fieldsValue["des-".concat(i)] = v.item_des;
        fieldsValue["nv-".concat(i)] = v.item_nvalues;
        var vals = typeof v.item_values === "string" ? JSON.parse(v.item_values) : v.item_values;

        var _iterator2 = _createForOfIteratorHelper(vals.entries()),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _step2$value = _slicedToArray(_step2.value, 2),
                iV = _step2$value[0],
                vV = _step2$value[1];

            fieldsValue["v".concat(v.item_key, "-").concat(iV)] = vV;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    var cliente_cod = {
      key: artigospecs === null || artigospecs === void 0 ? void 0 : artigospecs.cliente_cod,
      value: artigospecs === null || artigospecs === void 0 ? void 0 : artigospecs.cliente_cod,
      label: artigospecs === null || artigospecs === void 0 ? void 0 : artigospecs.cliente_nome
    };
    return _objectSpread(_objectSpread(_objectSpread({}, artigospecs), fieldsValue), {}, {
      cliente_cod: cliente_cod
    });
  };

  var init = function init() {
    var lookup = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var token = arguments.length > 1 ? arguments[1] : undefined;

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var _record$artigospecs, items, artigospecs;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (lookup) {}

              if (!(operation.key === "update")) {
                _context4.next = 10;
                break;
              }

              setFormTitle && setFormTitle({
                title: "Editar Especifica\xE7\xF5es"
              });
              _record$artigospecs = record.artigospecs, items = _record$artigospecs.items, artigospecs = _objectWithoutProperties(_record$artigospecs, _excluded);
              _context4.t0 = setArtigosSpecs;
              _context4.next = 7;
              return loadArtigosSpecsLookup({
                produto_id: artigospecs.produto_id,
                token: token
              });

            case 7:
              _context4.t1 = _context4.sent;
              (0, _context4.t0)(_context4.t1);
              form.setFieldsValue(transformData({
                items: items,
                artigospecs: artigospecs
              }));

            case 10:
              setLoading(false);

            case 11:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }))();
  };

  (0,react__WEBPACK_IMPORTED_MODULE_28__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_31__.cancelToken)();
    init(true, cancelFetch);
    return function () {
      return cancelFetch.cancel("Form Specs Cancelled");
    };
  }, []);

  var onValuesChange = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(changedValues) {
      var artigospecs, _artigoSpecsItems;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              setIsTouched(true);

              if (!('id' in changedValues)) {
                _context5.next = 7;
                break;
              }

              artigospecs = artigosSpecs.find(function (v) {
                return v.id === changedValues.id;
              });
              _context5.next = 5;
              return getArtigoSpecsItems({
                artigospecs_id: changedValues.id
              });

            case 5:
              _artigoSpecsItems = _context5.sent;
              form.setFieldsValue(transformData({
                items: _artigoSpecsItems,
                artigospecs: artigospecs
              }));

            case 7:
              setChangedValues(changedValues);

            case 8:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function onValuesChange(_x4) {
      return _ref9.apply(this, arguments);
    };
  }();

  var onFinish = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(values) {
      var status, v, error, k, _values$cliente_cod, cliente_cod, cliente_nome, response;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (isTouched) {
                _context6.next = 2;
                break;
              }

              return _context6.abrupt("return");

            case 2:
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              v = schema().validate(values, {
                abortEarly: false
              });

              if (v.error) {
                _context6.next = 25;
                break;
              }

              error = false;
              _context6.t0 = regeneratorRuntime.keys(values);

            case 7:
              if ((_context6.t1 = _context6.t0()).done) {
                _context6.next = 14;
                break;
              }

              k = _context6.t1.value;

              if (!(values[k] === undefined && k !== "cliente_cod" && k !== "designacao")) {
                _context6.next = 12;
                break;
              }

              error = true;
              return _context6.abrupt("break", 14);

            case 12:
              _context6.next = 7;
              break;

            case 14:
              if (error) {
                status.error.push({
                  message: "Os items têm de estar preenchidos!"
                });
              }

              if (!(status.error.length === 0)) {
                _context6.next = 25;
                break;
              }

              _values$cliente_cod = values.cliente_cod;
              _values$cliente_cod = _values$cliente_cod === void 0 ? {} : _values$cliente_cod;
              cliente_cod = _values$cliente_cod.value, cliente_nome = _values$cliente_cod.label;
              _context6.next = 21;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_31__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_32__.API_URL, "/updatecurrentsettings/"),
                filter: {
                  csid: record.id
                },
                parameters: {
                  type: 'specs',
                  specs: _objectSpread(_objectSpread({}, form.getFieldsValue(true)), {}, {
                    produto_id: record.artigospecs.produto_id,
                    cliente_cod: cliente_cod,
                    cliente_nome: cliente_nome
                  })
                }
              });

            case 21:
              response = _context6.sent;
              setResultMessage(response.data);

              if (!(response.data.status !== "error")) {
                _context6.next = 25;
                break;
              }

              throw 'TODO RELOAD PARENT';

            case 25:
              setFormStatus(status);

            case 26:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function onFinish(_x5) {
      return _ref10.apply(this, arguments);
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

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(react__WEBPACK_IMPORTED_MODULE_28__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_36__["default"], {
    result: resultMessage,
    successButtonOK: operation.key === "insert" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "Criar Novas Especifica\xE7\xF5es"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_35__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish,
    onValuesChange: onValuesChange,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FormLayout, {
    id: "LAY-SPECS-UPSERT",
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
      guides: false,
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
      guides: false,
      wide: 16,
      margin: "2px",
      layout: "horizontal",
      overflow: false
    }
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(react__WEBPACK_IMPORTED_MODULE_28__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_38__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.Field, {
      name: "id",
      layout: {
        center: "align-self:center;",
        right: "align-self:center;"
      },
      label: {
        enabled: false,
        text: "Especificações",
        pos: "left"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.SelectField, {
      size: "small",
      data: artigosSpecs,
      keyField: "id",
      textField: "designacao",
      optionsRender: function optionsRender(d, keyField, textField) {
        return {
          label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
            style: {
              display: "flex"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
            style: {
              minWidth: "150px"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("b", null, d[textField])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", null, "v.", d["versao"])),
          value: d[keyField]
        };
      }
    }))),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
      style: {
        minWidth: "300px"
      },
      margin: false,
      field: {
        wide: [16]
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.Field, {
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
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.SelectDebounceField, {
      placeholder: "Cliente",
      size: "small",
      keyField: "BPCNUM_0",
      textField: "BPCNAM_0",
      showSearch: true,
      showArrow: true,
      allowClear: true,
      fetchOptions: loadCustomersLookup
    }))))
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.VerticalSpace, {
    height: "12px"
  })), !forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(react__WEBPACK_IMPORTED_MODULE_28__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
    margin: false,
    field: {
      wide: [16]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.Field, {
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.SelectDebounceField, {
    placeholder: "Cliente",
    size: "small",
    keyField: "BPCNUM_0",
    textField: "BPCNAM_0",
    showSearch: true,
    showArrow: true,
    allowClear: true,
    fetchOptions: loadCustomersLookup
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.VerticalSpace, {
    height: "12px"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
    wide: 16,
    margin: false,
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    wide: 7
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
    wide: 9,
    margin: false,
    style: {
      minWidth: "185px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 3
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
    style: {
      textAlign: "center",
      fontWeight: 700
    }
  }, "TDS")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 50
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 3
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
    style: {
      textAlign: "center",
      fontWeight: 700
    }
  }, "Objetivo")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    wide: 7
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
    wide: 9,
    margin: false,
    style: {
      minWidth: "185px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 6
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "Min.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 6
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "M\xE1x.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 50
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 6
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "Min.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
    label: {
      enabled: false
    },
    split: 6
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "M\xE1x.")))), artigoSpecsItems.map(function (v, idx) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
      key: "gop-".concat(idx),
      wide: 16,
      field: {
        wide: [7, 9]
      },
      margin: false
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
      label: {
        enabled: false
      },
      style: {
        fontSize: "11px"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement("b", null, v.designacao), " (", v.unidade, ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldSet, {
      wide: 9,
      margin: false,
      style: _objectSpread({
        minWidth: "185px"
      }, !forInput && {
        fontSize: "10px"
      })
    }, _toConsumableArray(Array(form.getFieldValue("nv-".concat(idx)))).map(function (x, i) {
      if (i % 2 === 0 && i !== 0) {
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(react__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
          key: "".concat(v.key, "-").concat(i)
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.FieldItem, {
          label: {
            enabled: false
          },
          split: 50
        }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.Field, {
          split: 6,
          key: "".concat(v.key, "-").concat(i),
          name: "v".concat(v.key, "-").concat(i),
          label: {
            enabled: false
          }
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"], {
          min: v.min,
          max: v.max,
          controls: false,
          size: "small",
          precision: v === null || v === void 0 ? void 0 : v.precision
        })));
      }

      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_34__.Field, {
        split: 6,
        key: "".concat(v.key, "-").concat(i),
        name: "v".concat(v.key, "-").concat(i),
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"], {
        min: v.min,
        max: v.max,
        controls: false,
        size: "small",
        precision: v === null || v === void 0 ? void 0 : v.precision
      }));
    })));
  })))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_37__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], null, isTouched && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    type: "primary",
    onClick: function onClick() {
      return onFinish(form.getFieldsValue(true));
    }
  }, "Guardar"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_28__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    onClick: onClose
  }, "Fechar")))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_currentline_FormSpecsUpsert_jsx.chunk.js.map