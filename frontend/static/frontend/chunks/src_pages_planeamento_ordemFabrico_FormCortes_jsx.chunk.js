"use strict";
(self["webpackChunksgp"] = self["webpackChunksgp"] || []).push([["src_pages_planeamento_ordemFabrico_FormCortes_jsx"],{

/***/ "./src/pages/planeamento/cortes/FormCortesUpsert.jsx":
/*!***********************************************************!*\
  !*** ./src/pages/planeamento/cortes/FormCortesUpsert.jsx ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.find.js */ "./node_modules/core-js/modules/es.array.find.js");
/* harmony import */ var core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_find_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_entries_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.entries.js */ "./node_modules/core-js/modules/es.object.entries.js");
/* harmony import */ var core_js_modules_es_object_entries_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_entries_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_fill_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.fill.js */ "./node_modules/core-js/modules/es.array.fill.js");
/* harmony import */ var core_js_modules_es_array_fill_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_fill_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.reduce.js */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.number.constructor.js */ "./node_modules/core-js/modules/es.number.constructor.js");
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_array_every_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.array.every.js */ "./node_modules/core-js/modules/es.array.every.js");
/* harmony import */ var core_js_modules_es_array_every_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_every_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "./node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_jss__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! react-jss */ "./node_modules/react-jss/dist/react-jss.esm.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var utils_schemaValidator__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! utils/schemaValidator */ "./src/utils/schemaValidator.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_iconButton__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! components/iconButton */ "./src/components/iconButton.jsx");
/* harmony import */ var components_resultMessage__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! components/resultMessage */ "./src/components/resultMessage.jsx");
/* harmony import */ var components_portal__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! components/portal */ "./src/components/portal.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var react_dnd__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! react-dnd */ "./node_modules/react-dnd/dist/esm/hooks/useDrop/useDrop.mjs");
/* harmony import */ var react_dnd__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! react-dnd */ "./node_modules/react-dnd/dist/esm/hooks/useDrag/useDrag.mjs");
/* harmony import */ var react_dnd__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! react-dnd */ "./node_modules/react-dnd/dist/esm/core/DndProvider.mjs");
/* harmony import */ var react_dnd_html5_backend__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! react-dnd-html5-backend */ "./node_modules/react-dnd-html5-backend/dist/esm/index.mjs");
/* harmony import */ var use_immer__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! use-immer */ "./node_modules/use-immer/dist/use-immer.module.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
















































/* import SvgSchema from '../paletizacaoSchema/SvgSchema'; */

var schema = function schema(keys, excludeKeys) {
  return (0,utils_schemaValidator__WEBPACK_IMPORTED_MODULE_35__.getSchema)({}, keys, excludeKeys).unknown(true);
};

var useStyles = (0,react_jss__WEBPACK_IMPORTED_MODULE_41__.createUseStyles)({
  bobine: {
    cursor: "move",
    border: "solid 1px #bfbfbf",
    height: "150px",
    boxShadow: "2px 1px 2px #f0f0f0",
    margin: "3px",
    borderRadius: "3px",
    width: function width(props) {
      return "".concat(props.width, "%");
    },
    '&:hover': {
      backgroundColor: "#e6f7ff"
    }
  }
});

