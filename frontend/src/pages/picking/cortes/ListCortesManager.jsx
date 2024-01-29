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
import { suppressKeyboardEvent, useModalApi, getCellFocus, columnPath, refreshDataSource } from 'components/TableV4/TableV4';

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, OPTIONS_TROCAETIQUETAS, Action } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdDateEditor, AntdInputEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { includeObjectKeys, json, updateByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, EditOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { AppContext } from 'app';
import { zOneOfNumber } from 'utils/schemaZodRules';

const title = "Gerir Tarefas <Troca de Etiquetas>";
const subTitle = null;
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<ToolbarTitle disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />);
}

const OPTIONS_SUBTYPE = Object.entries(OPTIONS_TROCAETIQUETAS).map(([value, { label }]) => ({ value: value, label }))

const postProcess = async (dt) => {
  for (let [i, v] of dt.rows.entries()) {
    dt.rows[i]["parameters"] = json(dt.rows[i]["parameters"], {});
  }
  return dt;
};

const schema = z.object({
  subtype: zOneOfNumber([1, 2]),
  parameters: z.object({
    artigo: z.object({
      cod: z.string().min(1)
    }),
    cliente: z.object({
      BPCNAM_0: z.string().min(1)
    }),
    data_imputacao: z.coerce.date({ description: "Data imputação" }).max(dayjs().subtract(1, 'day').toDate())
  })
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
  const defaultParameters = { method: "TasksList" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const baseFilters = {
    ...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "TasksList-01" }), fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/trocaetiquetas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" }
    }
  });

  useEffect(() => {
    if (permission?.isReady) {
      modeApi.load({
        key: null,
        enabled: true,
        allowEdit: permission.isOk({ item: "trocaetiquetas", action: "admin" }),
        allowAdd: permission.isOk({ item: "trocaetiquetas", action: "admin" }),
        newRow: () => ({
          [dataAPI.getPrimaryKey()]: uid(6), type: 1, subtype: 2, status: 1, runtype: 1, appliesto: 1, mode: 1, parameters: {
            artigo: { cod: null },
            cliente: { BPCNUM_0: null },
            data_imputacao: dayjs().subtract(1, 'day').format(DATE_FORMAT)
          }
        }),
        onModeChange: (m) => { },
        newRowIndex: null,
        onAddSave: async (rows, allRows) => await onAddSave(rows, allRows),
        onEditSave: async (rows, allRows) => await onEditSave(rows, allRows),
        editText: null,
        addText: null,
        saveText: null

      });
    }
  }, [permission?.isReady]);

  const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
    if (newValue && colDef.field === "cod") {
      data = updateByPath(data, "parameters.artigo", includeObjectKeys(newValue, ["id", "cod", "des", "lar", "core"]));
      return data;
    } else if (newValue && colDef.field === "cliente") {
      data = updateByPath(data, "parameters.cliente", includeObjectKeys(newValue, ["BPCNUM_0", "BPCNAM_0"]));
      return data;
    }
    return null;
  }
  const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
    const r = await dataAPI.validateRows([data], schema, dataAPI.getPrimaryKey());
    r.onValidationFail((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }

  const onAddSave = useCallback(async (rows, allRows) => {
    const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey());
    await rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/trocaetiquetas/sql/`, "NewTask", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      return result.success;
      //setFormStatus(result);
    }));
  }, []);

  const onEditSave = useCallback(async (rows, allRows) => {
    const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey());
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/trocaetiquetas/sql/`, "UpdateTasks", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }));
  }, []);

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    const _safePost = async (method, parameters) => {
      const result = await dataAPI.safePost(`${API_URL}/trocaetiquetas/sql/`, method, { parameters: parameters });
      result.onValidationFail((p) => { });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
    }

    switch (option.key) {
      case "delete":
        Modal.confirm({
          content: <div>Tem a certeza que deseja apagar a tarefa <b>{row.nome}</b>?</div>, onOk: async () => {
            await _safePost("DeleteTask", { id: row.id });
          }
        })
        break;
      case "open": await _safePost("OpenTask", { id: row.id }); break;
      case "close": await _safePost("CloseTask", { id: row.id }); break;
    };

    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      ...params.data.status == "9" ? [{ label: "Abrir tarefa", key: "open", icon: <EditOutlined style={{ fontSize: "16px" }} /> }] : [],
      ...params.data.status == "1" ? [{ label: "Fechar tarefa", key: "close", icon: <StopOutlined style={{ fontSize: "16px" }} /> }] : [],
      { type: 'divider' },
      ...[{ label: "Apagar tarefa", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { validation, modeApi, modalApi, ...params } };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    if (params.data.status == 1) {
      return true;
    }
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
      { field: 'nome', headerName: 'Nome', ...cellParams(), lockPosition: "left", minWidth: 120, cellRenderer: (params) => <Value bold params={params} /> },
      { field: 'subtype', headerName: 'Tipo', ...cellParams(), minWidth: 120, type: "editableColumn", cellEditor: AntdSelectEditor, cellEditorParams: { options: OPTIONS_SUBTYPE }, cellRenderer: (params) => <Options map={OPTIONS_TROCAETIQUETAS} params={params} /> },
      { field: 'timestamp', headerName: 'Data', ...cellParams(), minWidth: 100, cellRenderer: (params) => <Value datetime params={params} /> },
      { field: 'cod', headerName: 'Artigo Cód.', ...cellParams({ path: "parameters.artigo.cod" }), minWidth: 100, type: "editableColumn", cellEditor: ArtigosLookupEditor, cellRenderer: (params) => <Value bold params={params} /> },
      { field: 'des', headerName: 'Artigo', ...cellParams({ path: "parameters.artigo.des" }), minWidth: 200, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { field: 'cliente', headerName: 'Cliente', ...cellParams({ path: "parameters.cliente.BPCNAM_0" }), minWidth: 200, type: "editableColumn", cellEditor: ClientesLookupEditor, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { field: 'data_imputacao', headerName: 'Data Imputação', ...cellParams({ path: "parameters.data_imputacao", format: DATE_FORMAT }), minWidth: 100, type: "editableColumn", cellEditor: AntdDateEditor, cellRenderer: (params) => <Value datetime params={params} /> },
      { field: 'status', headerName: 'Fechado', ...cellParams(), width: 70, cellRenderer: (params) => <Bool unCheckedColor='#73d13d' checkedValue={9} unCheckedValue={1} params={params} /> },
      { field: 'obs', wrapText: true, autoHeight: false, headerName: 'Obs', ...cellParams(), width: 200, type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, cellRenderer: (params) => <MultiLine dataType='json' params={params} /> }
    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode()]);


  const filters = useMemo(() => ({
    toolbar: [
      { field: "subtype", type: "options", options: OPTIONS_SUBTYPE },
      { field: "timestamp", type: "date", mask: "date({k})" },
      "bobine_nome", "bobine_original_nome"
    ],
    more: [/* "@columns"*/
      { field: "cod", alias: "pa1.cod" },
      { field: "des", alias: "pa1.des" },
      { field: "cliente", alias: "pc1.nome" },
      { field: "status", type: "options", options: "opt:4", label: "Estado" },
    ],
    no: [...Object.keys(baseFilters), "action"]
  }), []);

  return (
    <>
      <TitleForm loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        loading={submitting.state}
        style={style}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={[{ column: "timestamp", direction: "DESC" }]}
        filters={filters}
        permission={permission}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        //rowSelectionIgnoreOnMode={true}
        // rowSelection="single"
        // onSelectionChanged={onselectionchange}
        dataAPI={dataAPI}
        modeApi={modeApi}
        onBeforeCellEditRequest={onBeforeCellEditRequest}
        onAfterCellEditRequest={onAfterCellEditRequest}
        {...props}
      />
    </>
  );

}