"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_planeamento_ordemFabrico_FormPaletizacao_jsx"],{

/***/ "./src/pages/planeamento/ordemFabrico/FormPaletizacao.jsx":
/*!****************************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormPaletizacao.jsx ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/EditOutlined.js");
/* harmony import */ var _paletizacaoSchema_FormPaletizacaoSchema__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ../paletizacaoSchema/FormPaletizacaoSchema */ "./src/pages/planeamento/paletizacaoSchema/FormPaletizacaoSchema.jsx");
/* harmony import */ var _FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
























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


















var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_26__.getSchema)({}, keys, excludeKeys).unknown(true);
};

var Drawer = function Drawer(_ref) {
  var showWrapper = _ref.showWrapper,
      setShowWrapper = _ref.setShowWrapper,
      parentReload = _ref.parentReload;

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

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.WrapperForm, {
    title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.TitleForm, {
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
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
      ref: iref,
      id: "form-wrapper",
      style: {
        textAlign: 'right'
      }
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(_paletizacaoSchema_FormPaletizacaoSchema__WEBPACK_IMPORTED_MODULE_31__["default"], {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  }));
};

var loadPaletizacoesLookup = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
    var artigo_cod, cliente_cod, token, _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            artigo_cod = _ref2.artigo_cod, cliente_cod = _ref2.cliente_cod, token = _ref2.token;
            _context.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_25__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_27__.API_URL, "/paletizacoeslookup/"),
              filter: {
                artigo_cod: artigo_cod,
                cliente_cod: cliente_cod
              },
              sort: [{
                column: 'contentor_id'
              }, {
                column: 'designacao'
              }],
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

  return function loadPaletizacoesLookup(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var getPaletizacaoDetails = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref4) {
    var paletizacao_id, token, _yield$fetchPost2, rows;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            paletizacao_id = _ref4.paletizacao_id, token = _ref4.token;

            if (paletizacao_id) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", []);

          case 3:
            _context2.next = 5;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_25__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_27__.API_URL, "/paletizacaodetailsget/"),
              filter: {
                paletizacao_id: paletizacao_id
              },
              sort: [{
                column: 'item_order',
                direction: 'DESC'
              }],
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

  return function getPaletizacaoDetails(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref6) {
  var record = _ref6.record,
      setFormTitle = _ref6.setFormTitle,
      parentRef = _ref6.parentRef,
      closeParent = _ref6.closeParent,
      parentReload = _ref6.parentReload;

  /* const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext); */
  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_33__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      guides = _useState4[0],
      setGuides = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)(true),
      _useState6 = _slicedToArray(_useState5, 2),
      loading = _useState6[0],
      setLoading = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)(false),
      _useState8 = _slicedToArray(_useState7, 2),
      submitting = _useState8[0],
      setSubmitting = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)(setId(record.aggItem.paletizacao_id)),
      _useState10 = _slicedToArray(_useState9, 2),
      operation = _useState10[0],
      setOperation = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)({
    show: false
  }),
      _useState12 = _slicedToArray(_useState11, 2),
      showSchema = _useState12[0],
      setShowSchema = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)([]),
      _useState14 = _slicedToArray(_useState13, 2),
      paletizacoes = _useState14[0],
      setPaletizacoes = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)({}),
      _useState16 = _slicedToArray(_useState15, 2),
      changedValues = _useState16[0],
      setChangedValues = _useState16[1];

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_22__.useState)({
    status: "none"
  }),
      _useState18 = _slicedToArray(_useState17, 2),
      resultMessage = _useState18[0],
      setResultMessage = _useState18[1];

  var init = function init() {
    setFormTitle && setFormTitle({
      title: "Esquema de Paletiza\xE7\xE3o ".concat(record.aggItem.cliente_nome),
      subTitle: "".concat(record.aggItem.item_cod)
    });
  };

  (0,react__WEBPACK_IMPORTED_MODULE_22__.useEffect)(function () {
    console.log("zzzz", form.getFieldsValue(true));
    init();
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_22__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_25__.cancelToken)();
    loadData({
      paletizacao_id: "paletizacao_id" in changedValues ? changedValues.paletizacao_id : record.aggItem.paletizacao_id,
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel("Form Paletização Cancelled");
    };
  }, [changedValues]);

  var onValuesChange = function onValuesChange(changedValues, allValues) {
    if ("paletizacao_id" in changedValues) {
      setChangedValues(changedValues);
    }
  };

  var onFinish = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(values) {
      var paletizacao_id, _record$aggItem, ofabrico_id, ofabrico_cod, qty_item, artigo, response;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              paletizacao_id = form.getFieldValue("paletizacao_id");
              _record$aggItem = record.aggItem, ofabrico_id = _record$aggItem.tempof_id, ofabrico_cod = _record$aggItem.of_id, qty_item = _record$aggItem.qty_encomenda;
              artigo = {
                artigo_thickness: record.aggItem.artigo.thickness,
                artigo_diam: record.aggItem.artigo.diam_ref,
                artigo_core: record.aggItem.artigo.core,
                artigo_width: record.aggItem.artigo.lar,
                qty_item: record.aggItem.qty_encomenda
              };
              _context3.next = 5;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_25__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_27__.API_URL, "/savetempordemfabrico/"),
                parameters: {
                  type: "paletizacao",
                  paletizacao_id: paletizacao_id,
                  ofabrico_id: ofabrico_id,
                  ofabrico_cod: ofabrico_cod,
                  artigo: artigo
                }
              });

            case 5:
              response = _context3.sent;

              if (response.data.status !== "error") {
                parentReload({
                  agg_id: record.aggItem.id
                });
                closeParent();
              }

              setSubmitting(false); // const status = { error: [], warning: [], info: [], success: [] };
              // const msgKeys = ["start_date", "start_hour", "end_date", "end_hour"];
              // const { cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, item_id } = record;
              // const { core_cod: { value: core_cod, label: core_des } = {} } = values;
              // const { cortes_id, cortesordem_id } = form.getFieldsValue(true);
              // let diff = {};
              // const v = schema().custom((v, h) => {
              //     const { start_date, start_hour, end_date, end_hour } = v;
              //     diff = dateTimeDiffValidator(start_date, start_hour, end_date, end_hour);
              //     if (diff.errors == true) {
              //         return h.message("A Data de Fim tem de ser Maior que a Data de Início", { key: "start_date", label: "start_date" })
              //     }
              // }).validate(values, { abortEarly: false });
              // status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
              // status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
              // if (!v.error) { }
              // if (status.error.length === 0) {
              //     const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { ...values, cliente_cod, cliente_nome, iorder, item, item_id, ofabrico, core_cod, core_des, produto_id, cortes_id, cortesordem_id } });
              //     setResultMessage(response.data);
              // }
              // setFieldStatus(diff.fields);
              // setFormStatus(status);

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function onFinish(_x3) {
      return _ref7.apply(this, arguments);
    };
  }();
  /*     useEffect(() => {
          const cancelFetch = cancelToken();
          if ("paletizacao_id" in changedValues) {
              setLoading(true);
              loadData({ paletizacao_id: changedValues.paletizacao_id, token: cancelFetch });
          }
          return (() => cancelFetch.cancel("Form Paletização Cancelled"));
      }, [changedValues]); */


  var loadData = function loadData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "init";
    var paletizacao_id = data.paletizacao_id,
        token = data.token;

    switch (type) {
      case "lookup":
        setLoading(true);

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.t0 = setPaletizacoes;
                  _context4.next = 3;
                  return loadPaletizacoesLookup({
                    artigo_cod: record.aggItem.item_cod,
                    cliente_cod: record.aggItem.cliente_cod,
                    token: token
                  });

                case 3:
                  _context4.t1 = _context4.sent;
                  (0, _context4.t0)(_context4.t1);
                  setLoading(false);

                case 6:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }))();

        break;

      default:
        if (!loading) {
          setLoading(true);
        }

        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          var _paletizacoes, _paletizacoes$filter, _paletizacoes$filter2, paletizacao, paletizacaoDetails;

          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _paletizacoes = paletizacoes;

                  if (!record.aggItem.item_cod) {
                    _context5.next = 6;
                    break;
                  }

                  _context5.next = 4;
                  return loadPaletizacoesLookup({
                    artigo_cod: record.aggItem.item_cod,
                    cliente_cod: record.aggItem.cliente_cod,
                    token: token
                  });

                case 4:
                  _paletizacoes = _context5.sent;
                  setPaletizacoes(_paletizacoes);

                case 6:
                  if (!paletizacao_id) {
                    _context5.next = 12;
                    break;
                  }

                  _paletizacoes$filter = _paletizacoes.filter(function (v) {
                    return v.id === paletizacao_id;
                  }), _paletizacoes$filter2 = _slicedToArray(_paletizacoes$filter, 1), paletizacao = _paletizacoes$filter2[0];
                  _context5.next = 10;
                  return getPaletizacaoDetails({
                    paletizacao_id: paletizacao_id,
                    token: token
                  });

                case 10:
                  paletizacaoDetails = _context5.sent;
                  form.setFieldsValue(_objectSpread(_objectSpread({}, paletizacao), {}, {
                    paletizacao_id: paletizacao.id,
                    paletizacao: _toConsumableArray(paletizacaoDetails)
                  }));

                case 12:
                  setLoading(false);

                case 13:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }))();

    }
  };

  var onShowSchema = function onShowSchema() {
    var newSchema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var forInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var _record$aggItem2 = record.aggItem,
        cliente_cod = _record$aggItem2.cliente_cod,
        cliente_nome = _record$aggItem2.cliente_nome,
        item_cod = _record$aggItem2.item_cod,
        paletizacao_id = _record$aggItem2.paletizacao_id;

    if (newSchema) {
      setShowSchema(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: {
            cliente_cod: cliente_cod,
            cliente_nome: cliente_nome,
            artigo_cod: item_cod,
            paletizacao_id: paletizacao_id
          },
          forInput: forInput
        });
      });
    } else {
      setShowSchema(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: _objectSpread({}, form.getFieldsValue(true)),
          forInput: forInput
        });
      });
    }
  };

  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_22__.useCallback)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            setSubmitting(true);
            form.submit();

          case 2:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  })), []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(react__WEBPACK_IMPORTED_MODULE_22__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_34__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_35__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(Drawer, {
    showWrapper: showSchema,
    setShowWrapper: setShowSchema,
    parentReload: loadData
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_33__["default"], {
    form: form,
    name: "form-of-paletizacao",
    onFinish: onFinish,
    onValuesChange: onValuesChange
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FormLayout, {
    id: "LAY-PALETIZACAO",
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

        /* width: "80px", */
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_29__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.Field, {
      name: "paletizacao_id",
      layout: {
        center: "align-self:center;",
        right: "align-self:center;"
      },
      label: {
        enabled: true,
        text: "Paletização",
        pos: "left"
      },
      addons: _objectSpread({}, form.getFieldValue("paletizacao_id") && {
        right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
          onClick: function onClick() {
            return onShowSchema();
          },
          style: {
            marginLeft: "3px"
          },
          size: "small"
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_37__["default"], {
          style: {
            fontSize: "16px"
          }
        }))
      })
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.SelectField, {
      allowClear: true,
      size: "small",
      data: paletizacoes,
      keyField: "id",
      textField: "designacao",
      optionsRender: function optionsRender(d, keyField, textField) {
        return {
          label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
            style: {
              display: "flex"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
            style: {
              width: "70px"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("b", null, d["contentor_id"])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
            style: {
              flex: 1
            }
          }, d[textField]), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement("div", {
            style: {
              width: "20px"
            }
          }, "v.", d["versao"])),
          value: d[keyField]
        };
      }
    }))),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
      onClick: function onClick() {
        return onShowSchema(true);
      }
    }, "Novo Esquema")
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_28__.FieldSet, null, !loading && form.getFieldValue("paletizacao_id") && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(_paletizacaoSchema_FormPaletizacaoSchema__WEBPACK_IMPORTED_MODULE_31__["default"], {
    record: form.getFieldsValue(true),
    wrapForm: false,
    forInput: false,
    parentReload: loadData
  })))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_30__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22__.createElement(antd__WEBPACK_IMPORTED_MODULE_36__["default"], {
    disabled: submitting,
    onClick: onSubmit,
    type: "primary"
  }, "Guardar")))));
});

