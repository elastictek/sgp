"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_planeamento_ordemFabrico_FormAgg_jsx"],{

/***/ "./src/pages/planeamento/agg/FormAggUpsert.jsx":
/*!*****************************************************!*\
  !*** ./src/pages/planeamento/agg/FormAggUpsert.jsx ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_iconButton__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! components/iconButton */ "./src/components/iconButton.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ../ordemFabrico/FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
























function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


















var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_28__.getSchema)({}, keys, excludeKeys).unknown(true);
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

var loadAggsLookup = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var produto_id, agg_id, _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            produto_id = _ref.produto_id, agg_id = _ref.agg_id;
            _context.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_26__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_27__.API_URL, "/tempaggofabricolookup/"),
              filter: {
                status: 0,
                produto_id: produto_id,
                agg_id: agg_id
              },
              parameters: {
                group: false
              },
              sort: []
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

  return function loadAggsLookup(_x) {
    return _ref2.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref3) {
  var setFormTitle = _ref3.setFormTitle,
      parentRef = _ref3.parentRef,
      closeParent = _ref3.closeParent,
      parentReload = _ref3.parentReload,
      _ref3$wrapForm = _ref3.wrapForm,
      wrapForm = _ref3$wrapForm === void 0 ? "form" : _ref3$wrapForm,
      _ref3$forInput = _ref3.forInput,
      forInput = _ref3$forInput === void 0 ? true : _ref3$forInput;
  var ctx = (0,react__WEBPACK_IMPORTED_MODULE_23__.useContext)(_ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_34__.OFabricoContext);

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_35__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      submitting = _useState4[0],
      setSubmitting = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)({}),
      _useState6 = _slicedToArray(_useState5, 2),
      changedValues = _useState6[0],
      setChangedValues = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      formStatus = _useState8[0],
      setFormStatus = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)(false),
      _useState10 = _slicedToArray(_useState9, 2),
      guides = _useState10[0],
      setGuides = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)(setId(ctx.agg_id)),
      _useState12 = _slicedToArray(_useState11, 2),
      operation = _useState12[0],
      setOperation = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_23__.useState)({
    status: "none"
  }),
      _useState14 = _slicedToArray(_useState13, 2),
      resultMessage = _useState14[0],
      setResultMessage = _useState14[1];

  var init = function init() {
    var produto_id = ctx.produto_id,
        produto_cod = ctx.produto_cod,
        of_cod = ctx.of_cod,
        agg_id = ctx.agg_id;

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var aggsLookup, aggs;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return loadAggsLookup({
                produto_id: produto_id,
                agg_id: agg_id
              });

            case 2:
              aggsLookup = _context2.sent;
              setFormTitle && setFormTitle({
                title: "Agrupar Ordens Fabrico"
              });
              aggs = aggsLookup.filter(function (v) {
                return v.id == agg_id || v.agg_ofid_original == v.id;
              }).map(function (v) {
                return {
                  checked: agg_id === v.id ? 1 : 0,
                  tempof_id: v.tempof_id,
                  of_id: v.of_id,
                  artigo_cod: v.item_cod,
                  cliente_nome: v.cliente_nome,
                  iorder: v.iorder,
                  item_nome: v.item_nome,
                  enabled: of_cod == v.of_id ? false : true
                };
              });
              form.setFieldsValue({
                aggs: aggs
              });
              setLoading(false);

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  };

  (0,react__WEBPACK_IMPORTED_MODULE_23__.useEffect)(function () {
    init();
    return function () {};
  }, []);

  var onValuesChange = function onValuesChange(changedValues) {
    setChangedValues(changedValues);
  };

  var onFinish = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(values) {
      var response;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_26__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_27__.API_URL, "/savetempagg/"),
                parameters: _objectSpread(_objectSpread({}, values), {}, {
                  agg_id: ctx.agg_id
                })
              });

            case 2:
              response = _context3.sent;

              if (response.data.status !== "error") {
                parentReload({
                  agg_id: ctx.agg_id
                }, "init");
                setSubmitting(false);
                closeParent();
              } else {
                setSubmitting(false);
                setResultMessage(response.data);
              }

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function onFinish(_x2) {
      return _ref5.apply(this, arguments);
    };
  }();

  var onSuccessOK = function onSuccessOK() {
    if (operation.key === "insert") {
      setSubmitting(false);
      form.resetFields();
      init();
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

  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_23__.useCallback)(function () {
    setSubmitting(true);
    form.submit();
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(react__WEBPACK_IMPORTED_MODULE_23__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_32__["default"], {
    result: resultMessage,
    successButtonOK: operation.key === "insert" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "xxxx"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_30__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_35__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish,
    onValuesChange: onValuesChange,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FormLayout, {
    id: "LAY-AGG-UPSERT",
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
      guides: guides,
      label: {
        enabled: true,
        pos: "top"
        /* pos: (forInput ? "top" : "left"), align: (forInput ? "start" : "end"), vAlign: "center", width: "140px" */
        ,
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
        alignSelf: "center"
      }
    },
    fieldSet: {
      guides: guides,
      wide: 16,
      margin: false,
      layout: "horizontal",
      overflow: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_35__["default"].List, {
    name: "aggs"
  }, function (fields, _ref6) {
    _objectDestructuringEmpty(_ref6);

    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, {
      layout: "vertical",
      margin: false
    }, fields.map(function (field, index) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, {
        key: field.key,
        field: {
          wide: [1]
        },
        margin: "0px 0px 3px 0px",
        padding: "5px",
        style: {
          border: "solid 1px #d9d9d9",
          borderRadius: "3px"
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
        forInput: true,
        name: [field.name, "checked"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.CheckboxField, {
        disabled: form.getFieldValue(["aggs", field.name, "enabled"]) ? false : true
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, {
        margin: false,
        wide: 15,
        layout: "vertical"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, {
        field: {
          wide: [5, 5, 6],
          forViewBorder: false
        },
        margin: false,
        wide: 16,
        style: {
          fontWeight: 700
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
        forInput: false,
        name: [field.name, "of_id"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
        disabled: true,
        size: "small"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
        forInput: false,
        name: [field.name, "iorder"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
        disabled: true,
        size: "small"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
        forInput: false,
        name: [field.name, "artigo_cod"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
        disabled: true,
        size: "small"
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.FieldSet, {
        field: {
          wide: [7, 9],
          forViewBorder: false
        },
        margin: false,
        wide: 16
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
        forInput: false,
        name: [field.name, "cliente_nome"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
        disabled: true,
        size: "small"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_29__.Field, {
        forInput: false,
        name: [field.name, "item_nome"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
        disabled: true,
        size: "small"
      })))));
    }));
  }))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_33__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_23__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
    disabled: submitting,
    type: "primary",
    onClick: onSubmit
  }, "Guardar")))));
});

/***/ }),

