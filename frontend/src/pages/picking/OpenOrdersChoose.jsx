import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle, lazy } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { json } from 'utils/object';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { suppressKeyboardEvent, getCellFocus } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine, OrdemFabricoStatus, ClienteArtigo, Encomenda, PlanningStatus } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';

export default ({ noid = false, defaultFilters = {}, serverMethod, baseFilters: _baseFilters, defaultSort = [], onClick, isRowSelectable, permission, style, gridRef, showHeader = false, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const defaultParameters = { method: serverMethod ? serverMethod : "OpenOrdersList" };
  const baseFilters = _baseFilters ? _baseFilters : {};
  const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "OpenOrdersChoose-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */ payload: { url: `${API_URL}/cargas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, pageSize: 20 }, baseFilter: baseFilters } });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: "id", field: "id", hide: true },
      { field: 'eef', headerName: 'Encomenda', minWidth: 120, width: 120, ...cellParams(), cellRenderer: (params) => <Value params={params} /> },
      { field: 'prf', headerName: 'PRF', minWidth: 120, width: 120, ...cellParams(), cellRenderer: (params) => <Value bold params={params} /> },
      { field: 'data_expedicao', headerName: 'Data Expedição', minWidth: 120, width: 120, ...cellParams(), cellRenderer: (params) => <Value datetime params={params} /> },
      { field: 'cliente', headerName: 'Cliente', minWidth: 250, flex: 1, ...cellParams(), cellRenderer: (params) => <Value params={params} /> },
    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({ toolbar: ["@columns"], more: ["@columns"], no: ["id", ...Object.keys(baseFilters)] }), []);

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
    <Page.Ready ready={permission?.isReady}>
      <TableGridSelect
        {...!showHeader && {
          gridCss: "ag-noheader ag-noborder", headerHeight: 0, suppressDragLeaveHidesColumns: true
        }}
        domLayout={'autoHeight'}
        style={{ height: "auto", ...style }}
        gridRef={_gridRef}
        ignoreRowSelectionOnCells={[/* "sgppl.nome", "mb.nome" */]}
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={defaultSort}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        onSelectionChanged={onSelectionChanged}
        isRowSelectable={_isRowSelectable}
        {...props}
      />
    </Page.Ready>
  );

}