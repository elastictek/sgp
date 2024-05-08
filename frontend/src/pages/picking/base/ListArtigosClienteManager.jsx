import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdSelectEditor, ArtigosLookupEditor, ArtigosSageLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { includeObjectKeys, json, updateByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, EditOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { rules, setValidationGroups, validateRows } from 'utils/useValidation';
import Page from 'components/FormFields/FormsV2';

const title = "Gerir relação Artigo/Cliente";
const subTitle = null;
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<ToolbarTitle disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />);
}

// const postProcess = async (dt) => {
//   for (let [i, v] of dt.rows.entries()) {}
//   return dt;
// };

const schema = z.object({
  artigo_cod: z.any(),
  cliente_cod: z.any(),
  cliente_abv: z.any(),
  lar: z.any(),
  limites:z.object({
    liminf:z.any(),
    limsup:z.any()
  }),
  diam:z.object({
    diam_ref:z.any(),
    liminf:z.any(), 
    limsup:z.any()
  })
}).refine((v) => {
  const r = rules();
  r(v, "lar", { name: "Largura" }).number().required().positive(false).min(20);
  r(v, "artigo_cod", { name: "Artigo" }).required();
  r(v, "cliente_cod", { name: "Cliente" }).required();
  r(v, "cliente_abv", { name: "Abreviatura" }).required();
  
  r(v?.diam, "liminf").number().required().positive(false);
  r(v?.diam, "limsup").number().required().positive(false);
  r(v?.diam, "diam_ref", { name: "Diâmetro de Referência" }).number().required().positive(false).between(v?.diam?.liminf, v?.diam?.limsup, { including: true, nameMin: "Limite inferior", nameMax: "Limite superior" });

  r(v?.limites, "liminf", { name: "Limite inferior" }).number().required().positive(false).max(v?.limites?.limsup, { name: "Limite superior" });
  r(v?.limites, "limsup", { name: "Limite superior" }).number().required().positive(false).min(v?.limites?.liminf, { name: "Limite inferior" });

  if (!r().valid()) {
    throw new z.ZodError(r().errors());
  }
  return true;
}, {});

