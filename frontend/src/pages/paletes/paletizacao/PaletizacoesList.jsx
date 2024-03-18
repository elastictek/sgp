import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import loadInitV3, { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import { uid } from 'uid';
import dayjs from 'dayjs';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, getCellFocus, columnPath, refreshDataSource } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import { AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { includeObjectKeys, json, updateByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, EditOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { setValidationGroups, validateRows } from 'utils/useValidation';
import Page from 'components/FormFields/FormsV2';
import TableGridView from 'components/TableV4/TableGridView';
import FormPaletizacao from './FormPaletizacao';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';

const title = "Esquemas de Embalamento";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
  return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
    leftTitle={<span style={{}}>{title}</span>}
    {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
  />}</>);
}

// const postProcess = async (dt) => {
//   for (let [i, v] of dt.rows.entries()) {}
//   return dt;
// };

export default (props) => {
  const location = useLocation();
  const { noid = false, showFilters = true, header = true, select = false, edit = false, baseFilters: _baseFilters, defaultFilters = {}, defaultSort = [], style, closeSelf, onSelectionChanged, isRowSelectable, ...rest } = loadInitV3({}, {}, { ...props }, { ...location?.state });
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState({});
  const submitting = useSubmitting(false);
  const gridRef = useRef(); //not required
  const modalApi = useModalApi() //not Required;
  const modeApi = useModeApi() //not Required;
  const permission = usePermission({ name: "ordemfabrico" });
  const defaultParameters = { method: "PaletizacoesList" };
  const [validation, setValidation] = useState({});
  const { openNotification } = useContext(AppContext);
  const baseFilters = {
    ..._baseFilters//...parseFilter("ot.`type`", `==1`, { type: "number" })
  };
  const dataAPI = useDataAPI({
    ...(!noid && { id: "PaletizacoesList-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
    payload: {
      url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
      filter: {}, baseFilter: baseFilters,
      sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
    }
  });

  const onGridReady = async ({ api, ...params }) => { }
  const onGridRequest = async () => { };
  const onGridResponse = async (api) => {
    if (dataAPI.requestsCount() === 1) { }
  };

  const onActionSave = useCallback(async (row, option) => {
    submitting.trigger();

    const _safePost = async (method, { filter, parameters = {} }) => {
      const result = await dataAPI.safePost(`${API_URL}/ordensfabrico/sql/`, method, { filter, parameters });
      result.onValidationFail((p) => { });
      result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
      result.onFail((p) => { });
      //setFormStatus(result);
    }

    switch (option.key) {
      case "delete":
        Modal.confirm({
          content: <div>Tem a certeza que deseja apagar o esquema de embalamento <b>{row.designacao}</b>?</div>, onOk: async () => {
            await _safePost("DeletePaletizacaoV2", { filter: { id: row.id } });
          }
        })
        break;
    };
    submitting.end();
  }, []);

  const actionItems = useCallback((params) => {
    return [
      ...[{ label: "Apagar Esquema de embalamento", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
    ]
  }, []);

  const validationGroups = useMemo(() => (setValidationGroups({
    limites: ["liminf", "limsup"],
    diam: ["diam_ref", "liminf", "limsup"]
  })), []);

  const cellParams = useCallback((params = {}, editorParams = {}) => {
    return {
      cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
      cellEditorParams: { ...editorParams }
    };
  }, [validation, modeApi?.isOnMode()]);

  // ...(true) ? [{ name: 'designacao', header: 'Designação', userSelect: true, defaultLocked: true, defaultWidth: 170, defaultFlex: 1, render: ({ data }) => <Link onClick={() => onOpenPaletizacao(data?.id)} /* onClick={() => navigate('/app/ofabrico/formulacao', { state: { formulacao_id: data?.id, tstamp: Date.now() } })} */ value={data?.designacao}/> }] : [],
  // ...(true) ? [{ name: 'versao', header: 'Versão', userSelect: true, defaultLocked: false, defaultWidth: 90, render: (p) => <div style={{}}>{p.data?.versao}</div> }] : [],
  // ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', userSelect: true, defaultLocked: false, defaultWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.cliente_nome}</div> }] : [],
  // ...(true) ? [{ name: 'cod', header: 'Artigo', userSelect: true, defaultLocked: false, defaultWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.cod}</div> }] : [],
  // ...(true) ? [{ name: 'des', header: 'Artigo Des.', userSelect: true, defaultLocked: false, defaultWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.des}</div> }] : [],
  // ...(true) ? [{ name: 'bobines', header: 'Bobines', userSelect: true, defaultLocked: false, defaultWidth: 90, render: ({data,cellProps}) => <LeftAlign>{data.bobines}</LeftAlign> }] : [],


  const onClick = (e, { data } = {}) => {
    const _edit = ![181, 182].includes(data?.id);
    modalApi.setModalParameters({
      content: <FormPaletizacao edit={permission.isOk({ item: "paletizacao", action: "admin", forInput: [_edit] })} parentApi={gridRef.current.api} parameters={{ ...data && { id: data.id } }} />,
      closable: true,
      title: "Esquema de Embalamento",
      lazy: true,
      type: "drawer",
      responsive: true,
      width: "100%",
      parameters: { ...data && getCellFocus(gridRef.current.api) }
    });
    modalApi.showModal();
  }

  const allowEdit = useMemo(() => {
    return permission.isOk({ item: "paletizacao", action: "admin", forInput: [true, edit] });
  }, [permission.isReady]);

  const columnDefs = useMemo(() => ({
    cols: [
      ...allowEdit ? [{ colId: 'action', type: "actionOnViewColumn", lockPosition: "left", cellRenderer: (params) => ![181, 182].includes(params?.data?.id) && <Action params={params} onClick={(option) => onActionSave(params.data, option)} items={() => actionItems(params)} /> }] : [],
      { colId: "designacao", field: 'designacao', headerName: 'Designação', width: 190, cellRenderer: (params) => <Value link onClick={(e) => onClick(e, params)} bold params={params} /> },
      { colId: "versao", field: 'versao', headerName: 'Versão', ...cellParams(), width: 80, cellRenderer: (params) => <Value params={params} /> },
      { colId: "bobines", field: 'bobines', headerName: 'Esquema', ...cellParams(), width: 80, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pp.cliente_cod", field: 'cliente_cod', headerName: 'Cliente Num.', ...cellParams(), width: 130, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pp.cliente_nome", field: 'cliente_nome', headerName: 'Cliente', ...cellParams(), minWidth: 300, width: 300, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },
      { colId: "pa.cod", field: 'cod', headerName: 'Artigo Cod.', ...cellParams(), width: 140, cellRenderer: (params) => <Value params={params} /> },
      { colId: "pa.des", field: 'des', headerName: 'Artigo Des.', ...cellParams(), minWidth: 300, width: 350, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },

    ], timestamp: new Date()
  }), [validation, modeApi?.isOnMode(), permission.isReady]);


  const filters = useMemo(() => ({
    toolbar: ["designacao", "cliente_cod", "cliente_nome", "cod", "des"],
    more: ["@columns"],
    no: [...Object.keys(baseFilters), "action"]
  }), []);

  const _onSelectionChanged = async (rows) => {
    const _row = Array.isArray(rows) ? rows[0] : rows;
    if (onSelectionChanged && typeof onSelectionChanged == "function") {
      await onSelectionChanged(_row);
      if (closeSelf && typeof closeSelf == "function") {
        closeSelf();
      }
    }
  }

  return (
    <Page.Ready ready={permission?.isReady}>
      <TitleForm visible={header} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={rest?.title ? rest.title : title} subTitle={rest?.subTitle ? rest.subTitle : subTitle} />
      <TableGridView
        onGridRequest={onGridRequest}
        onGridResponse={onGridResponse}
        onGridReady={onGridReady}

        {...select && { rowSelection: "single", onSelectionChanged: _onSelectionChanged, ignoreRowSelectionOnCells: ["designacao"], ...(isRowSelectable && typeof isRowSelectable == "function") && { isRowSelectable } }}

        loading={submitting.state}
        style={style}
        gridRef={gridRef}
        columnDefs={columnDefs}
        defaultSort={[{ column: "id", direction: "DESC" }]}
        filters={filters}
        defaultParameters={defaultParameters}
        dataAPI={dataAPI}
        topToolbar={{
          showFilters: showFilters,
          start: <Space>
            {(allowEdit) && <Button icon={<EditOutlined />} onClick={() => onClick()}>Novo esquema</Button>}
          </Space>,
          left: <></>
        }}
        {...rest}
      />
    </Page.Ready>
  );

}