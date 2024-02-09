import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { createUseStyles } from 'react-jss';
import { ROOT_URL, API_URL, DATE_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from "config";
import { useDataAPI, parseFilter, getFilterValue } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import loadInit, { newWindow } from "utils/loadInitV3";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, useModalApi, getCellFocus, columnPath, refreshDataSource, disableTabOnNextCell, HeaderCheck } from 'components/TableV4/TableV4';

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, EstadoBobine, Action, OPTIONS_LAB_MODE, OPTIONS_LAB_PARAMETERTYPE, BadgeCount, ModalMultiRangeView, ArrayTags } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdAutoCompleteEditor, AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdMultiSelectEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor, RangeDefeitosEditor } from 'components/TableV4/TableEditorsV4';
import { firstKey, firstKeyValue, includeObjectKeys, json, updateByPath, valueByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, DownloadOutlined, EditOutlined, PrinterOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Checkbox, Modal } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { fetchPost } from 'utils/fetch';
import { isNil } from 'ramda';
import Palete from '../paletes/Palete';
import { compareObjArrays } from 'utils/index';

const OPTIONS_OUTROSDEFEITOS= BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc');


const title = "Parâmetros";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitle disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

const postProcess = async (dt) => {
  
  for (let [i, v] of dt.rows.entries()) {
    let defeitos = [];
    for (let p of OPTIONS_OUTROSDEFEITOS) {
      (v[p.value] === 1) && defeitos.push(p);
    }
    dt.rows[i]["defeitos"] = defeitos;
    dt.rows[i]["estado_original"] = dt.rows[i]["estado"];
    dt.rows[i]["estado"] = dt.rows[i]["estado"];
    dt.rows[i]["fc_pos"] = json(dt.rows[i]["fc_pos"]);
    dt.rows[i]["ff_pos"] = json(dt.rows[i]["ff_pos"]);
    dt.rows[i]["furos_pos"] = json(dt.rows[i]["furos_pos"]);
    dt.rows[i]["buracos_pos"] = json(dt.rows[i]["buracos_pos"]);
    dt.rows[i]["rugas_pos"] = json(dt.rows[i]["rugas_pos"]);
  }
  return dt;
};

export const schema = z.object({
  nome: z.string().min(1),
  unit: z.string().min(1),
  value_precision: z.coerce.number().min(0),
  lvalues: zGroupIntervalNumber("min_value", "max_value", { description: { init: "Valor mínimo", end: "Valor máximo" }, nullable: false })
});

const useTableStyles = createUseStyles({
  recycled: {
    background: "#ffccc7 !important"
  }
});

