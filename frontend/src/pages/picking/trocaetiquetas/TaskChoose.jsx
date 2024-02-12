import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, getCellFocus } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, OPTIONS_TROCAETIQUETAS } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import { json } from 'utils/object';

const title = "Troca de Etiquetas";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
  return (<ToolbarTitle id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
  />);
}

const OPTIONS_SUBTYPE = Object.entries(OPTIONS_TROCAETIQUETAS).map(([value, { label }]) => ({ value: value, label }))

const postProcess = async (dt) => {
  for (let [i, v] of dt.rows.entries()) {
    dt.rows[i]["parameters"] = json(dt.rows[i]["parameters"], {});
  }
  return dt;
};

export default ({ noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, isRowSelectable, permission, style, gridRef, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const defaultParameters = { method: "TodoTasksList" };
  const baseFilters = _baseFilters ? _baseFilters : {};//{ ...parseFilter("type", "==1", { type: "number" }), ...parseFilter("status", "==1", { type: "number" }) };
  const dataAPI = useDataAPI({
    ...((!noid || location?.state?.noid === false) && { id: "TodoTasksList-01" }), fnPostProcess: (dt) => postProcess(dt, null),
    payload: {
      url: `${API_URL}/trocaetiquetas/sql/`, primaryKey: "id", parameters: defaultParameters,
      pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, baseFilter: baseFilters,
      sortMap: { cod: "parameters->>'$.artigo.cod'", des: "parameters->>'$.artigo.des'", cliente: "parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "parameters->>'$.data_imputacao'" }
    }
  });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: 'nome', field: 'nome', headerName: 'Nome', ...cellParams(), lockPosition: "left", minWidth: 120, cellRenderer: (params) => <Value bold params={params} /> },
      { field: 'subtype', headerName: 'Tipo', ...cellParams(), minWidth: 120, cellRenderer: (params) => <Options map={OPTIONS_TROCAETIQUETAS} params={params} /> },
      { colId: 'timestamp', field: 'timestamp', ...cellParams(), headerName: 'Data', minWidth: 100, cellRenderer: (params) => <Value datetime params={params} /> },
      { field: 'cod', headerName: 'Artigo Cód.', ...cellParams({ path: "parameters.artigo.cod" }), minWidth: 100, cellRenderer: (params) => <Value params={params} /> },
      { field: 'des', headerName: 'Artigo', ...cellParams({ path: "parameters.artigo.des" }), minWidth: 200, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { field: 'cliente', headerName: 'Cliente', ...cellParams({ path: "parameters.cliente.BPCNAM_0" }), minWidth: 200, flex: 1, cellRenderer: (params) => <Value params={params} /> },
      { field: 'data_imputacao', headerName: 'Data Imputação', ...cellParams({ path: "parameters.data_imputacao", format: DATE_FORMAT }), minWidth: 100, cellRenderer: (params) => <Value datetime params={params} /> }
    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({
    toolbar: [
      { field: "subtype", type: "options", options: OPTIONS_SUBTYPE },
      { field: "timestamp", type: "date", mask: "date({k})" },
      { field: "cod", mask: "parameters->>'$.artigo.cod'" },
      { field: "cliente", mask: "parameters->>'$.cliente.BPCNAM_0'" }
    ],
    more: [/* "@columns"*/"nome"],
    no: [...Object.keys(baseFilters)]
  }), []);

  const onSelectionChanged = (rows) => {
    if (typeof onClick === "function") {
      onClick(rows);
    }
  }
  const _isRowSelectable = (params) => {
    if (typeof isRowSelectable === "function") {
      return isRowSelectable(params);
    }
    return true;
  }

  return (
    <>
      <TableGridSelect
        style={style}
        gridRef={_gridRef}
        ignoreRowSelectionOnCells={[]}
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={defaultSort}
        permission={permission}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        onSelectionChanged={onSelectionChanged}
        isRowSelectable={_isRowSelectable}
        {...props}
      />
    </>
  );

}