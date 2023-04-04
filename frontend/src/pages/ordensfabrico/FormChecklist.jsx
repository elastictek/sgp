import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
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
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, DownOutlined, DeleteTwoTone } from '@ant-design/icons';
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
import { MediaContext, AppContext } from "../App";
import { json } from "utils/object";
import FormTrocaEtiquetasTask from './FormTrocaEtiquetasTask';
import FormRetrabalhoTask from './FormRetrabalhoTask';
import { TypeChecklist, ButtonTypeChecklist, ItemStatus, ButtonTask, tasksMenuItems, SubType, checklistStatus, Status } from './commons';


const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const loadChecklistLookup = async (checklist_id) => {
    const { data } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { limit: 1 }, filter: { checklist_id: `==${checklist_id}` }, parameters: { method: "ChecklistLookup" } });
    return data;
}
const loadChecklistItemsLookup = async (checklist_id) => {
    const { data } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { enabled: true,pageSize:50 }, filter: { checklist_id: `==${checklist_id}` }, parameters: { method: "ChecklistItemsLookup" } });
    return data;
}

const newTaskItems = tasksMenuItems;


export default (props) => {
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ name: "checklist",item:"checklist" });//Permissões Iniciais
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
    const dataAPIItems = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [activeTab, setActiveTab] = useState();
    const [checklistId, setChecklistId] = useState();
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "task_1": return <FormTrocaEtiquetasTask loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "task_15": return <FormRetrabalhoTask loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                default: return (<div>Teste</div>);
            }
        }
        return (
            <ResponsiveModal type={modalParameters?.type} push={modalParameters?.push} title={modalParameters.title} onCancel={hideModal} width={modalParameters?.width} height={modalParameters?.height} extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, checklist_id } = {}) => {
        submitting.trigger();
        const _checklist_id = checklistId ? checklistId : (checklist_id ? checklist_id : props?.parameters?.checklist_id);
        let _title = "Nova Checklist";
        if (_checklist_id) {
            const formValues = await loadChecklistLookup(_checklist_id);
            if (formValues.rows.length > 0) {
                _title = `Checklist ${formValues.rows[0].nome}`;
                form.setFieldsValue({ ...formValues.rows[0], timestamp: moment(formValues.rows[0].timestamp), agg: formValues.rows[0]?.agg_of_id });
                setChecklistId(formValues.rows[0].id);
                const _rows = formValues.tasks.rows.map(v => ({ ...v, parameters: json(v.parameters) }));
                dataAPITasks.setRows(_rows);
            }
        } else {
            //default
            form.setFieldsValue({ status: 1 });
        }
        props.setTitle({ title: _title });
        submitting.end();
    }

    const onFinish = async (type) => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);

        if (!values?.agg || values.agg === {}) {
            errors = 1;
            status.fieldStatus.agg = { status: "error", messages: [{ message: "A ordem de fabrico (agregada) tem de ser preenchida!" }] };
        }

        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                const vals = { ...values };
                console.log("SAVING----", { method: type === "update" ? "updateChecklist" : "newChecklist", ...vals })
                let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: { method: type === "update" ? "updateChecklist" : "newChecklist", ...vals } });
                if (response.data.status !== "error") {
                    props?.loadParentData();
                    if (type === "update") { changeMode(); }
                    loadData({ checklist_id: response.data.id })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                    submitting.end();
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                submitting.end();
            };
        } else {
            submitting.end();
        }
    }

    const onNewTask = (v) => {
        setModalParameters({ content: `task_${v.key}`, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData, parameters: { taskType: v.key, checklist_id: checklistId } });
        showModal();
    }

    const onTaskClick = (r) => {
        setModalParameters({ content: `task_${r.type}`, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData, parameters: { taskType: r.type, task: r } });
        showModal();
    }

    const onValuesChange = (changedValues, values) => {
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }

    const onTabChange = async (k) => {
        setActiveTab(k);
        if (['3'].includes(k)) {
            submitting.trigger();
            const _checklist_id = props?.parameters?.checklist_id;
            if (_checklist_id) {
                const dt = await loadChecklistItemsLookup(_checklist_id);
                dataAPIItems.setRows(dt.rows);
            }
            submitting.end();
        }
    }

    const onDelTask = (r) => {
        Modal.confirm({
            title: <div>Eliminar a tarefa <b>{r.nome}</b></div>, content: "Tem a certeza que deseja eliminar a tarefa selecionada?", onOk: async () => {
                submitting.trigger();
                try {
                    let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id: r.id }, parameters: { method: "DeleteTask" } });
                    if (response.data.status !== "error") {
                        openNotification(response.data.status, 'top', "Notificação", `Tarefa ${r.nome} eliminada com sucesso!`);
                        loadData();
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", `Erro ao eliminar a tarefa ${r.nome}!`);
                    }
                } catch (e) {
                    openNotification("error", 'top', "Notificação", e);
                } finally {
                    submitting.end();
                };
            }
        });
    }

    const changeMode = () => {
        setModeEdit({ form: (modeEdit.form) ? false : true });
    }

    return (
        <div style={{ height: "calc(100vh - 120px)" }}>
            <YScroll>
                <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} style={{ marginBottom: "5px" }} />
                <FormContainer id="LAY-CHK" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={modeEdit?.form && permission.isOk({ action: "update" }) || !checklistId && permission.isOk({ action: "new" })} alert={{ tooltip: true, pos: "none" }}>

                    <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange} tabBarExtraContent={{
                        right: <> {(!activeTab || activeTab === '1') && <Permissions permissions={permission} action={checklistId ? "update" : "new"}>
                            <Space>
                                {(!submitting.state && checklistId) && <>
                                    {modeEdit.form && <Button style={{ marginBottom: "5px" }} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                                    {!modeEdit.form && <Button style={{ marginBottom: "5px" }} icon={<EditOutlined />} onClick={changeMode}>Modo de edição</Button>}
                                    {modeEdit.form && <Button style={{ marginBottom: "5px" }} icon={<EditOutlined />} onClick={() => onFinish("update")} >Guardar</Button>}
                                </>}
                                {(!submitting.state && !checklistId) && <Button style={{ marginBottom: "5px" }} icon={<EditOutlined />} onClick={() => onFinish("new")}>Guardar</Button>}
                            </Space>
                        </Permissions>}</>
                    }}
                        items={[
                            {
                                label: `Informação`,
                                key: '1',
                                children: <>
                                    <Row style={{}} gutterWidth={10}>
                                        <Col width={180}><Field name="nome" label={{ enabled: true, text: "Código" }} forInput={false}><Input size="small" /></Field></Col>
                                        <Col width={160}><Field name="timestamp" label={{ enabled: true, text: "Data" }} forInput={false}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                                        <Col width={180}><Field name="agg" {...(modeEdit?.form === true) && { forInput: false }} label={{ enabled: true, text: "Ordem de Fabrico (Agregada)" }}>
                                            <Selector
                                                popupWidth={800}
                                                allowClear={true}
                                                size="small"
                                                title="Ordens de Fabrico"
                                                params={{ payload: { url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "AvailableAggLookup" }, pagination: { enabled: true, limit: 50 }, filter: {}, sort: [] } }}
                                                keyField={["id"]}
                                                textField="cod"
                                                load
                                                //detailText={r => r?.cod}
                                                style={{ fontWeight: 700 }}
                                                columns={[
                                                    { key: 'cod', name: 'Cód', width: 160 },
                                                    { key: 'of_id', name: 'Ordem', width: 160 },
                                                    { key: 'order_cod', name: 'Encomenda', width: 160 },
                                                    { key: 'prf_cod', name: 'PRF', width: 160 },
                                                    { key: 'cliente_nome', name: 'Cliente' }
                                                ]}
                                                filters={{ /* fartigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } */ }}
                                                moreFilters={{}}
                                            />

                                        </Field></Col>
                                    </Row>
                                    <Row style={{}} gutterWidth={10}>
                                        <Col xs="content"><Field name="status" label={{ enabled: true, text: "Estado" }}><SelectField style={{ width: "180px" }} size="small" keyField="value" textField="label" data={checklistStatus} /></Field></Col>
                                    </Row>
                                    <Row style={{}} gutterWidth={10}>
                                        <Col xs={12} md={6}><Field name="obs" label={{ enabled: true, text: "Observações" }}><TextArea autoSize={{ minRows: 1, maxRows: 16 }} style={{ width: "100%" }} /></Field></Col>
                                    </Row>
                                </>,
                            },
                            {
                                label: `Tarefas`,
                                key: '2',
                                disabled: !checklistId,
                                children: <>
                                    <Row style={{}} gutterWidth={10}>
                                        <Col>
                                            <Table
                                                rowStyle={`cursor:pointer;font-size:12px;`}
                                                loadOnInit={false}
                                                columns={[
                                                    { key: 'nome', frozen: true, width: 135, name: 'Cód.', formatter: p => <b>{p.row.nome}</b> },
                                                    { key: 'type', name: 'Tarefa', frozen: true, width: 150, formatter: p => <TypeChecklist v={p.row.type} onClick={() => onTaskClick(p.row)} /> },
                                                    { key: 'subtype', name: 'Tipo', frozen: true, width: 150, formatter: p => <SubType type={p.row.type} v={p.row.subtype} /> },
                                                    { key: 'status', width: 110, name: 'Estado', formatter: p => <Status v={p.row.status} genre="f" /> },
                                                    { key: 'timestamp', width: 130, name: 'Data', formatter: p => moment(p.row.timestamp).format(DATETIME_FORMAT) },
                                                    { key: 'ofid', width: 140, name: 'Ordem Fabrico', formatter: p => p.row.ofid },
                                                    { key: 'cliente_nome', width: 200, name: 'Cliente', formatter: p => p.row.parameters?.cliente?.BPCNAM_0 },
                                                    { key: 'artigo_cod', width: 150, name: 'Artigo', formatter: p => p.row.parameters?.artigo?.cod },
                                                    { key: 'artigo_des', width: "1fr", name: 'Artigo Des.', formatter: p => p.row.parameters?.artigo?.des },
                                                    { key: 'data_imputacao', width: 130, name: 'Data imputação', formatter: p => p.row.parameters?.data_imputacao },
                                                    { key: 'baction', name: '', minWidth: 45, maxWidth: 45, width: 45, formatter: p => <Permissions log="tasksssss" permissions={permission} forInput={[p.row.status !== 9]} action="deletetask"><Button icon={<DeleteTwoTone />} size="small" onClick={() => onDelTask(p.row)} /></Permissions> },
                                                    // { key: 'estado', name: 'Estado', width: 90, formatter: p => <EstadoBobines align="center" id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                                    // { key: 'largura', name: 'Larguras (mm)', width: 90, formatter: p => <Largura id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                                    // { key: 'core', name: 'Cores', width: 90, formatter: p => <Core id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                                    // { key: 'des', name: 'Designação', formatter: p => <div style={{ fontWeight: 700 }}>{p.row.des}</div> }
                                                ]}
                                                dataAPI={dataAPITasks}
                                                toolbar={true}
                                                search={false}
                                                leftToolbar={<Space>
                                                    {checklistId &&
                                                        <Dropdown menu={{ items: newTaskItems, onClick: onNewTask }}>
                                                            <Button disabled={(submitting.state && !permission.isOk({ action: "newtask" }))}>
                                                                <Space>
                                                                    Nova Tarefa
                                                                    <DownOutlined />
                                                                </Space>
                                                            </Button>
                                                        </Dropdown>
                                                    }</Space>}
                                                moreFilters={false}
                                                rowSelection={false}
                                                primaryKeys={["id"]}
                                                editable={false}
                                                rowHeight={28}
                                            />
                                        </Col>
                                    </Row>
                                </>,
                            }
                            , {
                                label: `Estado de Execução`,
                                key: '3',
                                disabled: !checklistId,
                                children: <Table
                                    rowStyle={`cursor:pointer;font-size:12px;`}
                                    loadOnInit={false}
                                    columns={[
                                        { key: 'type', name: 'Tarefa', frozen: true, width: 150, formatter: p => <ButtonTask s={p.row.status} t={p.row.type} onClick={() => onTaskClick(p.row)} /> },
                                        { key: 'subtype', width: 150, name: 'Tipo', formatter: p => <SubType type={p.row.type} v={p.row.subtype} /> },
                                        { key: 'status', width: 110, name: 'Estado', formatter: p => <ItemStatus v={p.row.status} /> },
                                        { key: 'timestamp', width: 130, name: 'Data', formatter: p => moment(p.row.timestamp).format(DATETIME_FORMAT) },
                                        { key: 'artigo_cod', width: 150, name: 'Artigo', formatter: p => json(p.row.parameters)?.artigo?.cod },
                                        { key: 'artigo_des', name: 'Artigo Des.', formatter: p => json(p.row.parameters)?.artigo?.des },
                                        { key: 'cliente_nome', name: 'Cliente', formatter: p => json(p.row.parameters)?.cliente?.BPCNAM_0 },
                                        { key: 'result', name: 'Resultado', formatter: p => p.row.result },
                                        // { key: 'agg_cod', width: 140, name: 'Agg Cód.', formatter: p => p.row.agg_cod },
                                        // { key: 'ofid', width: 140, name: 'Ordem Fabrico', formatter: p => p.row.ofid },
                                        // { key: 'cliente_nome', width: 200, name: 'Cliente', formatter: p => p.row.parameters?.cliente?.BPCNAM_0 },
                                        // { key: 'artigo_cod', width: 150, name: 'Artigo', formatter: p => p.row.parameters?.artigo?.cod },
                                        // { key: 'artigo_des', name: 'Artigo Des.', formatter: p => p.row.parameters?.artigo?.des },
                                        // { key: 'data_imputacao', width: 130, name: 'Data imputação', formatter: p => p.row.parameters?.data_imputacao },
                                        // { key: 'estado', name: 'Estado', width: 90, formatter: p => <EstadoBobines align="center" id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                        // { key: 'largura', name: 'Larguras (mm)', width: 90, formatter: p => <Largura id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                        // { key: 'core', name: 'Cores', width: 90, formatter: p => <Core id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                        // { key: 'des', name: 'Designação', formatter: p => <div style={{ fontWeight: 700 }}>{p.row.des}</div> }
                                    ]}
                                    dataAPI={dataAPIItems}
                                    toolbar={false}
                                    search={false}
                                    moreFilters={false}
                                    rowSelection={false}
                                    primaryKeys={["id"]}
                                    editable={false}
                                    rowHeight={28}
                                />,
                            }]}
                    />



                </FormContainer>
            </YScroll>
        </div>
    )

}