import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { createUseStyles } from 'react-jss';
import { ROOT_URL, API_URL, DATE_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from "config";
import { useDataAPI as useDataAPIV4, parseFilter, getFilterValue } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep, compareArrays, compareObjArrays, removeArrayMatchingElements, uniqueValues, length, isNullOrEmpty, noValue } from "utils";
import loadInit, { newWindow } from "utils/loadInitV3";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource, disableTabOnNextCell, getSelectedNodes, exitMode, getAllNodes } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, EstadoBobine, Action, OPTIONS_LAB_MODE, OPTIONS_LAB_PARAMETERTYPE, BadgeCount, ModalMultiRangeView, ArrayTags, useDestinosStyles } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdAutoCompleteEditor, AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdMultiSelectEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor, DestinosEditor, FormDestinosEditor, RangeDefeitosEditor } from 'components/TableV4/TableEditorsV4';
import { excludeObjectKeys, firstKey, firstKeyValue, includeObjectKeys, json, updateByPath, valueByPath } from 'utils/object';
import { z } from "zod";
import { CheckOutlined, CloseCircleFilled, CloseOutlined, DeleteFilled, DownloadOutlined, EditOutlined, ExpandOutlined, MoreOutlined, PrinterOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Modal, Space } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { fetchPost } from 'utils/fetch';
import { is, isEmpty, isNil } from 'ramda';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import Palete from '../paletes/Palete';
import FormPrint from '../commons/FormPrint';
import { setValidationGroups, validateRows } from 'utils/useValidation';
import { postProcess } from './BobinesDefeitosList';

const OPTIONS_OUTROSDEFEITOS = BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc');

const title = "Bobines Destinos";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitle disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}



export const RowsSelection = ({ dataAPI, modeApi, gridApi, validation }) => {

  const handleSelectionClick = (v, select = 1) => {
    const k = v.key.split(":");
    gridApi.forEachNode(node => {
      if (k.length == 2) {
        if (k[0].includes(node.data.estado) && k[1].includes(node.data.lar) && canChangeRow(node.data)) {
          node.setSelected(select == 1);
        }
      } else {
        if (k[0] === "clearall") {
          node.setSelected(false);
        } else {
          if (k[0].includes(node.data.estado) && canChangeRow(node.data)) {
            node.setSelected(select == 1);
          }
        }
      }
    });
  }
  const selectionOptions = useMemo(() => {
    if (dataAPI.hasData() || modeApi.isOnMode()) {
      const _keysAdded = [];
      const itemsE = [];
      const itemsL = [];

      const appendItem = (n) => {
        if (!_keysAdded.includes(n.estado)) {
          _keysAdded.push(n.estado);
          itemsE.push({ key: n.estado, label: <div style={{ display: "flex", justifyContent: "space-between", width: "150px", alignItems: "center" }}><div><b>{n.estado}</b></div><Button onClick={(e) => { e.stopPropagation(); handleSelectionClick({ key: `${n.estado}` }, 0); }} size="small" icon={<CloseOutlined />} /></div> });
        }
        if (!_keysAdded.includes(`${n.estado}:${n.lar}`)) {
          _keysAdded.push(`${n.estado}:${n.lar}`);
          itemsL.push({ key: `${n.estado}:${n.lar}`, label: <div style={{ display: "flex", justifyContent: "space-between", width: "150px", alignItems: "center" }}><div><b>{n.estado}</b>&nbsp;{n.lar}</div><Button onClick={(e) => { e.stopPropagation(); handleSelectionClick({ key: `${n.estado}:${n.lar}` }, 0); }} size="small" icon={<CloseOutlined />} /></div> });
        }
      }

      if (modeApi.isOnMode()) {
        gridApi.forEachNode(n => {
          appendItem(n.data);
        });
      } else {
        dataAPI.getData().rows.forEach(n => {
          appendItem(n);
        });
      }
      return { items: [{ key: "clearall", label: "Limpar Seleção" }, { type: "divider" }, ...itemsE, { type: "divider" }, ...itemsL], onClick: (v) => handleSelectionClick(v, 1) };
    }
    return { items: [] };
  }, [dataAPI.getTimeStamp(), validation]);

  return (<Dropdown trigger={["click"]} menu={selectionOptions}><Button><Space>Selecionar<MoreOutlined /></Space></Button></Dropdown>);
}