/***/ }),

/***/ "./src/pages/planeamento/paletizacaoSchema/FormPaletizacaoSchema.jsx":
/*!***************************************************************************!*\
  !*** ./src/pages/planeamento/paletizacaoSchema/FormPaletizacaoSchema.jsx ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
/* harmony import */ var core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_includes_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_19__);
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
/* harmony import */ var components_iconButton__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/iconButton */ "./src/components/iconButton.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/PlusOutlined.js");
/* harmony import */ var react_icons_cg__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! react-icons/cg */ "./node_modules/react-icons/cg/index.esm.js");
/* harmony import */ var _ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ../ordemFabrico/FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");
/* harmony import */ var _paletizacaoSchema_SvgSchema__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ../paletizacaoSchema/SvgSchema */ "./src/pages/planeamento/paletizacaoSchema/SvgSchema.jsx");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }



























function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }





















var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_31__.getSchema)({
    npaletes: joi__WEBPACK_IMPORTED_MODULE_28___default().number().positive().label("Paletes/Contentor").required(),
    palete_maxaltura: joi__WEBPACK_IMPORTED_MODULE_28___default().number().positive().precision(2).label("Altura Máx. Palete (metros)").required(),
    //designacao: Joi.string().label("Designação").required(),
    netiquetas_bobine: joi__WEBPACK_IMPORTED_MODULE_28___default().number().positive().precision(2).label("Etiqueta/Bobine").required(),
    netiquetas_lote: joi__WEBPACK_IMPORTED_MODULE_28___default().number().positive().precision(2).label("Etiqueta do Lote da Palete").required(),
    netiquetas_final: joi__WEBPACK_IMPORTED_MODULE_28___default().number().positive().precision(2).label("Etiqueta Final da Palete").required(),
    folha_identificativa: joi__WEBPACK_IMPORTED_MODULE_28___default().number().min(0).precision(2).label("Folha Identificativa Palete").required(),
    cintas: joi__WEBPACK_IMPORTED_MODULE_28___default().number().valid(0, 1),
    ncintas: joi__WEBPACK_IMPORTED_MODULE_28___default().when('cintas', {
      is: 1,
      then: joi__WEBPACK_IMPORTED_MODULE_28___default().number().positive().required()
    }),
    paletizacao: joi__WEBPACK_IMPORTED_MODULE_28___default().array().min(1).label("Items da Paletização").required()
  }, keys, excludeKeys).unknown(true);
};

