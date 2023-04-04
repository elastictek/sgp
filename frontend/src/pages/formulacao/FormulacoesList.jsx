import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
//import moment from 'moment';
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
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { RightAlign } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import FormFormulacao from "./FormFormulacao";

const title = "Formulações";
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
  return getSchema({}, options).unknown(true);
}
const ToolbarFilters = ({ dataAPI, auth, num, v, ...props }) => {
  return (<>
    {true && <>
      <Col width={100}>
        <Field name="fcliente" shouldUpdate label={{ enabled: true, text: "Cliente", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
      <Col width={100}>
        <Field name="fproduto" shouldUpdate label={{ enabled: true, text: "Produto", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
      <Col width={100}>
        <Field name="fdesignacao" shouldUpdate label={{ enabled: true, text: "Designação", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
      <Col xs='content'>
        <Field shouldUpdate name="fdata_created" label={{ enabled: true, text: "Data Criação", pos: "top", padding: "0px" }}>
          <RangeDateField size='small' allowClear />
        </Field>
      </Col>
    </>}
  </>
  );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
  { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' }, span: 24 } },
  { fproduto: { label: "Produto", field: { type: 'input', size: 'small' }, span: 24 } },
  { fdesignacao: { label: "Desinação", field: { type: 'input', size: 'small' }, span: 24 } },
  { fversao: { label: "Versão", field: { type: 'input', size: 'small' }, span: 3 } },
  { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 },fsubgroup: { label: "Subgrupo", field: { type: 'input', size: 'small' }, span: 12 } },
  { freference: { label: 'Referência', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Não" }, { value: 1, label: "Sim" }] }, span: 6 } },
  { fdata_created: { label: "Data Criação", field: { type: "rangedate", size: 'small' } } },
  { fdata_updated: { label: "Data Alteração", field: { type: "rangedate", size: 'small' } } }
];

export default ({ setFormTitle, ...props }) => {
  const media = useContext(MediaContext);

  const permission = usePermission({ name: "formulacao", item: "datagrid" });//Permissões Iniciais
  const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
  const [gridStatus, setGridStatus] = useState({ fieldStatus: {}, formStatus: {}, errors: 0, warnings: 0 });

  const { openNotification } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const tableCls = useTableStyles();
  const [formFilter] = Form.useForm();
  const defaultFilters = {};
  const defaultParameters = { method: "ListFormulacoes" };
  const defaultSort = [{ column: "id", direction: "ASC" }];
  const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/ordensfabrico/sql/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
  const submitting = useSubmitting(true);

  const [modalParameters, setModalParameters] = useState({});
  const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
    const content = () => {
      switch (modalParameters.content) {
        case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />;
      }
    }
    return (
      <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
        {content()}
      </ResponsiveModal>
    );
  }, [modalParameters]);
  const onOpenFormulacao = (formulacao_id) => {
    setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", push: false, loadData: () => dataAPI.fetchPost(), parameters: { ...formulacao_id ? { formulacao_id } : {new:true} } });
    showModal();
  }

  const columnEditable = (v, { data, name }) => {
    return false;
  }

  const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
  };

  const columns = [
    ...(true) ? [{ name: 'designacao', header: 'Designação', userSelect: true, defaultLocked: true, minWidth: 170, defaultFlex: 1, render: ({ data }) => <Button type='link' onClick={() => onOpenFormulacao(data?.id)} /* onClick={() => navigate('/app/ofabrico/formulacao', { state: { formulacao_id: data?.id, tstamp: Date.now() } })} */>{data?.designacao}</Button> }] : [],
    ...(true) ? [{ name: 'group_name', header: 'Grupo', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1}] : [],
    ...(true) ? [{ name: 'subgroup_name', header: 'SubGrupo', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1}] : [],
    ...(true) ? [{ name: 'versao', header: 'Versão', userSelect: true, defaultLocked: false, width: 90, render: (p) => <div style={{}}>{p.data?.versao}</div> }] : [],
    ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.cliente_nome}</div> }] : [],
    ...(true) ? [{ name: 'produto_cod', header: 'Produto', userSelect: true, defaultLocked: false, minWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.produto_cod}</div> }] : [],
    ...(true) ? [{ name: 'reference', header: 'Referência', userSelect: true, defaultLocked: false, width: 90, render: (p) => <div style={{}}>{p.data?.reference}</div> }] : [],
    ...(true) ? [{ name: 'created_date', header: 'Data Criação', userSelect: true, defaultLocked: false, minWidth: 170, render: (p) => <div style={{}}>{dayjs(p.data?.created_date).format(DATETIME_FORMAT)}</div> }] : [],
    ...(true) ? [{ name: 'updated_date', header: 'Data Alteração', userSelect: true, defaultLocked: false, minWidth: 170, render: (p) => <div style={{}}>{dayjs(p.data?.updated_date).format(DATETIME_FORMAT)}</div> }] : []
  ];


  useEffect(() => {
    const controller = new AbortController();
    const interval = loadData({ init: true, signal: controller.signal });
    return (() => { controller.abort(); (interval) && clearInterval(interval); });
  }, []);

  const loadData = async ({ init = false, signal } = {}) => {
    if (init) {
      const { tstamp, ...initFilters } = loadInit({ ...defaultFilters }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, { ...location?.state }, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
      //if (!("fdata" in initFilters)) {
      //  initFilters["fdata"] = [`>=${dayjs().startOf('month').format(DATE_FORMAT)} 00:00:00`, `<=${dayjs().format(DATE_FORMAT)} 23:59:59`];
      //}
      //let { filterValues, fieldValues } = fixRangeDates(['fdata_created', 'fdata_updated'], initFilters);
      let { filterValues, fieldValues } = fixRangeDates(null, initFilters);
      formFilter.setFieldsValue({ ...fieldValues });
      dataAPI.addFilters({ ...filterValues }, true);
      dataAPI.setSort(dataAPI.getSort(), defaultSort);
      dataAPI.addParameters({ ...defaultParameters }, true);
      //dataAPI.update();
    }
    submitting.end();
  }

  const onFilterFinish = (type, values) => {
    const _data = { start: values?.fdata?.startValue?.format(DATE_FORMAT), end: values?.fdata?.endValue?.format(DATE_FORMAT) };
    const { errors, warnings, value, messages, ...status } = getStatus(schema().validate(_data, { abortEarly: false, messages: validateMessages, context: {} }));
    if (errors > 0) {
      openNotification("error", 'top', "Notificação", messages.error);
    } else {
      if (warnings > 0) {
        openNotification("warning", 'top', "Notificação", messages.warning);
      }
      switch (type) {
        case "filter":
          //remove empty values
          const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
          const _values = {
            ...vals,
            fcliente: getFilterValue(vals?.fcliente, 'any'),
            fproduto: getFilterValue(vals?.fproduto, 'any'),
            fdesignacao: getFilterValue(vals?.fdesignacao, 'any'),
            fgroup: getFilterValue(vals?.fgroup, 'any'),
            fsubgroup: getFilterValue(vals?.fsubgroup, 'any'),
            fdata_created: getFilterRangeValues(vals?.fdata_created?.formatted, true, "00:00:00", "23:59:59"),
            fdata_updated: getFilterRangeValues(vals?.fdata_updated?.formatted, true, "00:00:00", "23:59:59")
          };
          dataAPI.addFilters(dataAPI.removeEmpty(_values));
          dataAPI.addParameters(defaultParameters);
          dataAPI.first();
          dataAPI.setAction("filter", true);
          dataAPI.update(true);
          break;
      }
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
    // const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, columnId, value, rowIndex, gridStatus);
    // setGridStatus({ errors, warnings, fieldStatus, formStatus });
    // dataAPI.updateValue(rowIndex, columnId, value);
  }

  const onSave = async (type) => {
    // const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
    // submitting.trigger();
    // let response = null;
    // try {
    //   const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateRows(rowSchema);
    //   setGridStatus({ errors, warnings, fieldStatus, formStatus });
    //   if (errors === 0) {
    //     response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateArtigosCompativeis", rows } });
    //     if (response.data.status !== "error") {
    //       dataAPI.update(true);
    //       openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //     } else {
    //       openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //     }
    //   }
    // } catch (e) {
    //   openNotification(response.data.status, 'top', "Notificação", e.message, null);
    // } finally {
    //   submitting.end();
    // };
  }

  const onAddSave = async (type) => {
    // const rows = dataAPI.getData().rows;
    // submitting.trigger();
    // let response = null;
    // try {
    //   const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateRows(rowSchema);
    //   setGridStatus({ errors, warnings, fieldStatus, formStatus });
    //   if (errors === 0) {
    //     //response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateArtigosCompativeis", rows } });
    //     //if (response.data.status !== "error") {
    //     //  dataAPI.update(true);
    //     //  openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //     //} else {
    //     ///  openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //     //}
    //   }
    // } catch (e) {
    //   //openNotification(response.data.status, 'top', "Notificação", e.message, null);
    // } finally {
    //   submitting.end();
    // };
  }
  const onAdd = (cols) => {
    // dataAPI.addRow(cols, null, 0);
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
          enabled: false,
          add: false,
          gridStatus, setGridStatus,
          onAdd: onAdd, onAddSave: onAddSave,
          onSave: () => onSave("update"),
          modeKey: "datagrid", setMode, mode, onEditComplete
        }}
        //enableFiltering={false} //Column Filter...
        //defaultFilterValue={defaultFilterValue}
        moreFilters={true}
        leftToolbar={<Permissions forInput={[!submitting.state]} permissions={permission} action="add">
          <Button style={{}} onClick={()=>onOpenFormulacao()}>Nova formulação</Button>
        </Permissions>}
        toolbarFilters={{
          form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
          filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} />,
          moreFilters: { schema: moreFiltersSchema }
        }}
      />
    </>
  );


};