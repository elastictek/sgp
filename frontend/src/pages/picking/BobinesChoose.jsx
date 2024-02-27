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

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, EstadoBobine } from "components/TableV4/TableColumnsV4";

import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page from 'components/FormFields/FormsV2';


const Palete = lazy(() => import('../paletes/Palete'));

export default ({ noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, isRowSelectable, permission, style, gridRef, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const _gridRef = gridRef || useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const defaultParameters = { method: "BobinesListV2" };
  const baseFilters = _baseFilters ? _baseFilters : {};
  const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "BobinesChoose-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */ payload: { url: `${API_URL}/bobines/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: baseFilters } });

  const cellParams = useCallback((params = {}) => {
    return { cellRendererParams: { modalApi, ...params } };
  }, []);

  const columnDefs = useMemo(() => ({
    cols: [
      { colId: 'mb.nome', field: 'nome', headerName: 'Nome', lockPosition: "left", minWidth: 120, ...cellParams(), cellRenderer: (params) => <Value link bold onClick={(e) => onBobineClick(e, params)} params={params} /> },
      { colId: 'mb.timestamp', field: 'timestamp', headerName: 'Data', minWidth: 100, ...cellParams(), cellRenderer: (params) => <Value datetime params={params} /> },
      { colId: 'mb.estado', field: 'estado', headerName: 'Estado', width: 90, ...cellParams(), cellRenderer: (params) => <EstadoBobine field={{ estado: "estado", largura: "lar" }} params={params} /> },
      { colId: 'mb.area', field: 'area', headerName: 'Área', minWidth: 100, ...cellParams(), cellRenderer: (params) => <Value unit=" m²" params={params} /> },
      { colId: 'mb.comp_actual', field: 'comp_actual', headerName: 'Comp.', minWidth: 100, ...cellParams(), cellRenderer: (params) => <Value unit=" m" params={params} /> },
      { colId: 'mb.lar', field: 'lar', headerName: 'Lar.', minWidth: 100, ...cellParams(), cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'mb.core', field: 'core', headerName: 'Core', minWidth: 100, ...cellParams(), cellRenderer: (params) => <Value unit="''" params={params} /> },
      { colId: 'mb.diam', field: 'diam', headerName: 'Diam.', minWidth: 100, ...cellParams(), cellRenderer: (params) => <Value unit=" mm" params={params} /> },
      { colId: 'mb.destino', field: 'destino', headerName: 'Destino', minWidth: 200, flex: 1, ...cellParams(), cellRenderer: (params) => <Value bold params={params} /> },
      { colId: 'sgppl.nome', field: 'palete_nome', headerName: 'Palete', minWidth: 200, flex: 1, ...cellParams(), cellRenderer: (params) => <Value onClick={(e) => onPaleteClick(e, params)} link bold params={params} /> },
    ], timestamp: new Date()
  }), []);

  const filters = useMemo(() => ({
    toolbar: [
      { field: "nome", case: "s", op: "start" },
      "destino",
      { field: "palete_nome", case: "i", op: "start" },
      { field: "timestamp", type: "date", mask: "date({k})" }
    ],
    more: [/* "@columns"*/],
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

  const onPaleteClick = (e, { data }) => {
    const p = { palete_id: data.palete_id, palete_nome: data.palete_nome, palete: { id: data.palete_id }, tstamp: Date.now() };
    modalApi.setModalParameters({ content: <Palete parameters={p} />, lazy: true, type: "drawer", width: "95%", parameters: { ...getCellFocus(gridRef.current.api) } });
    modalApi.showModal();
  }

  const onBobineClick = (e, { data }) => {
    newWindow(`${ROOT_URL}/producao/bobine/details/${data.id}/`, {}, `bobine-${data.id}`);
  }

  return (
    <Page.Ready ready={permission?.isReady}>
      <TableGridSelect
        style={style}
        gridRef={_gridRef}
        ignoreRowSelectionOnCells={["sgppl.nome", "mb.nome"]}
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