var SubFormPalete = function SubFormPalete(_ref) {
  var form = _ref.form,
      field = _ref.field,
      remove = _ref.remove,
      move = _ref.move,
      index = _ref.index,
      length = _ref.length,
      operation = _ref.operation,
      forInput = _ref.forInput;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(1),
      _useState2 = _slicedToArray(_useState, 2),
      item = _useState2[0],
      setItem = _useState2[1];

  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    if (operation.key === "update") {
      setItem(form.getFieldValue(["paletizacao", field.name, "item_id"]));
    }
  }, []);

  var onSelect = function onSelect(f) {
    setItem(form.getFieldValue(["paletizacao", f, "item_id"]));
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    layout: "horizontal",
    field: {
      wide: [1, 1, 8, 5, 1]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }, forInput && index > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_iconButton__WEBPACK_IMPORTED_MODULE_34__["default"], {
    onClick: function onClick() {
      return move(index, index - 1);
    },
    style: {
      alignSelf: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react_icons_cg__WEBPACK_IMPORTED_MODULE_39__.CgArrowUpO, null))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }, forInput && index < length - 1 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_iconButton__WEBPACK_IMPORTED_MODULE_34__["default"], {
    onClick: function onClick() {
      return move(index, index + 1);
    },
    style: {
      alignSelf: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react_icons_cg__WEBPACK_IMPORTED_MODULE_39__.CgArrowDownO, null))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    label: {
      enabled: false
    },
    name: [field.name, "item_id"]
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
    onChange: function onChange() {
      return onSelect(field.name);
    },
    size: "small",
    data: config__WEBPACK_IMPORTED_MODULE_30__.PALETIZACAO_ITEMS,
    keyField: "key",
    textField: "value"
  })), item === 1 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    label: {
      enabled: false
    },
    name: [field.name, "item_paletesize"]
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
    size: "small",
    data: config__WEBPACK_IMPORTED_MODULE_30__.PALETE_SIZES,
    keyField: "key",
    textField: "value"
  })), item === 2 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    label: {
      enabled: false
    },
    name: [field.name, "item_numbobines"]
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 1,
    max: 80
  })), (item > 2 || item === undefined) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_iconButton__WEBPACK_IMPORTED_MODULE_34__["default"], {
    onClick: function onClick() {
      return remove(field.name);
    },
    style: {
      alignSelf: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react_icons_cg__WEBPACK_IMPORTED_MODULE_39__.CgCloseO, null))));
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
  var ctx = (0,react__WEBPACK_IMPORTED_MODULE_26__.useContext)(_ordemFabrico_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_37__.OFabricoContext);

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_41__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(true),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      submitting = _useState6[0],
      setSubmitting = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState8 = _slicedToArray(_useState7, 2),
      changedValues = _useState8[0],
      setChangedValues = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState10 = _slicedToArray(_useState9, 2),
      formStatus = _useState10[0],
      setFormStatus = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState12 = _slicedToArray(_useState11, 2),
      guides = _useState12[0],
      setGuides = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(setId(record.paletizacao_id)),
      _useState14 = _slicedToArray(_useState13, 2),
      operation = _useState14[0],
      setOperation = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    status: "none"
  }),
      _useState16 = _slicedToArray(_useState15, 2),
      resultMessage = _useState16[0],
      setResultMessage = _useState16[1];

  var init = function init() {
    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (operation.key === "update") {
                setFormTitle && setFormTitle({
                  title: "Editar Esquema de Paletiza\xE7\xE3o ".concat(record.cliente_nome),
                  subTitle: "".concat(record.artigo_cod)
                });
                form.setFieldsValue(_objectSpread({}, record));
              } else {
                setFormTitle && setFormTitle({
                  title: "Novo Esquema de Paletiza\xE7\xE3o ".concat(record.cliente_nome),
                  subTitle: "".concat(record.artigo_cod)
                });
                form.setFieldsValue({
                  contentor_id: "Camião",
                  cintas_palete: 1,
                  ncintas: 2,
                  netiquetas_bobine: 2,
                  netiquetas_lote: 4,
                  netiquetas_final: 1,
                  npaletes: 24,
                  palete_maxaltura: 2.55,
                  folha_identificativa: 1
                });
              }

              setLoading(false);

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  };

  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    init();
  }, []);

  var onValuesChange = function onValuesChange(changedValues, allValues) {
    setChangedValues(changedValues);
  };

  var onFinish = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(values) {
      var _v$error;

      var status, msgKeys, v, response;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              msgKeys = ["paletizacao"];
              v = schema().validate(values, {
                abortEarly: false
              });
              status.error = [].concat(_toConsumableArray(status.error), _toConsumableArray(v.error ? (_v$error = v.error) === null || _v$error === void 0 ? void 0 : _v$error.details.filter(function (v) {
                return msgKeys.includes(v.context.key);
              }) : []));

              if (!(!v.error && status.error.length === 0)) {
                _context2.next = 10;
                break;
              }

              _context2.next = 7;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/newpaletizacaoschema/"),
                parameters: _objectSpread(_objectSpread({}, values), {}, {
                  id: record === null || record === void 0 ? void 0 : record.paletizacao_id,
                  cliente_cod: record.cliente_cod,
                  cliente_nome: record.cliente_nome,
                  artigo_cod: record.artigo_cod
                })
              });

            case 7:
              response = _context2.sent;

              if (response.data.status !== "error") {
                if (operation.key === "update") {
                  parentReload({
                    paletizacao_id: operation.values.id
                  });
                } else {
                  parentReload({}, "lookup");
                }
              }

              setResultMessage(response.data);

            case 10:
              setSubmitting(false);
              setFormStatus(status);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function onFinish(_x) {
      return _ref4.apply(this, arguments);
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

    setSubmitting(false);
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

  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_26__.useCallback)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            setSubmitting(true);
            form.submit();

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })), []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_35__["default"], {
    result: resultMessage,
    successButtonOK: operation.key === "insert" && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
      type: "primary",
      key: "goto-of",
      onClick: onSuccessOK
    }, "Criar Novo Esquema"),
    successButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
      key: "goto-close",
      onClick: function onClick() {
        return onClose(true);
      }
    }, "Fechar"),
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.AlertsContainer, {
    id: "el-external"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_33__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish,
    onValuesChange: onValuesChange,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FormLayout, {
    id: "LAY-PALETIZACAO_SCHEMA",
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
      guides: guides,
      wide: 16,
      margin: "2px",
      layout: "horizontal",
      overflow: false
    }
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    field: {
      wide: [4, 4]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "contentor_id",
    label: {
      enabled: true,
      text: "Contentor"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
    size: "small",
    data: config__WEBPACK_IMPORTED_MODULE_30__.CONTENTORES_OPTIONS,
    keyField: "value",
    textField: "label",
    optionsRender: function optionsRender(d, keyField, textField) {
      return {
        label: d[keyField],
        value: d[keyField]
      };
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "designacao",
    label: {
      enabled: true,
      text: "Designação"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], {
    size: "small"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.HorizontalRule, {
    margin: "12px"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    field: {
      wide: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    split: 3,
    field: {
      alert: {
        tooltip: true
      },
      layout: {
        center: "min-width: 70px; max-width: 70px; align-self:center;"
      },
      label: {
        pos: "right",
        width: "100%"
      }
    },
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    label: {
      text: "Paletes/Contentor"
    },
    name: "npaletes"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 1,
    max: 150
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    label: {
      text: "Altura Máx. Palete (metros)"
    },
    name: "palete_maxaltura"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 1,
    max: 150
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    required: false,
    name: "paletes_sobrepostas",
    label: {
      enabled: true,
      text: "Paletes Sobrepostas"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.CheckboxField, {
    disabled: true
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    split: 3,
    field: {
      layout: {
        center: "min-width: 70px;max-width: 70px; align-self:center;"
      },
      label: {
        pos: "right",
        width: "100%"
      }
    },
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "netiquetas_bobine",
    label: {
      enabled: true,
      text: "Etiqueta/Bobine"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 1,
    max: 10
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "netiquetas_lote",
    label: {
      enabled: true,
      text: "Etiqueta do Lote da Palete"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 1,
    max: 10
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "netiquetas_final",
    label: {
      enabled: true,
      text: "Etiqueta Final da Palete"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 1,
    max: 10
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    margin: false,
    split: 3,
    field: {
      layout: {
        center: "min-width: 20px;max-width: 20px; align-self:center;"
      },
      label: {
        pos: "right",
        width: "100%"
      }
    },
    layout: "vertical"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    required: false,
    name: "filmeestiravel_bobines",
    label: {
      enabled: true,
      text: "Filme Estirável/Palete"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.CheckboxField, null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    required: false,
    name: "filmeestiravel_exterior",
    label: {
      enabled: true,
      text: "Filme Estirável Exterior"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.CheckboxField, null)))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    wide: 16,
    margin: false,
    field: {
      wide: [2, 2, 3, 5, '*'],
      style: {
        alignSelf: "center"
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "cintas",
    style: {
      minWidth: "20px",
      alignSelf: "center"
    },
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.CheckboxField, null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Item, {
    shouldUpdate: function shouldUpdate(prevValues, curValues) {
      return (prevValues === null || prevValues === void 0 ? void 0 : prevValues.cintas) !== (curValues === null || curValues === void 0 ? void 0 : curValues.cintas);
    }
  }, function () {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
      rule: schema(['cintas', 'ncintas']),
      allValues: form.getFieldsValue(true),
      layout: {
        center: "min-width: 50px;max-width: 50px; align-self:center;"
      },
      name: "ncintas",
      label: {
        enabled: true,
        text: "Cintas",
        pos: "right",
        colon: false
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
      disabled: form.getFieldValue(["cintas"]) !== 1,
      size: "small",
      min: 1,
      max: 10
    }));
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Item, {
    shouldUpdate: function shouldUpdate(prevValues, curValues) {
      return (prevValues === null || prevValues === void 0 ? void 0 : prevValues.cintas) !== (curValues === null || curValues === void 0 ? void 0 : curValues.cintas);
    }
  }, function () {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
      name: "cintas_palete",
      layout: {
        center: "align-self:center;"
      },
      label: {
        enabled: false
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
      size: "small",
      data: config__WEBPACK_IMPORTED_MODULE_30__.CINTASPALETES_OPTIONS,
      keyField: "value",
      textField: "label",
      disabled: form.getFieldValue(["cintas"]) !== 1,
      optionsRender: function optionsRender(d, keyField, textField) {
        return {
          label: d[textField],
          value: d[keyField]
        };
      }
    }));
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: "folha_identificativa",
    required: false,
    layout: {
      center: "align-self:center;"
    },
    label: {
      enabled: true,
      text: "Folha Identificativa da Palete",
      pos: "left",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"], {
    size: "small",
    min: 0,
    max: 10
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.HorizontalRule, {
    margin: "12px"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    field: {
      wide: 16
    },
    layout: "horizontal"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    layout: "vertical",
    wide: 7
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"].List, {
    name: "paletizacao"
  }, function (fields, _ref6) {
    var add = _ref6.add,
        remove = _ref6.remove,
        move = _ref6.move;

    var addRow = function addRow(fields) {
      add({
        item_id: 1,
        item_paletesize: '970x970',
        item_numbobines: 10
      }, 0);
    };

    var removeRow = function removeRow(fieldName) {
      remove(fieldName);
    };

    var moveRow = function moveRow(from, to) {
      move(from, to);
    };

    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, null, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
      type: "dashed",
      onClick: function onClick() {
        return addRow(fields);
      },
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_44__["default"], null), "Adicionar")), fields.map(function (field, index) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(SubFormPalete, {
        key: field.key,
        form: form,
        remove: removeRow,
        move: moveRow,
        field: field,
        index: index,
        length: fields.length,
        operation: operation,
        forInput: forInput
      });
    }));
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    wide: 9
  }, !loading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_paletizacaoSchema_SvgSchema__WEBPACK_IMPORTED_MODULE_38__["default"], {
    form: form,
    changedValues: changedValues
  }))))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_36__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
    disabled: submitting,
    onClick: onSubmit,
    type: "primary"
  }, "Guardar")))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_planeamento_ordemFabrico_FormPaletizacao_jsx.chunk.js.map