/***/ "./src/pages/planeamento/ordemFabrico/FormAgg.jsx":
/*!********************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormAgg.jsx ***!
  \********************************************************/
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
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_9__);
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
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.number.to-fixed.js */ "./node_modules/core-js/modules/es.number.to-fixed.js");
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var components_YScroll__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/YScroll */ "./src/components/YScroll.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/collapse/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/card/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/list/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/PaperClipOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _agg_FormAggUpsert__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ../agg/FormAggUpsert */ "./src/pages/planeamento/agg/FormAggUpsert.jsx");
/* harmony import */ var ramda__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ramda */ "./node_modules/ramda/es/index.js");
/* harmony import */ var _ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ../ordemFabrico/FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
/* harmony import */ var _paletizacaoSchema_SvgSchema__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ../paletizacaoSchema/SvgSchema */ "./src/pages/planeamento/paletizacaoSchema/SvgSchema.jsx");
















var _excluded = ["form", "guides", "schema"];

var _templateObject, _templateObject2;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }



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

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }






















var Panel = antd__WEBPACK_IMPORTED_MODULE_35__["default"].Panel;



var FormPaletesStockUpsert = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_SwapOutlined_js"), __webpack_require__.e("src_pages_planeamento_paletesStock_FormPaletesStockUpsert_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ../paletesStock/FormPaletesStockUpsert */ "./src/pages/planeamento/paletesStock/FormPaletesStockUpsert.jsx"));
});
var FormPaletizacao = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_react-icons_cg_index_esm_js"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormPaletizacao_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./FormPaletizacao */ "./src/pages/planeamento/ordemFabrico/FormPaletizacao.jsx"));
});
var FormSettings = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.lazy(function () {
  return __webpack_require__.e(/*! import() */ "src_pages_planeamento_ordemFabrico_FormSettings_jsx").then(__webpack_require__.bind(__webpack_require__, /*! ./FormSettings */ "./src/pages/planeamento/ordemFabrico/FormSettings.jsx"));
});
var FormAttachments = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.lazy(function () {
  return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_ant-design_icons_es_icons_InboxOutlined_js-node_modules_antd_es_upload_i-ae3142"), __webpack_require__.e("src_pages_planeamento_ordemFabrico_FormAttachments_jsx")]).then(__webpack_require__.bind(__webpack_require__, /*! ./FormAttachments */ "./src/pages/planeamento/ordemFabrico/FormAttachments.jsx"));
});





