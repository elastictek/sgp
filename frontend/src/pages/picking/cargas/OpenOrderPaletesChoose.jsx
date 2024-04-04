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

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine, ArrayTags } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { useSubmitting } from 'utils';
import { Button, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { TbCircles } from 'react-icons/tb';


const Palete = lazy(() => import('../../paletes/Palete'));

let title = "";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

export default ({ noid = false, header = true, showOk = true, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, onSelect, topToolbar, rowSelection, isRowSelectable, okText = "Ok", onOk, permission: _permission, style, gridRef, pagination, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const submitting = useSubmitting(false);
  const defaultParameters = { method: "OpenOrderPaletesList" };
  const permission = _permission ? _permission : usePermission({ name: "controlpanel" });
  const baseFilters = _baseFilters ? _baseFilters : {};
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "OOPaletesChoose-01" }),
    payload: {
      url: `${API_URL}/cargas/sql/`, primaryKey: "id", parameters: defaultParameters,
      pagination: { enabled: true, pageSize: 80, ...rowSelection == "multiple" && pagination }, baseFilter: baseFilters
    }
  });
  const [selection, setSelection] = useState({ count: 0 });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "pp.id", hide: true },
      /*       { colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> }, */
      { colId: 'pp.nome', field: 'nome', headerName: 'Palete', ...rowSelection == "multiple" && { checkboxSelection: true, headerCheckboxSelection: true }, lockPosition: "left", minWidth: 120, cellStyle: {}, cellRenderer: (params) => <Value link onClick={(e) => onPaleteClick(e, params)} params={params} /> },
      { colId: 'btn', field: "btn", headerName: "", type: "actionOnViewColumn", cellRenderer: (params) => <Button onClick={(e) => onPaleteClick(e, params)} icon={<TbCircles />} size='small'  /> },
      { colId: 'pp.area', field: 'area', headerName: 'Área', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" m2" params={params} /> },
      { colId: 'pp.comp_total', field: 'comp_total', headerName: 'Comp.', width: 90, cellStyle: {}, cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'pp.nbobines_real', field: 'nbobines_real', headerName: 'Bobines', width: 90, cellStyle: {}, cellRenderer: (params) => <FromTo field={{ from: "nbobines_real", to: "num_bobines" }} colorize={true} params={params} /> },
      { colId: 'pp.diam_avg', field: 'diam_avg', headerName: 'Diametros', width: 120, cellStyle: {}, cellRenderer: (params) => <Value value={`${params.data.diam_min} < ${params.data.diam_avg} < ${params.data.diam_max}`} params={params} /> },
      { colId: 'pp.peso_bruto', field: 'peso_bruto', headerName: 'Peso Bruto', width: 100, cellStyle: {}, cellRenderer: (params) => <Value unit=" kg" params={params} /> },
      { colId: 'pp.peso_liquido', field: 'peso_liquido', headerName: 'Peso Líquido', width: 100, cellStyle: {}, cellRenderer: (params) => <Value unit=" kg" params={params} /> },
      { colId: 'pp.peso_palete', field: 'peso_palete', headerName: 'Peso Palete', width: 100, cellStyle: {}, cellRenderer: (params) => <Value unit=" kg" params={params} /> },
      { colId: 'pp.ofid', field: 'ofid', headerName: 'Ordem Fabrico', width: 100, cellStyle: {}, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'pp.timestamp', field: 'timestamp', headerName: 'Data', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'pp.artigo', field: 'artigo', headerName: 'Artigo', minWidth: 150,flex:1, cellStyle: {}, cellRenderer: (params) => <ArrayTags isObject valueProperty='cod' labelProperty='des' params={params} /> },
    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({
    toolbar: [
      { field: "nome", case: "i", op: "start" },
      { field: "timestamp", type: "date", mask: "date({k})" }
    ],
    more: ["ofid"/* "@columns"*/],
    no: [...Object.keys(baseFilters),"btn"]
  }), []);


  const onSelectionChanged = (rows) => {
    const _nodes = getSelectedNodes(_gridRef.current.api)
    if (typeof onClick === "function") {
      onClick(_nodes);

    } else if (typeof onSelect === "function") {
      onSelect(_nodes);
    }
    setSelection(prev => ({ ...prev, count: _nodes.length }));
  }
  const _isRowSelectable = (params) => {
    if (typeof isRowSelectable === "function") {
      return isRowSelectable(params);
    }
    return true;
  }

  const onPaleteClick = (e, { data }) => {
    const p = { palete_id: data.palete_id, palete_nome: data.palete_nome, palete: { id: data.palete_id }, tstamp: Date.now() };
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
        ignoreRowSelectionOnCells={["nome"]}
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={defaultSort}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        onSelectionChanged={onSelectionChanged}
        isRowSelectable={_isRowSelectable}
        topToolbar={{
          start: <Space>
            (<b>{selection.count}</b>)
            {topToolbar?.start && topToolbar.start}
            {(rowSelection == "multiple" && showOk /* && selection.count>0 */) && <Button icon={<CheckOutlined />} type="default" onClick={_onOk}>{okText}</Button>}
          </Space>,
          left: <>
          <Space>
            {topToolbar?.left && topToolbar?.left}
          </Space>
          </>
        }}
        {...props}
      />
    </Page.Ready>
  );

}