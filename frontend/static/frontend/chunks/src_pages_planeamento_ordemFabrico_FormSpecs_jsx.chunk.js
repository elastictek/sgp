"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_planeamento_ordemFabrico_FormSpecs_jsx"],{

/***/ "./src/pages/planeamento/artigo/FormSpecsUpsert.jsx":
/*!**********************************************************!*\
  !*** ./src/pages/planeamento/artigo/FormSpecsUpsert.jsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ../ordemFabrico/FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }









































var artigoSpecsItems = config__WEBPACK_IMPORTED_MODULE_30__.ARTIGOS_SPECS.filter(function (v) {
  return !(v !== null && v !== void 0 && v.disabled);
});

var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_31__.getSchema)({}, keys, excludeKeys).unknown(true);
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
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/sellcustomerslookup/"),
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref2) {
  var record = _ref2.record,
      setFormTitle = _ref2.setFormTitle,
      parentRef = _ref2.parentRef,
      closeParent = _ref2.closeParent,
      parentReload = _ref2.parentReload,
      _ref2$wrapForm = _ref2.wrapForm,
      wrapForm = _ref2$wrapForm === void 0 ? "form" : _ref2$wrapForm,
      _ref2$forInput = _ref2.forInput,
      forInput = _ref2$forInput === void 0 ? true : _ref2$forInput;
  var ctx = (0,react__WEBPACK_IMPORTED_MODULE_26__.useContext)(_ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_36__.OFabricoContext);

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_37__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      submitting = _useState4[0],
      setSubmitting = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState6 = _slicedToArray(_useState5, 2),
      changedValues = _useState6[0],
      setChangedValues = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      formStatus = _useState8[0],
      setFormStatus = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState10 = _slicedToArray(_useState9, 2),
      guides = _useState10[0],
      setGuides = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(setId(record.artigospecs_id)),
      _useState12 = _slicedToArray(_useState11, 2),
      operation = _useState12[0],
      setOperation = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    status: "none"
  }),
      _useState14 = _slicedToArray(_useState13, 2),
      resultMessage = _useState14[0],
      setResultMessage = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)([]),
      _useState16 = _slicedToArray(_useState15, 2),
      customerLookup = _useState16[0],
      setCustomerLookup = _useState16[1];

  var init = function init() {
    var lookup = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var initValues, _iterator, _step, _step$value, idx, v;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (lookup) {}

              if (operation.key === "update") {
                setFormTitle && setFormTitle({
                  title: "Editar Especifica\xE7\xF5es"
                });
                form.setFieldsValue(_objectSpread(_objectSpread({}, record.artigoSpecs), record.artigoSpecsItems));
              } else {
                setFormTitle && setFormTitle({
                  title: "Novas Especifica\xE7\xF5es ".concat(ctx.item_cod),
                  subTitle: "".concat(ctx.item_nome)
                });
                initValues = {};
                initValues["nitems"] = artigoSpecsItems.length;
                _iterator = _createForOfIteratorHelper(artigoSpecsItems.entries());

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    _step$value = _slicedToArray(_step.value, 2), idx = _step$value[0], v = _step$value[1];
                    initValues["key-".concat(idx)] = v.key;
                    initValues["des-".concat(idx)] = v.designacao;
                    initValues["nv-".concat(idx)] = v.nvalues;
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                form.setFieldsValue(initValues);
              }

              setLoading(false);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  };

  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    init(true);
  }, []);

  var onValuesChange = function onValuesChange(changedValues) {
    setChangedValues(changedValues);
  };

  var onFinish = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(values) {
      var status, v, error, k, _values$cliente_cod, cliente_cod, cliente_nome, response;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
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
                _context3.next = 22;
                break;
              }

              error = false;
              _context3.t0 = regeneratorRuntime.keys(values);

            case 5:
              if ((_context3.t1 = _context3.t0()).done) {
                _context3.next = 12;
                break;
              }

              k = _context3.t1.value;

              if (!(values[k] === undefined && k !== "cliente_cod" && k !== "designacao")) {
                _context3.next = 10;
                break;
              }

              error = true;
              return _context3.abrupt("break", 12);

            case 10:
              _context3.next = 5;
              break;

            case 12:
              if (error) {
                status.error.push({
                  message: "Os items têm de estar preenchidos!"
                });
              }

              if (!(status.error.length === 0)) {
                _context3.next = 22;
                break;
              }

              _values$cliente_cod = values.cliente_cod;
              _values$cliente_cod = _values$cliente_cod === void 0 ? {} : _values$cliente_cod;
              cliente_cod = _values$cliente_cod.value, cliente_nome = _values$cliente_cod.label;
              _context3.next = 19;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/newartigospecs/"),
                parameters: _objectSpread(_objectSpread({}, form.getFieldsValue(true)), {}, {
                  produto_id: ctx.produto_id,
                  cliente_cod: cliente_cod,
                  cliente_nome: cliente_nome
                })
              });

            case 19:
              response = _context3.sent;

              if (response.data.status !== "error") {
                parentReload({
                  artigospecs_id: record.artigospecs_id
                }, "init");
              }

              setResultMessage(response.data);

            case 22:
              setFormStatus(status);

            case 23:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function onFinish(_x2) {
      return _ref4.apply(this, arguments);
    };
  }();

  var onSuccessOK = function onSuccessOK() {
    if (operation.key === "insert") {
      form.resetFields();
      init();
      setSubmitting(false);
      setResultMessage({
        status: "none"
      });
    }
  };

  var onErrorOK = function onErrorOK() {
    setSubmitting(false);
    setResultMessage({
      status: "none"
    });
  };

  var onClose = function onClose() {
    var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    closeParent();
  };

  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_26__.useCallback)(function () {
    setSubmitting(true);
    form.submit();
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_34__["default"], {
    result: resultMessage,
    successButtonOK: operation.key === "insert" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "Criar Novas Especifica\xE7\xF5es"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_33__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish,
    onValuesChange: onValuesChange,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FormLayout, {
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
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    field: {
      wide: [6, 8]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "designacao",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
    placeholder: "Designa\xE7\xE3o",
    size: "small"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectDebounceField, {
    placeholder: "Cliente",
    size: "small",
    keyField: "BPCNUM_0",
    textField: "BPCNAM_0",
    showSearch: true,
    showArrow: true,
    allowClear: true,
    fetchOptions: loadCustomersLookup
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.VerticalSpace, {
    height: "24px"
  })), !forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    field: {
      wide: [9, 7]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectDebounceField, {
    placeholder: "Cliente",
    size: "small",
    keyField: "BPCNUM_0",
    textField: "BPCNAM_0",
    showSearch: true,
    showArrow: true,
    allowClear: true,
    fetchOptions: loadCustomersLookup
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.VerticalSpace, {
    height: "24px"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    wide: 16,
    margin: false,
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    wide: 7
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    wide: 9,
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 4.5
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      textAlign: "center",
      fontWeight: 700
    }
  }, "TDS")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 50
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 4.5
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      textAlign: "center",
      fontWeight: 700
    }
  }, "Objetivo")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    wide: 7
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    wide: 9,
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 9
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "Min.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 9
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "M\xE1x.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 50
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 9
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "Min.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    },
    split: 9
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, "M\xE1x.")))), artigoSpecsItems.map(function (v, idx) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
      key: "gop-".concat(idx),
      wide: 16,
      field: {
        wide: [7, 9]
      },
      margin: false
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
      label: {
        enabled: false
      },
      style: {
        fontSize: "11px"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, v.designacao), " (", v.unidade, ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
      wide: 9,
      margin: false
    }, _toConsumableArray(Array(form.getFieldValue("nv-".concat(idx)))).map(function (x, i) {
      if (i % 2 === 0 && i !== 0) {
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, {
          key: "".concat(v.key, "-").concat(i)
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
          label: {
            enabled: false
          },
          split: 50
        }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
          split: 9,
          key: "".concat(v.key, "-").concat(i),
          name: "v".concat(v.key, "-").concat(i),
          label: {
            enabled: false
          }
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
          min: v.min,
          max: v.max,
          controls: false,
          size: "small",
          precision: v === null || v === void 0 ? void 0 : v.precision
        })));
      }

      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
        split: 9,
        key: "".concat(v.key, "-").concat(i),
        name: "v".concat(v.key, "-").concat(i),
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
        min: v.min,
        max: v.max,
        controls: false,
        size: "small",
        precision: v === null || v === void 0 ? void 0 : v.precision
      }));
    })));
  })))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_35__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
    disabled: submitting,
    type: "primary",
    onClick: onSubmit
  }, "Guardar")))));
});

/***/ }),