var StyledCard = (0,styled_components__WEBPACK_IMPORTED_MODULE_40__["default"])(antd__WEBPACK_IMPORTED_MODULE_41__["default"])(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    .ant-card-body{\n        height:250px;\n        max-height:400px; \n        overflow-y:hidden;\n    }\n\n"])));
var StyledCollapse = (0,styled_components__WEBPACK_IMPORTED_MODULE_40__["default"])(antd__WEBPACK_IMPORTED_MODULE_35__["default"])(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n\n    .ant-collapse-header{\n        background-color:#f5f5f5;\n        border-radius: 2px!important;\n        padding:1px 1px!important;\n    }\n    .ant-collapse-content > .ant-collapse-content-box{\n        padding:15px 15px!important;\n    }\n\n"])));

var Drawer = function Drawer(_ref) {
  var showWrapper = _ref.showWrapper,
      setShowWrapper = _ref.setShowWrapper,
      parentReload = _ref.parentReload;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      formTitle = _useState2[0],
      setFormTitle = _useState2[1];

  var iref = (0,react__WEBPACK_IMPORTED_MODULE_27__.useRef)();
  var _showWrapper$record = showWrapper.record,
      record = _showWrapper$record === void 0 ? {} : _showWrapper$record;

  var onVisible = function onVisible() {
    setShowWrapper(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        show: !prev.show
      });
    });
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.WrapperForm, {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.TitleForm, {
      title: formTitle.title,
      subTitle: formTitle.subTitle
    }),
    type: showWrapper.mode,
    destroyOnClose: true,
    width: 800,
    mask: true
    /* style={{ maginTop: "48px" }} */
    ,
    setVisible: onVisible,
    visible: showWrapper.show,
    bodyStyle: {
      height: "450px"
      /*  paddingBottom: 80 */

      /* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */

    },
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      ref: iref,
      id: "form-wrapper",
      style: {
        textAlign: 'right'
      }
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_YScroll__WEBPACK_IMPORTED_MODULE_34__["default"], null, !showWrapper.type && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_agg_FormAggUpsert__WEBPACK_IMPORTED_MODULE_36__["default"], {
    setFormTitle: setFormTitle
    /* record={record} */
    ,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  }), showWrapper.type === "paletes_stock" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(FormPaletesStockUpsert, {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  })), showWrapper.type === "schema" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(FormPaletizacao, {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  })), showWrapper.type === "settings" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(FormSettings, {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  })), showWrapper.type === "attachments" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Suspense, {
    fallback: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(FormAttachments, {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  }))));
};

var loadAggsLookup = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(produto_id, token) {
    var _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_31__.API_URL, "/tempaggofabricolookup/"),
              filter: {
                status: 6,
                produto_id: produto_id
              },
              sort: [],
              cancelToken: token
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

  return function loadAggsLookup(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var loadPaletesGet = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(tempof_id) {
    var _yield$fetchPost2, rows;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_31__.API_URL, "/paletesstockget/"),
              parameters: {},
              pagination: {
                enabled: false
              },
              filter: {
                of_id: tempof_id
              },
              sort: []
            });

          case 2:
            _yield$fetchPost2 = _context2.sent;
            rows = _yield$fetchPost2.data.rows;
            return _context2.abrupt("return", rows);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function loadPaletesGet(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var PaletesStock = function PaletesStock(_ref4) {
  var item = _ref4.item;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row-reverse"
    }
  }, item.paletesstock && item.paletesstock.map(function (v, idx) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        flex: "1 1 80px"
      },
      key: "ps-".concat(item.tempof_id, "-").concat(idx)
    }, v);
  }));
};

