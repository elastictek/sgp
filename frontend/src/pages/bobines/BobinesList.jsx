import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle, lazy } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, BOBINE_ESTADOS, BOBINE_DEFEITOS } from "config";
import { useDataAPI, parseFilter, parseFilters } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { includeObjectKeys, json, valueByPath } from 'utils/object';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, getCellFocus, getSelectedNodes, columnPath, refreshDataSource } from 'components/TableV4/TableV4';
import useModeApi from 'utils/useModeApi';

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine, OrdensDetail, BadgeCount, ArrayTags, ModalMultiRangeView, OrdemFabrico, Action, } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { useSubmitting, noValue } from 'utils';
import { Button, Space, Modal } from 'antd';
import { CheckOutlined, ShrinkOutlined } from '@ant-design/icons';
import { TbCircles } from 'react-icons/tb';
import { isRecycled, postProcess, useTableStyles } from './BobinesDefeitosList';
import { AntdInputNumberEditor, FormDestinosEditor } from 'components/TableV4/TableEditorsV4';
import Palete from '../paletes/Palete';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import useModalApi from 'utils/useModalApi';
import { setValidationGroups, validateRows } from 'utils/useValidation';
import { z } from 'zod';
import { is } from 'ramda';


let title = "Bobines";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

// export const postProcess = async (dt, submitting) => {
//   // for (let [i, v] of dt.rows.entries()) {
//   //   dt.rows[i]["bobines"] = json(dt.rows[i]["bobines"]).sort((a, b) => (a.nome < b.nome) ? -1 : 1);
//   // }
//   if (submitting) {
//     submitting.end();
//   }
//   return dt;
// }

const canChangeRow = (data) => {
  if (data?.recycle == 0 && data?.comp_actual !== data?.comp && !data?.carga_id) {
    return true;
  }
  return false;
}

const showActionMenu = (data) => {
  return data?.recycle == 0 && !data?.carga_id && (!data?.palete_id || data?.palete_nome?.startsWith("DM"));
}

export const schema = z.object({
  comps: z.object({
    comp_actual: z.coerce.number(),
    comp: z.coerce.number()
  }).refine((v) => {
    const errors = [];
    if ((!is(Number, v.comp_actual))) {
      errors.push({ path: ['comp_actual'], message: 'O comprimento é obrigatório!' });
      throw new z.ZodError(errors);
    }
    if (v.comp_actual < 0 || v.comp_actual > v.comp) {
      errors.push({ path: ['comp_actual'], message: 'O comprimento tem de ser maior ou igual a zero e menor que o comprimento da bobinagem!' });
      throw new z.ZodError(errors);
    }
    return true;
  }, {})
});