var Bobine = function Bobine(_ref) {
  var id = _ref.id,
      value = _ref.value,
      index = _ref.index,
      moveBobine = _ref.moveBobine,
      _ref$width = _ref.width,
      width = _ref$width === void 0 ? 0 : _ref$width,
      _ref$forInput = _ref.forInput,
      forInput = _ref$forInput === void 0 ? false : _ref$forInput,
      cortes = _ref.cortes;
  var classes = useStyles({
    width: width
  });
  var ref = (0,react__WEBPACK_IMPORTED_MODULE_30__.useRef)(null);
  var color = cortes.find(function (v) {
    return v.item_lar == value;
  });
  var style = {
    color: color.color,
    fontStyle: "italic",
    height: "70%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  var _useDrop = (0,react_dnd__WEBPACK_IMPORTED_MODULE_42__.useDrop)({
    accept: 'bobine',
    collect: function collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    drop: function drop(item, monitor) {
      var _ref$current;

      if (!ref.current) {
        return;
      }

      var dragIndex = item.index;
      var hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      var hoverBoundingRect = (_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.getBoundingClientRect();
      var hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      var clientOffset = monitor.getClientOffset();
      var hoverClientY = clientOffset.y - hoverBoundingRect.top;
      moveBobine(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  }),
      _useDrop2 = _slicedToArray(_useDrop, 2),
      handlerId = _useDrop2[0].handlerId,
      drop = _useDrop2[1];

  var _useDrag = (0,react_dnd__WEBPACK_IMPORTED_MODULE_43__.useDrag)({
    type: 'bobine',
    item: function item() {
      return {
        id: id,
        index: index
      };
    },
    canDrag: function canDrag(monitor) {
      return forInput;
    },
    collect: function collect(monitor) {
      return {
        isDragging: monitor.isDragging()
      };
    }
  }),
      _useDrag2 = _slicedToArray(_useDrag, 2),
      isDragging = _useDrag2[0].isDragging,
      drag = _useDrag2[1];

  var opacity = isDragging ? 0 : 1;
  drag(ref);
  drop(ref);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement("div", {
    ref: ref,
    className: classes.bobine,
    style: {
      opacity: opacity,
      background: color.bcolor,
      color: color.color
    },
    "data-handler-id": handlerId
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement("div", {
    style: {
      fontSize: "10px",
      textAlign: "center"
    }
  }, index + 1), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement("div", {
    style: style
  }, value));
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

  var _Form$useForm = antd__WEBPACK_IMPORTED_MODULE_44__["default"].useForm(),
      _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
      form = _Form$useForm2[0];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_30__.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      loading = _useState2[0],
      setLoading = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_30__.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      submitting = _useState4[0],
      setSubmitting = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_30__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      formStatus = _useState6[0],
      setFormStatus = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_30__.useState)(false),
      _useState8 = _slicedToArray(_useState7, 2),
      guides = _useState8[0],
      setGuides = _useState8[1];

  var _useImmer = (0,use_immer__WEBPACK_IMPORTED_MODULE_45__.useImmer)([]),
      _useImmer2 = _slicedToArray(_useImmer, 2),
      bobines = _useImmer2[0],
      setBobines = _useImmer2[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_30__.useState)(0),
      _useState10 = _slicedToArray(_useState9, 2),
      larguraTotal = _useState10[0],
      setLarguraTotal = _useState10[1];

  var init = function init() {
    var cortes = record.cortes,
        cortesOrdem = record.cortesOrdem;
    setFormTitle && setFormTitle({
      title: "Posicionar Cortes"
    });
    var largura_json = cortes[0].largura_json;
    var _bobines = [];
    var _larguraTotal = 0;

    if (!cortesOrdem) {
      for (var _i2 = 0, _Object$entries = Object.entries(JSON.parse(largura_json)); _i2 < _Object$entries.length; _i2++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        _bobines.push.apply(_bobines, _toConsumableArray(new Array(value).fill(key)));

        _larguraTotal = _larguraTotal + value * key;
      }
    } else {
      var _cortesOrdem = JSON.parse(cortesOrdem.largura_ordem);

      _bobines.push.apply(_bobines, _toConsumableArray(_cortesOrdem));

      form.setFieldsValue({
        designacao: cortesOrdem.designacao
      });
      _larguraTotal = _cortesOrdem.reduce(function (sum, v) {
        return Number(sum) + Number(v);
      });
    }

    setBobines(_bobines);
    setLarguraTotal(_larguraTotal);
  };

  (0,react__WEBPACK_IMPORTED_MODULE_30__.useEffect)(function () {
    init();
  }, [record]);

  var onFinish = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(values) {
      var status, cortes, ordem, cortes_id, touched, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              cortes = record.cortes, ordem = record.ordem;
              cortes_id = cortes[0].cortes_id;
              touched = false;

              if (!ordem) {
                touched = true;
              } else {
                if (!JSON.parse(ordem.largura_ordem).every(function (v, i) {
                  return v === bobines[i];
                })) {
                  touched = true;
                }
              }

              if (!touched) {
                _context.next = 11;
                break;
              }

              _context.next = 8;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_33__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_34__.API_URL, "/updatecortesordem/"),
                parameters: _objectSpread(_objectSpread({}, values), {}, {
                  largura_ordem: JSON.stringify(bobines),
                  cortes_id: cortes_id
                })
              });

            case 8:
              response = _context.sent;

              if (response.data.status !== "error") {
                status.success.push({
                  message: response.data.title
                });
                parentReload({}, "lookup");
                closeParent();
              } else {
                status.error.push({
                  message: response.data.title
                });
              }

              setFormStatus(status);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function onFinish(_x) {
      return _ref3.apply(this, arguments);
    };
  }();

  var moveBobine = (0,react__WEBPACK_IMPORTED_MODULE_30__.useCallback)(function (dragIndex, hoverIndex) {
    setBobines(function (draft) {
      var tmp = draft[hoverIndex];
      draft[hoverIndex] = draft[dragIndex];
      draft[dragIndex] = tmp;
    });
  }, [bobines]);
  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_30__.useCallback)(function () {
    setSubmitting(true);
    form.submit();
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(react__WEBPACK_IMPORTED_MODULE_30__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_37__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(antd__WEBPACK_IMPORTED_MODULE_44__["default"], {
    form: form,
    name: "fps",
    onFinish: onFinish,
    component: wrapForm
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_36__.FormLayout, {
    id: "LAY-CORTESORDEM-UPSERT",
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
  }, forInput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(react__WEBPACK_IMPORTED_MODULE_30__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_36__.FieldSet, {
    margin: false,
    field: {
      wide: [6, 4]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_36__.Field, {
    name: "designacao",
    label: {
      enabled: false
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(antd__WEBPACK_IMPORTED_MODULE_46__["default"], {
    placeholder: "Designa\xE7\xE3o",
    size: "small"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_36__.VerticalSpace, {
    height: "24px"
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(react_dnd__WEBPACK_IMPORTED_MODULE_47__.DndProvider, {
    backend: react_dnd_html5_backend__WEBPACK_IMPORTED_MODULE_48__.HTML5Backend
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row"
    }
  }, bobines.map(function (v, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(Bobine, {
      key: "b-".concat(v, ".").concat(i),
      id: "b-".concat(v, ".").concat(i),
      value: v,
      index: i,
      moveBobine: moveBobine,
      width: v * 100 / larguraTotal,
      cortes: record.cortes,
      forInput: forInput
    });
  }))), parentRef && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(components_portal__WEBPACK_IMPORTED_MODULE_40__["default"], {
    elId: parentRef.current
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(antd__WEBPACK_IMPORTED_MODULE_49__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_30__.createElement(antd__WEBPACK_IMPORTED_MODULE_50__["default"], {
    disabled: submitting,
    onClick: onSubmit,
    type: "primary"
  }, "Guardar"))));
});

/***/ }),

/***/ "./src/pages/planeamento/ordemFabrico/FormCortes.jsx":
/*!***********************************************************!*\
  !*** ./src/pages/planeamento/ordemFabrico/FormCortes.jsx ***!
  \***********************************************************/
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
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "./node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.object.define-property.js */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.for-each.js */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors.js */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.object.define-properties.js */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.promise.js */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.array.index-of.js */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.array.reduce.js */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "./node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/esnext.string.replace-all.js */ "./node_modules/core-js/modules/esnext.string.replace-all.js");
/* harmony import */ var core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_esnext_string_replace_all_js__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es.array.is-array.js */ "./node_modules/core-js/modules/es.array.is-array.js");
/* harmony import */ var core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array_js__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! regenerator-runtime/runtime.js */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime_js__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! joi */ "./node_modules/joi/dist/joi-browser.min.js");
/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var utils_fetch__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! utils/fetch */ "./src/utils/fetch.js");
/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! config */ "./src/config/index.js");
/* harmony import */ var components_formLayout__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! components/formLayout */ "./src/components/formLayout.jsx");
/* harmony import */ var components_alertMessages__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! components/alertMessages */ "./src/components/alertMessages.jsx");
/* harmony import */ var components_toolbar__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! components/toolbar */ "./src/components/toolbar.jsx");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/spin/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/form/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/EditOutlined.js");
/* harmony import */ var _cortes_FormCortesUpsert__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ../cortes/FormCortesUpsert */ "./src/pages/planeamento/cortes/FormCortesUpsert.jsx");
/* harmony import */ var _FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./FormOFabricoValidar */ "./src/pages/planeamento/ordemFabrico/FormOFabricoValidar.jsx");















