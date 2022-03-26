"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_planeamento_paletesStock_FormPaletesStockUpsert_jsx"],{

/***/ "./src/pages/planeamento/paletesStock/FormPaletesStockUpsert.jsx":
/*!***********************************************************************!*\
  !*** ./src/pages/planeamento/paletesStock/FormPaletesStockUpsert.jsx ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_2__);
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
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.array.reduce.js */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.parse-float.js */ "./node_modules/core-js/modules/es.parse-float.js");
/* harmony import */ var core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_float_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.number.to-fixed.js */ "./node_modules/core-js/modules/es.number.to-fixed.js");
/* harmony import */ var core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_to_fixed_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_25__);
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
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var components_YScroll__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! components/YScroll */ "./src/components/YScroll.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var components_table__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! components/table */ "./src/components/table.jsx");
/* harmony import */ var utils_useDataAPI__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! utils/useDataAPI */ "./src/utils/useDataAPI.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/SearchOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/SwapOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");



















var _excluded = ["aggItem", "leftColumns", "rightColumns", "leftDataAPI", "rightDataAPI", "setResultMessage"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }








function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
















var ButtonGroup = antd__WEBPACK_IMPORTED_MODULE_38__["default"].Group;





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

var loadPaletesStockLookup = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(of_id) {
    var _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/paletesstocklookup/"),
              pagination: {
                enabled: true,
                page: 1,
                pageSize: 20
              },
              filter: {
                of_id: of_id
              }
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

  return function loadPaletesStockLookup(_x) {
    return _ref.apply(this, arguments);
  };
}();
/* <Table
    rowSelection={rowSelection}
    columns={columns}
    dataSource={filteredItems}
    size="small"
    rowKey="nome"
    style={{ pointerEvents: listDisabled ? 'none' : null }}
    onRow={({ key, disabled: itemDisabled }) => ({
        onClick: () => {
            if (itemDisabled || listDisabled) return;
            onItemSelect(key, !listSelectedKeys.includes(key));
        },
    })}
/> */


var GlobalSearch = function GlobalSearch() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      form = _ref2.form,
      formName = _ref2.formName,
      dataAPI = _ref2.dataAPI;

  var onValuesChange = function onValuesChange(changedValues) {};

  var onFinish = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var _dataAPI$getFilter, item_id, of_id;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _dataAPI$getFilter = dataAPI.getFilter(), item_id = _dataAPI$getFilter.item_id, of_id = _dataAPI$getFilter.of_id;
              dataAPI.addFilters(_defineProperty({
                of_id: of_id,
                item_id: item_id
              }, formName, form.getFieldValue(formName)));
              dataAPI.first();
              dataAPI.fetchPost();

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function onFinish() {
      return _ref3.apply(this, arguments);
    };
  }();

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"], {
    form: form,
    name: formName,
    onFinish: onFinish,
    onValuesChange: onValuesChange
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FormLayout, {
    id: "PS-FILTER",
    layout: "horizontal",
    style: {
      width: "100%",
      padding: "0px"
      /* , minWidth: "700px" */

    },
    field: {
      forInput: true,
      wide: [16],
      margin: "2px",
      overflow: false,
      label: {
        enabled: true,
        pos: "top",
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
      wide: 16,
      margin: false,
      layout: "horizontal",
      overflow: false,
      style: {
        alignSelf: "center"
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
    name: formName,
    label: {
      enabled: false
    },
    addons: {
      right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"]
      /* style={{ padding: "3px" }} */
      , {
        size: "small",
        onClick: onFinish
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_42__["default"], null))
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_43__["default"], {
    size: "small"
  }))));
};

