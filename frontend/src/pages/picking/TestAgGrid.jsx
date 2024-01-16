import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from "react-dom";
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { uid } from 'uid';
import { useDataAPI } from "utils/useDataAPIV4";
import { json, includeObjectKeys } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, UploadOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, RollbackOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle, { Title } from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import XScroll, { RowXScroll } from 'components/XScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';

import useModeApi from 'utils/useModeApi';
import TableV4, { suppressKeyboardEvent, useModalApi } from 'components/TableV4/TableV4';
import { Cuba, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, OFabricoStatus, StatusProduction, PosColumn } from 'components/TableV4/TableColumnsTemp';
import { useImmer } from 'use-immer';

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber } from "components/TableV4/TableColumnsV4";
import { GridApi } from 'ag-grid-community';


const PaletesList = ({ extraRef, closeSelf, loadParentData, noid = false, defaultFilters = {}, defaultSort = [], onSelect, title, onFilterChange, local = false, loadOnInit = false, rowSelection, ...props }) => {
  const gridRef = useRef(); //not required
  const [gridApi, setGridApi] = useState(); //not Required;
  const modalApi = useModalApi() //not Required;
  const permission = usePermission({ name: "paletes" });
  const modeApi = useModeApi(); //not Required;
  const submitting = useSubmitting(false);
  const defaultParameters = { method: "PaletesListV2" };
  const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "PaletesListV2-01" }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { url: `${API_URL}/paletes/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, baseFilter: defaultFilters, sort: defaultSort } });
  const inputParameters = useRef(loadInit({ filter: { nome: "DM" } }, { filter: dataAPI.getFilters(false, true) }, { ...props?.parameters }, { ...location?.state }));

  useEffect(() => {
    if (permission.isReady) {
      modeApi.load({
        key: null,
        enabled: false,
        allowEdit: permission.isOk({ item: "stock", /* forInput: [!submitting.state], */ action: "edit" }),
        allowAdd: permission.isOk({ item: "stock",/* forInput: [!submitting.state], */ action: "add" }),
        // onAdd: () => { },
        newRow: () => ({ [dataAPI.getPrimaryKey()]: uid(6), nome: null }),
        newRowIndex: null,
        onAddSave: () => { console.log("on add save") },
        onEditSave: () => { console.log("on edit save") },
        editText: null,
        addText: null,
        saveText: null,
        // onExit: () => { console.log("on edit mode exit") },

      });
    }
  }, [permission.isReady]);

  useEffect(() => {
    if (gridApi) {
      const controller = new AbortController();
      loadData({ signal: controller.signal, init: true });
      return (() => controller.abort());
    }
  }, [gridApi]);

  const loadData = async ({ signal, init = false } = {}) => {
    /**When not loadOnInit, we can do any init changes, before load it */
    if (gridApi && !loadOnInit) {
      //dataAPI.addFilters(excludeObjectKeys({ ...dataAPI.getFilter(), ...fieldValues }, ['tstamp']), true);
      dataAPI.setSort(null, [{ column: `sgppl.nome`, direction: "DESC" }]);
      dataAPI.addParameters({ ...defaultParameters }, false);

      if (!local) {
        let datasource = dataAPI.dataSourceV4(null);
        gridApi.setGridOption("serverSideDatasource", datasource);
      } else {
        submitting.trigger();
        const dt = await dataAPI.fetchPost({ ignoreTotalRows: true });
        submitting.end();
      }
    }
  }

  const [columnDefs, setColumnDefs] = useImmer([
    { colId: 'sgppl.nome', field: 'nome', headerName: 'Nome', lockPosition: "left", minWidth: 120, cellStyle: {}, cellRenderer: (params) => <Value link bold params={params} /> },
    { colId: 'sgppl.timestamp', field: 'timestamp', headerName: 'Data', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
    { colId: 'sgppl.nbobines_real', field: 'nbobines_real', headerName: 'Bobines', width: 90, cellStyle: {}, cellRenderer: (params) => <FromTo field={{ from: "nbobines_real", to: "num_bobines" }} colorize={true} params={params} /> },
    { colId: 'sgppl.estado', field: 'estado', headerName: 'Estado', width: 110, cellStyle: {}, cellEditor: ModalEditor, cellRenderer: (params) => <EstadoBobines field={{ artigos: "artigo" }} params={params} /> },
    { colId: 'sgppl.largura', field: 'largura', headerName: 'Largura', width: 110, cellStyle: {}, cellRenderer: (params) => <Larguras field={{ artigos: "artigo" }} params={params} /> },
    { colId: 'po2.ofid', field: 'ofid', headerName: 'Ordem Fabrico', width: 180, cellStyle: {}, cellRenderer: (params) => <Ordens field={{ cod: "ofid", des: "ordem_original" }} params={params} /> },
    { colId: 'pt.prf_cod', field: 'prf', headerName: 'Prf', width: 120, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
    { colId: 'pt.order_cod', field: 'iorder', headerName: 'Encomenda', width: 120, cellStyle: {}, cellRenderer: (params) => <Value align='right' params={params} /> },
    { colId: 'sgppl.cliente_nome', field: 'cliente_nome', headerName: 'Cliente', width: 200, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
    { colId: 'sgppl.destino', field: 'destino', headerName: 'Destino', flex: 1, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
    { colId: 'sgppl.core', field: 'core', headerName: 'Core', width: 110, cellStyle: {}, cellRenderer: (params) => <BadgeNumber params={params} /> },
    { colId: 'sgppl.destinos', field: 'destinos', wrapText: true, autoHeight: false, headerName: 'teste', flex: 1, cellStyle: {}, cellRenderer: (params) => <MultiLine modalApi={modalApi} dataType='json' params={params} /> }
    // { field: 'age' },
    // { field: 'country', cellRenderer: (params) => { return (<div style={{ fontWeight: 700, color: "red" }}>{params.value}</div>); } },
    // { field: 'year' },
    // { field: 'date' },
    // { field: 'sport', valueGetter: (params) => { return params.data.sport; } },
    // { field: 'gold' },
    // { field: 'silver' },
    // { field: 'bronze' },
    // { field: 'total' },
  ]);

  const defaultColDef = useMemo(() => {
    return {
      editable: (params) => modeApi.isOnEditMode() || (params.data?.rowadded == 1 && modeApi.isOnAddMode()), //params.data.year == 2012,
      filter: false,
      sortable: modeApi.isOnMode() ? false : true,
      suppressMenu: modeApi.isOnMode() ? true : false,
      valueGetter: (params) => params.data?.[params.column.getDefinition().field],
      suppressKeyboardEvent
      //   valueSetter: params => {
      //     params.data[params.column.getDefinition().field] = params.newValue;
      //     //params.data.name = params.newValue;
      //     return true;
      // }
    };
  }, [modeApi.isOnMode()]);
  const columnTypes = useMemo(() => {
    return {
      // nonEditableColumn: { editable: false },
      // dateColumn: {
      //   filter: 'agDateColumnFilter',
      //   filterParams: { comparator: myDateComparator },
      //   suppressMenu: true
      // }
    };
  }, []);

  const [filters, setFilters] = useState({
    toolbar: ["nome", { field: "largura", type: "number" }, { field: "timestamp", label: "Teste 1", type: "date" },
      { field: "ofid", type: "text", op: "any", alias: "sgppl.ofid", mask: "lower({k})" },
      { field: "core", options: [{ value: "3" }, { value: "6" }, { value: "9" }], type: "select", exp: "", multi: true },
      { field: "test", options: "bool:0", type: "options", exp: "" },
      { field: "test1", options: "opt:2", type: "options", exp: "" }
    ],
    more: ["@columns", { field: "timestamp", type: "date", col: 6, style: { width: "100px" } }],
    no: ["destinos"]
  });


  const rowClassRules = useMemo(() => {
    return {};
  }, []);

  const onSelectionChanged = (rows) => {
    console.log(rows);

    // document.querySelector('#selectedRows').innerHTML =
    //   selectedRows.length === 1 ? selectedRows[0].athlete : '';
  };

  // const tt = () => {
  //   console.log("######");
  //   const loadedRows = [];
  //   gridRef.current.api.forEachNode((node) => {
  //     loadedRows.push(node.data);
  //   });
  //   console.log("-->", loadedRows, modeApi.isOnEditMode());
  // }

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <TableV4
        loading={submitting.state}
        gridApi={gridApi}
        loadOnInit={loadOnInit}
        setGridApi={setGridApi}
        multiSortKey='ctrl'
        gridRef={gridRef}
        local={local}

        rowSelection="multiple"
        onSelectionChanged={onSelectionChanged}

        rowClassRules={rowClassRules}

        showRange={false}
        allowGoTo={false}
        showTotalCount={true}
        showFromTo={false}

        dataAPI={dataAPI}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        columnTypes={columnTypes}

        showTopToolbar={true}
        topToolbar={{
          title: <Title level={3} text="Paletes" style={{}} />,
          start: null,
          left: null, /* <Space>
            <Permissions permissions={permission} action="edit" forInput={[!modeApi.isOnMode()]}><Button icon={<UploadOutlined />}>Carregar Parâmetros</Button></Permissions>
          </Space> */
          right: null,
          initFilterValues: inputParameters.current,
          onFilterFinish: null,
          filters,
          showSettings: true,
          showFilters: true,
          showMoreFilters: true,
          clearSort: true
        }}
        modeApi={modeApi}
      />
    </div>
  );
}

const ModalEditor = memo(

  forwardRef((props, ref) => {
    const isHappy = (value) => value === "Happy";

    const [ready, setReady] = useState(false);
    const [happy, setHappy] = useState(isHappy(props.value));
    const [done, setDone] = useState(false);
    const refContainer = useRef(null);

    const checkAndToggleMoodIfLeftRight = (event) => {
      if (ready) {
        if (["ArrowLeft", "ArrowRight"].indexOf(event.key) > -1) {
          // left and right
          const isLeft = event.key === "ArrowLeft";
          setHappy(isLeft);
          event.stopPropagation();
        }
      }
    };

    useEffect(() => {
      if (done) props.stopEditing();
    }, [done]);

    useEffect(() => {
      //ReactDOM.findDOMNode(refContainer.current).focus();
      setReady(true);
    }, []);

    useEffect(() => {
      window.addEventListener("keydown", checkAndToggleMoodIfLeftRight);

      return () => {
        window.removeEventListener("keydown", checkAndToggleMoodIfLeftRight);
      };
    }, [checkAndToggleMoodIfLeftRight, ready]);

    useImperativeHandle(ref, () => {
      return {
        getValue() {
          return "example";
          //return happy ? "Happy" : "Sad";
        },
      };
    });

    // const mood = {
    //   borderRadius: 15,
    //   border: "1px solid grey",
    //   backgroundColor: "red",
    //   padding: 15,
    //   textAlign: "center",
    //   display: "inline-block",
    // };

    // const unselected = {
    //   paddingLeft: 10,
    //   paddingRight: 10,
    //   border: "1px solid transparent",
    //   padding: 4,
    // };

    // const selected = {
    //   paddingLeft: 10,
    //   paddingRight: 10,
    //   border: "1px solid lightgreen",
    //   padding: 4,
    // };

    // const happyStyle = happy ? selected : unselected;
    // const sadStyle = !happy ? selected : unselected;

    // return (
    //   <div
    //     ref={refContainer}
    //     style={mood}
    //     tabIndex={1} // important - without this the key presses wont be caught
    //   >
    //     <img
    //       src="https://www.ag-grid.com/example-assets/smileys/happy.png"
    //       onClick={() => {
    //         setHappy(true);
    //         setDone(true);
    //       }}
    //       style={happyStyle}
    //     />
    //     <img
    //       src="https://www.ag-grid.com/example-assets/smileys/sad.png"
    //       onClick={() => {
    //         setHappy(false);
    //         setDone(true);
    //       }}
    //       style={sadStyle}
    //     />
    //   </div>
    // );

    return (
      <Modal open={true} onOk={() => setDone(true)}>

        <div tabIndex={1} >dsfdsfsdfsdfsdf</div>

      </Modal>
    );


  })

);

// const CustomCellRenderer = (props) => {
//   const cellValue = props.value;
//   const inputRef = useRef(null);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.keyCode === 13) {
//         // "Enter" key is pressed
//         console.log('Enter key pressed for cell:', props.node.data);
//         // You can perform any action here
//       }
//     };
// if (inputRef.current){
//     inputRef.current.addEventListener('keydown', handleKeyDown);

//     return () => {
//       // Cleanup event listener when component unmounts
//       //inputRef.current && inputRef.current.removeEventListener('keydown', handleKeyDown);
//     };
//   }
//   }, [props.node.data]);

//   return <div ref={inputRef}>gggggggggggggg</div>;
// };

export const CustomCellRenderer = ({ column, data }) => {
  const contentRef = useRef();
  const onKeyDown = (event) => {
    if (event.keyCode === 13) {
      console.log('Enter key pressed for cell:', data[column.getDefinition().field]);
    }
  }
  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if (event.keyCode === 13) {
  //     //   // "Enter" key is pressed
  //        console.log('Enter key pressed for cell:', data[column.getDefinition().field]);
  //     //   // You can perform any action here
  //     }
  //   };
  //   contentRef.current.focus();
  //   contentRef.current.addEventListener('keydown', handleKeyDown);

  //   return () => {
  //     //contentRef.current.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);
  return (<div tabIndex="1" style={{ outline: "none" }} ref={contentRef} onKeyDown={onKeyDown}>{data[column.getDefinition().field]}</div>);
}

export default PaletesList;