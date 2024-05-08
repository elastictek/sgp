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
import { isNullOrEmpty } from 'utils/index';

export default ({ noid = false, defaultFilters = {}, serverMethod, baseFilters: _baseFilters, defaultSort = [], onClick,onItemsClick, isRowSelectable, permission, style, gridRef, allowInElaboration, showHeader = false, retrabalho = false, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const defaultParameters = { method: serverMethod ? serverMethod : "OrdensFabricoPlanGet", allowInElaboration };
  const baseFilters = _baseFilters ? _baseFilters : { ...!isNullOrEmpty(retrabalho) && { retrabalho: retrabalho ? 1 : 0 } };
  const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "OrdensFabricoChoose-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */ payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "ofid", parameters: defaultParameters, pagination: { enabled: false, limit: 1000 }, baseFilter: baseFilters } });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      ...!retrabalho ? [
        { field: 'agg_cod', headerName: 'Agg.', minWidth: 120, width: 120, ...cellParams(), cellRenderer: (params) => <Value bold outerStyle={{ display: "flex", alignItems: "center" }} params={params} /> },
        { field: 'ofabrico_status', wrapText: false, autoHeight: true, headerName: 'Status', minWidth: 180, width: 180, ...cellParams(), cellRenderer: (params) => <OrdemFabricoStatus field={{ status: "ofabrico_status", ofId: "ofid" }} params={params} /> },
      ] : [
        { field: 'ofid', headerName: 'Ordem Fabrico', minWidth: 300, flex: 1, ...cellParams(), cellRenderer: (params) => <Value bold outerStyle={{ display: "flex", alignItems: "center" }} params={params} /> },
        { field: 'ofabrico_status', wrapText: false, autoHeight: true, headerName: 'Status', minWidth: 180, width: 180, ...cellParams(), cellRenderer: (params) => <OrdemFabricoStatus field={{ status: "ofabrico_status", retrabalho }} params={params} /> },
      ],

      { field: 'cliente_artigo', wrapText: false, autoHeight: true, headerName: 'Cliente/Artigo', minWidth: 400, ...cellParams(), cellRenderer: (params) => <ClienteArtigo field={{ clienteNome: "cliente_nome", artigoCod: "item_cod", artigoDes: "artigo_des" }} params={params} /> },
      { field: 'order', wrapText: false, autoHeight: true, headerName: 'Encomenda', minWidth: 190, flex: 1, ...cellParams(), cellRenderer: (params) => <Encomenda field={{ orderCod: "order_cod", prfCod: "prf_cod" }} params={params} /> },
      { field: 'planning', autoHeight: true, headerName: 'Planeamento', width: 180, ...cellParams(), cellRenderer: (params) => <PlanningStatus onClick={_onItemsClick} outerStyle={{ height: "100%", alignItems: "center" }} check={{ paletizacao: { id: "paletizacao_id" } }} params={params} /> }


    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({ toolbar: [], more: [/* "@columns"*/], no: [...Object.keys(baseFilters)] }), []);

  const _onItemsClick = (item,data) => {
    if (typeof onItemsClick === "function") {
      onItemsClick(item,data);
    }
  }

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
        showTopToolbar={true}
        {...props}
      />
    </Page.Ready>
  );

}