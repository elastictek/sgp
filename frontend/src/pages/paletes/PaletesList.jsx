import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle, lazy } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, BOBINE_ESTADOS, BOBINE_DEFEITOS, paleteColors } from "config";
import { useDataAPI, parseFilter, parseFilters } from "utils/useDataAPIV4";
import loadInit, { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { json } from 'utils/object';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, getCellFocus, getSelectedNodes, useTableStyles } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine, OrdensDetail, BadgeCount, Color, ClienteArtigo, ArrayTags, ArrayColumn, Action } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { useSubmitting, noValue, unique, uniqueValues } from 'utils';
import { Button, Space } from 'antd';
import { CheckOutlined, EditOutlined, FileExcelTwoTone, PrinterOutlined } from '@ant-design/icons';
import TableGridView from 'components/TableV4/TableGridView';
import { TbCircles } from 'react-icons/tb';
import BobinesPopup from '../bobinagens/commons/BobinesPopup';
import Palete, { changeOfV2 } from './Palete';
import { FormPrint, printersList } from 'components/FormFields';
import { MediaContext, AppContext } from "app";

let title = "Paletes";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

export const postProcess = async (dt, submitting) => {
  for (let [i, v] of dt.rows.entries()) {
    dt.rows[i]["artigo"] = uniqueValues(json(dt.rows[i]["artigo"]), ["cod", "estado"])?.map(v => ({
      ...v,
      des: v?.des?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")
    }));
    dt.rows[i]["destinos"] = json(dt.rows[i]["destinos"]);
  }
  if (submitting) {
    submitting.end();
  }
  return dt;
}

const valueDestinos = (v) => {
  if (Array.isArray(v)) {
    return v.map(x => ({
      ...x?.regranular && { "Regranular": "Sim" },
      ...x?.estado?.label && { "Estado": x.estado.label },
      ...x?.destinos && {
        "Destinos": x.destinos.map(k => ({
          ...k?.cliente?.BPCNAM_0 && { "Cliente": k.cliente.BPCNAM_0 },
          ...k?.largura && { "Largura": `${k.largura}mm` },
          ...k?.obs && { "Observações": k.obs }
        }))
      }
    }));
  }
  return [];
}

const showActionMenu = (data) => {
  return true;
  //return !data?.carga_id;
}

