import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Empty, Dropdown } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, DownOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, HorizontalRule } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import { FaWeightHanging } from 'react-icons/fa';
import { SwitchField } from 'components/form';
import { tasks, modes, taskStatus } from './commons';

const subTypes = Object.keys(tasks[1].subtypes).map(v => ({
    value: parseInt(v), label: tasks[1].subtypes[v].name
}));


const schema = (options = {}) => {
    return getSchema({
        'data_imputacao': Joi.any().label("Data de Imputação").required()
    }, options).unknown(true);
}


export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ name: "checklist", item: "task-tre" });//Permissões Iniciais
    const [modeEdit, setModeEdit] = useState({ form: false });

    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPITasks = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [activeTab, setActiveTab] = useState();
    const [typeTask, setTypeTask] = useState();
    const [taskId, setTaskId] = useState();
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                default: return (<div>Teste</div>);
            }
        }
        return (
            <ResponsiveModal type={modalParameters?.type} push={modalParameters?.push} title={modalParameters.title} onCancel={hideModal} width={modalParameters?.width} height={modalParameters?.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, task } = {}) => {
        submitting.trigger();
        const _task = task ? task : props?.parameters?.task;
        switch (parseInt(props.parameters.taskType)) {
            case 1:
                let _title = "Nova Troca de Etiquetas";
                if (_task) {
                    setTaskId(_task.id);
                    _title = "Troca de Etiquetas";
                    const { parameters, ..._data } = _task;
                    form.setFieldsValue({ ..._data, ...parameters, data_imputacao: dayjs(_task.parameters.data_imputacao), subtype: _task?.subtype });
                }
                else {
                    //default
                    form.setFieldsValue({ data_imputacao: dayjs(), status: 1, subtype: subTypes[0].value, mode: 1 });
                }
                props.setTitle({ title: _title });
                break;
        }
        setTypeTask(typeTask);
        submitting.end();
    }

    const onFinish = async (type) => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);

        if (!values?.artigo || values.artigo === {}) {
            errors = 1;
            status.fieldStatus.artigo = { status: "error", messages: [{ message: "O artigo tem de ser preenchido!" }] };
        }
        if (!values?.cliente || values.cliente === {}) {
            errors = 1;
            status.fieldStatus.cliente = { status: "error", messages: [{ message: "O cliente tem de ser preenchido!" }] };
        }
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                const vals = {
                    cliente: values.cliente,
                    artigo: { id: values.artigo.id, cod: values.artigo.cod, des: values.artigo.des, core: values.artigo.core, lar: values.artigo.lar },
                    parameters: {
                        cliente: values.cliente,
                        artigo: { id: values.artigo.id, cod: values.artigo.cod, des: values.artigo.des, core: values.artigo.core, lar: values.artigo.lar },
                        data_imputacao: dayjs(values.data_imputacao).format(DATE_FORMAT),
                        obs: values?.obs
                    },
                    obs: values?.obs,
                    type: 1, // Troca de etiquetas
                    subtype: values?.subtype,
                    checklist_id: props?.parameters?.checklist_id,
                    runtype: 1, // 1 - single, 2 - multiple run
                    mode: values?.mode, //1 - Execução, 2 - Pré-selecão, 3 - Ambos
                    appliesto: 1, //1 -bobine, 2 - palete, 3 - ordem fabrico, ...
                    status: values?.status //1 - ativo, 0 - inativo, 9 - finalizado
                };
                let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {id:values?.id}, parameters: { method: type === "update" ? "updateTaskTrocaEtiquetas" :  "newTaskTrocaEtiquetas", values: vals } });
                if (response.data.status !== "error") {
                    props?.loadParentData({ checklist_id: props?.parameters?.checklist_id });
                    if (type === "update") { changeMode(); }
                    props?.closeSelf();
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };
        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        console.log(changedValues)
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }

    const changeMode = () => {
        setModeEdit({ form: (modeEdit.form) ? false : true });
    }

    return (
        <div style={{ height: "calc(100vh - 120px)" }}>
            <YScroll>
                <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                <FormContainer id="LAY-CHKTASK" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={modeEdit?.form && permission.isOk({ action: "update" }) || !taskId && permission.isOk({ action: "new" })} alert={{ tooltip: true, pos: "none" }}>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={400}>
                            <Field wrapFormItem={true} name="artigo" label={{ enabled: true, text: "Artigo <Para>" }}>
                                <Selector
                                    allowClear
                                    size="small"
                                    title="Artigo <Para>"
                                    params={{ payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ArtigosLookup" }, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                                    keyField={["id"]}
                                    textField="des"
                                    detailText={r => r?.cod}
                                    style={{ fontWeight: 700 }}
                                    columns={[
                                        { key: 'cod', name: 'Cód', width: 160 },
                                        { key: 'des', name: 'Nome' }
                                    ]}
                                    filters={{ fartigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } }}
                                    moreFilters={{}}
                                />
                            </Field>
                        </Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={400}>
                            <Field wrapFormItem={true} name="cliente" label={{ enabled: true, text: "Cliente" }}>
                                <Selector
                                    allowClear
                                    size="small"
                                    title="Clientes"
                                    params={{ payload: { url: `${API_URL}/sellcustomerslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                                    keyField={["BPCNUM_0"]}
                                    textField="BPCNAM_0"
                                    detailText={r => r?.ITMDES1_0}
                                    style={{ fontWeight: 700 }}
                                    columns={[
                                        { key: 'BPCNUM_0', name: 'Cód', width: 160 },
                                        { key: 'BPCNAM_0', name: 'Nome' }
                                    ]}
                                    filters={{ fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } }}
                                    moreFilters={{}}
                                />
                            </Field>
                        </Col>
                    </Row>

                    <Row style={{}} gutterWidth={10}>
                        <Col xs="content"><Field name="subtype" label={{ enabled: true, text: "Tipo de troca" }}><SelectField style={{ width: "180px" }} size="small" keyField="value" textField="label" data={subTypes} /></Field></Col>
                    </Row>

                    <Row style={{}} gutterWidth={10}>
                        <Col xs={12} md={6}><Field name="obs" label={{ enabled: true, text: "Observações" }}><TextArea autoSize={{ minRows: 1, maxRows: 16 }} style={{ width: "100%" }} /></Field></Col>
                    </Row>

                    <Row style={{}} gutterWidth={10}>
                        <Col xs="content"><Field wrapFormItem={true} name="data_imputacao" label={{ enabled: true, text: "Data Imputação" }}><DatePicker format={DATE_FORMAT} size="small" showTime={false} disabledDate={(current) => current && current > dayjs()} /></Field></Col>
                        <Col xs="content"><Field name="mode" label={{ enabled: true, text: "Modo de interação" }}><SelectField style={{ width: "180px" }} size="small" keyField="value" textField="label" data={modes} /></Field></Col>
                        <Row style={{}} gutterWidth={10}>
                            <Col xs="content"><Field name="status" label={{ enabled: true, text: "Estado" }}><SelectField style={{ width: "180px" }} size="small" keyField="value" textField="label" data={taskStatus} /></Field></Col>
                        </Row>
                    </Row>
                </FormContainer>
                {props?.extraRef && <Portal elId={props?.extraRef.current}>
                    <Permissions permissions={permission} action={taskId ? "update" : "new"}>
                        <Space>
                            {taskId && !modeEdit.form && !submitting.state && <Button icon={<EditOutlined />} onClick={changeMode}>Modo de edição</Button>}
                            {(taskId && !submitting.state && modeEdit.form) && <>
                                <Button icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />
                                <Button type="primary" disabled={submitting.state} onClick={() => onFinish("update")}>Guardar</Button>
                                <Button onClick={props?.closeParent}>Cancelar</Button>
                            </>}
                            {(!taskId && !submitting.state) && <>
                                <Button type="primary" disabled={submitting.state} onClick={() => onFinish("new")}>Guardar</Button>
                                <Button onClick={props?.closeParent}>Cancelar</Button>
                            </>}
                        </Space>
                    </Permissions>
                </Portal>
                }
            </YScroll>
        </div>
    )

}