// export const schema = z.object({
//   largura: z.object({
//     num_bobinagem: z.coerce.number(),
//     estado: z.string(),
//     lar: z.coerce.number({}),
//     l_real: z.any().transform(v => parseInt(v))
//   }).refine((v) => {
//     const errors = [];
//     if ((!is(Number, v.l_real) && (v.estado == "BA" || v.num_bobinagem % 10 === 0))) {
//       errors.push({ path: ['l_real'], message: 'A largura real é obrigatória!' });
//       throw new z.ZodError(errors);
//     }
//     if (v.l_real < (v.lar - 30) || v.l_real > (v.lar + 30)) {
//       errors.push({ path: ['l_real'], message: 'A largura real não é válida!' });
//       throw new z.ZodError(errors);
//     }
//     return true;
//   }, {})
// });

// export const schemaFinal = z.object({
//   fc_pos: z.any(),
//   ff_pos: z.any(),
//   furos_pos: z.any(),
//   buracos_pos: z.any(),
//   rugas_pos: z.any(),
//   defeitos: z.any(),
//   estado: z.string(),
//   prop_obs: z.string().nullable(),
//   palete_nome: z.string().nullable(),
//   obs: z.string().nullable()
// }).merge(schema).refine(v => {
//   const hasDefeitos = (length(v.defeitos.filter(x => x.value !== "troca_nw")) > 0 || length(v.fc_pos) > 0 || length(v.ff_pos) > 0 || length(v.furos_pos) > 0 || length(v.buracos_pos) > 0 || length(v.rugas_pos) > 0 || !isNullOrEmpty(v.prop_obs) || !isNullOrEmpty(v.obs)) ? true : false;
//   const estado = v.estado;
//   const errors = [];
//   if ((estado === "R" || estado === "DM") && !hasDefeitos) {
//     errors.push({ path: ['estado'], message: 'Para classificar com DM ou R, tem de indicar pelo menos um defeito!' });
//   } else if (v.defeitos.some(x => x.key === "fmp") && isNullOrEmpty(v.obs)) {
//     errors.push({ path: ['obs'], message: 'Falha de Matéria Prima, preencher nas observações o motivo.' });
//   } else if (v.defeitos.some(x => x.key === "esp") && isNullOrEmpty(v.prop_obs)) {
//     errors.push({ path: ['prop_obs'], message: 'Gramagem, preencher nas observações das propriedades o motivo.' });
//   } else if (v.defeitos.some(x => x.key === "prop") && isNullOrEmpty(v.prop_obs)) {
//     errors.push({ path: ['prop_obs'], message: 'Propriedades, preencher nas observações das propriedades o motivo.' });
//   }
//   if (errors.length > 0) {
//     throw new z.ZodError(errors);
//   }
//   return true;
// }, {});

export const validationGroups = (dataAPI) => setValidationGroups({});

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

