import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { createUseStyles } from 'react-jss';
import { ROOT_URL, API_URL, DATE_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from "config";
import { useDataAPI, parseFilter, getFilterValue } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep, compareArrays, compareObjArrays, removeArrayMatchingElements, uniqueValues, length,isNullOrEmpty } from "utils";
import loadInit, { newWindow } from "utils/loadInitV3";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource, disableTabOnNextCell, getSelectedNodes, exitMode } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, EstadoBobine, Action, OPTIONS_LAB_MODE, OPTIONS_LAB_PARAMETERTYPE, BadgeCount, ModalMultiRangeView, ArrayTags } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdAutoCompleteEditor, AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdMultiSelectEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor, RangeDefeitosEditor, DestinosEditor } from 'components/TableV4/TableEditorsV4';
import { firstKey, firstKeyValue, includeObjectKeys, json, updateByPath, valueByPath } from 'utils/object';
import { z } from "zod";
import { CheckOutlined, CloseCircleFilled, CloseOutlined, DeleteFilled, DeleteOutlined, DownloadOutlined, EditOutlined, MoreOutlined, PrinterOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Modal, Space } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { fetchPost } from 'utils/fetch';
import { is, isEmpty, isNil } from 'ramda';
import Palete from '../paletes/Palete';
import FormPrint from '../commons/FormPrint';
import { RowsSelection } from './BobinesDefeitosList';
import { setValidationGroups, validateRows } from 'utils/useValidation';

const OPTIONS_OUTROSDEFEITOS = BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc');


const title = "Bobines Destinos";
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
    dt.rows[i]["destinos"] = json(dt.rows[i]["destinos"]);
  }
  return dt;
};

export const schema = z.object({
  largura: z.object({
    num_bobinagem: z.coerce.number(),
    estado: z.string(),
    lar: z.coerce.number({}),
    l_real: z.any().transform(v => parseInt(v))
  }).refine((v) => {
    const errors = [];
    if ((!is(Number, v.l_real) && (v.estado == "BA" || v.num_bobinagem % 10 === 0))) {
      errors.push({ path: ['l_real'], message: 'A largura real é obrigatória!' });
      throw new z.ZodError(errors);
    }
    if (v.l_real < (v.lar - 30) || v.l_real > (v.lar + 30)) {
      errors.push({ path: ['l_real'], message: 'A largura real não é válida!' });
      throw new z.ZodError(errors);
    }
    return true;
  }, {})
});

const schemaFinal = z.object({
  fc_pos: z.any(),
  ff_pos: z.any(),
  furos_pos: z.any(),
  buracos_pos: z.any(),
  rugas_pos: z.any(),
  defeitos: z.any(),
  estado: z.string(),
  prop_obs: z.string().nullable(),
  obs: z.string().nullable()
}).merge(schema).refine(v => {
  const hasDefeitos = (length(v.defeitos) > 0 || length(v.fc_pos) > 0 || length(v.ff_pos) > 0 || length(v.furos_pos) > 0 || length(v.buracos_pos) > 0 || length(v.rugas_pos) > 0 || !isNullOrEmpty(v.prop_obs) || !isNullOrEmpty(v.obs)) ? true : false;
  const estado = v.estado;
  const errors = [];
  if ((estado === "R" || estado === "DM") && !hasDefeitos) {
    errors.push({ path: ['estado'], message: 'Para classificar com DM ou R, tem de indicar pelo menos um defeito!' });
  } else if (v.defeitos.some(x => x.key === "fmp") && isNullOrEmpty(v.obs)) {
    errors.push({ path: ['obs'], message: 'Falha de Matéria Prima, preencher nas observações o motivo.' });
  } else if (v.defeitos.some(x => x.key === "esp") && isNullOrEmpty(v.prop_obs)) {
    errors.push({ path: ['prop_obs'], message: 'Gramagem, preencher nas observações das propriedades o motivo.' });
  } else if (v.defeitos.some(x => x.key === "prop") && isNullOrEmpty(v.prop_obs)) {
    errors.push({ path: ['prop_obs'], message: 'Propriedades, preencher nas observações das propriedades o motivo.' });
  }
  if (errors.length > 0) {
    throw new z.ZodError(errors);
  }
  return true;
}, {});

const useTableStyles = createUseStyles({
  recycled: {
    background: "#ffccc7 !important"
  }
});

const canChangeRow = (data) => {
  if (data?.recycle == 0 && data?.comp_actual >= 50 && !data?.carga_id) {
    return true;
  }
  return false;
}
const isRecycled = (data) => {
  if (data?.recycle == 1 || data?.comp_actual < 50) {
    return true;
  }
  return false;
}