export default ({ noid = true, noPrint = true, noEdit = true, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const classes = useTableStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const modeApi = useModeApi() //not Required;
  const permission = usePermission({ permissions: props?.permissions });
  const defaultParameters = { method: "BobinesListV2" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const [lastTabs, setLastTabs] = useState({ palete: "1", bobinagem: "1" });
  const [checks, updateChecks] = useImmer({
    chk: [],
    timestamp: new Date()
  });
  const inputParameters = useRef(loadInit({}, {}, { ...props?.parameters }, { ...location?.state }));
  const baseFilters = {
    //...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "ListBobinesDefeitos-01" }), fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/bobines/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, pageSize: 250, limit: 250 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });


  useEffect(() => {
    if (permission?.isReady) {
      dataAPI.setFilters({
        ...inputParameters.current?.bobinagem_id && {
          ...parseFilter("pbm.id", `==${inputParameters.current?.bobinagem_id}`, { type: "number" }),
          //...parseFilter("mb.comp_actual", `>0`, { type: "number" }),
          //...parseFilter("mb.recycle", `==0`, { type: "number" })
        },
        ...inputParameters.current?.palete_id && {
          ...parseFilter("sgppl.id", `==${inputParameters.current?.palete_id}`, { type: "number" }),
          ...parseFilter("mb.comp_actual", `>0`, { type: "number" }),
          ...parseFilter("mb.recycle", `==0`, { type: "number" })
        }
      });
      modeApi.load({
        key: null,
        enabled: true,
        allowEdit: permission.isOk({ action: "changeDefeitos" }),
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
    const { check, checkKey } = colDef.cellRendererParams;
    if (check) {
      const _checkKey = checkKey ? checkKey : colDef.field;
      if (checks?.[_checkKey].includes(event.node.id)) {
        const {removed,added} = compareObjArrays(valueByPath(data,path),newValue,"value");
        console.log("------------------------",removed,added);
        const transactions = [];
        for (const v of checks[_checkKey]) {
          console.log("=====>>>>>>>>>>>>>>>>>",event.api.getRowNode(v).data, colDef.field, newValue)
          transactions.push({ ...updateByPath(event.api.getRowNode(v).data, colDef.field, newValue), rowvalid: 0 });
        }
        if (transactions.length > 0) {
          event.api.applyServerSideTransaction({ update: transactions });
        }
        return false; //Se return === false o tratamento executado na Table é ignorado
      }
    } else {
      return null;
    }


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
    const r = await dataAPI.validateRows([data], schema, dataAPI.getPrimaryKey(), { validationGroups });
    r.onValidationFail((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }

  const onAddSave = useCallback(async (rows, allRows) => {
    const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
    await rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "NewLabParameter", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      return result.success;
      //setFormStatus(result);
    }));
  }, []);

  const onEditSave = useCallback(async (rows, allRows) => {
    const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "UpdateLabParameter", { parameters: { rows } });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }));
  }, []);

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

  const validationGroups = useMemo(() => (dataAPI.validationGroups({
    lvalues: ["min_value", "max_value"]
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
    /**
     * editColumnControl, transfere para cada elemento entrar em modo de edição, em vez de ser a grid, para isso tem de ser true, e na grid suppressClickEdit=true  
     */
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, checks, updateChecks, editColumControl: true, ...params },
      cellEditorParams: { ...editorParams },
      headerComponentParams: { checks, updateChecks, checkKey: "chk", ...headerParams }
    };
  }, [validation, modeApi?.isOnMode(), checks.timestamp]);

  const isCellEditable = useCallback((params) => {
    return (params.data?.recycle==1 || params.data?.comp_actual<=50) ? false : true
    /* if (modeApi.isOnAddMode() && ["cliente_abv", "liminf", "diam_ref", "limsup"].includes(params.colDef.field)) {
      return (params.data.cliente_id) ? false : true;
    }
    if (modeApi.isOnEditMode() && ["artigo_cod", "cliente_cod"].includes(params.colDef.field)) {
      return false;
    } */
    //return true;
  }, [modeApi?.isOnMode()]);

  const onPaleteClick = (e, { data }) => {
    modalApi.setModalParameters({
      content: <Palete tab={lastTabs.palete} setTab={(v) => setLastTabs(prev => ({ ...prev, palete: v }))} parameters={{ palete: { id: data?.palete_id, nome: data?.palete_nome }, palete_id: data?.palete_id, palete_nome: data?.palete_nome }} />,
      closable: true,
      title: null, //"Carregar Parâmetros",
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "95%",
      parameters: {} //{ ...getCellFocus(gridRef.current.api) }
    });
    modalApi.showModal();
  }
  const onBobineClick = (e, { data }) => {
    newWindow(`${ROOT_URL}/producao/bobine/details/${data.id}/`, {}, `bobine-${data.id}`);
  }
  const onDefeitosRangeClick = ({ column, data }, minValue, maxValue, extraFields = {}) => {
    const _value = data[column.getDefinition().field];
    const { unit } = column.getDefinition()?.cellRendererParams || {};
    if (_value && _value.length > 0) {
      modalApi.setModalParameters({
        content: <ModalMultiRangeView unit={unit} minValue={minValue} maxValue={maxValue} value={_value} extraFields={extraFields} />,
        closable: true,
        title: column.getDefinition().headerName,
        lazy: true,
        type: "modal",
        responsive: true,
        width: "500px",
        parameters: { ...getCellFocus(gridRef.current.api) }
      });
      modalApi.showModal();
    }
  }

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "mb.nome", field: 'nome',checkboxSelection: true,headerCheckboxSelection: true, headerName: 'Bobine', lockPosition: "left", ...cellParams(), width: 140, cellRenderer: (params) => <Value bold link onClick={(e) => onBobineClick(e, params)} params={params} /> },
      ...!inputParameters.current?.palete_id ? [{ colId: "sgppl.nome", field: 'palete_nome', headerName: 'Palete', ...cellParams(), width: 130, cellRenderer: (params) => <Value bold link onClick={(e) => onPaleteClick(e, params)} params={params} /> }] : [],
      ...inputParameters.current?.palete_id ? [{ colId: "mb.posicao_palete", field: 'posicao_palete', headerName: 'Pos.', ...cellParams(), width: 90, cellRenderer: (params) => <Value params={params} /> }] : [],
      { colId: 'mb.estado', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, field: 'estado', headerName: 'Estado', type: "editableColumn", cellEditor: AntdSelectEditor, width: 90, ...cellParams({ check: true, checkKey: "chk" }, { options: BOBINE_ESTADOS }), cellRenderer: (params) => <EstadoBobine field={{ estado: "estado", largura: "lar" }} params={params} /> },
      { colId: 'mb.lar', field: 'lar', headerName: 'Lar.', width: 90, ...cellParams(), cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'mb.l_real', field: 'l_real', headerName: 'Lar. Real', width: 90, ...cellParams(null, {}), type: "editableColumn", singleClickEdit: true, cellEditor: AntdInputNumberEditor, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'pbm.comp', field: 'comp_original', headerName: 'Comp. Original', width: 70, ...cellParams(), cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.comp_actual', field: 'comp_actual', headerName: 'Comp.', width: 70, ...cellParams(), cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.fc_pos', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, field: 'fc_pos', headerName: 'F.Corte', width: 90, ...cellParams({ check: true, checkKey: "chk", unit: "mm" }), type: "editableColumn", cellEditor: RangeDefeitosEditor, cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },

      { colId: 'mb.ff_pos', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, field: 'ff_pos', headerName: 'F.Filme', width: 90, ...cellParams({ check: true, checkKey: "chk", unit: "m" }), type: "editableColumn", cellEditor: RangeDefeitosEditor, cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual, { type: true })} params={params} /> },
      { colId: 'mb.buracos_pos', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, field: 'buracos_pos', headerName: 'Buracos', width: 90, ...cellParams({ check: true, checkKey: "chk", unit: "m" }), type: "editableColumn", cellEditor: RangeDefeitosEditor, cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      { colId: 'mb.furos_pos', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, field: 'furos_pos', headerName: 'Furos', width: 90, ...cellParams({ check: true, checkKey: "chk", unit: "m" }), type: "editableColumn", cellEditor: RangeDefeitosEditor, cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      { colId: 'mb.rugas_pos', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, field: 'rugas_pos', headerName: 'Rugas', width: 90, ...cellParams({ check: true, checkKey: "chk", unit: "m" }), type: "editableColumn", cellEditor: RangeDefeitosEditor, cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      { field: 'defeitos', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, headerName: 'Outros defeitos', sortable: false, width: 390,minWidth: 390, flex: 1, ...cellParams({ check: true, checkKey: "chk" }, { options: OPTIONS_OUTROSDEFEITOS,labelInValue:true }), type: "editableColumn", cellEditor: AntdMultiSelectEditor, cellRenderer: (params) => <ArrayTags params={params} isObject color="red" /> },
      { field: 'prop_obs', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, wrapText: true, autoHeight: false, headerName: 'Obs. Propriedades', ...cellParams({ check: true, checkKey: "chk" }), width: 200,type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> },
      { field: 'obs', ...modeApi?.isOnMode() && { headerComponent: HeaderCheck }, wrapText: true, autoHeight: false, headerName: 'Obs.', ...cellParams({ check: true, checkKey: "chk" }), type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, width: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> }
      // { field: 'designacao', headerName: 'Designação', ...cellParams(), type: "editableColumn", cellEditor: AntdInputEditor, width: 250, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      // { field: 'parameter_type', headerName: 'Tipo', ...cellParams({ map: OPTIONS_LAB_PARAMETERTYPE }), type: "editableColumn", cellEditor: AntdSelectEditor, width: 120, cellRenderer: (params) => <Options style={{ width: "100px" }} params={params} /> },
      // { field: 'parameter_mode', headerName: 'Modo', ...cellParams({ map: OPTIONS_LAB_MODE }), type: "editableColumn", cellEditor: AntdSelectEditor, width: 120, cellRenderer: (params) => <Options style={{ width: "80px" }} params={params} /> },
      // { field: 'unit', headerName: 'Unidade', ...cellParams({}, { remote: { column: "unit", fetch: fecthUnits } }), type: "editableColumn", cellEditor: AntdAutoCompleteEditor, width: 120, cellRenderer: (params) => <Value params={params} /> },
      // { field: 'min_value', headerName: 'Min.', ...cellParams(null, { min: 0, max: 100 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value params={params} /> },
      // { field: 'max_value', headerName: 'Max.', ...cellParams(null, { min: 0, max: 100 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value params={params} /> },
      // { field: 'value_precision', headerName: 'Precisão', ...cellParams(null, { min: 0, max: 6 }), type: "editableColumn", cellEditor: AntdInputNumberEditor, width: 140, cellRenderer: (params) => <Value params={params} /> },
      // { field: 'required', headerName: 'Obrigatório', ...cellParams(null, { checkedValue: 1, unCheckedValue: 0 }), type: "editableColumn", cellEditor: AntdCheckboxEditor, width: 70, cellRenderer: (params) => <Bool checkedValue={1} unCheckedValue={0} params={params} /> },
      // { field: 'versao', headerName: 'Versão', ...cellParams(), width: 80, cellRenderer: (params) => <Value params={params} /> }
    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode(), checks.timestamp]);

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
    // modalApi.setModalParameters({
    //   content: <LabLoadParameters refreshParentData={() => { refreshDataSource(gridRef.current.api); }} />,
    //   closable: true,
    //   title: "Carregar Parâmetros",
    //   lazy: true,
    //   type: "drawer",
    //   responsive: true,
    //   width: "1100px",
    //   parameters: { /* ...getCellFocus(gridRef.current.api) */ }
    // });
    // modalApi.showModal();
  }, []);

  const onPrint = () => {
    const palete = parameters.palete?.id ? parameters?.palete : null;
    const bobinagem = parameters.bobinagem?.id ? parameters?.bobinagem : null;
    const _title = palete ? `Etiquetas Bobines - Palete ${palete?.nome} ` : `Etiquetas Bobines - Bobinagem ${bobinagem?.nome} `;
    setModalParameters({ content: "print", palete, bobinagem, title: _title, width: 500, height: 280 });
    showModal();
  }

  const _rowClassRules = useMemo(() => {
    return {
      [classes.recycled]: (params) => {
        return params.data?.recycle === 1;
      }
    };
  }, []);

  return (
    <>
      <TitleForm visible={false} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        loading={submitting.state}
        style={{ height: "65vh" }}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={inputParameters.current?.bobinagem_id ? [{ column: 'mb.nome', direction: 'ASC' }] : [{ column: 'mb.posicao_palete', direction: 'ASC' }]}
        filters={filters}
        permission={permission}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        //singleClickEdit={true}
        suppressClickEdit={true}
        topToolbar={{
          start: <>{!noPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>}</>
        }}
        //rowSelectionIgnoreOnMode={true}
        // rowSelection="single"
        // onSelectionChanged={onselectionchange}
        dataAPI={dataAPI}
        modeApi={modeApi}
        onBeforeCellEditRequest={onBeforeCellEditRequest}
        onAfterCellEditRequest={onAfterCellEditRequest}
        rowClassRules={_rowClassRules}

        rowSelectionIgnoreOnMode={true}
        rowSelection="multiple"
        onSelectionChanged={()=>{}}
        suppressRowClickSelection={true}
        isRowSelectable={()=>{return true;}}
        {...props}
      />
    </>
  );

}