export default ({ noid = false, header = true, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], style, gridRef, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useTableStyles();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi(); //not Required;
  const modeApi = useModeApi(); //not Required;
  const [validation, setValidation] = useState({});
  const submitting = useSubmitting(false);
  const [lastTabs, setLastTabs] = useState({ palete: "1", bobinagem: "1" });
  const defaultParameters = { method: "BobinesListV2" };
  const permission = usePermission({ name: "bobines" });
  const baseFilters = _baseFilters ? _baseFilters : {

  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "BobinesList-01" }), fnPostProcess: (dt) => postProcess(dt, { validate: false }),
    payload: {
      url: `${API_URL}/bobines/sql/`, primaryKey: "id", parameters: defaultParameters,
      pagination: { enabled: true, pageSize: 20 }, baseFilter: baseFilters
    }
  });

  const validationGroups = useMemo(() => setValidationGroups({
    comps: ["comp_actual", "comp"]
  }), []);

  const cellParams = useCallback((params = {}, editorParams = {}) => {
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  const _rowClassRules = useMemo(() => {
    return {
      [classes.recycled]: (params) => {
        return isRecycled(params.data);
      }
    };
  }, [dataAPI.getTimeStamp()]);


  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    const _fix = async (v) => {
      const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "FixBobineProduto", { filter: { id: row.id }, parameters: { designacao_prod: v.cod } });
      result.onValidationFail((p) => { });
      result.onSuccess((p) => { refreshDataSource(_gridRef.current.api); Modal.destroyAll(); });
      result.onFail((p) => { });
    }

    switch (option.key) {
      case "fixproduto":
        const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "GetBobinesProduto", {
          notify: [],
          filter: {
            ...parseFilter("pa.artigo_id", `==${row.artigo_id}`, { type: "number" }),
            ...row?.cliente_id && parseFilter("pa.cliente_id", `==${row?.cliente_id}`, { type: "number" })
          }
        });
        if (result.response?.rows && result.response.rows.length > 0) {
          const content = <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "5px" }}>
            {result.response.rows.map((v, i) => <div style={{ borderBottom: "solid 1px #000" }} key={`prd-${i}`}><Button size='small' style={{ height: "55px", fontSize: "12px" }} onClick={() => _fix(v)} type="link"><b>{v?.cod}</b><br />{v.nome}</Button></div>)}
          </div>;
          Modal.confirm({
            title: <div style={{ fontSize: "12px", textAlign: "center" }}>Selecione o novo Produto da bobine <b>{row.nome}</b><br />{row.designacao_prod}</div>,
            content,
            okButtonProps: { style: { display: 'none' } }
          });
        }
        break;
    };

    submitting.end();
  }, []);


  const actionItems = useCallback((params) => {
    return [
      { type: 'divider' },
      ...[{ label: "Corrigir designação do Produto", key: "fixproduto", icon: <ShrinkOutlined style={{ fontSize: "16px" }} /> }],
      { type: 'divider' }
    ]
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "pbm.id", field: "id", hide: true },
      { colId: 'action', type: "actionOnEditColumn", lockPosition: "left", cellRenderer: (params) => <Action visible={showActionMenu(params.data)} params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
      { colId: 'mb.nome', field: 'nome', headerName: 'Bobine', lockPosition: "left", width: 120, cellStyle: {}, cellRenderer: (params) => <Value bold link onClick={(e) => onBobineClick(e, params)} params={params} /> },
      { colId: 'pbm.nome', field: 'bobinagem_nome', headerName: 'Bobinagem', width: 100, cellStyle: {}, cellRenderer: (params) => <Value link onClick={(e) => onBobinagemClick(e, params)} params={params} /> },
      { colId: "sgppl.nome", field: 'palete_nome', headerName: 'Palete', ...cellParams(), width: 100, cellRenderer: (params) => <Value link onClick={(e) => onPaleteClick(e, params)} params={params} /> },
      { colId: "mb.posicao_palete", suppressHeaderMenuButton: true, field: 'posicao_palete', type: "number", headerName: 'Pos.', ...cellParams(), width: 50, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'mb.estado', field: 'estado', headerName: 'Estado', width: 65, ...cellParams({ multi: true }, {}), cellRenderer: (params) => <EstadoBobine field={{ estado: "estado", largura: "lar" }} params={params} /> },
      { colId: 'mb.timestamp', field: 'timestamp', type: "date", headerName: 'Data', width: 115, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'mb.core', field: 'core', type: "number", headerName: 'Core', width: 60, cellStyle: {}, cellRenderer: (params) => <Value unit="''" params={params} /> },
      { colId: 'mb.comp_actual', field: 'comp_actual', type: "number", headerName: 'Comp. Actual', width: 70, cellStyle: {}, type: "editableColumn", cellEditor: AntdInputNumberEditor, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.comp', field: 'comp', type: "number", headerName: 'Comprimento', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.diam', field: 'diam', type: "number", headerName: 'Diâmetro', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'mb.lar', field: 'lar', type: "number", headerName: 'Largura', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'mb.l_real', field: 'l_real', type: "number", headerName: 'Lar. Real', width: 60, ...cellParams(null, {}), cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'mb.area', field: 'area', type: "number", headerName: 'Área', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m2" params={params} /> },

      { colId: 'mb.fc_pos', field: 'fc_pos', headerName: 'F.Corte', width: 70, ...cellParams({ unit: "mm", multi: true }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      { colId: 'mb.ff_pos', field: 'ff_pos', headerName: 'F.Filme', width: 70, ...cellParams({ unit: "m", multi: true }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual, { type: true })} params={params} /> },
      { colId: 'mb.buracos_pos', field: 'buracos_pos', headerName: 'Buracos', width: 70, ...cellParams({ unit: "m", multi: true }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      { colId: 'mb.furos_pos', field: 'furos_pos', headerName: 'Furos', width: 70, ...cellParams({ unit: "m", multi: true }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      { colId: 'mb.rugas_pos', field: 'rugas_pos', headerName: 'Rugas', width: 70, ...cellParams({ unit: "m", multi: true }), cellRenderer: (params) => <BadgeCount onClick={() => onDefeitosRangeClick(params, 0, params.data.comp_actual)} params={params} /> },
      {
        field: 'defeitos', headerName: 'Outros defeitos', sortable: false, valueGetter: (params) => {
          return valueByPath(params.data, columnPath(params.column))?.map(v => v?.label).join(",");
        }, width: 390, minWidth: 390, flex: 1, ...cellParams({ multi: true }, {}), cellRenderer: (params) => <ArrayTags params={params} isObject color="red" />
      },
      { colId: 'mb.destino', field: 'destino', headerName: 'Destinos', width: 300, ...cellParams({ unit: "m", multi: true }), cellRenderer: (params) => <Value onClick={() => onDestinosClick(params)} params={params} /> },

      { colId: 'mb.designacao_prod', field: 'designacao_prod', headerName: 'Produto', width: 190, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'mva.cod', field: 'artigo_cod', headerName: 'Artigo Cód.', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'mva.des', field: 'artigo_des', headerName: 'Artigo Des.', width: 280, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },

      { colId: 'po.ofid', field: 'ofid_bobine', headerName: 'OF Bobine', width: 150, ...cellParams({}), cellRenderer: (params) => <Value bold params={params} /> },

      { colId: 'pc.nome', field: 'cliente_nome', headerName: 'Cliente da Palete', width: 190, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'po2.ofid', field: 'palete_ofid', headerName: 'OF Palete', width: 220, ...cellParams({}), cellRenderer: (params) => <OrdemFabrico field={{ ofid: "palete_ofid", order: "palete_eef" }} params={params} /> },

      { colId: 'pcarga.carga', field: 'carga', headerName: 'Carga', width: 190, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.eef', field: 'eef', headerName: 'Enc. Carga', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.prf', field: 'prf', headerName: 'PRF Carga', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.cliente', field: 'carga_cliente', headerName: 'Cliente da Carga', width: 190, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },

      { colId: 'mb.nwinf', field: 'nwinf', type: "number", headerName: 'NW Inf.', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.nwsup', field: 'nwsup', type: "number", headerName: 'NW Sup.', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.tiponwinf', field: 'tiponwinf', headerName: 'Tipo NW Inf.', width: 290, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'mb.tiponwsup', field: 'tiponwsup', headerName: 'Tipo NW Sup.', width: 290, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'mb.lotenwinf', field: 'lotenwinf', headerName: 'Lote NW Inf.', width: 130, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'mb.lotenwsup', field: 'lotenwsup', headerName: 'Lote NW Sup.', width: 130, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'mb.recycle', field: 'recycle', headerName: 'Reciclada', ...cellParams(), width: 50, cellRenderer: (params) => <Bool checkedValue={1} unCheckedValue={0} params={params} /> },
      { field: 'prop_obs', wrapText: true, autoHeight: false, headerName: 'Obs. Propriedades', ...cellParams({ multi: true }), minWidth: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> },
      { field: 'obs', wrapText: true, autoHeight: false, headerName: 'Obs.', ...cellParams({ multi: true }), minWidth: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> }
    ], timestamp: new Date()
  }), [validation, dataAPI.getTimeStamp(), modeApi.isOnMode()]);

  const filters = useMemo(() => ({
    toolbar: [
      { field: "nome", case: "s" }, { field: "estado", group: "t2", type: "select", assign: true, options: BOBINE_ESTADOS, multi: true, label: "Estado", style: { width: "250px" }, case: "s" },
      { field: "pbm.data", type: "date", label: "Data"/* , mask: "date({k})" */ }
    ],
    more: [
      { field: "palete_nome", case: "s" }, { field: "bobinagem_nome", case: "s" },
      { field: "defeitos", group: "t2", type: "select", assign: true, options: BOBINE_DEFEITOS, multi: true, label: "Defeitos", style: { width: "250px" }, case: "s" },
      {
        field: "of_id", group: "t1", type: "input", assign: true, label: "Ordem Fabrico", style: { width: "120px" }, case: "i",
        gmask: " EXISTS (SELECT 1 FROM producao_tempaggordemfabrico aof join producao_tempordemfabrico tof on tof.agg_of_id=acs.agg_of_id WHERE aof.id=acs.agg_of_id and {_})"
      },
      { field: "destino", group: "t2", type: "input", assign: true, label: "Destino", style: { width: "150px" }, case: "i" },
      { field: "cliente", group: "t2", type: "input", assign: true, label: "Cliente", style: { width: "150px" }, case: "i" },
      { field: "recycle", options: "bool:1", type: "options" },
      "@columns",

    ],
    no: [...Object.keys(baseFilters), "action", "id", "btn"]
  }), []);


  // const onBobineClick = (e, { data }) => {
  //   if (data?.valid == 0) {
  //     navigate("/app/bobinagens/validatebobinagem", { state: { action: "validate", bobinagem_id: data.id, bobinagem_nome: data.nome } });
  //   } else {
  //     const hasQualidadeGroup = permission.auth.groups.some(role => role.startsWith("qualidade"));
  //     navigate("/app/bobinagens/formbobinagem", { replace: true, state: { tab: hasQualidadeGroup ? "4" : "1", bobinagem: data, bobinagem_id: data.id, bobinagem_nome: data.nome, tstamp: Date.now(), dataAPI: { offset: dataAPI.getRowOffset(data), ...dataAPI.getPayload() } } });
  //   }
  // }

  const onBobineClick = (e, { data }) => {
    if (!data) {
      return;
    }
    newWindow(`${ROOT_URL}/producao/bobine/details/${data.id}/`, {}, `bobine-${data.nome}`);
    //setModalParameters({ content: "details", width: 5000, height: 5000, src: `/producao/bobine/details/${v.id}/`, title: `Detalhes da Bobine` });
    //showModal();
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
        parameters: { ...getCellFocus(_gridRef.current.api) }
      });
      modalApi.showModal();
    }
  }

  const onDestinosClick = ({ column, data }) => {
    modalApi.setModalParameters({
      content: <FormDestinosEditor forInput={false} field="destinos" value={valueByPath(data, "destinos")} data={data} gridApi={_gridRef.current.api} />,
      closable: true,
      title: column.getDefinition().headerName,
      lazy: false,
      type: "drawer",
      width: "95vw",
      responsive: true,
      parameters: { ...getCellFocus(_gridRef.current.api) }
    });
    modalApi.showModal();
  }
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
  const onBobinagemClick = (e, { data }) => {
    if (data?.valid == 0) {
      navigate("/app/bobinagens/validatebobinagem", { state: { action: "validate", bobinagem_id: data.bobinagem_id, bobinagem_nome: data.bobinagem_nome } });
    } else {
      const hasQualidadeGroup = permission.auth.groups.some(role => role.startsWith("qualidade"));
      navigate("/app/bobinagens/formbobinagem", { replace: true, state: { tab: hasQualidadeGroup ? "4" : "1", bobinagem: { id: data.bobinagem_id }, bobinagem_id: data.bobinagem_id, bobinagem_nome: data.bobinagem_nome, tstamp: Date.now() } });
    }
  }

  const isCellEditable = useCallback((params) => {
    return canChangeRow(params.data);
  }, [modeApi?.isOnMode()]);



  const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
    /**
 * Método que permite antes do "commit", fazer pequenas alterações aos dados.
 * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
 * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
 * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
 */
    return null;
  }
  const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
    const r = await validateRows([data], schema, dataAPI.getPrimaryKey(), { validationGroups });
    r.onValidationFail((p) => {
      console.log("errrororrrrrr",p.alerts.error)
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }



  const onEditSave = async (rows, allRows) => {
    submitting.trigger();
    const rv = await validateRows(rows, schema, dataAPI.getPrimaryKey(), { passthrough: false, validationGroups });
    rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });
    await rv.onValidationSuccess(async (p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
       const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "UpdateBobines", {
         parameters: {
           rows: rows.map(v => {
             return { ...includeObjectKeys(v, ["id","comp_actual"]) };
           })
         }
       });
    //   result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
    //   result.onFail((p) => { });
    //   //setFormStatus(result);
    //   return result.success;

    });
    submitting.end();
  };

  const onExitMode = () => {
    setValidation({});
    _gridRef.current.api.deselectAll();
  };

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm visible={header} auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={props?.title ? props?.title : title} />
      <TableGridEdit
        style={{ height: "80vh" }}
        gridRef={_gridRef}
        rowClassRules={_rowClassRules}
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={[{ column: "mb.timestamp", direction: "DESC" }]}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}

        isCellEditable={isCellEditable}
        singleClickEdit={true}
        enterNavigatesVerticallyAfterEdit={true}

        modeApi={modeApi}
        modeOptions={{
          enabled: true,
          allowEdit: permission.isOk({ action: "edit" }),
          allowAdd: false,
          newRow: null,
          newRowIndex: null,
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
        topToolbar={{
          start: <></>,
          left: <></>
        }}
        {...props}
      />
    </Page.Ready>
  );

}