/***/ "./src/pages/planeamento/ordemFabrico/FormSpecs.jsx":
/*!**********************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormSpecs.jsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_9__);
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
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/EditOutlined.js");
/* harmony import */ var _artigo_FormSpecsUpsert__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ../artigo/FormSpecsUpsert */ "./src/pages/planeamento/artigo/FormSpecsUpsert.jsx");
/* harmony import */ var _FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");

















var _excluded = ["form", "guides", "schema", "fieldStatus"];

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }








function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



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
















var Drawer = function Drawer(_ref) {
  var showWrapper = _ref.showWrapper,
      setShowWrapper = _ref.setShowWrapper,
      parentReload = _ref.parentReload;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_24__.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      formTitle = _useState2[0],
      setFormTitle = _useState2[1];

  var iref = (0,react__WEBPACK_IMPORTED_MODULE_24__.useRef)();
  var _showWrapper$record = showWrapper.record,
      record = _showWrapper$record === void 0 ? {} : _showWrapper$record;

  var onVisible = function onVisible() {
    setShowWrapper(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        show: !prev.show
      });
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.WrapperForm, {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.TitleForm, {
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
    width: 800,
    bodyStyle: {
      height: "450px"
      /*  paddingBottom: 80 */

      /* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */

    },
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement("div", {
      ref: iref,
      id: "form-wrapper",
      style: {
        textAlign: 'right'
      }
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(_artigo_FormSpecsUpsert__WEBPACK_IMPORTED_MODULE_31__["default"], {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  }));
};

var loadArtigosSpecsLookup = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
    var produto_id, token, _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            produto_id = _ref2.produto_id, token = _ref2.token;
            _context.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_27__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_28__.API_URL, "/artigosspecslookup/"),
              filter: {
                produto_id: produto_id
              },
              sort: [],
              cancelToken: token
            });

          case 3:
            _yield$fetchPost = _context.sent;
            rows = _yield$fetchPost.data.rows;
            return _context.abrupt("return", rows);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function loadArtigosSpecsLookup(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var getArtigoSpecsItems = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref4) {
    var artigospecs_id, token, _yield$fetchPost2, rows;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            artigospecs_id = _ref4.artigospecs_id, token = _ref4.token;

            if (artigospecs_id) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", []);

          case 3:
            _context2.next = 5;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_27__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_28__.API_URL, "/artigospecsitemsget/"),
              filter: {
                artigospecs_id: artigospecs_id
              },
              sort: [],
              cancelToken: token
            });

          case 5:
            _yield$fetchPost2 = _context2.sent;
            rows = _yield$fetchPost2.data.rows;
            return _context2.abrupt("return", rows);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getArtigoSpecsItems(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref6) {
  var _ref6$changedValues = _ref6.changedValues,
      changedValues = _ref6$changedValues === void 0 ? {} : _ref6$changedValues;

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_24__.useContext)(_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_32__.OFabricoContext),
      form = _useContext.form,
      guides = _useContext.guides,
      schema = _useContext.schema,
      fieldStatus = _useContext.fieldStatus,
      ctx = _objectWithoutProperties(_useContext, _excluded);

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_24__.useState)(true),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_24__.useState)({
    show: false
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      showForm = _useState6[0],
      setShowForm = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_24__.useState)([]),
      _useState8 = _slicedToArray(_useState7, 2),
      artigosSpecs = _useState8[0],
      setArtigosSpecs = _useState8[1];

  (0,react__WEBPACK_IMPORTED_MODULE_24__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_27__.cancelToken)();
    loadData({
      artigospecs_id: form.getFieldValue("artigospecs_id"),
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel("Form Specs Cancelled");
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_24__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_27__.cancelToken)();

    if ("artigospecs_id" in changedValues) {
      setLoading(true);
      loadData({
        artigospecs_id: changedValues.artigospecs_id,
        token: cancelFetch
      });
    }

    return function () {
      return cancelFetch.cancel("Form Specs Cancelled");
    };
  }, [changedValues]);

  var loadData = function loadData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "init";
    var artigospecs_id = data.artigospecs_id,
        token = data.token;

    switch (type) {
      case "lookup":
        setLoading(true);

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.t0 = setArtigosSpecs;
                  _context3.next = 3;
                  return loadArtigosSpecsLookup({
                    produto_id: ctx.produto_id,
                    token: token
                  });

                case 3:
                  _context3.t1 = _context3.sent;
                  (0, _context3.t0)(_context3.t1);
                  setLoading(false);

                case 6:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }))();

        break;

      default:
        if (!loading) {
          setLoading(true);
        }

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var _artigosspecs, _artigosspecs$filter, _artigosspecs$filter2, artigoSpecs, artigoSpecsItems, fieldsValue, _iterator, _step, _step$value, i, v, vals, _iterator2, _step2, _step2$value, iV, vV;

          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _artigosspecs = artigosSpecs;

                  if (!ctx.produto_id) {
                    _context4.next = 6;
                    break;
                  }

                  _context4.next = 4;
                  return loadArtigosSpecsLookup({
                    produto_id: ctx.produto_id,
                    token: token
                  });

                case 4:
                  _artigosspecs = _context4.sent;
                  setArtigosSpecs(_artigosspecs);

                case 6:
                  if (!artigospecs_id) {
                    _context4.next = 16;
                    break;
                  }

                  _artigosspecs$filter = _artigosspecs.filter(function (v) {
                    return v.id === artigospecs_id;
                  }), _artigosspecs$filter2 = _slicedToArray(_artigosspecs$filter, 1), artigoSpecs = _artigosspecs$filter2[0];
                  _context4.next = 10;
                  return getArtigoSpecsItems({
                    artigospecs_id: artigospecs_id,
                    token: token
                  });

                case 10:
                  artigoSpecsItems = _context4.sent;
                  fieldsValue = {
                    nitems: artigoSpecsItems.length
                  };
                  _iterator = _createForOfIteratorHelper(artigoSpecsItems.entries());

                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                      _step$value = _slicedToArray(_step.value, 2), i = _step$value[0], v = _step$value[1];
                      fieldsValue["key-".concat(i)] = v.item_key;
                      fieldsValue["des-".concat(i)] = v.item_des;
                      fieldsValue["nv-".concat(i)] = v.item_nvalues;
                      vals = typeof v.item_values === "string" ? JSON.parse(v.item_values) : v.item_values;
                      _iterator2 = _createForOfIteratorHelper(vals.entries());

                      try {
                        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                          _step2$value = _slicedToArray(_step2.value, 2), iV = _step2$value[0], vV = _step2$value[1];
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

                  artigoSpecs = _objectSpread(_objectSpread({}, artigoSpecs), {}, {
                    cliente_cod: {
                      key: artigoSpecs.cliente_cod,
                      value: artigoSpecs.cliente_cod,
                      label: artigoSpecs.cliente_nome
                    }
                  });
                  form.setFieldsValue({
                    artigoSpecs: artigoSpecs,
                    artigoSpecsItems: fieldsValue
                  });

                case 16:
                  setLoading(false);

                case 17:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }))();

    }
  };

  var onShowForm = function onShowForm() {
    var newForm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var forInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (newForm) {
      setShowForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: {},
          forInput: forInput
        });
      });
    } else {
      setShowForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: _objectSpread({}, form.getFieldsValue(["artigospecs_id", "artigoSpecs", "artigoSpecsItems"])),
          forInput: forInput
        });
      });
    }
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(react__WEBPACK_IMPORTED_MODULE_24__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(antd__WEBPACK_IMPORTED_MODULE_33__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_34__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(Drawer, {
    showWrapper: showForm,
    setShowWrapper: setShowForm,
    parentReload: loadData
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FormLayout, {
    id: "LAY-ARTIGOSPECS",
    guides: guides,
    layout: "vertical",
    style: {
      width: "100%",
      padding: "0px"
      /* , minWidth: "700px" */

    },
    schema: schema,
    field: {
      //wide: [3, 2, 1, '*'],
      margin: "2px",
      overflow: false,
      guides: guides,
      label: {
        enabled: true,
        pos: "top",
        align: "start",
        vAlign: "center",
        width: "120px",
        wrap: false,
        overflow: false,
        colon: true,
        ellipsis: true
      },
      alert: {
        pos: "right",
        tooltip: true,
        container: true
        /* container: "el-external" */

      },
      layout: {
        top: "",
        right: "",
        center: "",
        bottom: "",
        left: ""
      },
      addons: {},
      //top|right|center|bottom|left
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_30__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
      allowClear: true,
      name: "artigospecs_id",
      layout: {
        center: "align-self:center;",
        right: "align-self:center;"
      },
      label: {
        enabled: true,
        text: "Especificações",
        pos: "left"
      },
      addons: _objectSpread({}, form.getFieldValue("artigospecs_id") && {
        right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(antd__WEBPACK_IMPORTED_MODULE_35__["default"], {
          onClick: function onClick() {
            return onShowForm(false, true);
          },
          style: {
            marginLeft: "3px"
          },
          size: "small"
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_36__["default"], {
          style: {
            fontSize: "16px"
          }
        }))
      })
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.SelectField, {
      allowClear: true,
      size: "small",
      data: artigosSpecs,
      keyField: "id",
      textField: "designacao",
      optionsRender: function optionsRender(d, keyField, textField) {
        return {
          label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement("div", {
            style: {
              display: "flex"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement("div", {
            style: {
              minWidth: "150px"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement("b", null, d[textField])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement("div", null, "v.", d["versao"])),
          value: d[keyField]
        };
      }
    }))),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(antd__WEBPACK_IMPORTED_MODULE_35__["default"], {
      onClick: function onClick() {
        return onShowForm(true, true);
      }
    }, "Novas Especifica\xE7\xF5es")
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, null, !loading && form.getFieldValue("artigospecs_id") && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_24__.createElement(_artigo_FormSpecsUpsert__WEBPACK_IMPORTED_MODULE_31__["default"], {
    record: form.getFieldsValue(true),
    wrapForm: false,
    forInput: false,
    parentReload: loadData
  })))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_planeamento_ordemFabrico_FormSpecs_jsx.chunk.js.map