export default ({ noid = true, print = false, edit = false, defaultFilters = {}, defaultSort = [], style, ...props }) => {
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
  const [inputParameters, setInputParameters] = useState();
  const baseFilters = {
    //...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "ListBobinesDestinos-01" }), fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/bobines/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, pageSize: 250, limit: 250 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });


  useEffect(() => {
    if (permission?.isReady) {
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

  useEffect(() => {
    if (permission?.isReady) {
      if (inputParameters?.tstamp !== props?.parameters?.tstamp) {
        const _inputParameters = loadInit({}, {}, { ...props?.parameters }, { ...location?.state });
        dataAPI.setBaseFilters({
          ..._inputParameters?.bobinagem?.id && {
            ...parseFilter("pbm.id", `==${_inputParameters?.bobinagem?.id}`, { type: "number" }),
            //...parseFilter("mb.comp_actual", `>0`, { type: "number" }),
            //...parseFilter("mb.recycle", `==0`, { type: "number" })
          },
          ..._inputParameters?.palete?.id && {
            ...parseFilter("sgppl.id", `==${_inputParameters?.palete?.id}`, { type: "number" }),
            ...parseFilter("mb.comp_actual", `>0`, { type: "number" }),
            ...parseFilter("mb.recycle", `==0`, { type: "number" })
          }
        });
        setInputParameters({
          ..._inputParameters,
          bobinagem_id: _inputParameters?.bobinagem?.id,
          bobinagem_nome: _inputParameters?.bobinagem?.nome,
          palete_id: _inputParameters?.palete?.id,
          palete_nome: _inputParameters?.palete?.nome
        });
        if (modeApi.isOnMode()) {
          modeApi.onExit(() => exitMode(gridRef.current.api, false, null, onExitMode));
        }
        refreshDataSource(gridRef.current.api);
      }
    }
  }, [permission.isReady, props?.parameters?.tstamp])

  const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
    /**
     * Método que permite antes do "commit", fazer pequenas alterações aos dados.
     * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
     * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
     * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
     */
    const field = columnPath(event.column);
    const multi = event.column.getDefinition().cellRendererParams?.multi;
    const transactions = [];
    const addTransaction = (values) => {
      const r = {};
      const keysSet = new Set(values.defeitos.map(obj => obj.key));
      OPTIONS_OUTROSDEFEITOS.forEach(obj => {
        r[obj.value] = (keysSet.has(obj.value)) ? 1 : 0;
      });
      const _data = {
        ...values, ...{
          ...r,
          prop: isNullOrEmpty(values?.prop_obs) ? 0 : 1,
          furos: length(values?.furos_pos) == 0 ? 0 : 1,
          buraco: length(values?.buraco_pos) == 0 ? 0 : 1,
          rugas: length(values?.rugas_pos) == 0 ? 0 : 1,
          ...length(values?.ff_pos) > 0 ? { ff: 1, ff_m_ini: values?.ff_pos[0]["min"], ff_m_fim: values?.ff_pos[0]["max"] } : { ff: 0, ff_m_ini: null, ff_m_fim: null },
          ...length(values?.fc_pos) > 0 ? { fc: 1, fc_diam_ini: values?.fc_pos[0]["min"], fc_diam_fim: values?.fc_pos[0]["max"] } : { fc: 0, fc_diam_ini: null, fc_diam_fim: null }
        },
        rowvalid: 0
      };
      transactions.push(_data);
    }
    if (multi) {
      const selectedNodes = getSelectedNodes(event.api);
      if (!isEmpty(selectedNodes)) {
        let cancelTxs = false;
        if (selectedNodes.some(obj => obj.id === event.node.id)) {
          let _keys = [];
          if (field == "defeitos") {
            _keys = ["value"];
          } else if (field === "ff_pos") {
            _keys = ["min", "max", "type"];
          } else if (["fc_pos", "buracos_pos", "furos_pos", "rugas_pos"].includes(field)) {
            _keys = ["min", "max"];
          }
          if (!["prop_obs", "obs", "estado"].includes(field)) {
            const { removed, added } = compareArrays(valueByPath(data, path, []), newValue, _keys);
            event.api.forEachNode(n => {
              if (cancelTxs == false && !canChangeRow(n.data)) {
                cancelTxs = true;
                transactions.length = 0;
              }
              if (!cancelTxs) {
                const _selected = selectedNodes.some(obj => obj.id === n.id);
                if (_selected) {
                  let _nodedata = removeArrayMatchingElements(valueByPath(n.data, path, []), removed, _keys);
                  _nodedata.push(...added)
                  _nodedata = uniqueValues(_nodedata, _keys);
                  addTransaction(updateByPath(n.data, field, _nodedata));
                } else if (field === "defeitos" && !_selected) {
                  let _rnv = removed.find(v => v.value == "troca_nw");
                  let _anv = added.find(v => v.value == "troca_nw");
                  if (_anv || _rnv) {
                    let _nodedata = [];
                    if (_anv) {
                      _nodedata = [...valueByPath(n.data, field, [])];
                      _nodedata.push({ ..._anv });
                      _nodedata = uniqueValues(_nodedata, _keys);
                    } else if (_rnv) {
                      _nodedata = removeArrayMatchingElements(valueByPath(n.data, field, []), [_rnv], _keys);
                    }
                    addTransaction(updateByPath(n.data, field, _nodedata));
                  }
                }
              }
            });
          } else {
            event.api.forEachNode(n => {
              if (cancelTxs == false && !canChangeRow(n.data)) {
                cancelTxs = true;
                transactions.length = 0;
              }
              if (!cancelTxs) {
                if (field === "estado" && newValue === "BA") {
                  addTransaction(updateByPath(n.data, field, newValue));
                } else if (selectedNodes.some(obj => obj.id === n.id)) {
                  addTransaction(updateByPath(n.data, field, newValue));
                } else if (field === "estado" && n.data?.estado == "BA") {
                  cancelTxs = true;
                  transactions.length = 0;
                }
              }
            });
          }
        } else {
          addTransaction(updateByPath(data, field, newValue));
        }
        if (transactions.length > 0) {
          event.api.applyServerSideTransaction({ update: transactions });
        }
        return false; //Se return === false mais nenhum processamento de dados é efetuado
      }
    }
    addTransaction(updateByPath(data, field, newValue));
    if (transactions.length > 0) {
      event.api.applyServerSideTransaction({ update: transactions });
      return false; //Se return === false mais nenhum processamento de dados é efetuado
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

  const onAddSave = useCallback(async (rows, allRows) => {
    // const rv = await validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
    // await rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

    // return (await rv.onValidationSuccess(async (p) => {
    //   setValidation(prev => ({ ...prev, ...p.alerts.error }));
    //   const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "NewLabParameter", { parameters: { rows } });
    //   result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
    //   result.onFail((p) => { });
    //   return result.success;
    //   //setFormStatus(result);
    // }));
  }, []);

  const onEditSave = useCallback(async (rows, allRows) => {
    const rv = await validateRows(rows, schemaFinal, dataAPI.getPrimaryKey(), { passthrough: false, validationGroups });
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });
    return (await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
      const keys = OPTIONS_OUTROSDEFEITOS.map(obj => obj.value);
      const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "UpdateDefeitosV2", {
        parameters: {
          rows: rows.map(v => {
            return { ...includeObjectKeys(v, [...keys, "id", "prop_obs", "obs", "l_real", "ff_pos", "fc_pos", "buracos_pos", "furos_pos", "rugas_pos", "ff_m_ini", "fc_diam_ini", "ff_m_fim", "fc_diam_fim"]) };
          })
        }
      });
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
      //...[{ label: "Apagar Parâmetro", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const validationGroups = useMemo(() => (setValidationGroups({
    largura: ["l_real", "lar", "estado", "num_bobinagem"]
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
    /**
     * editColumnControl, transfere para cada elemento entrar em modo de edição, em vez de ser a grid, para isso tem de ser true, e na grid suppressClickEdit=true  
     */
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams },
      headerComponentParams: { ...headerParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    return canChangeRow(params.data);
  }, [modeApi?.isOnMode()]);
  const isRowSelectable = useCallback((node) => {
    return canChangeRow(node.data);
  }, [modeApi?.isOnMode()]);

  const onExitMode = () => {
    gridRef.current.api.deselectAll();
  };

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

  const columnDefs = useMemo(() => {
    if (inputParameters?.tstamp) {
      return {
        cols: [
          { colId: "mb.nome", field: 'nome', ...modeApi?.isOnMode() && { checkboxSelection: true, headerCheckboxSelection: true }, headerName: 'Bobine', lockPosition: "left", ...cellParams(), width: 150, cellRenderer: (params) => <Value bold link onClick={(e) => onBobineClick(e, params)} params={params} /> },
          ...!inputParameters?.palete?.id ? [{ colId: "sgppl.nome", field: 'palete_nome', headerName: 'Palete', ...cellParams(), width: 130, cellRenderer: (params) => <Value bold link onClick={(e) => onPaleteClick(e, params)} params={params} /> }] : [],
          ...inputParameters?.palete?.id ? [{ colId: "mb.posicao_palete", field: 'posicao_palete', headerName: 'Pos.', ...cellParams(), width: 90, cellRenderer: (params) => <Value params={params} /> }] : [],
          { colId: 'mb.estado', field: 'estado', headerName: 'Estado', type: "editableColumn", cellEditor: AntdSelectEditor, width: 80, ...cellParams({ multi: true }, { options: BOBINE_ESTADOS }), cellRenderer: (params) => <EstadoBobine field={{ estado: "estado", largura: "lar" }} params={params} /> },
          { field: 'mb.troca_etiqueta', headerName: 'Troca Etiqueta', ...cellParams(), width: 70, cellRenderer: (params) => <Bool checkedValue={1} unCheckedValue={0} params={params} /> },
          { colId: 'mb.destino', field: 'destino', headerName: 'Destino', width: 350, flex: 1, ...cellParams({ multi: true }), type: "editableColumn", cellEditor: DestinosEditor, cellRenderer: (params) => <Value bold params={params} /> },
          /* { colId: 'mb.lar', field: 'lar', headerName: 'Lar.', width: 90, ...cellParams(), cellRenderer: (params) => <Value unit=" mm" params={params} /> }, */
          { colId: 'mb.comp_actual', field: 'comp_actual', headerName: 'Comp.', width: 80, ...cellParams(), cellRenderer: (params) => <Value unit=" m" params={params} /> },
          { colId: 'mb.fc_pos', field: 'fc_pos', headerName: 'F.Corte', width: 80, ...cellParams({ unit: "mm" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
          { colId: 'mb.ff_pos', field: 'ff_pos', headerName: 'F.Filme', width: 80, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual, { type: true })} params={params} /> },
          { colId: 'mb.buracos_pos', field: 'buracos_pos', headerName: 'Buracos', width: 80, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
          { colId: 'mb.furos_pos', field: 'furos_pos', headerName: 'Furos', width: 80, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
          { colId: 'mb.rugas_pos', field: 'rugas_pos', headerName: 'Rugas', width: 80, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
          { field: 'defeitos', headerName: 'Outros defeitos', sortable: false, width: 150, minWidth: 150, flex: 1, ...cellParams({}, { options: OPTIONS_OUTROSDEFEITOS, labelInValue: true }), cellRenderer: (params) => <ArrayTags params={params} isObject color="red" /> },
          { field: 'prop_obs', wrapText: true, autoHeight: false, headerName: 'Obs. Propriedades', ...cellParams({ multi: true }), width: 200, type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> },
          { field: 'obs', wrapText: true, autoHeight: false, headerName: 'Obs.', ...cellParams({ multi: true }), type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, width: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> }
        ], timestamp: new Date()
      };
    }
    return {
      cols: [],
      timestamp: new Date()
    }
  }, [validation, modeApi?.isOnMode(), inputParameters?.tstamp]);

  const filters = useMemo(() => ({
    toolbar: ["nome", "estado", { field: "lar", alias: "mb.lar", label: "Largura" }],
    more: [/* "@columns" */"nome", "estado", { field: "lar", alias: "mb.lar", label: "Largura" }, "comp"],
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

    const palete = inputParameters?.palete?.id ? inputParameters?.palete : null;
    const bobinagem = inputParameters?.bobinagem?.id ? inputParameters?.bobinagem : null;
    modalApi.setModalParameters({
      content: <FormPrint v={{ palete, bobinagem }} />,
      closable: true,
      title: palete ? `Etiquetas Bobines - Palete ${palete?.nome} ` : `Etiquetas Bobines - Bobinagem ${bobinagem?.nome} `,
      lazy: true,
      type: "modal",
      responsive: true,
      width: 500,
      height: 280,
      parameters: { /* ...getCellFocus(gridRef.current.api) */ }
    });
    modalApi.showModal();
  }

  const _rowClassRules = useMemo(() => {
    return {
      [classes.recycled]: (params) => {
        return isRecycled(params.data);
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
        defaultSort={inputParameters?.bobinagem?.id ? [{ column: 'mb.nome', direction: 'ASC' }] : [{ column: 'mb.posicao_palete', direction: 'ASC' }]}
        filters={filters}
        permission={permission}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        loadon
        //singleClickEdit={true}
        //suppressClickEdit={true}
        topToolbar={{
          start: <Space>
            {modeApi.isOnMode() && <RowsSelection dataAPI={dataAPI} modeApi={modeApi} gridApi={gridRef.current?.api} validation={validation} />}
            {/* {modeApi.isOnMode() && <Button icon={<CheckOutlined />} onClick={() => selectRows(["LAB"])}>Selecionar&nbsp;<b>LAB's</b></Button>} */}
            {!noPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>}</Space>,
          left: <></>
        }}
        //rowSelectionIgnoreOnMode={true}
        // rowSelection="single"
        // onSelectionChanged={onselectionchange}
        dataAPI={dataAPI}
        modeApi={modeApi}
        onBeforeCellEditRequest={onBeforeCellEditRequest}
        onAfterCellEditRequest={onAfterCellEditRequest}
        rowClassRules={_rowClassRules}

        onExitMode
        rowSelectionIgnoreOnMode={true}
        rowSelection="multiple"
        onSelectionChanged={() => { }}
        suppressRowClickSelection={true}
        isRowSelectable={isRowSelectable}
        {...props}
      />
    </>
  );

}