export default ({ noid = false, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const modeApi = useModeApi() //not Required;
  const permission = usePermission({ name: "controlpanel" });
  const defaultParameters = { method: "ArtigosClienteList" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const baseFilters = {
    //...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "ArtigosClienteList-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
    payload: {
      url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
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
    gridRef.current.api.deselectAll();
  };

  const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
    /**
 * Método que permite antes do "commit", fazer pequenas alterações aos dados.
 * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
 * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
 * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
 */
    if (newValue && colDef.field === "artigo_cod") {
      data = updateByPath(data, "artigo_cod", newValue?.ITMREF_0);
      data = updateByPath(data, "artigo_id", newValue?.id);
      data = updateByPath(data, "artigo_des", newValue?.ITMDES1_0);
      data = updateByPath(data, "gtin", newValue?.gtin);
      data = updateByPath(data, "lar", newValue?.lar);
      return data;
    } else if (newValue && colDef.field === "cliente_cod") {
      data = updateByPath(data, "cliente_cod", newValue?.BPCNUM_0);
      data = updateByPath(data, "cliente_nome", newValue?.BPCNAM_0);
      data = updateByPath(data, "cliente_id", newValue?.sgp_id);
      data = updateByPath(data, "cliente_abv", newValue?.sgp_abv);
      data = updateByPath(data, "liminf", newValue?.sgp_liminf);
      data = updateByPath(data, "limsup", newValue?.sgp_limsup);
      data = updateByPath(data, "diam_ref", newValue?.sgp_diam_ref);
      return data;
    }
    return null;
  }
  const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
    console.log("dddddddd", data)
    const r = await validateRows([data], schema, dataAPI.getPrimaryKey(), { passthrough: false, validationGroups });
    console.log("rrrrrrrrrrrrrrrrrrr", r)
    r.onValidationFail((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }

  const onAddSave = async (rows, allRows) => {
    console.log("dddddddd", rows)
    const rv = await validateRows(rows, schema, dataAPI.getPrimaryKey(), { passthrough: false, validationGroups });
    await rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });
    console.log("xxxxxxxxxxxxxxxxxxxxx")
    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/ordensfabrico/sql/`, "NewArtigoCliente", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      return result.success;
      //setFormStatus(result);
    }));
  };

  const onEditSave = async (rows, allRows) => {
    const rv = await validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/ordensfabrico/sql/`, "UpdateArtigoCliente", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }));
  };

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    const _safePost = async (method, { filter, parameters }) => {
      const result = await dataAPI.safePost(`${API_URL}/ordensfabrico/sql/`, method, { filter, parameters });
      result.onValidationFail((p) => { });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
    }

    switch (option.key) {
      case "delete":
        Modal.confirm({
          content: <div>Tem a certeza que deseja apagar a relação <b>{row.artigo_cod}</b>/<b>{row.cliente_nome}</b>?</div>, onOk: async () => {
            await _safePost("DeleteArtigoCliente", { parameters: { artigo_id: row.artigo_id, cliente_id: row.cliente_id }, filter: {} });
          }
        })
        break;
    };

    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      ...[{ label: "Apagar relação artigo/cliente", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const validationGroups = useMemo(() => (setValidationGroups({
    limites: ["liminf", "limsup"],
    diam: ["diam_ref", "liminf", "limsup"]
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}) => {
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    if (modeApi.isOnAddMode() && ["cliente_abv", "liminf", "diam_ref", "limsup"].includes(params.colDef.field)) {
      return (params.data.cliente_id) ? false : true;
    }
    if (modeApi.isOnEditMode() && ["lar"].includes(params.colDef.field)) {
      return (params.data.artigo_des.toLowerCase().includes("amostra")) ? true : false;
    }
    if (modeApi.isOnEditMode() && ["artigo_cod", "cliente_cod"].includes(params.colDef.field)) {
      return false;
    }
    return true;
  }, [modeApi?.isOnMode()]);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
      { colId: "pc.cod", field: 'cliente_cod', headerName: 'Cliente Num.', lockPosition: "left", ...cellParams(), type: "editableColumn", cellEditor: ClientesLookupEditor, width: 130, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pc.name", field: 'cliente_nome', headerName: 'Cliente', lockPosition: "left", ...cellParams(), width: 300, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: "pac.cod_client", field: 'cod_client', headerName: 'Cliente Cod.', ...cellParams(), type: "editableColumn", cellEditor: AntdInputEditor, width: 130, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: "pc.abv", field: 'cliente_abv', headerName: 'Abrev.', ...cellParams(null, { maxLength: 3 }), type: "editableColumn", cellEditor: AntdInputEditor, width: 70, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pa.lar", field: 'lar', headerName: 'Largura', ...cellParams(), width: 140, type: "editableColumn", cellEditor: AntdInputNumberEditor, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: "pa.cod", field: 'artigo_cod', headerName: 'Artigo Cod.', ...cellParams(), width: 140, type: "editableColumn", cellEditor: ArtigosSageLookupEditor, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pa.des", field: 'artigo_des', headerName: 'Artigo Des.', ...cellParams(), width: 350, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: "pa.gtin", field: 'gtin', headerName: 'GTIN', ...cellParams(), width: 140, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pc.diam_ref", field: 'diam_ref', headerName: 'Diam. Ref.', ...cellParams(null, { min: 0 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value unit="mm" params={params} /> },
      { colId: "pc.liminf", field: 'liminf', headerName: 'Diam. Inf.', ...cellParams(null, { min: 0 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value unit="mm" params={params} /> },
      { colId: "pc.limsup", field: 'limsup', headerName: 'Diam. Sup.', ...cellParams(null, { min: 0 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value unit="mm" params={params} /> },
      { colId: "pac.produto", field: 'produto', headerName: 'Produto', ...cellParams(), type: "editableColumn", cellEditor: AntdInputEditor, width: 220, flex: 1, cellRenderer: (params) => <Value bold params={params} /> }
    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode()]);


  const filters = useMemo(() => ({
    toolbar: [
      "cliente_cod", "cliente_nome", "artigo_cod", "artigo_des"
    ],
    more: ["@columns"],
    no: [...Object.keys(baseFilters), "action"]
  }), []);

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        onGridRequest={onGridRequest}
        onGridResponse={onGridResponse}
        onGridReady={onGridReady}
        loading={submitting.state}
        style={style}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={[{ column: "pc.name", direction: "DESC" }]}
        filters={filters}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        singleClickEdit={true}
        //rowSelectionIgnoreOnMode={true}
        // rowSelection="single"
        // onSelectionChanged={onselectionchange}
        dataAPI={dataAPI}
        modeApi={modeApi}
        modeOptions={{
          enabled: true,
          allowEdit: permission.isOk({ item: "base", action: "admin" }),
          allowAdd: permission.isOk({ item: "base", action: "admin" }),
          newRow: () => ({ [dataAPI.getPrimaryKey()]: uid(6) }),
          newRowIndex: null,
          onAddSave,
          onEditSave,
          onAdd: null,
          onModeChange: null,
          onExitMode,
          onExitModeRefresh: true,
          onAddSaveExit: true,
          onEditSaveExit: false
        }}
        onBeforeCellEditRequest={onBeforeCellEditRequest}
        onAfterCellEditRequest={onAfterCellEditRequest}
        {...props}
      />
    </Page.Ready>
  );

}