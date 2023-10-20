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
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { RightAlign, Favourite, Link, LeftAlign } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
import FormPaletizacao from "./FormPaletizacao";


const title = "Paletizações";
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
        <Field name="fdesignacao" shouldUpdate label={{ enabled: true, text: "Designação", pos: "top", padding: "0px" }}>
          <Input size='small' allowClear />
        </Field>
      </Col>
      <Col width={100}>
        <Field name="fbobines" shouldUpdate label={{ enabled: true, text: "Bobines", pos: "top", padding: "0px" }}>
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
  { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' }, span: 24 } },
  { fdesignacao: { label: "Desinação", field: { type: 'input', size: 'small' }, span: 24 } },
  { fversao: { label: "Versão", field: { type: 'input', size: 'small' }, span: 3 } },
  { fbobines: { label: "Bobines", field: { type: 'input', size: 'small' }, span: 3 } },
  {
    fempilhadas: { label: 'Empilhadas', field: { type: 'select', size: 'small', options: [{ value: "null", label: " " }, { value: ">1", label: "Sim" }, { value: "==1", label: "Não" }] }, span: 6 },
},
];

export default ({ setFormTitle, ...props }) => {
  const media = useContext(MediaContext);

  const permission = usePermission({ name: "formulacao", item: "datagrid" });//Permissões Iniciais
  const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });

  const { openNotification } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const tableCls = useTableStyles();
  const [formFilter] = Form.useForm();
  const defaultFilters = {};
  const defaultParameters = { method: "PaletizacoesList" };
  const defaultSort = [/* { column: "id", direction: "ASC" } */];
  const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/ordensfabrico/sql/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
  const submitting = useSubmitting(true);

  const [modalParameters, setModalParameters] = useState({});
  const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
    const content = () => {
      switch (modalParameters.content) {
        case "paletizacao": return <FormPaletizacao parameters={modalParameters.parameters} />;
      }
    }
    return (
      <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
        {content()}
      </ResponsiveModal>
    );
  }, [modalParameters]);
  const onOpenPaletizacao = (paletizacao_id) => {
    setModalParameters({ content: "paletizacao", type: "drawer", width: "95%", title: "Paletização", push: false, loadData: () => dataAPI.fetchPost(), parameters: { ...paletizacao_id ? { paletizacao_id } : { new: true } } });
    showModal();
  }

  const columnEditable = (v, { data, name }) => {
    return false;
  }

  const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
  };

  const columns = [
    ...(true) ? [{ name: 'designacao', header: 'Designação', userSelect: true, defaultLocked: true, defaultWidth: 170, defaultFlex: 1, render: ({ data }) => <Link onClick={() => onOpenPaletizacao(data?.id)} /* onClick={() => navigate('/app/ofabrico/formulacao', { state: { formulacao_id: data?.id, tstamp: Date.now() } })} */ value={data?.designacao}/> }] : [],
    ...(true) ? [{ name: 'versao', header: 'Versão', userSelect: true, defaultLocked: false, defaultWidth: 90, render: (p) => <div style={{}}>{p.data?.versao}</div> }] : [],
    ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', userSelect: true, defaultLocked: false, defaultWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.cliente_nome}</div> }] : [],
    ...(true) ? [{ name: 'cod', header: 'Artigo', userSelect: true, defaultLocked: false, defaultWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.cod}</div> }] : [],
    ...(true) ? [{ name: 'des', header: 'Artigo Des.', userSelect: true, defaultLocked: false, defaultWidth: 170, defaultFlex: 1, render: (p) => <div style={{}}>{p.data?.des}</div> }] : [],
    ...(true) ? [{ name: 'bobines', header: 'Bobines', userSelect: true, defaultLocked: false, defaultWidth: 90, render: ({data,cellProps}) => <LeftAlign>{data.bobines}</LeftAlign> }] : [],
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
            fdesignacao: getFilterValue(vals?.fdesignacao, 'any'),
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
    //dataAPI.validateField(rowSchema, columnId, value, rowIndex);
    // dataAPI.updateValue(rowIndex, columnId, value);
  }

  const onSave = async (type) => {
    // const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
    // submitting.trigger();
    // let response = null;
    // try {
    //   dataAPI.validateRows(rowSchema);
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
    //   dataAPI.validateRows(rowSchema);
    //   
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
        loading={submitting.state}
        loadOnInit={true}
        pagination="remote"
        defaultLimit={20}
        columns={columns}
        dataAPI={dataAPI}
        editable={{
          enabled: false,
          add: false,
          onAdd: onAdd, onAddSave: onAddSave,
          onSave: () => onSave("update"),
          modeKey: "datagrid", setMode, mode, onEditComplete
        }}
        //enableFiltering={false} //Column Filter...
        //defaultFilterValue={defaultFilterValue}
        moreFilters={true}
        leftToolbar={<Permissions forInput={[!submitting.state]} permissions={permission} action="add">
          <Button style={{}} onClick={() => onOpenPaletizacao()}>Nova Paletização</Button>
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