export default ({ noid = false, header = true, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], style, gridRef, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openNotification } = useContext(AppContext);
  const classes = useTableStyles();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const submitting = useSubmitting(false);
  const defaultParameters = { method: "PaletesListV2" };
  const permission = usePermission({ name: "paletes" });
  const [lastTabs, setLastTabs] = useState({ palete: "1" });
  const baseFilters = loadInit({}, {}, { baseFilters: _baseFilters }, location?.state)?.baseFilters || {};
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "PaletesList-01" }), fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/paletes/sql/`, primaryKey: "id", parameters: defaultParameters,
      pagination: { enabled: true, pageSize: 20 }, baseFilter: baseFilters
    }
  });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const actionItems = useCallback(({ data } = {}) => {
    return [
      { type: 'divider' },
      { label: "Imprimir Etiqueta", key: "print", icon: <PrinterOutlined style={{ fontSize: "16px" }} /> },
      { type: 'divider' },
      ...(permission.isOk({ action: "changeOrdem" }) && !data?.carga_id) ? [{ label: "Alterar ordem de fabrico", key: "changeof", icon: <EditOutlined style={{ fontSize: "16px" }} /> }] : [],
      { type: 'divider' }
    ]
  }, []);

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();
    // const _fix = async (v) => {
    //   const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "FixBobineProduto", { filter: { id: row.id }, parameters: { designacao_prod: v.cod } });
    //   result.onValidationFail((p) => { });
    //   result.onSuccess((p) => { refreshDataSource(_gridRef.current.api); Modal.destroyAll(); });
    //   result.onFail((p) => { });
    // }

    switch (option.key) {
      case "print":
        const _printers = [...printersList?.PRODUCAO, ...printersList?.ARMAZEM];
        modalApi.setModalParameters({
          content: <FormPrint printer={_printers[0].value}
            {...{
              url: `${API_URL}/print/sql/`, printers: _printers, numCopias: 2,
              onComplete: onDownloadComplete,
              parameters: {
                method: "PrintPaleteEtiqueta",
                id: row.id,
                palete_nome: row.nome,
                name: "ETIQUETAS-PALETE",
                path: "ETIQUETAS/PALETE",
              }
            }}
          />,
          ...getCellFocus(_gridRef.current.api),
          closable: true,
          title: "Imprimir Etiqueta",
          lazy: false,
          type: "modal",
          width: "500px",
          height: "200px"
        });
        modalApi.showModal();
        break;
      case "changeof":
        changeOfV2({ modalApi, gridRef: _gridRef, openNotification, row });


        // const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "GetBobinesProduto", {
        //   notify: [],
        //   filter: {
        //     ...parseFilter("pa.artigo_id", `==${row.artigo_id}`, { type: "number" }),
        //     ...row?.cliente_id && parseFilter("pa.cliente_id", `==${row?.cliente_id}`, { type: "number" })
        //   }
        // });
        // if (result.response?.rows && result.response.rows.length > 0) {
        //   const content = <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "5px" }}>
        //     {result.response.rows.map((v, i) => <div style={{ borderBottom: "solid 1px #000" }} key={`prd-${i}`}><Button size='small' style={{ height: "55px", fontSize: "12px" }} onClick={() => _fix(v)} type="link"><b>{v?.cod}</b><br />{v.nome}</Button></div>)}
        //   </div>;
        //   Modal.confirm({
        //     title: <div style={{ fontSize: "12px", textAlign: "center" }}>Selecione o novo Produto da bobine <b>{row.nome}</b><br />{row.designacao_prod}</div>,
        //     content,
        //     okButtonProps: { style: { display: 'none' } }
        //   });
        // }
        break;
    };

    submitting.end();
  }, []);

  const onDownloadComplete = async (response, download) => {
    if (download == "download") {
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    }
  }

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "sgppl.id", field: "id", hide: true },
      { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", pinned: "left", cellRenderer: (params) => <Action visible={showActionMenu(params.data)} params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> },
      { colId: 't', field: 't', headerName: '', lockPosition: "left", pinned: "left", sortable: false, resizable: false, suppressHeaderMenuButton: true, width: 20, cellStyle: {}, cellRenderer: (params) => <Color value={paleteColors(params.data.nome)?.color} params={params} /> },
      { colId: 'sgppl.nome', field: 'nome', headerName: 'Palete', lockPosition: "left", pinned: "left", width: 120, cellStyle: {}, cellRenderer: (params) => <Value link onClick={(e) => onPaleteClick(e, params)} params={params} /> },
      { colId: 'btn', field: "btn", headerName: "", type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Button onClick={(e) => onBobinesPopup(e, params)} icon={<TbCircles />} size='small' /> },
      { colId: 'sgppl.timestamp', field: 'timestamp', type: "date", headerName: 'Data', width: 115, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'sgppl.nbobines_real', field: 'nbobines_real', type: "number", headerName: 'Bobines', width: 90, cellStyle: {}, cellRenderer: (params) => <FromTo field={{ from: "nbobines_real", to: "num_bobines" }} colorize={true} params={params} /> },
      { colId: 'sgppl.nbobines_emendas', field: 'nbobines_emendas', type: "number", headerName: 'Emendas', width: 90, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'sgppl.nbobines_sem_destino', field: 'nbobines_sem_destino', type: "number", headerName: 'Sem destino', width: 90, cellStyle: {}, cellRenderer: (params) => <BadgeNumber params={params} /> },
      { colId: 'n_bobines_expired', field: 'n_bobines_expired', sortable: false, headerName: 'Expiradas (Bobines)', width: 80, cellStyle: {}, cellRenderer: (params) => <BadgeNumber value={params.data?.carga_id ? 0 : params?.data?.n_bobines_expired} params={params} /> },
      { colId: 'sgppl.artigo', field: 'artigo', headerName: 'Estado', width: 150, cellStyle: {}, cellRenderer: (params) => <EstadoBobines field={{ artigos: "artigo" }} params={params} /> },
      { colId: 'l', field: 'l', headerName: 'Larguras', width: 110, cellStyle: {}, sortable: false, suppressHeaderMenuButton: true, cellRenderer: (params) => <Larguras field={{ artigos: "artigo" }} params={params} /> },
      { colId: 'c', field: 'c', headerName: 'Cores', width: 90, cellStyle: {}, sortable: false, suppressHeaderMenuButton: true, cellRenderer: (params) => <Cores field={{ artigos: "artigo" }} params={params} /> },

      { colId: 'sgppl.area_real', field: 'area_real', type: "number", headerName: 'Área', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" m2" params={params} /> },
      { colId: 'sgppl.comp_real', field: 'comp_real', type: "number", headerName: 'Comprimento', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'sgppl.peso_bruto', field: 'peso_bruto', type: "number", headerName: 'Peso Bruto', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" kg" params={params} /> },
      { colId: 'sgppl.peso_liquido', field: 'peso_liquido', type: "number", headerName: 'Peso Líquido', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" kg" params={params} /> },
      { colId: 'sgppl.diam_min', field: 'diam_min', type: "number", headerName: 'Diâm. Mínimo', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'sgppl.diam_max', field: 'diam_max', type: "number", headerName: 'Diâm. Máximo', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'sgppl.diam_avg', field: 'diam_avg', type: "number", headerName: 'Diâm. Médio', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'sgppl.destino', field: 'destino', headerName: 'Destinos', ...cellParams({}), width: 150, cellStyle: {}, cellRenderer: (params) => <MultiLine modalApi={modalApi} dataType='json' valuePopup={valueDestinos(json(params.data.destinos))} params={params} /> },

      { colId: 'pc.name', field: 'cliente_nome', headerName: 'Cliente', width: 250, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'po2.ofid', field: 'ofid', headerName: 'OF Palete', width: 100, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pt.order_cod', field: 'iorder', headerName: 'Encomenda', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pt.prf_cod', field: 'prf', headerName: 'PRF', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.carga', field: 'carga', headerName: 'Carga', width: 190, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.eef', field: 'carga_eef', headerName: 'Enc. Carga', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.prf', field: 'carga_prf', headerName: 'PRF Carga', width: 150, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pcarga.cliente', field: 'carga_cliente', headerName: 'Cliente da Carga', width: 190, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
      { colId: 'xartigox', field: 'xartigox', headerName: 'Artigos', width: 300, ...cellParams({}), cellRenderer: (params) => <ArrayColumn column="artigo" showValue isObject valueProperty='cod' labelProperty='des' params={params} /> },
      { colId: 'po1.ofid', field: 'ofid_original', headerName: 'OF Original', width: 100, ...cellParams({}), cellRenderer: (params) => <Value params={params} /> },
    ], timestamp: new Date()
  }), [dataAPI.getTimeStamp()]);

  const filters = useMemo(() => ({
    toolbar: [
      "nome", { field: "estado", group: "t2", type: "select", assign: true, options: BOBINE_ESTADOS, multi: true, label: "Estado", style: { width: "250px" }, case: "s" },
      { field: "sgppl.data_pal", type: "date", label: "Data"/* , mask: "date({k})" */ }
    ],
    more: [
      "@columns",
      { field: "defeitos", group: "t2", type: "select", assign: true, options: BOBINE_DEFEITOS, multi: true, label: "Defeitos", style: { width: "250px" }, case: "s" },
      { field: "of_id", alias: "po2.ofid", group: "t1", type: "input", assign: true, label: "Ordem Fabrico", style: { width: "120px" }, case: "i" },
      { field: "ofid_original", alias: "po1.ofid", group: "t1", type: "input", assign: true, label: "Ordem Fabrico Original", style: { width: "120px" }, case: "i" },
      { field: "destino", type: "input", assign: true, label: "Destino", style: { width: "150px" }, case: "i" },
      { field: "artigo_cod", alias: "ta.cod", group: "t2", type: "input", assign: true, label: "Cód. Artigo", style: { width: "150px" }, case: "i" },
      { field: "artigo_des", alias: "ta.des", group: "t2", type: "input", assign: true, label: "Artigo Designação", style: { width: "150px" }, case: "i" },
      { field: "cliente_nome", alias: "pc.nome", type: "input", assign: true, label: "Cliente", style: { width: "150px" }, case: "i" },
      { field: "carga_cliente", alias: 'pcarga.cliente', type: "input", assign: true, label: "Cliente Carga", style: { width: "150px" }, case: "i" }
    ],
    no: [...Object.keys(baseFilters), "action", "id", "btn", "c", "l", "t", "n_bobines_expired", "xartigox", "timestamp"]
  }), []);


  const onPaleteClick = (e, { data }) => {
    modalApi.setModalParameters({
      content: <Palete tab={lastTabs.palete} setTab={(v) => setLastTabs(prev => ({ ...prev, palete: v }))} parameters={{ palete: { id: data?.id, nome: data?.nome }, palete_id: data?.id, palete_nome: data?.nome }} />,
      closable: true,
      title: null, //"Carregar Parâmetros",
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "95%",
      parameters: { ...getCellFocus(_gridRef.current.api) }
    });
    modalApi.showModal();
  }

  const onBobinesPopup = async (e, { data }) => {
    const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "BobinesLookup", { notify: [], sort: [{ column: "mb.posicao_palete", direction: "ASC" }, { column: "mb.nome", direction: "ASC" }], filter: { fpaleteid: data.id } });
    modalApi.setModalParameters({ content: <BobinesPopup record={{ bobines: json(result.response?.rows) }} />, title: <div>Palete <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, lazy: true, type: "drawer", width: "95%", parameters: { ...getCellFocus(_gridRef.current.api) } });
    modalApi.showModal();
  }

  const _rowClassRules = useMemo(() => {
    return {
      [classes.error]: (params) => {
        return params.data?.nok_estados > 0;
      },
      [classes.warning]: (params) => {
        return params.data?.nok > 0;
      }
    }
  }, [dataAPI.getTimeStamp()]);


  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm visible={header} auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={props?.title ? props?.title : title} />
      <TableGridView
        style={{ height: "80vh" }}
        gridRef={_gridRef}
        rowClassRules={_rowClassRules}

        columnDefs={columnDefs}
        filters={filters}
        defaultSort={[{ column: "sgppl.timestamp", direction: "DESC" }]}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}

        topToolbar={{
          start: <></>,
          left: <></>,
          reports:[
            { label: 'Paletes (Detalhado)', key: 'PaletesDetailed_01', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "xlsx" } },
          ]
        }}
        {...props}
      />
    </Page.Ready>
  );

}