const DetailRenderer = ({ data }) => {
  const classes = useDestinosStyles();

  const valueDestinos = useMemo(() => {
    return noValue(data?.destinos, {});
  });

  return (<Row gutterWidth={50} style={{ backgroundColor: "#f6fcff", padding: "15px 40px", userSelect: "text" }}>
    <Col>{valueDestinos?.destinos && <>

      <Row style={{ height: "30px", fontWeight: 700, backgroundColor: "#f5f5f5", border: "solid 1px #d9d9d9", borderRadius: "5px 5px 0px 0px" }} wrap='nowrap'>
        <Col width={70} style={{ borderRight: "solid 1px #d9d9d9" }}>Prior.</Col>
        <Col width={250} style={{ borderRight: "solid 1px #d9d9d9" }}>Cliente</Col>
        <Col width={70} style={{ borderRight: "solid 1px #d9d9d9" }}>Largura</Col>
        <Col>Obs.</Col>
      </Row>

      {valueDestinos.destinos.map((v, idx) => {
        return (<Row key={`dst-${data.id}-${idx}`} style={{ backgroundColor: "#fafafa", minHeight: "30px", borderBottom: "solid 1px #d9d9d9", borderLeft: "solid 1px #d9d9d9", borderRight: "solid 1px #d9d9d9" }} wrap='nowrap'>
          <Col width={70} style={{ borderRight: "solid 1px #d9d9d9" }} className={classes[v.prioridade]} >{v.prioridade}</Col>
          <Col width={250} style={{ borderRight: "solid 1px #d9d9d9" }}>{v.cliente.BPCNAM_0}</Col>
          <Col width={70} style={{ borderRight: "solid 1px #d9d9d9" }}>{v.largura} mm</Col>
          <Col style={{ whiteSpace: "pre-wrap" }}>{v.obs}</Col>
        </Row>);

      })}

    </>}</Col>
    <Col>{valueDestinos?.obs_prioridades && <>

      <Row style={{ height: "30px", fontWeight: 700, backgroundColor: "#f5f5f5", border: "solid 1px #d9d9d9", borderRadius: "5px 5px 0px 0px" }} wrap='nowrap'>
        <Col width={70} style={{ borderRight: "solid 1px #d9d9d9" }}>Prior.</Col>
        <Col>Obs.</Col>
      </Row>

      {valueDestinos.obs_prioridades.map((v, idx) => {
        return (<Row key={`op-${data.id}-${idx}`} style={{ backgroundColor: "#fafafa", minHeight: "30px", borderBottom: "solid 1px #d9d9d9", borderLeft: "solid 1px #d9d9d9", borderRight: "solid 1px #d9d9d9" }} wrap='nowrap'>
          <Col width={70} style={{ borderRight: "solid 1px #d9d9d9" }} className={classes[v.id]} >{v.id}</Col>
          <Col style={{ whiteSpace: "pre-wrap" }}>{v.value}</Col>
        </Row>);

      })}

    </>}</Col>
  </Row>);

};

