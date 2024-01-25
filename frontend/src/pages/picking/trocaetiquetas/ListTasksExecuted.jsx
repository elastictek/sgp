import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, DATETIME_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, useModalApi, getCellFocus } from 'components/TableV4/TableV4';

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, OPTIONS_TROCAETIQUETAS } from "components/TableV4/TableColumnsV4";

import TableGridView from 'components/TableV4/TableGridView';

const title = "Troca de Etiquetas Executadas";
const subTitle = null;
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<ToolbarTitle disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />);
}

const OPTIONS_SUBTYPE = Object.entries(OPTIONS_TROCAETIQUETAS).map(([value, { label }]) => ({ value: value, label }))

export default ({ noid = false, defaultFilters = {}, defaultSort = [], style, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const permission = usePermission({ name: "checklist" });
  const defaultParameters = { method: "TasksExecutedList" };
  const baseFilters = {
    ...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "TasksExecutedList-01" }), /* fnPostProcess: (dt) => postProcess(dt, null) */ payload: { url: `${API_URL}/trocaetiquetas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: baseFilters } });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: 'ot.nome', field: 'nome', headerName: 'Tarefa',...cellParams(), lockPosition: "left", width: 120, cellRenderer: (params) => <Value params={params} /> },
      { colId: "ot.subtype", field: 'subtype', headerName: 'Tipo',...cellParams(), minWidth: 120, cellRenderer: (params) => <Options map={OPTIONS_TROCAETIQUETAS} params={params} /> },
      { colId: 'te.timestamp', field: 'timestamp', headerName: 'Data',...cellParams({format:DATETIME_FORMAT}), minWidth: 100, cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'te.bobine_nome', field: "bobine_nome", headerName: 'Bobine',...cellParams(), width: 150, cellRenderer: (params) => <Value link bold onClick={(e) => onBobineClick(e, "bobine_id", params)} params={params} /> },
      { colId: 'pb1.lar', field: 'lar', headerName: 'Lar.',...cellParams(), width: 100, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'pb1.core', field: 'core', headerName: 'Core',...cellParams(), width: 100, cellRenderer: (params) => <Value unit="''" params={params} /> },
      { field: 'cod', headerName: 'Artigo Cód.',...cellParams(), minWidth: 100, cellRenderer: (params) => <Value params={params} /> },
      { field: 'des', headerName: 'Artigo',...cellParams(), minWidth: 200, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { field: 'cliente', headerName: 'Cliente',...cellParams(), minWidth: 200, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { colId: 'te.bobine_original_nome', field: "bobine_original_nome", headerName: 'Bobine Original',...cellParams(), width: 150, cellRenderer: (params) => <Value link onClick={(e) => onBobineClick(e, "bobine_original_id", params)} params={params} /> },
    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({
    toolbar: [
      { field: "subtype", type: "options", options: OPTIONS_SUBTYPE },
      { field: "timestamp", type: "date", mask: "date({k})" },
      "bobine_nome", "bobine_original_nome"
    ],
    more: [/* "@columns"*/
      { field: "cod", alias: "pa1.cod" },
      { field: "des", alias: "pa1.des" },
      { field: "cliente", alias: "pc1.nome" }
    ],
    no: [...Object.keys(baseFilters)]
  }), []);

  const onBobineClick = (e, field_id, { data }) => {
    newWindow(`${ROOT_URL}/producao/bobine/details/${data[field_id]}/`, {}, `bobine-${data[field_id]}`);
  }

  return (
    <>
      <TitleForm auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
      <TableGridView
        style={style}
        gridRef={gridRef}
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={[{ column: "te.timestamp", direction: "DESC" }]}
        permission={permission}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        {...props}
      />
    </>
  );

}