var TableTransfer = function TableTransfer(_ref4) {
  var aggItem = _ref4.aggItem,
      leftColumns = _ref4.leftColumns,
      rightColumns = _ref4.rightColumns,
      leftDataAPI = _ref4.leftDataAPI,
      rightDataAPI = _ref4.rightDataAPI,
      setResultMessage = _ref4.setResultMessage,
      props = _objectWithoutProperties(_ref4, _excluded);

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_41__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      formLeftFilter = _Form$useForm2[0];

  var _Form$useForm3 = antd__WEBPACK_IMPORTED_MODULE_41__["default"].useForm(),
      _Form$useForm4 = _slicedToArray(_Form$useForm3, 1),
      formRightFilter = _Form$useForm4[0];

  var id = aggItem.tempof_id,
      qty_encomenda = aggItem.qty_encomenda;

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)([]),
      _useState2 = _slicedToArray(_useState, 2),
      leftSelectedRows = _useState2[0],
      setLeftSelectedRows = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)([]),
      _useState4 = _slicedToArray(_useState3, 2),
      rightSelectedRows = _useState4[0],
      setRightSelectedRows = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    left: {
      st: 0,
      stm2: 0,
      total: 0,
      totalm2: 0
    },
    right: {
      st: 0,
      stm2: 0,
      total: 0,
      totalm2: 0,
      vTotal: 0,
      vTotalm2: 0
    }
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      selectedTotais = _useState6[0],
      setSelectedTotais = _useState6[1];

  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    if (!(leftDataAPI.isLoading() && rightDataAPI.isLoading())) {
      var totalm2 = rightDataAPI.getData().rows.reduce(function (a, b) {
        return a + (b["area"] || 0);
      }, 0);
      setSelectedTotais(function (prev) {
        return {
          left: {
            st: 0,
            stm2: 0,
            total: 0,
            totalm2: 0
          },
          right: {
            st: 0,
            stm2: 0,
            vTotal: rightDataAPI.getData().total,
            vTotalm2: totalm2,
            total: rightDataAPI.getData().total,
            totalm2: totalm2
          }
        };
      });
    }
  }, [leftDataAPI.isLoading() && rightDataAPI.isLoading()]);

  var addRemove = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var response, cancelFetch;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/savepaletesstock/"),
                parameters: {
                  id: id,
                  left: leftSelectedRows,
                  right: rightSelectedRows
                }
              });

            case 2:
              response = _context3.sent;

              if (response.data.status !== "error") {
                cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.cancelToken)();
                setLeftSelectedRows([]);
                leftDataAPI.fetchPost({
                  token: cancelFetch
                });
                rightDataAPI.fetchPost({
                  token: cancelFetch
                });
              } else {
                setResultMessage(response.data);
              }

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function addRemove() {
      return _ref5.apply(this, arguments);
    };
  }();

  var selection = function selection(s, key, keyValue, value) {
    if (Array.isArray(value)) {
      s[key] = _objectSpread(_objectSpread({}, s[key]), {}, {
        st: value.length,
        stm2: value.reduce(function (a, b) {
          return a + (b["area"] || 0);
        }, 0)
      });
      console.log("array", s);
    } else {
      if (keyValue.length <= s[key].st) {
        //remove
        s[key] = _objectSpread(_objectSpread({}, s[key]), {}, {
          st: keyValue.length,
          stm2: parseFloat(s[key].stm2) - value.area
        });
      } else {
        //add
        s[key] = _objectSpread(_objectSpread({}, s[key]), {}, {
          st: keyValue.length,
          stm2: parseFloat(s[key].stm2) + value.area
        });
      }
    }
  };

  var onSelectionLeft = function onSelectionLeft(keyValue, value) {
    var s = _objectSpread({}, selectedTotais);

    selection(s, "left", keyValue, value);
    s.right.vTotal = s.right.total - s.right.st + s.left.st;
    s.right.vTotalm2 = s.right.totalm2 - s.right.stm2 + s.left.stm2;
    setSelectedTotais(s);
  };

  var onSelectionRight = function onSelectionRight(keyValue, value) {
    var s = _objectSpread({}, selectedTotais);

    selection(s, "right", keyValue, value);
    s.right.vTotal = s.right.total - s.right.st + s.left.st;
    s.right.vTotalm2 = s.right.totalm2 - s.right.stm2 + s.left.stm2;
    setSelectedTotais(s);
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_36__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, "Encomenda ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, aggItem.qty_encomenda, " m\xB2")),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, selectedTotais.right.total), " Paletes Adicionadas"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
      style: {
        color: qty_encomenda <= selectedTotais.right.vTotalm2 ? "#389e0d" : "#000"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, selectedTotais.right.totalm2.toFixed(2), " m\xB2")))
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      overflow: "hidden"
      /* , alignItems: "center" */

    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      width: "45%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, "Paletes em Stock (", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, selectedTotais.left.st), " selecionadas)"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, selectedTotais.left.stm2.toFixed(2), " m\xB2"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_table__WEBPACK_IMPORTED_MODULE_39__["default"], {
    columnChooser: false,
    reload: false,
    clearSort: false,
    stripRows: true,
    darkHeader: false,
    toolbar: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(GlobalSearch, {
      form: formLeftFilter,
      formName: "fpl-filter",
      dataAPI: leftDataAPI
    }),
    size: "small",
    selection: {
      enabled: true,
      rowKey: "id",
      onSelection: onSelectionLeft,
      multiple: true,
      selectedRows: leftSelectedRows,
      setSelectedRows: setLeftSelectedRows
    },
    paginationProps: {
      pageSizeOptions: [10, 15, 20, 30]
    },
    dataAPI: leftDataAPI,
    columns: leftColumns,
    onFetch: leftDataAPI.fetchPost //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}

  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      width: "5%",
      textAlign: "center",
      alignSelf: "center"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
    type: "primary",
    onClick: addRemove,
    size: "small",
    icon: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_44__["default"], null)
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      width: "50%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", null, "Total Virtual ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, selectedTotais.right.vTotal), " Paletes"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
    style: {
      color: qty_encomenda <= selectedTotais.right.vTotalm2 ? "#389e0d" : "#000"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("b", null, selectedTotais.right.vTotalm2.toFixed(2), " m\xB2")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_table__WEBPACK_IMPORTED_MODULE_39__["default"], {
    columnChooser: false,
    reload: false,
    clearSort: false,
    stripRows: true,
    darkHeader: false,
    toolbar: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(GlobalSearch, {
      form: formRightFilter,
      formName: "fpr-filter",
      dataAPI: rightDataAPI
    }),
    size: "small",
    selection: {
      enabled: true,
      rowKey: "id",
      onSelection: onSelectionRight,
      multiple: true,
      selectedRows: rightSelectedRows,
      setSelectedRows: setRightSelectedRows
    }
    /* paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }} */
    ,
    dataAPI: rightDataAPI,
    columns: rightColumns,
    onFetch: rightDataAPI.fetchPost,
    scroll: {
      y: 465,
      scrollToFirstRowOnChange: true
    }
    /* style={{ maxHeight: "465px", overflowY: "auto" }} */
    //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}

  }))));
};

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
  var aggItem = record.aggItem;

  var _Form$useForm5 = antd__WEBPACK_IMPORTED_MODULE_41__["default"].useForm(),
      _Form$useForm6 = _slicedToArray(_Form$useForm5, 1),
      form = _Form$useForm6[0];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(true),
      _useState8 = _slicedToArray(_useState7, 2),
      loading = _useState8[0],
      setLoading = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({}),
      _useState10 = _slicedToArray(_useState9, 2),
      changedValues = _useState10[0],
      setChangedValues = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState12 = _slicedToArray(_useState11, 2),
      formStatus = _useState12[0],
      setFormStatus = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(false),
      _useState14 = _slicedToArray(_useState13, 2),
      guides = _useState14[0],
      setGuides = _useState14[1];

  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)(setId(aggItem.of_id)),
      _useState16 = _slicedToArray(_useState15, 2),
      operation = _useState16[0],
      setOperation = _useState16[1];

  var _useState17 = (0,react__WEBPACK_IMPORTED_MODULE_26__.useState)({
    status: "none"
  }),
      _useState18 = _slicedToArray(_useState17, 2),
      resultMessage = _useState18[0],
      setResultMessage = _useState18[1];

  var leftDataAPI = (0,utils_useDataAPI__WEBPACK_IMPORTED_MODULE_40__.useDataAPI)({
    payload: {
      url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/paletesstocklookup/"),
      parameters: {},
      pagination: {
        enabled: true,
        page: 1,
        pageSize: 15
      },
      filter: {
        item_id: aggItem.item_id
      },
      sort: []
    }
  });
  var rightDataAPI = (0,utils_useDataAPI__WEBPACK_IMPORTED_MODULE_40__.useDataAPI)({
    payload: {
      url: "".concat(config__WEBPACK_IMPORTED_MODULE_30__.API_URL, "/paletesstockget/"),
      parameters: {},
      pagination: {
        enabled: false
      },
      filter: {
        of_id: aggItem.tempof_id
      },
      sort: []
    }
  });

  var init = function init() {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_29__.cancelToken)();

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              setFormTitle && setFormTitle({
                title: "Paletes em Stock ".concat(aggItem.item_cod),
                subTitle: "".concat(aggItem.cliente_nome)
              });
              leftDataAPI.first();
              leftDataAPI.fetchPost({
                token: cancelFetch
              });
              rightDataAPI.first();
              rightDataAPI.fetchPost({
                token: cancelFetch
              });
              setLoading(false);

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }))();
  };

  var columns = _objectSpread({}, function (common) {
    return {
      nome: _objectSpread({
        title: "Palete",
        width: 100,
        render: function render(v) {
          return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
            style: {
              fontSize: "12px",
              fontWeight: 700
            }
          }, v);
        }
      }, common),
      largura_bobines: _objectSpread({
        title: "Larg.",
        width: 60,
        render: function render(v) {
          return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
            style: {
              fontSize: "10px"
            }
          }, v, " mm");
        }
      }, common),
      core_bobines: _objectSpread({
        title: "",
        width: 20,
        render: function render(v) {
          return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
            style: {
              fontSize: "10px"
            }
          }, v, "''");
        }
      }, common),
      area: _objectSpread({
        title: "Área",
        width: 80,
        render: function render(v) {
          return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement("div", {
            style: {
              fontSize: "10px"
            }
          }, v, " m\xB2");
        }
      }, common)
      /* comp_total: { title: "Comp.", width: 60, render: v => (<div style={{ fontSize: "10px" }}>{v} m</div>), ...common } */

    };
  }({
    idx: 1,
    optional: false,
    sort: false
  }));

  var leftColumns = (0,components_table__WEBPACK_IMPORTED_MODULE_39__.setColumns)({
    dataAPI: leftDataAPI,
    data: leftDataAPI.getData().rows,
    uuid: "leftPaletesStock",
    include: columns,
    exclude: []
  });
  var rightColumns = (0,components_table__WEBPACK_IMPORTED_MODULE_39__.setColumns)({
    dataAPI: rightDataAPI,
    data: rightDataAPI.getData().rows,
    uuid: "rightPaletesStock",
    include: columns,
    exclude: []
  });
  (0,react__WEBPACK_IMPORTED_MODULE_26__.useEffect)(function () {
    init(true);
  }, []);

  var onErrorOK = function onErrorOK() {
    setResultMessage({
      status: "none"
    });
  };

  var onClose = function onClose() {
    var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    parentReload({
      agg_id: aggItem.id
    });
    closeParent();
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(react__WEBPACK_IMPORTED_MODULE_26__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_resultMessage__WEBPACK_IMPORTED_MODULE_34__["default"], {
    result: resultMessage,
    errorButtonOK: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      type: "primary",
      key: "goto-ok",
      onClick: onErrorOK
    }, "OK"),
    errorButtonClose: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
      key: "goto-close",
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_45__["default"], {
    spinning: leftDataAPI.isLoading() || rightDataAPI.isLoading(),
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_46__["default"], {
      style: {
        fontSize: 24
      },
      spin: true
    }),
    tip: "A carregar..."
  }, leftDataAPI.hasData() && rightDataAPI.hasData() && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(TableTransfer, {
    aggItem: aggItem,
    leftColumns: leftColumns,
    rightColumns: rightColumns,
    leftDataAPI: leftDataAPI,
    rightDataAPI: rightDataAPI,
    setResultMessage: setResultMessage
  })), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_35__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_47__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_26__.createElement(antd__WEBPACK_IMPORTED_MODULE_38__["default"], {
    type: "primary",
    onClick: onClose
  }, "Fechar")))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_planeamento_paletesStock_FormPaletesStockUpsert_jsx.chunk.js.map