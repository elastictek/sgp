import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle, lazy } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter, parseFilters } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { json } from 'utils/object';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, getCellFocus, getSelectedNodes } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { useSubmitting } from 'utils';
import { Button, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';


const Palete = lazy(() => import('../paletes/Palete'));

let title = "";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}


export default ({ noid = false, header = true, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, onSelect,onSelectionChanged,closeOnSelect=false, rowSelection, isRowSelectable, okText = "Ok", onOk, permission: _permission, style, gridRef, pagination, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const submitting = useSubmitting(false);
  const defaultParameters = { method: "PaletesListV2" };
  const permission = _permission ? _permission : usePermission({ name: "controlpanel" });
  const baseFilters = _baseFilters ? _baseFilters : {

  };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "PaletesChoose-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
    payload: {
      url: `${API_URL}/paletes/sql/`, primaryKey: "id", parameters: defaultParameters,
      pagination: { enabled: true, pageSize: 20, ...rowSelection == "multiple" && pagination }, baseFilter: baseFilters
    }
  });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "pc.id", hide: true },
      /*       { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> }, */
      { colId: "n", field: 'n', headerName: '', ...cellParams(), lockPosition: "left", width: 20, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'sgppl.nome', field: 'nome', headerName: 'Palete', ...rowSelection == "multiple" && { checkboxSelection: true, headerCheckboxSelection: true }, lockPosition: "left", minWidth: 120, cellStyle: {}, cellRenderer: (params) => <Value link onClick={(e) => onPaleteClick(e, params)} params={params} /> },
      { colId: 'sgppl.timestamp', field: 'timestamp', headerName: 'Data', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'sgppl.nbobines_real', field: 'nbobines_real', headerName: 'Bobines', width: 90, cellStyle: {}, cellRenderer: (params) => <FromTo field={{ from: "nbobines_real", to: "num_bobines" }} colorize={true} params={params} /> },
      { colId: 'sgppl.estado', field: 'estado', headerName: 'Estado', width: 110, cellStyle: {}, cellRenderer: (params) => <EstadoBobines field={{ artigos: "artigo" }} params={params} /> },
      { colId: 'sgppl.largura', field: 'largura', headerName: 'Largura', width: 110, cellStyle: {}, cellRenderer: (params) => <Larguras field={{ artigos: "artigo" }} params={params} /> },
      { colId: 'po2.ofid', field: 'ofid', headerName: 'Ordem Fabrico', width: 180, cellStyle: {}, cellRenderer: (params) => <Ordens field={{ cod: "ofid", des: "ordem_original" }} params={params} /> },
      { colId: 'pt.prf_cod', field: 'prf', headerName: 'Prf', width: 120, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pt.order_cod', field: 'iorder', headerName: 'Encomenda', width: 120, cellStyle: {}, cellRenderer: (params) => <Value align='right' params={params} /> },
      { colId: 'sgppl.cliente_nome', field: 'cliente_nome', headerName: 'Cliente', width: 200, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'sgppl.destino', field: 'destino', headerName: 'Destino', flex: 1, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'sgppl.core_bobines', field: 'core_bobines', headerName: 'Core', width: 110, cellStyle: {}, cellRenderer: (params) => <Value unit="''" params={params} /> },
    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({
    toolbar: [
      { field: "nome", case: "i", op: "start" },
      "prf", "destino",
      { field: "timestamp", type: "date", mask: "date({k})" }
    ],
    more: ["iorder", "cliente_nome", "ofid"/* "@columns"*/],
    no: [...Object.keys(baseFilters)]
  }), []);


  const _onSelectionChanged = (rows) => {
    if (typeof onClick === "function") {
      onClick(rows);
    } else if (typeof onSelect === "function") {
      onSelect(rows);
    } else if (typeof onSelectionChanged === "function") {
      onSelectionChanged(rows);
    }
    if (closeOnSelect && props?.closeSelf){
      props.closeSelf();
    }
  }
  const _isRowSelectable = (params) => {
    if (typeof isRowSelectable === "function") {
      return isRowSelectable(params);
    }
    return true;
  }

  const onPaleteClick = (e, { data }) => {
    const p = { palete_id: data?.palete_id ? data?.palete_id : data.id, palete_nome: data?.palete_nome ? data?.palete_nome : data.nome, palete: { id: data?.palete_id ? data?.palete_id : data.id }, tstamp: Date.now() };
    modalApi.setModalParameters({ content: <Palete parameters={p} />, lazy: true, type: "drawer", width: "95%", parameters: { ...getCellFocus(_gridRef.current.api) } });
    modalApi.showModal();
  }

  const _onOk = () => {
    if (onOk && typeof onOk == "function") {
      onOk(getSelectedNodes(_gridRef.current.api), { close: props?.closeSelf });
    }
  }

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm visible={header} auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={props?.title ? props?.title : title} />
      <TableGridSelect
        style={style}
        gridRef={_gridRef}
        rowSelection={rowSelection}
        ignoreRowSelectionOnCells={["sgppl.nome"]}
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={defaultSort}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        onSelectionChanged={_onSelectionChanged}
        isRowSelectable={_isRowSelectable}
        topToolbar={{
          start: <Space>
            {rowSelection == "multiple" && <Button icon={<CheckOutlined />} type="link" onClick={_onOk}>{okText}</Button>}
          </Space>,
          left: <></>
        }}
        {...props}
      />
    </Page.Ready>
  );

}