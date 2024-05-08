import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle, lazy } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, BOBINE_ESTADOS, BOBINE_DEFEITOS } from "config";
import { useDataAPI, parseFilter, parseFilters } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { json } from 'utils/object';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, getCellFocus, getSelectedNodes, useTableStyles } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine, OrdensDetail, } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { useSubmitting,noValue } from 'utils';
import { Button, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import TableGridView from 'components/TableV4/TableGridView';
import BobinesPopup from './commons/BobinesPopup';
import { TbCircles } from 'react-icons/tb';

let title = "Bobinagens";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

export const postProcess = async (dt, submitting) => {
  for (let [i, v] of dt.rows.entries()) {
    dt.rows[i]["bobines"] = json(dt.rows[i]["bobines"]).sort((a, b) => (a.nome < b.nome) ? -1 : 1);
  }
  if (submitting) {
    submitting.end();
  }
  return dt;
}

export default ({ noid = false, header = true, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], style, gridRef, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useTableStyles();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const submitting = useSubmitting(false);
  const defaultParameters = { method: "BobinagensListV2" };
  const permission = usePermission({ name: "bobinagens" });
  const baseFilters = _baseFilters ? _baseFilters : {

  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "BobinagensList-01" }), fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/bobinagens/sql/`, primaryKey: "id", parameters: defaultParameters,
      pagination: { enabled: true, pageSize: 20 }, baseFilter: baseFilters
    }
  });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "pbm.id", field: "id", hide: true },
      /*       { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> }, */
      { colId: 'pbm.nome', field: 'nome', headerName: 'Bobinagem', lockPosition: "left",pinned:"left", width: 120, cellStyle: {}, cellRenderer: (params) => <Value link onClick={(e) => onBobinagemClick(e, params)} params={params} /> },
      { colId: 'btn', field: "btn", headerName: "", type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Button onClick={(e) => onBobinagemPopup(e, params)} icon={<TbCircles />} size='small' /> },
      { colId: 'pbm.timestamp', field: 'timestamp',type:"date", headerName: 'Data', width: 115, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'pbm.inico', field: 'inico',type:"time", headerName: 'Início', width: 70, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pbm.fim', field: 'fim',type:"time", headerName: 'Fim', width: 70, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pb.core', field: 'core',type:"number", headerName: 'Core', width: 60, cellStyle: {}, cellRenderer: (params) => <Value unit="''" params={params} /> },
      { colId: 'pbm.comp', field: 'comp',type:"number", headerName: 'Comprimento', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'pbm.comp_par', field: 'comp_par',type:"number", headerName: 'Emenda', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'pbm.diam', field: 'diam',type:"number", headerName: 'Diâmetro', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'sum(pb.lar)', field: 'largura',type:"number", headerName: 'Largura', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'pbm.largura_bruta', field: 'largura_bruta',type:"number", headerName: 'Largura Bruta', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'pbm.area', field: 'area', headerName: 'Área',type:"number", width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m2" params={params} /> },
      ...[...Array(24).keys()].map((v, i) => ({ colId: `${v + 1}`, field: `${v + 1}`, sortable: false, suppressHeaderMenuButton: true, headerName: `${v + 1}`, width: 35, resizable: false, headerClass: classes.headerCenter, cellStyle: {}, cellRenderer: (params) => <EstadoBobine title={`${params.data.bobines?.[v]?.nome} ${noValue(params.data.bobines?.[v]?.destino,"")}`} onClick={(e)=>onBobineClick(e,params.data.bobines?.[v])} field={{ estado: "estado", largura: "lar", destino:"destino" }} params={{ ...params, data: params.data.bobines?.[v] }} /> })),
      { colId: 'pbm.duracao', field: 'duracao', headerName: 'Duração', width: 70, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pbm.comp_cli', field: 'comp_cli',type:"number", headerName: 'Comp. Cliente', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'pbm.nwinf', field: 'nwinf',type:"number", headerName: 'NW Inf.', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'pbm.nwsup', field: 'nwsup',type:"number", headerName: 'NW Sup.', width: 70, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'pbm.tiponwinf', field: 'tiponwinf', headerName: 'Tipo NW Inf.', width: 250, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'pbm.tiponwsup', field: 'tiponwsup', headerName: 'Tipo NW Sup.', width: 250, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'pbm.lotenwinf', field: 'lotenwinf', headerName: 'Lote NW Inf.', width: 130, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pbm.lotenwsup', field: 'lotenwsup', headerName: 'Lote NW Sup.', width: 130, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'ofs', field: 'ofs', headerName: 'Ordens de Fabrico', width: 300, cellStyle: {}, cellRenderer: (params) => <OrdensDetail params={params} /> }
    ], timestamp: new Date()
  }), [dataAPI.getTimeStamp()]);

  const filters = useMemo(() => ({
    toolbar: [
      "nome", { field: "estado", group: "t2", type: "select", assign: true, options: BOBINE_ESTADOS, multi: true, label: "Estado", style: { width: "250px" }, case: "s" },
      { field: "pbm.data", type: "date", label: "Data"/* , mask: "date({k})" */ }
    ],
    more: [
      "@columns",
      { field: "defeitos", group: "t2", type: "select", assign: true, options: BOBINE_DEFEITOS, multi: true, label: "Defeitos", style: { width: "250px" }, case: "s" },
      {
        field: "of_id", group: "t1", type: "input", assign: true, label: "Ordem Fabrico", style: { width: "120px" }, case: "i",
        gmask: " EXISTS (SELECT 1 FROM producao_tempaggordemfabrico aof join producao_tempordemfabrico tof on tof.agg_of_id=acs.agg_of_id WHERE aof.id=acs.agg_of_id and {_})"
      },
      { field: "destino", group: "t2", type: "input", assign: true, label: "Destino", style: { width: "150px" }, case: "i" },
      { field: "cliente", group: "t2", type: "input", assign: true, label: "Cliente", style: { width: "150px" }, case: "i" }
    ],
    no: [...Object.keys(baseFilters), "action", "id", "btn", "largura","core", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"]
  }), []);


  const onBobinagemClick = (e, { data }) => {
    if (data?.valid == 0) {
      navigate("/app/bobinagens/validatebobinagem", { state: { action: "validate", bobinagem_id: data.id, bobinagem_nome: data.nome } });
    } else {
      const hasQualidadeGroup = permission.auth.groups.some(role => role.startsWith("qualidade"));
      navigate("/app/bobinagens/formbobinagem", { replace: true, state: { tab: hasQualidadeGroup ? "4" : "1", bobinagem: data, bobinagem_id: data.id, bobinagem_nome: data.nome, tstamp: Date.now(), dataAPI: { offset: dataAPI.getRowOffset(data), ...dataAPI.getPayload() } } });
    }
  }

  const onBobinagemPopup = (e, { data }) => {
    modalApi.setModalParameters({ content: <BobinesPopup record={{ bobines: json(data.bobines) }} />, title: <div>Bobinagem <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, lazy: true, type: "drawer", width: "95%", parameters: { ...getCellFocus(_gridRef.current.api) } });
    modalApi.showModal();
  }

  const onBobineClick = (e, data) => {
    if (!data){
      return;
    }
    newWindow(`${ROOT_URL}/producao/bobine/details/${data.id}/`, {}, `bobine-${data.nome}`);
    //setModalParameters({ content: "details", width: 5000, height: 5000, src: `/producao/bobine/details/${v.id}/`, title: `Detalhes da Bobine` });
    //showModal();
}

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm visible={header} auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={props?.title ? props?.title : title} />
      <TableGridView
        style={{ height: "80vh" }}
        gridRef={_gridRef}

        columnDefs={columnDefs}
        filters={filters}
        defaultSort={[{ column: "pbm.timestamp", direction: "DESC" }]}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}

        topToolbar={{
          start: <></>,
          left: <></>
        }}
        {...props}
      />
    </Page.Ready>
  );

}