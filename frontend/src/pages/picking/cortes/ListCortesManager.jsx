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

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { includeObjectKeys, json, updateByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, EditOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { AppContext } from 'app';
import { zOneOfNumber } from 'utils/schemaZodRules';

const title = "Gerir Cortes";
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
  designacao: z.string().min(1)
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
  const defaultParameters = { method: "CortesList" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const baseFilters = {
    //...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "CortesList-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
    payload: {
      url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });

  useEffect(() => {
    if (permission?.isReady) {
      modeApi.load({
        key: null,
        enabled: true,
        allowEdit: permission.isOk({ item: "cortes", action: "admin" }),
        allowAdd: false,
        newRow: () => ({ [dataAPI.getPrimaryKey()]: uid(6) }),
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
    // if (newValue && colDef.field === "cod") {
    //   data = updateByPath(data, "parameters.artigo", includeObjectKeys(newValue, ["id", "cod", "des", "lar", "core"]));
    //   return data;
    // }
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

    // return (await rv.onValidationSuccess(async (p) => {
    //   setValidation(prev => ({ ...prev, ...p.alerts.error }));
    //   const result = await dataAPI.safePost(`${API_URL}/trocaetiquetas/sql/`, "NewTask", { parameters: { rows } });
    //   result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
    //   result.onFail((p) => { });
    //   return result.success;
    //   //setFormStatus(result);
    // }));
  }, []);

  const onEditSave = useCallback(async (rows, allRows) => {
    const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey());
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/ordensfabrico/sql/`, "UpdateCortes", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }));
  }, []);

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    // const _safePost = async (method, parameters) => {
    //   const result = await dataAPI.safePost(`${API_URL}/trocaetiquetas/sql/`, method, { parameters: parameters });
    //   result.onValidationFail((p) => { });
    //   result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
    //   result.onFail((p) => { });
    //   //setFormStatus(result);
    // }

    // switch (option.key) {
    //   case "delete":
    //     Modal.confirm({
    //       content: <div>Tem a certeza que deseja apagar a tarefa <b>{row.nome}</b>?</div>, onOk: async () => {
    //         await _safePost("DeleteTask", { id: row.id });
    //       }
    //     })
    //     break;
    //   case "open": await _safePost("OpenTask", { id: row.id }); break;
    //   case "close": await _safePost("CloseTask", { id: row.id }); break;
    // };

    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      // ...params.data.status == "9" ? [{ label: "Abrir tarefa", key: "open", icon: <EditOutlined style={{ fontSize: "16px" }} /> }] : [],
      // ...params.data.status == "1" ? [{ label: "Fechar tarefa", key: "close", icon: <StopOutlined style={{ fontSize: "16px" }} /> }] : [],
      // { type: 'divider' },
      // ...[{ label: "Apagar tarefa", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { validation, modeApi, modalApi, ...params } };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    return true;
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      //{ colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
      { colId: "pc2.designacao", field: 'designacao', headerName: 'Designação', ...cellParams(), type: "editableColumn", cellEditor: AntdInputEditor, lockPosition: "left", width: 190, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: "pc2.versao", field: 'versao', headerName: 'Versão', ...cellParams(), width: 80, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pc.largura_util", field: 'largura_util', headerName: 'Lar. útil', ...cellParams(), width: 70, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pc.largura_json", field: 'largura_json', headerName: 'Larguras', sortable: true, ...cellParams(), width: 250, cellRenderer: (params) => <Cortes params={params} /> },
      { colId: "pc2.largura_ordem", field: 'largura_ordem', headerName: 'Esquema', sortable: false, ...cellParams(), width: 250, flex: 1, cellRenderer: (params) => <CortesOrdem params={params} /> },
      { field: 'pc2.status', field: "status", headerName: 'Ativo', ...cellParams(), type: "editableColumn", cellEditor: AntdCheckboxEditor, width: 70, cellRenderer: (params) => <Bool checkedValue={1} unCheckedValue={0} params={params} /> },
    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode()]);


  const filters = useMemo(() => ({
    toolbar: ["designacao", "versao", "largura_util", { field: "status", type: "options", options: "opt:5", label: "Estado" }],
    more: [/* "@columns"*/],
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
        defaultSort={[{ column: "pc2.updated_date", direction: "DESC" }]}
        filters={filters}
        permission={permission}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        singleClickEdit={true}
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