var _excluded = ["form", "guides", "schema"];

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

















var colors = [{
  bcolor: '#002766',
  color: '#ffffff'
}, {
  bcolor: '#0050b3',
  color: '#ffffff'
}, {
  bcolor: '#1890ff',
  color: '#000000'
}, {
  bcolor: '#69c0ff',
  color: '#000000'
}, {
  bcolor: '#bae7ff',
  color: '#000000'
}, {
  bcolor: '#ffffff',
  color: '#000000'
}];

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
    type: "drawer",
    destroyOnClose: true,
    mask: true,
    setVisible: onVisible,
    visible: showWrapper.show,
    width: 800,
    bodyStyle: {
      height: "450px"
    },
    footer: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
      ref: iref,
      id: "form-wrapper",
      style: {
        textAlign: 'right'
      }
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_cortes_FormCortesUpsert__WEBPACK_IMPORTED_MODULE_35__["default"], {
    setFormTitle: setFormTitle,
    record: record,
    parentRef: iref,
    closeParent: onVisible,
    parentReload: parentReload
  }));
};

var loadArtigosAggLookup = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
    var agg_id, token, _yield$fetchPost, rows;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            agg_id = _ref2.agg_id, token = _ref2.token;
            _context.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_31__.API_URL, "/artigostempagglookup/"),
              filter: {
                agg_id: agg_id
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

  return function loadArtigosAggLookup(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var loadCortesOrdemLookup = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref4) {
    var cortes_id, token, _yield$fetchPost2, rows;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            cortes_id = _ref4.cortes_id, token = _ref4.token;
            _context2.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_31__.API_URL, "/cortesordemlookup/"),
              filter: {
                cortes_id: cortes_id
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

  return function loadCortesOrdemLookup(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (_ref6) {
  var changedValues = _ref6.changedValues;

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)(true),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)({
    show: false
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      showForm = _useState6[0],
      setShowForm = _useState6[1];

  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)(false),
      _useState8 = _slicedToArray(_useState7, 2),
      submitting = _useState8[0],
      setSubmitting = _useState8[1];

  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)({
    error: [],
    warning: [],
    info: [],
    success: []
  }),
      _useState10 = _slicedToArray(_useState9, 2),
      formStatus = _useState10[0],
      setFormStatus = _useState10[1];

  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)([]),
      _useState12 = _slicedToArray(_useState11, 2),
      cortesOrdemLookup = _useState12[0],
      setCortesOrdemLookup = _useState12[1];

  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_27__.useState)(),
      _useState14 = _slicedToArray(_useState13, 2),
      larguraUtil = _useState14[0],
      setLarguraUtil = _useState14[1];

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_27__.useContext)(_FormOFabricoValidar__WEBPACK_IMPORTED_MODULE_36__.OFabricoContext),
      form = _useContext.form,
      guides = _useContext.guides,
      schema = _useContext.schema,
      ctx = _objectWithoutProperties(_useContext, _excluded);

  (0,react__WEBPACK_IMPORTED_MODULE_27__.useEffect)(function () {
    var cancelFetch = (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.cancelToken)();
    loadData({
      agg_id: ctx.agg_id,
      token: cancelFetch
    });
    return function () {
      return cancelFetch.cancel("Form Cortes Cancelled");
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_27__.useEffect)(function () {
    if (changedValues) {
      if ("cortes" in changedValues) {
        setLarguraUtil(calculateLarguraUtil(form.getFieldValue("cortes")));
      }

      if ("cortesordem_id" in changedValues) {//const v = ((changedValues.cortesordem_id) ? cortesOrdemLookup.filter(v => v.id === changedValues.cortesordem_id) : [])[0];
        //console.log(v);
        //setCortesOrdem(v);
      }
    }
  }, [changedValues]);

  var cortesOrdem = function cortesOrdem() {
    var id = form.getFieldValue("cortesordem_id");
    return (id ? cortesOrdemLookup.filter(function (v) {
      return v.id === id;
    }) : [])[0];
  };

  var isCortesTouched = function isCortesTouched() {
    return !(!form.getFieldValue("cortes_id") || changedValues && "cortes" in changedValues);
  };

  var calculateLarguraUtil = (0,react__WEBPACK_IMPORTED_MODULE_27__.useCallback)(function (cortes) {
    var v = cortes.reduce(function (accumulator, current) {
      return accumulator + current.item_ncortes * current.item_lar;
    }, 0);
    return v;
  });

  var loadData = function loadData(_ref7) {
    var agg_id = _ref7.agg_id,
        token = _ref7.token;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "init";

    switch (type) {
      case "lookup":
        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var _cortesOrdemLookup;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return loadCortesOrdemLookup({
                    cortes_id: form.getFieldValue("cortes_id"),
                    token: token
                  });

                case 2:
                  _cortesOrdemLookup = _context3.sent;
                  setCortesOrdemLookup(_cortesOrdemLookup);

                case 4:
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
          var _cortes, _iterator, _step, _step$value, i, v, _larguras, cortes_id, cortesordem_id, _cortesOrdemLookup;

          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return loadArtigosAggLookup({
                    agg_id: agg_id,
                    token: token
                  });

                case 2:
                  _cortes = _context4.sent;

                  if (_cortes.length > 0) {
                    _iterator = _createForOfIteratorHelper(_cortes.entries());

                    try {
                      for (_iterator.s(); !(_step = _iterator.n()).done;) {
                        _step$value = _slicedToArray(_step.value, 2), i = _step$value[0], v = _step$value[1];
                        _larguras = JSON.parse(v.largura_json);

                        if (_larguras !== undefined && _larguras !== null) {
                          v["item_ncortes"] = _larguras[v.item_lar];
                          v["bcolor"] = colors[i].bcolor;
                          v["color"] = colors[i].color;
                        }
                      }
                    } catch (err) {
                      _iterator.e(err);
                    } finally {
                      _iterator.f();
                    }
                  }

                  cortes_id = _cortes.length > 0 ? _cortes[0]["cortes_id"] : null;
                  cortesordem_id = _cortes.length > 0 ? _cortes[0]["cortesordem_id"] : null;
                  _context4.next = 8;
                  return loadCortesOrdemLookup({
                    cortes_id: cortes_id,
                    token: token
                  });

                case 8:
                  _cortesOrdemLookup = _context4.sent;
                  form.setFieldsValue(_objectSpread(_objectSpread({
                    cortes: _cortes
                  }, cortes_id ? {
                    cortes_id: cortes_id
                  } : {
                    cortes_id: null
                  }), cortesordem_id ? {
                    cortesordem_id: cortesordem_id
                  } : {
                    cortesordem_id: null
                  }));
                  setLarguraUtil(calculateLarguraUtil(_cortes));
                  setCortesOrdemLookup(_cortesOrdemLookup);
                  setLoading(false);

                case 13:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }))();

    }
  };

  var onSubmit = (0,react__WEBPACK_IMPORTED_MODULE_27__.useCallback)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var status, response;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            status = {
              error: [],
              warning: [],
              info: [],
              success: []
            };
            _context5.next = 3;
            return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.fetchPost)({
              url: "".concat(config__WEBPACK_IMPORTED_MODULE_31__.API_URL, "/newcortes/"),
              parameters: _objectSpread(_objectSpread({}, form.getFieldsValue(["cortes"])), {}, {
                agg_id: ctx.agg_id
              })
            });

          case 3:
            response = _context5.sent;

            if (response.data.status == "error") {
              status.error.push({
                message: response.data.title
              });
            } else {
              status.success.push({
                message: response.data.title
              });
              loadData({
                agg_id: ctx.agg_id
              });
            }

            setFormStatus(status);

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  })), []);

  var clearCortes = /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var status, response;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              status = {
                error: [],
                warning: [],
                info: [],
                success: []
              };
              _context6.next = 3;
              return (0,utils_fetch__WEBPACK_IMPORTED_MODULE_30__.fetchPost)({
                url: "".concat(config__WEBPACK_IMPORTED_MODULE_31__.API_URL, "/clearcortes/"),
                parameters: {
                  agg_id: ctx.agg_id
                }
              });

            case 3:
              response = _context6.sent;

              if (response.data.status == "error") {
                status.error.push({
                  message: response.data.title
                });
              } else {
                status.success.push({
                  message: response.data.title
                });
                loadData({
                  agg_id: ctx.agg_id
                });
              }

              setFormStatus(status);

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function clearCortes() {
      return _ref11.apply(this, arguments);
    };
  }();

  var onShowForm = function onShowForm() {
    var newForm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (newForm) {
      setShowForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: _objectSpread({}, form.getFieldsValue(["cortes", "cortes_id"]))
        });
      });
    } else {
      setShowForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          show: !prev.show,
          record: _objectSpread(_objectSpread({}, form.getFieldsValue(["cortes", "cortes_id"])), {}, {
            cortesOrdem: cortesOrdem()
          })
        });
      });
    }
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_alertMessages__WEBPACK_IMPORTED_MODULE_33__["default"], {
    formStatus: formStatus
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_37__["default"], {
    spinning: loading,
    indicator: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_38__["default"], {
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
    id: "LAY-CORTES",
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
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, null, form.getFieldValue("cortes_id") && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_34__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, larguraUtil && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null, "Largura \xDAtil [ ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, larguraUtil, "mm"), " ]")),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
      onClick: clearCortes
    }, "Refazer Cortes")
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    layout: "vertical",
    style: {
      minWidth: "200px",
      maxWidth: "200px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    style: {
      fontWeight: 500
    },
    field: {
      wide: [8, 8],
      noItemWrap: true,
      label: {
        enabled: false
      }
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, null, "Largura"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, null, "N\xBA Cortes")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_40__["default"].List, {
    name: "cortes"
  }, function (fields, _ref12) {
    var add = _ref12.add,
        remove = _ref12.remove,
        move = _ref12.move;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(react__WEBPACK_IMPORTED_MODULE_27__.Fragment, null, fields.map(function (field, index) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
        key: field.key,
        field: {
          wide: [8, 8]
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
        forInput: false,
        name: [field.name, "item_lar"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_41__["default"], {
        disabled: true,
        size: "small"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
        name: [field.name, "item_ncortes"],
        label: {
          enabled: false
        }
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_42__["default"], {
        size: "small",
        min: 1,
        max: 24
      })));
    }));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.VerticalSpace, {
    height: "12px"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
    disabled: isCortesTouched(),
    type: "dashed",
    onClick: onSubmit,
    style: {
      width: "100%"
    }
  }, "Aplicar")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.VerticalSpace, {
    height: "12px"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, null, form.getFieldValue("cortes_id") && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_toolbar__WEBPACK_IMPORTED_MODULE_34__["default"], {
    style: {
      width: "100%"
    },
    left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.Field, {
      name: "cortesordem_id",
      layout: {
        center: "align-self:center;",
        right: "align-self:center;"
      },
      label: {
        enabled: true,
        text: "Posição Cortes",
        pos: "left"
      },
      addons: _objectSpread({}, form.getFieldValue("cortesordem_id") && {
        right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
          onClick: function onClick() {
            return onShowForm();
          },
          style: {
            marginLeft: "3px"
          },
          size: "small"
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_ant_design_icons__WEBPACK_IMPORTED_MODULE_43__["default"], {
          style: {
            fontSize: "16px"
          }
        }))
      })
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.SelectField, {
      allowClear: true,
      size: "small",
      data: cortesOrdemLookup,
      keyField: "id",
      textField: "designacao",
      optionsRender: function optionsRender(d, keyField, textField) {
        return {
          label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
            style: {
              display: "flex"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
            style: {
              minWidth: "150px"
            }
          }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("b", null, d[textField])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", null, "v.", d["versao"])), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement("div", {
            style: {
              color: "#1890ff"
            }
          }, d["largura_ordem"].replaceAll('"', ' '))),
          value: d[keyField]
        };
      }
    }))),
    right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(antd__WEBPACK_IMPORTED_MODULE_39__["default"], {
      onClick: function onClick() {
        return onShowForm(true);
      }
    }, "Novo Posicionamento de Cortes")
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldSet, {
    field: {
      wide: [16]
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(components_formLayout__WEBPACK_IMPORTED_MODULE_32__.FieldItem, {
    label: {
      enabled: false
    }
  }, function (loading, cortesOrdem) {
    if (!loading && cortesOrdem) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_27__.createElement(_cortes_FormCortesUpsert__WEBPACK_IMPORTED_MODULE_35__["default"], {
        record: _objectSpread(_objectSpread({}, form.getFieldsValue(["cortes", "cortes_id"])), {}, {
          cortesOrdem: cortesOrdem
        }),
        wrapForm: false,
        forInput: false,
        parentReload: loadData
      });
    }
  }(loading, cortesOrdem()))))));
});

/***/ })

}]);
//# sourceMappingURL=src_pages_planeamento_ordemFabrico_FormCortes_jsx.chunk.js.map