export default ({ noid = true, noPrint = true, noEdit = true, loadOnInit = true, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const classes = useTableStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi(); //not Required;
  const modeApi = useModeApi(); //not Required;
  const permission = usePermission({ permissions: props?.permissions });
  const defaultParameters = { method: "BobinesListV2", validate: props?.validate };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const [lastTabs, setLastTabs] = useState({ palete: "1", bobinagem: "1" });
  const [inputParameters, setInputParameters] = useState();
  const _inputParameters = useRef(loadInit({}, {}, { ...props?.parameters }, { ...location?.state }));
  const baseFilters = {
    //...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPIV4({
    ...((!noid || location?.state?.noid === false) && { id: "ListBobinesDestinos-01" }), fnPostProcess: (dt) => postProcess(dt, { validate: props?.validate }),
    payload: {
      url: `${API_URL}/bobines/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, pageSize: 250, limit: 250 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });

  useEffect(() => {
    if (!isNil(inputParameters)) {
      //It means that this has parameters already, so the need to exit mode and reload grid data!
      //Importante para a navegação através do titleform previous|next
      if (modeApi.isOnMode() && !props.validate) {
        modeApi.onExit(() => exitMode(gridRef.current.api, false, null, onExitMode));
      }
      refreshDataSource(gridRef.current.api);
    }
  }, [props?.parameters?.bobinagem?.id, props?.parameters?.palete?.id]);

  useEffect(() => {
    //Usado quando se trata de validar a bobinagem!
    if (props?.validate && !isNullOrEmpty(props?.parameters?.validateTstamp)) {
      const updates = [];
      const troca_nw = props.parameters?.validateValues?.troca_nw == 1 ? OPTIONS_OUTROSDEFEITOS.find(v => v.value == "troca_nw") : null;
      gridRef.current.api.forEachNode(n => {
        const _defeitos = [...n.data.defeitos];
        if (troca_nw) {
          _defeitos.push(troca_nw);
        }
        updates.push({ ...n.data, defeitos: _defeitos, ...excludeObjectKeys(props.parameters?.validateValues, ["troca_nw"]) });
      });
      if (updates.length > 0) {
        gridRef.current.api.applyServerSideTransaction({ update: [...updates] });
        props.setDataToParent(getAllNodes(gridRef.current.api));
      }
    }
  }, [props?.parameters?.validateTstamp]);


  const onGridReady = async ({ api, ...params }) => {
  }
  const onGridRequest = async () => {
    if (inputParameters?.tstamp !== props?.parameters?.tstamp) {
      _inputParameters.current = loadInit({}, {}, { ...props?.parameters }, { ...location?.state });
      if (isNullOrEmpty(_inputParameters.current?.bobinagem?.id) && isNullOrEmpty(_inputParameters.current?.palete?.id)) {
        return false; //when return false it cancels the request!
      }
      dataAPI.setBaseFilters({
        ..._inputParameters.current?.bobinagem?.id && {
          ...parseFilter("pbm.id", `==${_inputParameters.current?.bobinagem?.id}`, { type: "number" }),
        },
        ..._inputParameters.current?.palete?.id && {
          ...parseFilter("sgppl.id", `==${_inputParameters.current?.palete?.id}`, { type: "number" }),
          ...parseFilter("mb.comp_actual", `>0`, { type: "number" }),
          ...parseFilter("mb.recycle", `==0`, { type: "number" })
        }
      });
      setInputParameters({
        ..._inputParameters.current,
        bobinagem_id: _inputParameters.current?.bobinagem?.id,
        bobinagem_nome: _inputParameters.current?.bobinagem?.nome,
        palete_id: _inputParameters.current?.palete?.id,
        palete_nome: _inputParameters.current?.palete?.nome
      });
    }

  };
  const onGridResponse = async (api) => {
    if (dataAPI.requestsCount() === 1) {
      if (props?.setDataToParent && typeof props.setDataToParent == "function") {
        console.log("data sent to parent", getAllNodes(api))
        props.setDataToParent(getAllNodes(api));
      }
    }
    console.log("aaaaaaa-xxx-after");
  };

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
    if (multi) {
      const selectedNodes = getSelectedNodes(event.api);
      if (isEmpty(selectedNodes)) {
        selectedNodes.push(event.node);
      }
      let cancelTxs = false;
      if (selectedNodes.some(obj => obj.id === event.node.id)) {
        event.api.forEachNode(n => {
          if (selectedNodes.some(obj => obj.id === n.id)) {
            let tx = true;
            if (cancelTxs == false && !canChangeRow(n.data)) {
              tx = false;
              //cancelTxs = true;
              //transactions.length = 0;
            }
            if (!cancelTxs && tx) {
              if (field === "destino") {
                transactions.push({ ...n.data, ...newValue, rowvalid: 0 });
              } else {
                transactions.push({ ...n.data, [field]: newValue, rowvalid: 0 });
              }
            }
          }
        });
      } else {
        if (canChangeRow(data)) {
          if (field === "destino") {
            transactions.push({ ...data, ...newValue, rowvalid: 0 });
          } else {
            transactions.push({ ...data, [field]: newValue, rowvalid: 0 });
          }
        }
      }
      if (transactions.length > 0) {
        event.api.applyServerSideTransaction({ update: transactions });
      }
      return false; //Se return === false mais nenhum processamento de dados é efetuado
    }
    return null;
  }
  const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
    // const r = await validateRows([data], schema, dataAPI.getPrimaryKey(), { validationGroups: _validationGroups });
    // r.onValidationFail((p) => {
    //   setValidation(prev => ({ ...prev, ...p.alerts.error }));
    // });
    // r.onValidationSuccess((p) => {
    //   setValidation(prev => ({ ...prev, ...p.alerts.error }));
    //   //Tem a ver com a validação da bobinagem (esta página é a mesma para validar a bobinagem)
    //   if (props?.setDataToParent && typeof props.setDataToParent == "function") {
    //     props.setDataToParent(getAllNodes(event.api));
    //   }
    // });
  }

  const onAddSave = async (rows, allRows) => {
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
  };

  const onEditSave = async (rows, allRows) => {

    const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "UpdateDestinosV2", {
      parameters: {
        rows: rows.map(v => {
          return { ...includeObjectKeys(v, ["id", "estado", "prop_obs", "obs", "destinos", "destino", "destinos_has_obs"]) };
        })
      }
    });
    result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
    result.onFail((p) => { });
    //setFormStatus(result);
    return result.success;

  };

  const onExitMode = () => {
    setValidation({});
    gridRef.current.api.deselectAll();
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
      //...[{ label: "Apagar Parâmetro", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const _validationGroups = useMemo(() => validationGroups(dataAPI), []);

  const cellParams = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
    /**
     * editColumnControl, transfere para cada elemento entrar em modo de edição, em vez de ser a grid, para isso tem de ser true, e na grid suppressClickEdit=true  
     */
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups: _validationGroups, ...params },
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

  // const selectRows = (estado) => {
  //   gridRef.current.api.forEachNode(node => {
  //     if (estado.includes(node.data.estado) && canChangeRow(node.data)) {
  //       node.setSelected(true);
  //     }
  //   });
  // };

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
  const onDestinosClick = ({ column, data }) => {
    modalApi.setModalParameters({
      content: <FormDestinosEditor forInput={false} field="destinos" value={valueByPath(data, "destinos")} data={data} gridApi={gridRef.current.api} />,
      closable: true,
      title: column.getDefinition().headerName,
      lazy: false,
      type: "drawer",
      width: "95vw",
      responsive: true,
      parameters: { ...getCellFocus(gridRef.current.api) }
    });
    modalApi.showModal();
  }

  const columnDefs = useMemo(() => {
    return {
      cols: [
        { field: "group", headerName: "", cellRenderer: 'agGroupCellRenderer', pinned: "left", width: 25 },
        { colId: "mb.nome", field: 'nome', ...modeApi?.isOnMode() && { checkboxSelection: true, headerCheckboxSelection: true }, headerName: 'Bobine', pinned: "left", ...cellParams(), width: 165, cellRenderer: (params) => <Value bold link onClick={(e) => onBobineClick(e, params)} params={params} /> },
        ...!_inputParameters.current?.palete?.id ? [{ colId: "sgppl.nome", field: 'palete_nome', headerName: 'Palete', ...cellParams(), width: 130, cellRenderer: (params) => <Value bold link onClick={(e) => onPaleteClick(e, params)} params={params} /> }] : [],
        ..._inputParameters.current?.palete?.id ? [{ colId: "mb.posicao_palete", suppressMenu: true, field: 'posicao_palete', headerName: 'Pos.', ...cellParams(), width: 60, cellRenderer: (params) => <Value params={params} /> }] : [],
        { colId: 'mb.estado', field: 'estado', headerName: 'Estado', suppressMenu: true, width: 80, ...cellParams({}), cellRenderer: (params) => <EstadoBobine field={{ estado: "estado", largura: "lar" }} params={params} /> },
        { colId: 'mb.destino', field: 'destino', headerName: 'Destinos', width: 300, ...cellParams({ unit: "m", multi: true }), type: "editableColumn", cellEditor: DestinosEditor, cellRenderer: (params) => <Value onClick={() => onDestinosClick(params)} params={params} /> },
        { colId: 'mb.lar', field: 'lar', headerName: 'Lar.', suppressMenu: true, width: 60, ...cellParams(), cellRenderer: (params) => <Value bold unit=" mm" params={params} /> },
        { colId: 'mb.l_real', field: 'l_real', headerName: 'Lar. Real', suppressMenu: true, width: 60, ...cellParams(null, {}), cellRenderer: (params) => <Value unit=" mm" params={params} /> },
        { colId: 'pbm.comp', field: 'comp_original', headerName: 'C. Original', suppressMenu: true, width: 70, ...cellParams(), cellRenderer: (params) => <Value unit=" m" params={params} /> },
        { colId: 'mb.comp_actual', field: 'comp_actual', headerName: 'Comp.', suppressMenu: true, width: 70, ...cellParams(), cellRenderer: (params) => <Value bold unit=" m" params={params} /> },
        { colId: 'mb.diam', field: 'diam', headerName: 'Diam.', suppressMenu: true, width: 60, ...cellParams(), cellRenderer: (params) => <Value bold unit=" mm" params={params} /> },
        { colId: 'mb.fc_pos', field: 'fc_pos', headerName: 'F.Corte', suppressMenu: true, width: 70, ...cellParams({ unit: "mm" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },

        { colId: 'mb.ff_pos', field: 'ff_pos', headerName: 'F.Filme', suppressMenu: true, width: 70, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual, { type: true })} params={params} /> },
        { colId: 'mb.buracos_pos', field: 'buracos_pos', headerName: 'Buracos', suppressMenu: true, width: 70, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
        { colId: 'mb.furos_pos', field: 'furos_pos', headerName: 'Furos', suppressMenu: true, width: 70, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
        { colId: 'mb.rugas_pos', field: 'rugas_pos', headerName: 'Rugas', suppressMenu: true, width: 70, ...cellParams({ unit: "m" }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
        { field: 'defeitos', headerName: 'Outros defeitos', suppressMenu: true, sortable: false, width: 300, minWidth: 390, flex: 1, ...cellParams(), cellRenderer: (params) => <ArrayTags params={params} isObject color="red" /> },
        { field: 'prop_obs', wrapText: true, autoHeight: false, pinned: "right", headerName: 'Obs. Propriedades', ...cellParams({ multi: true }), width: 200, type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, minWidth: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> },
        { field: 'obs', wrapText: true, autoHeight: false, pinned: "right", headerName: 'Obs.', ...cellParams({ multi: true }), width: 200, type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, minWidth: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> }
      ], timestamp: new Date()
    };
  }, [validation, modeApi?.isOnMode(), inputParameters?.tstamp]);

  const filters = useMemo(() => ({
    toolbar: ["nome", "estado", { field: "lar", alias: "mb.lar", label: "Largura" }],
    more: [/* "@columns" */"nome", "estado", { field: "lar", alias: "mb.lar", label: "Largura" }, "l_real", "comp", "comp_actual"],
    no: [...Object.keys(baseFilters), "action"]
  }), []);

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

  const onToggleExpand = (t=1) => {
    gridRef.current.api.forEachNode(n => {
      n.setExpanded(t==1 ? true : false);
    });
  }

  return (
    <>
      <TitleForm visible={false} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        // domLayout={'autoHeight'}
        style={{ height: "65vh" }}
        masterDetail={true}
        detailCellRenderer={DetailRenderer}
        //detailRowHeight={70}
        detailRowAutoHeight={true}

        onGridRequest={onGridRequest}
        onGridResponse={onGridResponse}
        //onGridFailRequest={onGridFailRequest}
        loadOnInit={loadOnInit}
        loading={submitting.state}
        // style={{ height: "65vh" }}
        gridRef={gridRef}
        onGridReady={onGridReady}
        columnDefs={columnDefs}
        defaultSort={_inputParameters.current?.bobinagem?.id ? [{ column: 'mb.nome', direction: 'ASC' }] : [{ column: 'mb.posicao_palete', direction: 'ASC' }]}
        filters={filters}
        permission={permission}
        defaultParameters={defaultParameters}
        isCellEditable={isCellEditable}
        singleClickEdit={true}
        enterNavigatesVerticallyAfterEdit={true}
        //suppressClickEdit={true}
        topToolbar={{
          start: <Space>
            <Dropdown.Button onClick={()=>onToggleExpand(1)} icon={<MoreOutlined />} menu={{ items:[{ key: '1', label: 'Recolher Destinos'}], onClick: ()=>onToggleExpand(0) }}>Expandir Destinos</Dropdown.Button>
            {(modeApi.isOnMode() && dataAPI.hasData()) && <RowsSelection dataAPI={dataAPI} modeApi={modeApi} gridApi={gridRef.current?.api} validation={validation} />}
            {!noPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>}</Space>,
          left: <></>
        }}
        //rowSelectionIgnoreOnMode={true}
        // rowSelection="single"
        // onSelectionChanged={onselectionchange}
        dataAPI={dataAPI}
        modeApi={modeApi}
        modeOptions={{
          enabled: true,
          ...props?.validate && { showControls: false, mode: modeApi.EDIT },
          allowEdit: permission.isOk({ action: "changeDefeitos" }) || props?.validate,
          allowAdd: false,
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
        rowClassRules={_rowClassRules}
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