var CardAgg = function CardAgg(_ref5) {
  var _aggItem$paletesstock, _aggItem$paletesstock2;

  var aggItem = _ref5.aggItem,
      setShowForm = _ref5.setShowForm,
      of_id = _ref5.of_id;
  var paletes = JSON.parse(aggItem === null || aggItem === void 0 ? void 0 : aggItem.n_paletes);

  var onAction = function onAction(op) {
    switch (op) {
      case 'paletes_stock':
        setShowForm(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            type: op,
            mode: "drawer",
            show: !prev.show,
            record: {
              /* aggItem, */
              aggItem: aggItem,
              of_id: of_id
            }
          });
        });
        break;

      case 'schema':
        setShowForm(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            type: op,
            mode: "drawer",
            show: !prev.show,
            record: {
              /* aggItem, */
              aggItem: aggItem,
              of_id: of_id
            }
          });
        });
        break;

      case 'settings':
        console.log("sssss", aggItem, of_id);
        setShowForm(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            type: op,
            mode: "drawer",
            show: !prev.show,
            record: {
              /* aggItem, */
              aggItem: aggItem,
              of_id: of_id
            }
          });
        });
        break;

      case 'attachments':
        setShowForm(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            type: op,
            mode: "drawer",
            show: !prev.show,
            record: {
              /* aggItem, */
              aggItem: aggItem,
              of_id: of_id
            }
          });
        });
        break;
    }
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"].Item, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(StyledCard, {
    hoverable: true,
    style: {
      width: '100%'
      /* , height:"300px", maxHeight:"400px", overflowY:"auto" */

    },
    headStyle: {
      backgroundColor: "#002766",
      color: "#fff"
    },
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "14px"
      }
    }, aggItem.of_id), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        color: "#fff",
        fontSize: ".7rem"
      }
    }, aggItem.item_cod, " - ", aggItem.cliente_nome)),
    size: "small",
    actions: [/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      key: "settings",
      onClick: function onClick() {
        return onAction('settings');
      },
      title: "Outras defini\xE7\xF5es"
    }, "Defini\xE7\xF5es"),
    /*#__PURE__*/

    /* <FaPallet key="schema" onClick={() => onAction('schema')} title="Paletização (Esquema)" />, */

    /* <FaWarehouse key="paletes" onClick={() => onAction('paletes_stock')} title="Paletes em Stock" />, */
    react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      key: "schema",
      onClick: function onClick() {
        return onAction('schema');
      },
      title: "Paletiza\xE7\xE3o (Esquema)"
    }, "Paletiza\xE7\xE3o"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      key: "paletes",
      onClick: function onClick() {
        return onAction('paletes_stock');
      }
    }, "Stock"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      key: "attachments",
      onClick: function onClick() {
        return onAction('attachments');
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("span", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_43__["default"], null), "Anexos"))
    /* <div key="quantity" onClick={() => onAction('quantity')} title="Quantidades">Quantidades</div> */

    /*<SettingOutlined key="settings" onClick={() => onAction('settings')} title="Outras definições" />,*/

    /*<MdProductionQuantityLimits key="quantity" onClick={() => onAction('quantity')} title="Quantidades" />*/

    /*                     <EditOutlined key="edit" />,
                        <EllipsisOutlined key="ellipsis" />, */
    ]
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_YScroll__WEBPACK_IMPORTED_MODULE_34__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    wide: 16,
    margin: false,
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(StyledCollapse, {
    defaultActiveKey: ['1'],
    expandIconPosition: "right",
    bordered: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(Panel, {
    header: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, "Encomenda")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, aggItem.qty_encomenda, " m\xB2")),
    key: "1"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, aggItem.linear_meters.toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "m/bobine")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, aggItem.sqm_bobine.toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "m\xB2/bobine")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, (aggItem.qty_encomenda / aggItem.sqm_bobine).toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "bobines")), (paletes === null || paletes === void 0 ? void 0 : paletes.items) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, paletes.total.n_paletes.toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "paletes")), (paletes === null || paletes === void 0 ? void 0 : paletes.items) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, paletes.total.sqm_contentor.toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "m\xB2/contentor")), (paletes === null || paletes === void 0 ? void 0 : paletes.items) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, (aggItem.qty_encomenda / paletes.total.sqm_contentor).toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "contentores"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(Panel, {
    header: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, "Paletiza\xE7\xE3o"))),
    key: "2"
  }, (paletes === null || paletes === void 0 ? void 0 : paletes.items) && paletes.items.map(function (v, idx) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        borderBottom: "20px"
      },
      key: "pc-".concat(aggItem.name, "-").concat(v.id)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottom: "solid 1px #d9d9d9"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, "Palete"), " ", idx + 1), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, "Bobines"), " ", v.num_bobines)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        color: "#595959"
      }
    }, "m\xB2"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, v.sqm_palete.toFixed(2))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        color: "#595959"
      }
    }, "N\xBA Paletes"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, (paletes.total.n_paletes / paletes.items.length).toFixed(2))));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_paletizacaoSchema_SvgSchema__WEBPACK_IMPORTED_MODULE_39__["default"], {
    items: aggItem,
    width: "100%",
    height: "100%"
  })), (aggItem === null || aggItem === void 0 ? void 0 : (_aggItem$paletesstock = aggItem.paletesstock) === null || _aggItem$paletesstock === void 0 ? void 0 : _aggItem$paletesstock.length) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(Panel, {
    header: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, aggItem === null || aggItem === void 0 ? void 0 : (_aggItem$paletesstock2 = aggItem.paletesstock) === null || _aggItem$paletesstock2 === void 0 ? void 0 : _aggItem$paletesstock2.length, " Paletes de Stock"))),
    key: "3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
    style: {
      height: "150px",
      overflowY: "hidden"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_YScroll__WEBPACK_IMPORTED_MODULE_34__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(PaletesStock, {
    item: aggItem
  })))))))));
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref6) {
  _objectDestructuringEmpty(_ref6);

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_27__.useContext)(_ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_38__.OFabricoContext),
      form = _useContext.form,
      guides = _useContext.guides,
      schema = _useContext.schema,
      ctx = _objectWithoutProperties(_useContext, _excluded); //temp_ofabrico_agg, item_id, form, guides, schema


  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)(true),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)({
    show: false,
    type: null
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      showForm = _useState6[0],
      setShowForm = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)([]),
      _useState8 = _slicedToArray(_useState7, 2),
      aggs = _useState8[0],
      setAggs = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)(),
      _useState10 = _slicedToArray(_useState9, 2),
      aggId = _useState10[0],
      setAggId = _useState10[1];

  (0,react__WEBPACK_IMPORTED_MODULE_27__.useEffect)(function () {
    /*         console.log("FORM-AGG->", ctx) */
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.cancelToken)();
    loadData({
      agg_id: ctx.agg_id,
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel("Form Agg Cancelled");
    };
  }, []);
  /*     useEffect(() => {
          const cancelFetch = cancelToken();
          if (changedValues) {
              console.log("CHANGED",changedValues)
              if ("agg_id" in changedValues) {
                  setLoading(true);
                  loadData({ agg_id: changedValues.agg_id, token: cancelFetch });
              }
          }
          return (() => cancelFetch.cancel("Form Agg Cancelled"));
      }, [changedValues]); */

  var loadData = function loadData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "init";
    var agg_id = data.agg_id,
        token = data.token;

    switch (type) {
      case "lookup":
        setLoading(true);

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.t0 = setAggs;
                  _context3.next = 3;
                  return loadAggsLookup(ctx.produto_id, token);

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
          var _aggs$;

          var _aggs, ret;

          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return loadAggsLookup(ctx.produto_id, token);

                case 2:
                  _aggs = _context4.sent;
                  setAggs(_aggs);
                  console.log("LOAD-DATA-AGG", agg_id);

                  if (agg_id && (_aggs$ = _aggs[0]) !== null && _aggs$ !== void 0 && _aggs$.v) {
                    //const { id, group_id, group_ofid, group_item_cod, group_qty_item } = _aggs[0].v.filter(v => v.id == agg_of_id)[0];
                    ret = _aggs[0].v.filter(function (v) {
                      return v.id == agg_id;
                    }); //setAggId({ id, group_id: group_id.split(','), group_ofid: group_ofid.split(','), group_item_cod: group_item_cod.split(','), group_qty_item: group_qty_item.split(',') });

                    console.log("CHANGED", _aggs[0].v.filter(function (v) {
                      return v.id == agg_id;
                    }));
                    setAggId(_aggs[0].v.filter(function (v) {
                      return v.id == agg_id;
                    })); //console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx", { id, group_id: group_id.split(','), group_ofid: group_ofid.split(','), group_item_cod: group_item_cod.split(','), group_qty_item: group_qty_item.split(',') });
                    //form.setFieldsValue({ thikness: THICKNESS });
                    // let [artigoSpecs] = _artigosspecs.filter(v => v.id === artigospecs_id);
                    // const artigoSpecsItems = await getArtigoSpecsItems({ artigospecs_id });
                    // const fieldsValue = { nitems: artigoSpecsItems.length };
                    // for (let [i, v] of artigoSpecsItems.entries()) {
                    //     fieldsValue[`key-${i}`] = v.item_key;
                    //     fieldsValue[`des-${i}`] = v.item_des;
                    //     const vals = (typeof v.item_values === "string") ? JSON.parse(v.item_values) : v.item_values;
                    //     for (let [iV, vV] of vals.entries()) {
                    //         fieldsValue[`v${v.item_key}-${iV}`] = vV;
                    //     }
                    // }
                    // artigoSpecs = { ...artigoSpecs, cliente_cod: { key: artigoSpecs.cliente_cod, value: artigoSpecs.cliente_cod, label: artigoSpecs.cliente_nome } };
                    // form.setFieldsValue({ artigoSpecs, artigoSpecsItems: fieldsValue });
                  }

                  setLoading(false);

                case 7:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }))();

    }
  };

  var onShowForm = function
    /* newForm = false */
  onShowForm() {
    /* const { produto_id, produto_cod, ofabrico, temp_ofabrico_agg, temp_ofabrico } = ctx; */

    /* if (newForm) { */
    setShowForm(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        type: null,
        show: !prev.show
        /* record: { produto_id, produto_cod, ofabrico, temp_ofabrico_agg, temp_ofabrico } */

      });
    });
    /* } else { */
    //setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(true) } }));

    /* } */
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_44__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_45__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(Drawer, {
    showWrapper: showForm,
    setShowWrapper: setShowForm,
    parentReload: loadData
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FormLayout, {
    id: "LAY-AGGS",
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
        width: "180px",
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_33__["default"], {
    style: {
      width: "100%"
    }
    /* left={<FieldSet>
        <Field name="thikness" wide={11} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, width: "100px", text: "Espessura", pos: "left" }}>
            <SelectField size="small" data={THICKNESS} keyField="t" textField="t"
                optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "100px" }}><b>{d[textField]} &#x00B5;</b></div></div>, value: d[keyField] })}
            />
        </Field>
    </FieldSet>} */
    ,
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
      onClick: function onClick() {
        return onShowForm();
      }
    }, "Agrupar")
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false
  }, aggId &&
  /*#__PURE__*/

  /*                             <Form.List name="agg" initialValue={aggId}>
                                  {(fields, { add, remove, move }) => {
                                      return ( */
  react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
    style: {
      width: "100%"
    },
    grid: {
      gutter: 16,
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 2,
      xxl: 2
    },
    size: "small",
    dataSource: aggId,
    renderItem: function renderItem(aggItem) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(CardAgg, {
        aggItem: aggItem
        /* aggItem={aggId[item.name]} */
        ,
        of_id: ctx.of_id,
        setShowForm: setShowForm
      });
    }
  })
  /*                                     )
                                  }}
                              </Form.List> */
  ))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_planeamento_ordemFabrico_FormAgg_jsx.chunk.js.map