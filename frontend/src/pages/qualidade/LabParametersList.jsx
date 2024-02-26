import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter, getFilterValue } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource, disableTabOnNextCell } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action, OPTIONS_LAB_MODE, OPTIONS_LAB_PARAMETERTYPE } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdAutoCompleteEditor, AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { firstKey, firstKeyValue, includeObjectKeys, json, updateByPath, valueByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, DownloadOutlined, EditOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { fetchPost } from 'utils/fetch';
import LabLoadParameters from './LabLoadParameters';
import { setValidationGroups, validateRows } from 'utils/useValidation';

const title = "Parâmetros";
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

export const schema = z.object({
  nome: z.string().min(1),
  unit: z.string().min(1),
  value_precision: z.coerce.number().min(0),
  lvalues: zGroupIntervalNumber("min_value", "max_value", { description: { init: "Valor mínimo", end: "Valor máximo" }, nullable: false })
});

export const fecthUnits = async (value) => await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "LabParametersUnitLookup" }, pagination: { limit: 20 }, filter: { unit: getFilterValue(value, 'any') } })

export const columns = (cellParams, onActionSave, actionItems) => ({
  cols: [
    { colId: 'action', lockVisible: true, type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
    { field: 'id', hide: true, lockVisible: true },
    { field: 'nome', headerName: 'Parâmetro', suppressKeyboardEvent: (params) => disableTabOnNextCell(params), lockPosition: "left", ...cellParams(), type: "editableColumn", cellEditor: AntdInputEditor, width: 250, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },
    { field: 'designacao', headerName: 'Designação', ...cellParams(), type: "editableColumn", cellEditor: AntdInputEditor, width: 250, flex: 1, cellRenderer: (params) => <Value params={params} /> },
    { field: 'parameter_type', headerName: 'Tipo', ...cellParams({ map: OPTIONS_LAB_PARAMETERTYPE }), type: "editableColumn", cellEditor: AntdSelectEditor, width: 120, cellRenderer: (params) => <Options style={{ width: "100px" }} params={params} /> },
    { field: 'parameter_mode', headerName: 'Modo', ...cellParams({ map: OPTIONS_LAB_MODE }), type: "editableColumn", cellEditor: AntdSelectEditor, width: 120, cellRenderer: (params) => <Options style={{ width: "80px" }} params={params} /> },
    { field: 'unit', headerName: 'Unidade', ...cellParams({}, { remote: { column: "unit", fetch: fecthUnits } }), type: "editableColumn", cellEditor: AntdAutoCompleteEditor, width: 120, cellRenderer: (params) => <Value params={params} /> },
    { field: 'min_value', headerName: 'Min.', ...cellParams(null, { min: 0, max: 100 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value params={params} /> },
    { field: 'max_value', headerName: 'Max.', ...cellParams(null, { min: 0, max: 100 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value params={params} /> },
    { field: 'value_precision', headerName: 'Precisão', ...cellParams(null, { min: 0, max: 6 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value params={params} /> },
    { field: 'required', headerName: 'Obrigatório', ...cellParams(null, { checkedValue: 1, unCheckedValue: 0 }), type: "editableColumn", cellEditor: AntdCheckboxEditor, width: 70, cellRenderer: (params) => <Bool checkedValue={1} unCheckedValue={0} params={params} /> },
    { field: 'versao', headerName: 'Versão', ...cellParams(), width: 80, cellRenderer: (params) => <Value params={params} /> }
  ], timestamp: new Date()
});


export default ({ noid = false, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const modeApi = useModeApi() //not Required;
  const permission = usePermission({ name: "controlpanel" });
  const defaultParameters = { method: "ListLabParameters" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const baseFilters = {
    //...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "ListLabParameters-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
    payload: {
      url: `${API_URL}/qualidade/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
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
    if (newValue && colDef.field === "nome") {
      data = updateByPath(data, colDef.field, newValue);
      if (!valueByPath(data, "designacao")) {
        data = updateByPath(data, "designacao", newValue);
      }
      return data;
    }
    return null;
  }
  const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
    const r = await validateRows([data], schema, dataAPI.getPrimaryKey(), { validationGroups });
    r.onValidationFail((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }

  const onAddSave = async (rows, allRows) => {
    const rv = await validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
    await rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "NewLabParameter", { parameters: { rows } });
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
      const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "UpdateLabParameter", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }));
  };

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    const _safePost = async (method, { filter, parameters }) => {
      const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, method, { filter, parameters });
      result.onValidationFail((p) => { });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
    }

    switch (option.key) {
      case "delete":
        Modal.confirm({
          content: <div>Tem a certeza que deseja apagar o parâmetro <b>{row.nome}</b>?</div>, onOk: async () => {
            await _safePost("DeleteLabParameter", { parameters: {}, filter: { id: row.id } });
          }
        })
        break;
    };

    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      // { type: 'divider' },
      ...[{ label: "Apagar Parâmetro", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const validationGroups = useMemo(() => (setValidationGroups({
    lvalues: ["min_value", "max_value"]
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}) => {
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    /* if (modeApi.isOnAddMode() && ["cliente_abv", "liminf", "diam_ref", "limsup"].includes(params.colDef.field)) {
      return (params.data.cliente_id) ? false : true;
    }
    if (modeApi.isOnEditMode() && ["artigo_cod", "cliente_cod"].includes(params.colDef.field)) {
      return false;
    } */
    return true;
  }, [modeApi?.isOnMode()]);

  const columnDefs = useMemo(() => columns(cellParams, onActionSave, actionItems), [validation, modeApi?.isOnMode()]);

  const filters = useMemo(() => ({
    toolbar: [
      "nome",
      { field: "parameter_type", type: "options", options: OPTIONS_LAB_PARAMETERTYPE },
      { field: "parameter_mode", type: "options", options: OPTIONS_LAB_MODE }
    ],
    more: ["@columns"],
    no: [...Object.keys(baseFilters), "action"]
  }), []);

  const onLoadParameters = useCallback(() => {
    modalApi.setModalParameters({
      content: <LabLoadParameters refreshParentData={() => { refreshDataSource(gridRef.current.api); }} />,
      closable: true,
      title: "Carregar Parâmetros",
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "1100px",
      parameters: { /* ...getCellFocus(gridRef.current.api) */ }
    });
    modalApi.showModal();
  }, []);

  return (
    <>
      <TitleForm loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        onGridRequest={onGridRequest}
        onGridResponse={onGridResponse}
        onGridReady={onGridReady}
        loading={submitting.state}
        style={style}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={[{ column: "id", direction: "DESC" }]}
        filters={filters}
        permission={permission}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        singleClickEdit={true}
        topToolbar={{
          left: <>{!modeApi.isOnMode() && <Button onClick={onLoadParameters} icon={<DownloadOutlined />}>Carregar parâmetros</Button>}</>
        }}
        //rowSelectionIgnoreOnMode={true}
        // rowSelection="single"
        // onSelectionChanged={onselectionchange}
        dataAPI={dataAPI}
        modeApi={modeApi}
        modeOptions={{
          enabled: true,
          allowEdit: permission.isOk({ item: "qualidade", action: "admin" }),
          allowAdd: permission.isOk({ item: "qualidade", action: "admin" }),
          newRow: () => ({ [dataAPI.getPrimaryKey()]: uid(6), parameter_type: firstKey(OPTIONS_LAB_PARAMETERTYPE), parameter_mode: firstKey(OPTIONS_LAB_MODE), required: 0 }),
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
    </>
  );

}