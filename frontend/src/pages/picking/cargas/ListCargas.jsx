import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, CONTENTORES_OPTIONS } from "config";
import { allPass, curry, eqProps, map, uniqWith, clone, isNil, is } from 'ramda';
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { createUseStyles } from 'react-jss';
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action, ArrayTags } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { includeObjectKeys, json, updateByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, CloseOutlined, DeleteFilled, DeleteOutlined, EditOutlined, FileExcelTwoTone, FilePdfTwoTone, PlusOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalDate, zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { setValidationGroups, validateRows } from 'utils/useValidation';
import Page from 'components/FormFields/FormsV2';
import { isNullOrEmpty } from 'utils/index';
import PaletesCargaList from './PaletesCargaList';
import FormPackingList from '../../ordensfabrico/FormPackingList';
import { TbCircles } from 'react-icons/tb';


const useTableStyles = createUseStyles({
  confirmed: {
    background: "#ffccc7 !important"
  }
});


const title = "Cargas";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

// const postProcess = async (dt) => {
//   for (let [i, v] of dt.rows.entries()) {}
//   return dt;
// };

const schema = z.object({
  dates: zGroupIntervalDate("data", "data_prevista", { description: { init: "Data", end: "Data Prevista" }, nullable: false }),
  paletes: z.object({
    "num_paletes": z.any(),// coerce.date({ description: _init }),
    "num_paletes_actual": z.any() //coerce.date({ description: _end })
  }).refine((v) => {
    const errors = [];
    if (isNullOrEmpty(v.num_paletes)) {
      errors.push({ path: "num_paletes", message: `O número de paletes tem de estar preenchido` });
    } else if (!is(Number, v.num_paletes) || v.num_paletes < 1 || v.num_paletes < v.num_paletes_actual) {
      errors.push({ path: ['num_paletes'], message: 'O número de paletes não é válido!' });
    }
    if (errors.length > 0) {
      throw new z.ZodError(errors);
    }
    return true;
  }, {})
});

export default ({ noid = false, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useTableStyles();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const modeApi = useModeApi() //not Required;
  const permission = usePermission({ name: "controlpanel" });
  const defaultParameters = { method: "CargasList" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const baseFilters = {
    ...!isNullOrEmpty(location?.state?.estado) && parseFilter("pc.estado", `==${location?.state?.estado}`, {}),
    ...!isNullOrEmpty(location?.state?.expedida) && parseFilter("pc.expedida", `==${location?.state?.expedida}`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "CargasList-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
    payload: {
      url: `${API_URL}/cargas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });

  const onGridReady = async ({ api, ...params }) => { }
  const onGridRequest = async () => { };
  const onGridResponse = async (api) => {
    if (dataAPI.requestsCount() === 1) { }
  };

  const onExitMode = () => {
    setValidation({});
    /* gridRef.current.api.deselectAll(); */
  };

  const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
    /**
 * Método que permite antes do "commit", fazer pequenas alterações aos dados.
 * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
 * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
 * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
 */
    // if (newValue && colDef.field === "artigo_cod") {
    //   data = updateByPath(data, "artigo_cod", newValue?.cod);
    //   data = updateByPath(data, "artigo_id", newValue?.id);
    //   data = updateByPath(data, "artigo_des", newValue?.des);
    //   data = updateByPath(data, "gtin", newValue?.gtin);
    //   return data;
    // } else if (newValue && colDef.field === "cliente_cod") {
    //   data = updateByPath(data, "cliente_cod", newValue?.BPCNUM_0);
    //   data = updateByPath(data, "cliente_nome", newValue?.BPCNAM_0);
    //   data = updateByPath(data, "cliente_id", newValue?.sgp_id);
    //   data = updateByPath(data, "cliente_abv", newValue?.sgp_abv);
    //   data = updateByPath(data, "liminf", newValue?.sgp_liminf);
    //   data = updateByPath(data, "limsup", newValue?.sgp_limsup);
    //   data = updateByPath(data, "diam_ref", newValue?.sgp_diam_ref);
    //   return data;
    // }
    return null;
  }
  const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
    const r = await validateRows([data], schema, dataAPI.getPrimaryKey(), { validationGroups });
    console.log(r)
    r.onValidationFail((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }

  const onEditSave = async (rows, allRows) => {
    const rv = await validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "UpdateCarga", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      return result.success;
    }));
  };

  const onNew = () => {

  }

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();


    const _safePost = async (method, { filter, parameters }) => {
      const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, method, { filter, parameters });
      result.onValidationFail((p) => { });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
    }
    switch (option.key) {
      case "delete":
        Modal.confirm({
          content: <div>Tem a certeza que deseja apagar a carga <b>{row.carga}</b>?</div>, onOk: async () => {
            await _safePost("DeleteCarga", { parameters: { id: row.id }, filter: {} });
          }
        })
        break;
      case "close":
        await _safePost("CloseCarga", { parameters: { id: row.id }, filter: {} });
        break;
      case "pl-pdf":
        modalApi.setModalParameters({
          content: <FormPackingList parameters={{ report: { extension: "pdf", export: "pdf", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER", orientation: "vertical" }, ...row }} />,
          title: `Imprimir Packing List <Pdf> ${row?.prf}`,
          lazy: true, type: "modal", responsive: true, width: "500px", height: "350px"
        });
        modalApi.showModal();


        break;
      case "pl-excel":
        setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List <Excel> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "xlsx", export: "excel", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER", orientation: "landscape" }, ...data } });
        showModal();

        break;
      case "pld-pdf":
        setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List Detalhado <Pdf> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "pdf", export: "pdf", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER", orientation: "vertical" }, ...data } });
        showModal();

        break;
      case "pld-excel":
        setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List Detalhado <Excel> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "xlsx", export: "excel", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER", orientation: "landscape" }, ...data } });
        showModal();

        break;
    };

    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      ...params.data.estado == "C" ? [
        { label: 'Packing List', key: 'pl-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
        { label: 'Packing List', key: 'pl-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
        { label: 'Packing List Detalhado', key: 'pld-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } },
        { label: 'Packing List Detalhado', key: 'pld-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } },
        , { type: "divider" }] : [],
      ...permission.isOk({ item: "cargas", action: "close", forInput: [params.data.estado == "I", params.data.num_paletes_actual == params.data.num_paletes] }) ? [{ label: "Fechar Carga", key: "close", icon: <CloseOutlined style={{ fontSize: "16px" }} /> }, { type: "divider" }] : [],
      ...permission.isOk({ item: "cargas", action: "delete", forInput: [params.data.estado == "I"] }) ? [{ label: "Apagar Carga", key: "delete", icon: <DeleteOutlined style={{ fontSize: "16px" }} /> }] : []
    ]
  }, []);

  const validationGroups = useMemo(() => (setValidationGroups({
    dates: ["data", "data_prevista"],
    paletes: ["num_paletes", "num_paletes_actual"]
    /*diam: ["diam_ref", "liminf", "limsup"] */
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}) => {
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    if (modeApi.isOnEditMode() && ["data_prevista", "tipo", "num_paletes"].includes(params.colDef.field)) {
      return true;//(params.data.cliente_id) ? false : true;
    }
    return false;
  }, [modeApi?.isOnMode()]);

  const onCargasClick = (e, { data }) => {
    if (modeApi.isOnMode()) {
      return;
    }

    //navigate("/app/picking/cargas/paletescarga", { state: { ...data && { ...data }, title: `Paletes da Carga`, subTitle: data?.carga } })




    modalApi.setModalParameters({
      content: <PaletesCargaList style={{height:"70vh"}} header={false} parentApi={gridRef.current.api} parameters={{ ...data && { ...data } }} />,
      closable: true,
      title: `Paletes da Carga`,
      subTitle:data?.carga,
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "95%",
      parameters: { ...data && getCellFocus(gridRef.current.api) }
    });
    modalApi.showModal();
  }

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "pc.id", field: "id", hide: true },
      { colId: 'action', field: "action", headerName: "", type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
      { colId: "pc.carga", field: 'carga', headerName: 'Carga', lockPosition: "left", ...cellParams(), width: 200, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'btn', field: "btn", headerName: "", type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Button onClick={(e) => onCargasClick(e, params)} icon={<TbCircles />} size='small' /> },
      { colId: "pc.data", field: 'data', headerName: 'Data', ...cellParams({ format: DATE_FORMAT }), width: 110, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: "pc.eef", field: 'eef', headerName: 'Encomenda', ...cellParams(), width: 150, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pc.nome", field: 'cliente_nome', headerName: 'Cliente', ...cellParams(), minWidth: 180, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pc.tipo", field: 'tipo', headerName: 'Tipo', type: "editableColumn", ...cellParams({}, { options: CONTENTORES_OPTIONS }), width: 90, cellEditor: AntdSelectEditor, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pc.num_paletes', field: 'num_paletes', headerName: 'Paletes', type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 110, cellStyle: {}, cellRenderer: (params) => <FromTo field={{ from: "num_paletes_actual", to: "num_paletes" }} colorize={true} params={params} /> },
      { colId: "nbobines_emendas", field: 'nbobines_emendas', headerName: 'Bobines c/Emendas', ...cellParams(), width: 90, cellRenderer: (params) => <Value unit=' %' params={params} /> },
      { colId: "m2", field: 'm2', headerName: 'Área', ...cellParams(), width: 90, cellRenderer: (params) => <Value unit=' m2' params={params} /> },
      { colId: "pc.data_prevista", field: 'data_prevista', headerName: 'Data Prevista', type: "editableColumn", ...cellParams({ format: DATE_FORMAT }), cellEditor: AntdDateEditor, width: 110, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: "pc.data_expedicao", field: 'data_expedicao', headerName: 'Data Preparação', ...cellParams({ format: DATE_FORMAT }), width: 110, cellRenderer: (params) => <Value datetime params={params} /> },
      {
        colId: "estado", field: 'estado', headerName: 'Estado', ...cellParams(), width: 200, cellRenderer: (params) => <Options map={{
          "I": { label: "Incompleta", props: { color: "orange" } },
          "C": { label: "Completa", props: { color: "blue" } }
        }} params={params} />
      },
      {
        colId: "expedida", field: 'expedida', headerName: 'Preparação', ...cellParams(), width: 200, cellRenderer: (params) => <Options map={{
          0: { label: "Em preparação", props: { color: "orange" } },
          1: { label: "Preparada", props: { color: "green" } }
        }} params={params} />
      },
      { colId: "po.ofid", field: 'ofid', headerName: 'Ordem Fabrico', ...cellParams(), width: 150, cellRenderer: (params) => <ArrayTags params={params} /> }
    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode()]);


  const filters = useMemo(() => ({
    toolbar: ["carga", "eef", "cliente_nome"
      /* "cliente_cod", "cliente_nome", "artigo_cod", "artigo_des" */
    ],
    more: ["@columns"],
    no: ["id", ...Object.keys(baseFilters), "action", "btn"]
  }), []);

  const _titleForm = useCallback(() => {
    switch (location?.state?.action) {
      case "list_open": return "Cargas Abertas";
      case "list_closed": return "Cargas Completas";
      case "list_confirm": return "Confirmar Cargas";
      default: return "Cargas";
    }
  }, [submitting.timestamp]);

  const _action = useMemo(() => {
    return location?.state?.action;
  }, []);

  const onSelectionChanged = (v) => {
    navigate("/app/picking/cargas/confirmcarga", { state: { id: v[0].id, nome: v[0].carga, tstamp: Date.now() }, replace: false });
  }

  // const rowClassRules = useMemo(() => {
  //   return {
  //     [classes.confirmed]: (params) => {
  //       return params.data?.expedida == 0;
  //     }
  //   };
  // }, [dataAPI.getTimeStamp()]);

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={_titleForm()} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        onGridRequest={onGridRequest}
        onGridResponse={onGridResponse}
        onGridReady={onGridReady}
        loading={submitting.state}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={[{ column: "pc.id", direction: "DESC" }]}
        filters={filters}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        singleClickEdit={true}
        // rowClassRules={rowClassRules}
        //rowSelectionIgnoreOnMode={true}
        ignoreRowSelectionOnCells={["action"]}
        {..._action == "list_confirm" ? { isRowSelectable: () => true, rowSelection: "single", onSelectionChanged } : { modeApi }}
        dataAPI={dataAPI}
        modeOptions={{
          enabled: true,
          allowEdit: (location?.state?.action == "list_closed") ? false : permission.isOk({ item: "cargas", action: "edit" }),
          allowAdd: false,
          newRow: null,
          newRowIndex: null,
          onAddSave: null,
          onEditSave,
          onAdd: null,
          onModeChange: null,
          onExitMode,
          onExitModeRefresh: true,
          onAddSaveExit: true,
          onEditSaveExit: false
        }}
        topToolbar={{
          start: <Space>
            {/* {(!modeApi.isOnMode() && permission.isOk({ item: "cargas", action: "new" })) && <Button type="link" icon={<PlusOutlined />} onClick={onNew}>Nova carga</Button>} */}
          </Space>,
          left: <></>
        }}
        onBeforeCellEditRequest={onBeforeCellEditRequest}
        onAfterCellEditRequest={onAfterCellEditRequest}
        {...props}
      />
    </Page.Ready>
  );

}