import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import ToolbarTitle from 'components/ToolbarTitleV3';

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

export default ({ noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const permission = usePermission({ name: "checklist" });
  const defaultParameters = { method: "TodoTasksList" };
  const baseFilters = _baseFilters ? _baseFilters : { ...parseFilter("type", "==1", { type: "number" }), ...parseFilter("status", "==1", { type: "number" }) };
  const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "TodoTasksList-01" }), fnPostProcess: (dt) => postProcess(dt, null), payload: { url: `${API_URL}/trocaetiquetas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, baseFilter: baseFilters, sort: defaultSort } });

  const [columnDefs, setColumnDefs] = useImmer([
    { colId: 'nome', field: 'nome', headerName: 'Nome',/* headerCheckboxSelection: true, checkboxSelection: true, */ lockPosition: "left", minWidth: 120, cellStyle: {}, cellRenderer: (params) => <Value bold params={params} onClick={(e) => { console.log("adddddd", e, params); }} /> },
    { field: 'subtype', headerName: 'Tipo', minWidth: 120, cellStyle: {}, cellRenderer: (params) => <Options map={OPTIONS_TROCAETIQUETAS} params={params} /> },
    { colId: 'timestamp', field: 'timestamp', headerName: 'Data', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value datetime params={params} /> },
    { field: 'artigo_cod', headerName: 'Artigo Cód.', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value column="parameters.artigo.cod" params={params} /> },
    { field: 'artigo_des', headerName: 'Artigo', minWidth: 200, flex: 1, cellStyle: {}, cellRenderer: (params) => <Value column="parameters.artigo.des" params={params} /> },
    { field: 'cliente', headerName: 'Cliente', minWidth: 200, flex: 1, cellStyle: {}, cellRenderer: (params) => <Value column="parameters.cliente.BPCNAM_0" params={params} /> },
    { field: 'data_imputacao', headerName: 'Data Imputação', minWidth: 100, cellStyle: {}, cellRenderer: (params) => <Value datetime format={DATE_FORMAT} column="parameters.data_imputacao" params={params} /> }
  ]);

  const [filters, setFilters] = useState({
    toolbar: [
      { field: "subtype", type: "options", options: OPTIONS_SUBTYPE },
      { field: "timestamp", type: "date", mask: "date({k})" },
      { field: "artigo_cod", mask: "parameters->>'$.artigo.cod'" },
      { field: "cliente", mask: "parameters->>'$.cliente.BPCNAM_0'" }
    ],
    more: [/* "@columns"*/"nome"],
    no: [...Object.keys(baseFilters)]
  });

  const onSelectionChanged = (rows) => {
    if (typeof onClick==="function"){
      onClick(rows);
    }
    console.log(rows, filters);
  }

  return (
    <>
      <TitleForm auth={permission.auth} level={location?.state?.level} /* loading={submitting.state} */ title={props?.title ? props.title : title} />
      <TableGridSingleSelect
        //title="Troca de Etiquetas"
        //leftTitle="Troca de Etiquetas"
        //suppressRowClickSelection={true}
        //suppressCellFocus={true}
        //rowSelection="multiple" //single|multiple
        columnDefs={columnDefs}
        filters={filters}
        defaultSort={[{ column: `timestamp`, direction: "DESC" }]}
        permission={permission}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        onSelectionChanged={onSelectionChanged}
      />
    </>
  );

}