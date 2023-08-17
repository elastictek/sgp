import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker } from "antd";
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import {ArtigosCompativeisGroupEditor} from 'components/TableEditorsV3';
import {RightAlign} from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import { BsFillEraserFill } from 'react-icons/bs';

const title = "Artigos Compatíveis";
const TitleForm = ({ data, onChange, level, auth, form }) => {
  return (<ToolbarTitle id={auth?.user} description={title} title={<>
    <Col>
      <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
        <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
        {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
      </Row>

    </Col>
  </>
  }
  />);
}

const useStyles = createUseStyles({});

const schema = (options = {}) => {
  return getSchema({}, options).unknown(true);
}
const rowSchema = (options = {}) => {
  return getSchema({
    // "group": Joi.string().label("Grupo").required(),
    // "des": Joi.string().label("des").required()
  }, options).unknown(true);
}
const ToolbarFilters = ({ dataAPI, auth, num, v, ...props }) => {
  return (<>
    {true && <>
      <Col width={100}>
        <Field name="fgroup" shouldUpdate label={{ enabled: true, text: "Grupo", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
      <Col width={100}>
        <Field name="fcod" shouldUpdate label={{ enabled: true, text: "Artigo Cód.", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
      <Col width={100}>
        <Field name="fdes" shouldUpdate label={{ enabled: true, text: "Artigo Des.", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
    </>}
  </>
  );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
  { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
  { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } },
];

/* const FilterDate = React.forwardRef((props, ref) => {
  return (<div className="InovuaReactDataGrid__column-header__filter-wrapper" style={{minHeight: "41px"}}><Input size="small"/></div>)
}); */

export default ({ setFormTitle, ...props }) => {
  const media = useContext(MediaContext);

  const permission = usePermission({ item: "datagrid" });//Permissões Iniciais
  const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });

  const { openNotification } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const tableCls = useTableStyles();
  const [formFilter] = Form.useForm();
  const defaultFilters = {};
  const defaultParameters = { method: "ListArtigosCompativeis" };
  const defaultSort = [{ column: "pa.id", direction: "ASC" }];
  const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/artigos/sql/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
  const submitting = useSubmitting(true);

  const [modalParameters, setModalParameters] = useState({});
  const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
    const content = () => {
      switch (modalParameters.content) {
        //case "<key_name>": return <Component p={modalParameters.parameters.p} column="" parameters={modalParameters.parameters} />;
      }
    }
    return (
      <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
        {content()}
      </ResponsiveModal>
    );
  }, [modalParameters]);


  // const editable = (row, col) => {
  //   /* if (mode.datagrid.edit && permission.isOk({ action: "changeDestino" }) && !row?.carga_id && !row?.SDHNUM_0) {
  //       return (col === "destino") ? true : false;
  //   } */
  //   return false;
  // }
  // const editClass = (cellProps, { data }) => {
  //   if (cellProps.name.startsWith("ss_")) {
  //     if (ty?.trim() === 'in') {
  //       cellProps.style.background = "#91caff";
  //     } else if (ty?.trim() === 'out') {
  //       cellProps.style.background = "#e6f4ff";
  //     }
  //   }
  // }


  const columnEditable = (v, { data, name }) => {
    if (["group"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
      return true;
    }
    return false;
  }

  const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
    if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
      return tableCls.error;
    }
    if (["group"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
      return tableCls.edit;
    }
    // if (["group"].includes(name)){
    //   return tableCls.error;
    // }
  };

  const columns = [
    ...(true) ? [{ name: 'pa.id', header: 'id', userSelect: true, defaultLocked: true, width: 70, render: (p) => <div style={{}}>{p.data?.id}</div> }] : [],
    ...(true) ? [{ name: 'cod', header: 'Cód', userSelect: true, defaultLocked: true, width: 170, render: (p) => <div style={{ fontWeight: 700 }}>{p.data?.cod}</div> }] : [],
    ...(true) ? [{ name: 'des', header: 'Designação', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.des}</div> }] : [],
    ...(true) ? [{ name: 'group', header: 'Grupo', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1, editable: columnEditable, renderEditor: (props) => <ArtigosCompativeisGroupEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, render: (p) => <div style={{ fontWeight: 700 }}>{p.data?.group}</div> }] : [],
    ...(true) ? [{ name: 'gtin', header: 'gtin', userSelect: true, defaultLocked: false, width: 150, render: (p) => <div style={{}}>{p.data?.gtin}</div> }] : [],
    ...(true) ? [{ name: 'core', header: 'Core', userSelect: true, defaultLocked: false, width: 90, render: (p) => <div style={{}}>{p.data?.core}''</div> }] : [],
    ...(true) ? [{ name: 'lar', header: 'Largura', userSelect: true, defaultLocked: false, width: 90, render: (p) => <div style={{}}>{p.data?.lar}mm</div> }] : [],
    ...(true) ? [{ name: 'gsm', header: 'gsm', userSelect: true, defaultLocked: false, width: 90, render: (p) => <div style={{}}>{p.data?.gsm}g/m2</div> }] : [],
    ...(true) ? [{ name: 'produto_cod', header: 'Produto', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.produto_cod}</div> }] : [],
    // ...(true) ? [{ name: 'num', header: 'N', userSelect: true, defaultLocked: true, frozen: true, width: 70, render: (p) => <div style={{ fontWeight: 900 }}>{p.data?.num}</div> }] : [],
    // { name: 'dts', width: 100, header: 'Data', userSelect: true, frozen: true, render: p => dayjs(p.data.dts).format(DATE_FORMAT) },
    // ...(true) ? [{ name: 'baction', header: '', minWidth: 45, maxWidth: 45, render: p => <Button icon={<EditOutlined />} size="small" onClick={() => onFix(p.data)} /> }] : [],
    // ...(true) ? [{ name: 'SRN_0', header: 'Nome', userSelect: true, defaultFlex: 1, minWidth: 350, render: p => <div style={{ fontWeight: 700 }}>{`${p.data.SRN_0} ${p.data.NAM_0}`}</div> }] : [],
    // { name: 'nt', header: 'Picagens', userSelect: true, width: 80, render: p => p.data.nt },
    // //{ name: 'ty_01', header: '', userSelect: true, hidden: true, reportTitle: "es_01", minWidth: 35, width: 35, render: p => p.data.ty_01?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_01', width: 130, userSelect: true, header: 'P01', render: p => p.data.ss_01 && dayjs(p.data.ss_01).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_01) },
    // //{ name: 'ty_02', header: '', userSelect: true, hidden: true, reportTitle: "es_02", minWidth: 35, width: 35, render: p => p.data.ty_02?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_02', width: 130, userSelect: true, header: 'P02', render: p => p.data.ss_02 && dayjs(p.data.ss_02).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_02) },
    // //{ name: 'ty_03', header: '', userSelect: true, hidden: true, reportTitle: "es_03", minWidth: 35, width: 35, render: p => p.data.ty_03?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_03', width: 130, userSelect: true, header: 'P03', render: p => p.data.ss_03 && dayjs(p.data.ss_03).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_03) },
    // //{ name: 'ty_04', header: '', userSelect: true, hidden: true, reportTitle: "es_04", minWidth: 35, width: 35, render: p => p.data.ty_04?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_04', width: 130, userSelect: true, header: 'P04', render: p => p.data.ss_04 && dayjs(p.data.ss_04).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_04) },
    // //{ name: 'ty_05', header: '', userSelect: true, hidden: true, reportTitle: "es_05", minWidth: 35, width: 35, render: p => p.data.ty_05?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_05', width: 130, userSelect: true, header: 'P05', render: p => p.data.ss_05 && dayjs(p.data.ss_05).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_05) },
    // //{ name: 'ty_06', header: '', userSelect: true, hidden: true, reportTitle: "es_06", minWidth: 35, width: 35, render: p => p.data.ty_06?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_06', width: 130, userSelect: true, header: 'P06', render: p => p.data.ss_06 && dayjs(p.data.ss_06).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_06) },
    // //{ name: 'ty_07', header: '', userSelect: true, hidden: true, reportTitle: "es_07", minWidth: 35, width: 35, render: p => p.data.ty_07?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_07', width: 130, userSelect: true, header: 'P07', render: p => p.data.ss_07 && dayjs(p.data.ss_07).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_07) },
    // //{ name: 'ty_08', header: '', userSelect: true, hidden: true, reportTitle: "es_08", minWidth: 35, width: 35, render: p => p.data.ty_08?.trim() === 'in' ? "E" : "S" },
    // { name: 'ss_08', width: 130, userSelect: true, header: 'P08', render: p => p.data.ss_08 && dayjs(p.data.ss_08).format(DATETIME_FORMAT), onRender: (props, obj) => editableClass(props, obj, obj.data.ty_08) },
    // ...(true) ? [{
    //   name: 'pic', sortable: false,
    //   minWidth: 45, width: 45,
    //   header: "",
    //   render: p => <Button icon={<CameraOutlined />} size="small" onClick={() => onRegistosVisuais(p)} />
    // }] : [],
    // /*     { name: 'name', header: 'Name', minWidth: 50, defaultFlex: 2 },
    //     { name: 'age', header: 'Age', maxWidth: 1000, defaultFlex: 1 }, */
  ];


  useEffect(() => {
    const controller = new AbortController();
    const interval = loadData({ init: true, signal: controller.signal });
    return (() => { controller.abort(); (interval) && clearInterval(interval); });
  }, []);

  const loadData = async ({ init = false, signal } = {}) => {
    if (init) {
      const { tstamp, ...initFilters } = loadInit({ ...defaultFilters }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, { ...location?.state }, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
      let { filterValues, fieldValues } = fixRangeDates([], initFilters);
      formFilter.setFieldsValue({ ...fieldValues });
      dataAPI.addFilters({ ...filterValues }, true);
      dataAPI.setSort(dataAPI.getSort(), defaultSort);
      dataAPI.addParameters({ ...defaultParameters }, true);
      //dataAPI.update();
    }
    submitting.end();
  }

  const onFilterFinish = (type, values) => {
    switch (type) {
      case "filter":
        //remove empty values
        const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
        const _values = {
          ...vals,
          fgroup: getFilterValue(vals?.fgroup, 'any'),
          fcod: getFilterValue(vals?.fcod, 'any'),
          fdes: getFilterValue(vals?.fdes, 'any'),
          //f1: getFilterValue(vals?.f1, 'any'),
          //f2: getFilterRangeValues(vals?.f2?.formatted)
        };
        dataAPI.addFilters(dataAPI.removeEmpty(_values));
        dataAPI.addParameters(defaultParameters);
        dataAPI.first();
        dataAPI.setAction("filter", true);
        dataAPI.update(true);
        break;
    }
  };
  const onFilterChange = (changedValues, values) => {
    /* if ("type" in changedValues) {
        navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
    } */
  };

  const onModalView = (p) => {
    setModalParameters({ content: "<key_name>", type: "drawer", title: `Title`, push: false, width: "550px", loadData: () => dataAPI.fetchPost(), parameters: { openNotification, p } });
    showModal();
  }

  const onEditComplete = ({ value, columnId, rowIndex, ...rest }) => {
    dataAPI.validateField(rowSchema, columnId, value, rowIndex);
    dataAPI.updateValue(rowIndex, columnId, value);
  }

  const onSave = async (type) => {
    const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
    submitting.trigger();
    let response = null;
    try {
      const status = dataAPI.validateRows(rowSchema);
      if (status.errors === 0) {
        response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateArtigosCompativeis", rows } });
        if (response.data.status !== "error") {
          dataAPI.update(true);
          openNotification(response.data.status, 'top', "Notificação", response.data.title);
        } else {
          openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        }
      }
    } catch (e) {
      openNotification(response.data.status, 'top', "Notificação", e.message, null);
    } finally {
      submitting.end();
    };
  }

  const onAddSave = async (type) => {
    const rows = dataAPI.getData().rows;
    submitting.trigger();
    let response = null;
    try {
      dataAPI.validateRows(rowSchema);
      if (errors === 0) {
        //response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateArtigosCompativeis", rows } });
        //if (response.data.status !== "error") {
        //  dataAPI.update(true);
        //  openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //} else {
        ///  openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //}
      }
    } catch (e) {
      //openNotification(response.data.status, 'top', "Notificação", e.message, null);
    } finally {
      submitting.end();
    };
  }
  const onAdd = (cols) => {
    dataAPI.addRow(cols, null, 0);
  }

  return (
    <>
      {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
      <Table
        loadOnInit={true}
        pagination="remote"
        defaultLimit={20}
        columns={columns}
        dataAPI={dataAPI}
        editable={{
          enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
          add: permission.isOk({ forInput: [!submitting.state], action: "add" }),
          onAdd: onAdd, onAddSave: onAddSave,
          onSave: () => onSave("update"),
          modeKey: "datagrid", setMode, mode, onEditComplete
        }}
        //enableFiltering={false} //Column Filter...
        //defaultFilterValue={defaultFilterValue}
        moreFilters={true}
        leftToolbar={<Permissions forInput={[!submitting.state]} permissions={permission} action="edit"></Permissions>}
        toolbarFilters={{
          form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
          filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} />,
          moreFilters: { schema: moreFiltersSchema }
        }}
      />
    </>
  );


};