import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, CONTENTORES_OPTIONS } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import loadInitV3, { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import { uid } from 'uid';
import dayjs from 'dayjs';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource, getSelectedNodes } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action, ArrayTags } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { includeObjectKeys, json, updateByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, DeleteOutlined, EditOutlined, FilePdfTwoTone, PlusOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { setValidationGroups, validateRows } from 'utils/useValidation';
import Page from 'components/FormFields/FormsV2';
import { isNullOrEmpty } from 'utils/index';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import Palete from '../../paletes/Palete';
import PaletesChoose from '../PaletesChoose';



let title = "Cargas";
let subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

const postProcess = async (dt) => {
  for (let [i, v] of dt.rows.entries()) {
    dt.rows[i].n = i + 1;
  }
  return dt;
};

const schema = z.object({
  artigo_cod: z.coerce.string().min(1),
  cliente_cod: z.coerce.string().min(1),
  cliente_abv: z.coerce.string().min(1),
  limites: zGroupIntervalNumber("liminf", "limsup", { description: { init: "Limite inferior", end: "Limite superior" }, nullable: false }),
  diam: zGroupRangeNumber("diam_ref", "liminf", "limsup", { description: { value: "Diâmetro de referência", min: "Limite inferior", max: "Limite superior" }, nullable: false })
});

export default ({ noid = false, header = true, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const modeApi = useModeApi() //not Required;
  const permission = usePermission({ name: "controlpanel" });
  const defaultParameters = { method: "PaletesCargaList" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const inputParameters = useRef(loadInitV3({}, {}, { ...props?.parameters }, { ...location?.state }));

  title = inputParameters.current.title ? inputParameters.current.title : title;
  subTitle = inputParameters.current.subTitle ? inputParameters.current.subTitle : subTitle;

  const baseFilters = {
    ...parseFilter("pcarga.id", `==${inputParameters.current.id}`, {}),
  };
  const dataAPI = useDataAPI({
    noid: true,
    fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/cargas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, limit: 500 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });
  const [selections, setSelections] = useState({ delete: false });

  const allowEdit = useMemo(() => {
    if (inputParameters.current.estado !== "C" && permission.isOk({ item: "cargas", action: "edit" })) {
      return true;
    }
    return false;
  }, [permission.isReady]);

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
    r.onValidationFail((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
    r.onValidationSuccess((p) => {
      setValidation(prev => ({ ...prev, ...p.alerts.error }));
    });
  }

  const onNew = () => {

  }

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    // const _safePost = async (method, { filter, parameters }) => {
    //   const result = await dataAPI.safePost(`${API_URL}/ordensfabrico/sql/`, method, { filter, parameters });
    //   result.onValidationFail((p) => { });
    //   result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
    //   result.onFail((p) => { });
    //   //setFormStatus(result);
    // }

    // switch (option.key) {
    //   case "delete":
    //     Modal.confirm({
    //       content: <div>Tem a certeza que deseja apagar a relação <b>{row.artigo_cod}</b>/<b>{row.cliente_nome}</b>?</div>, onOk: async () => {
    //         await _safePost("DeleteArtigoCliente", { parameters: { artigo_id: row.artigo_id, cliente_id: row.cliente_id }, filter: {} });
    //       }
    //     })
    //     break;
    // };

    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      ...[{ label: "Packing List", key: "packinglist", icon: <FilePdfTwoTone style={{ fontSize: "16px" }} /> }],
      { type: "divider" },
      ...permission.isOk({ item: "cargas", action: "delete" }) ? [{ label: "Apagar Carga", key: "delete", icon: <DeleteOutlined style={{ fontSize: "16px" }} /> }] : []
    ]
  }, []);

  const validationGroups = useMemo(() => (setValidationGroups({
    /* limites: ["liminf", "limsup"],
    diam: ["diam_ref", "liminf", "limsup"] */
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}) => {
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  const isCellEditable = useCallback((params) => {
    if (modeApi.isOnEditMode() && ["data_prevista", "tipo"].includes(params.colDef.field)) {
      return true;//(params.data.cliente_id) ? false : true;
    }
    return false;
  }, [modeApi?.isOnMode()]);

  const onPaleteClick = (e, { data }) => {
    modalApi.setModalParameters({
      content: <Palete parentApi={gridRef.current.api} parameters={{ palete: data, palete_id: data.id, palete_nome: data.nome, tstamp: Date.now() }} />,
      closable: true,
      title: `Palete ${data?.nome}`,
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "100%",
      parameters: { ...data && getCellFocus(gridRef.current.api) }
    });
    modalApi.showModal();
  }

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "pc.id", hide: true },
      /*       { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> }, */
      { colId: "n", field: 'n', headerName: '', ...cellParams(), lockPosition: "left", width: 20, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'sgppl.nome', field: 'nome', headerName: 'Palete', ...allowEdit && { checkboxSelection: true, headerCheckboxSelection: true }, lockPosition: "left", minWidth: 120, cellStyle: {}, cellRenderer: (params) => <Value link onClick={(e) => onPaleteClick(e, params)} params={params} /> },
      { colId: 'sgppl.timestamp', field: 'timestamp', headerName: 'Data', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'sgppl.nbobines_real', field: 'nbobines_real', headerName: 'Bobines', width: 90, cellStyle: {}, cellRenderer: (params) => <FromTo field={{ from: "nbobines_real", to: "num_bobines" }} colorize={true} params={params} /> },
      { colId: 'sgppl.estado', field: 'estado', headerName: 'Estado', width: 110, cellStyle: {}, cellRenderer: (params) => <EstadoBobines field={{ artigos: "artigo" }} params={params} /> },
      { colId: 'sgppl.largura', field: 'largura', headerName: 'Largura', width: 110, cellStyle: {}, cellRenderer: (params) => <Larguras field={{ artigos: "artigo" }} params={params} /> },
      { colId: 'po2.ofid', field: 'ofid', headerName: 'Ordem Fabrico', width: 180, cellStyle: {}, cellRenderer: (params) => <Ordens field={{ cod: "ofid", des: "ordem_original" }} params={params} /> },
      { colId: 'pt.prf_cod', field: 'prf', headerName: 'Prf', width: 120, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pt.order_cod', field: 'iorder', headerName: 'Encomenda', width: 120, cellStyle: {}, cellRenderer: (params) => <Value align='right' params={params} /> },
      { colId: 'sgppl.cliente_nome', field: 'cliente_nome', headerName: 'Cliente', width: 200, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'sgppl.destino', field: 'destino', headerName: 'Destino', minWidth: 150, flex: 1, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'sgppl.core_bobines', field: 'core_bobines', headerName: 'Core', width: 110, cellStyle: {}, cellRenderer: (params) => <Value unit="''" params={params} /> },
    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode(), allowEdit, dataAPI.getTimeStamp()]);


  const filters = useMemo(() => ({
    toolbar: [
      /* "cliente_cod", "cliente_nome", "artigo_cod", "artigo_des" */
    ],
    more: ["@columns"],
    no: [...Object.keys(baseFilters), "action", "btn"]
  }), []);

  const onChoosePaletes = () => {
    modalApi.setModalParameters({
      content: <PaletesChoose header={false} parentApi={gridRef.current.api}
        noid={true}
        rowSelection="multiple"
        pagination={{ enabled: false, limit: 300, pageSize: 300 }}
        defaultSort={[{ column: `sgppl.timestamp`, direction: "DESC" }]}
        baseFilters={{
          ...parseFilter("pt.order_cod", `==${inputParameters.current.eef}`),
          ...parseFilter("sgppl.carga_id", "isnull")
        }}
        onOk={onSaveAdd}
        okText="Guardar"
      />,
      closable: true,
      title: "Adicionar à Carga",
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "90%",
      parameters: {}
    });
    modalApi.showModal();
  }



  const onDelete = async () => {
    const selectedNodes = getSelectedNodes(gridRef.current.api);
    if (selectedNodes.length > 0) {
      const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "DeletePaletesCarga", {
        parameters: {
          carga_id: inputParameters.current.id,
          rows: selectedNodes.map(v => {
            return { ...includeObjectKeys(v.data, ["id"]) };
          })
        }
      });
      result.onSuccess((p) => {
        setSelections(prev => ({ ...prev, delete: false }));
        gridRef.current.api.deselectAll();
        refreshDataSource(gridRef.current.api);
        if (props?.parentApi){
          refreshDataSource(props?.parentApi);
        }
      });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }

  }

  const onDeleteSelectionChanged = (v, x) => {
    if (props?.parentApi){
      refreshDataSource(props?.parentApi);
    }
    if (v.length > 0) {
      setSelections(prev => ({ ...prev, delete: true }));
    } else {
      setSelections(prev => ({ ...prev, delete: false }));
    }
  }



  const onSaveAdd = async (selectedNodes, options) => {
    console.log(selectedNodes, options);
    if (selectedNodes.length > 0) {
      const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "AddPaletesCarga", {
        parameters: {
          carga_id: inputParameters.current.id,
          rows: selectedNodes.map(v => {
            return { ...includeObjectKeys(v.data, ["id"]) };
          })
        }
      });
      result.onSuccess((p) => {
        gridRef.current.api.deselectAll();
        refreshDataSource(gridRef.current.api);
        if (props?.parentApi){
          refreshDataSource(props?.parentApi);
        }
      });
      result.onFail((p) => { });
      //setFormStatus(result);
      return result.success;
    }

  }

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm visible={header} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridEdit
        onGridRequest={onGridRequest}
        onGridResponse={onGridResponse}
        onGridReady={onGridReady}
        loading={submitting.state}
        style={style}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={[{ column: "pc.id", direction: "DESC" }]}
        filters={filters}
        defaultParameters={defaultParameters}
        singleClickEdit={false}
        //rowSelectionIgnoreOnMode={true}
        {...allowEdit && { rowSelection: "multiple", onSelectionChanged: onDeleteSelectionChanged }}
        dataAPI={dataAPI}
        modeApi={modeApi}
        modeOptions={{ enabled: false }}
        topToolbar={{
          start: <Space>
            {(allowEdit) &&
              <>
                <Button type="link" icon={<PlusOutlined />} onClick={onChoosePaletes}>Adicionar Paletes</Button>
                {(selections.delete) && <Button type="link" onClick={onDelete} icon={<DeleteOutlined />}>Retirar Paletes da Carga</Button>}
              </>
            }
          </Space>,
          left: <></>
        }}
        {...props}
      />
    </Page.Ready>
  );

}