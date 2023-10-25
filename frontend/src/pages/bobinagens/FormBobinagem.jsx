import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import { Context } from './Bobinagem';
import { Core, EstadoBobines, Largura } from "components/TableColumns";
import { LeftToolbar, RightToolbar } from "./Bobinagem";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const loadBobinagensLookup = async (bobinagem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, pagination: { limit: 1 }, filter: { bobinagem_id: `==${bobinagem_id}` }, parameters: { method: "BobinagensLookup" } });
    return rows;
}

const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, parameters, permission }) => {
    const navigate = useNavigate();

    const onChange = (v, field) => {


    }

    const leftContent = (<>
        {/* <Space>
            {modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={()=>changeMode('formPalete')} />}
            {!modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<EditOutlined />} onClick={()=>changeMode('formPalete')}>Editar</Button>}
        </Space> */}
        <LeftToolbar permission={permission} />
    </>);

    const rightContent = (
        <Space>
            <RightToolbar permission={permission} bobinagem={{ id: parameters?.bobinagem?.id, nome: parameters?.bobinagem?.nome }} />
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ permissions: props?.permissions });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: true, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});

    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, [props?.parameters?.tstamp, location?.state?.tstamp]);

    const loadData = async ({ signal, init = false } = {}) => {
        setFormDirty(false);
        //if (init) {
        const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
        inputParameters.current = { ...paramsIn };
        //}
        const formValues = await loadBobinagensLookup(paramsIn?.bobinagem?.id);
        const v = formValues.length > 0 ? json(formValues[0].artigo)[0] : {};
        const _ofs = formValues.length > 0 ? json(formValues[0].ofs) : [];
        form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], core: v?.core, ofs: _ofs, timestamp: dayjs(formValues[0].timestamp) } : {});
        if (formValues.length > 0 && formValues[0]?.artigo) {
            dataAPIArtigos.setRows(json(formValues[0].artigo));
        }
        submitting.end();
    }

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        /* if (values.XXXX < values.YYYY) {
            errors = 1;
            status.fieldStatus.ZZZZZ = { status: "error", messages: [{ message: "Error description." }] };
        } */
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let vals = {

                }
                let response = await fetchPost({ url: `${API_URL}/api_to_call/`, filter: { ...vals }, parameters: {} });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Sucesso...` })
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
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }


    return (
        <YScroll>
            <ToolbarTable {...props} permission={permission} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-FP" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row gutterWidth={10} style={{}}>
                    <Col width={300}><Field name="produto_cod" label={{ enabled: true, text: "Produto" }}><Input size='small' /></Field></Col>
                    <Col width={110}><Field name="data" label={{ enabled: true, text: "Data" }}><DatePicker size='small' style={{}} showTime={false} format={DATE_FORMAT} /></Field></Col>
                    <Col width={110}><Field name="inico" label={{ enabled: true, text: "Início" }}><TimePicker size='small' style={{}} format={TIME_FORMAT} /></Field></Col>
                    <Col width={110}><Field name="fim" label={{ enabled: true, text: "Fim" }}><TimePicker size='small' style={{}} format={TIME_FORMAT} /></Field></Col>
                    <Col width={110}><Field name="duracao" label={{ enabled: true, text: "Duração" }}><Input size='small' style={{}} /></Field></Col>
                </Row>
                <Row gutterWidth={10} style={{ marginTop: "10px" }}>
                    <Col width={120}><Field name="lar_util" label={{ enabled: true, text: "Largura Útil" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} min={0} addonAfter={<b>mm</b>} /></Field></Col>
                    <Col width={120}><Field required name="largura_bruta" label={{ enabled: true, text: "Largura Bruta" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>mm</b>} /></Field></Col>
                    <Col width={120}><Field name="comp_par" required label={{ enabled: true, text: "Com. Emenda" }}><InputNumber size="small" style={{ textAlign: "right" }} addonAfter={<b>m</b>} /></Field></Col>
                    <Col width={120}><Field name="diam" label={{ enabled: true, text: "Diâmetro" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>mm</b>} /></Field></Col>
                    <Col width={120}><Field name="area" label={{ enabled: true, text: "Área" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>m<sup>2</sup></b>} /></Field></Col>
                    {form.getFieldValue("cortes") && <>
                        <Col width={200}><CortesField value={form.getFieldValue("cortes")} /></Col>
                        <Col width={90}><Field name="core" label={{ enabled: true, text: "Core" }}><Input size='small' style={{}} addonAfter={<b>''</b>} /></Field></Col>
                    </>}
                </Row>
                {(form.getFieldValue("ofs") && form.getFieldValue("ofs").length > 0) && <>
                    <Row><Col><HorizontalRule title="Ordens de Fabrico" /></Col></Row>
                    {form.getFieldValue("ofs").map((v, i) => {
                        return (
                            <Row style={{}} gutterWidth={10} key={`vof-${v.id}`}>
                                <Col style={{ display: "flex" }}>
                                    <Field name={["ofs", i, "of_cod"]} label={{ enabled: false, text: "Ordem Fabrico" }}><Input style={{ width: "120px", marginRight: "10px" }} size="small" /></Field>
                                    <Field name={["ofs", i, "op"]} label={{ enabled: false, text: "" }}><Input /* style={{ width: "650px" }} */ size="small" /></Field>
                                </Col>
                            </Row>
                        );
                    })}
                </>}
                <Row><Col><HorizontalRule title="Nonwovens" /></Col></Row>
                <Row style={{}} gutterWidth={10} wrap="nowrap">
                    <Col width={20}></Col>
                    <Col width={70} style={{ fontWeight: 700 }}>Consumo</Col>
                    <Col width={180} style={{ fontWeight: 700 }}>Artigo</Col>
                    <Col width={180} style={{ fontWeight: 700 }}>Lote</Col>
                    <Col width={430} style={{ fontWeight: 700 }}>Designação</Col>
                </Row>
                <Row style={{ alignItems: "center" }} gutterWidth={10} wrap="nowrap">
                    <Col width={20} style={{ fontWeight: 700 }}><ImArrowUp /></Col>
                    <Col width={70}><Field name="nwsup" label={{ enabled: false }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="m" /></Field></Col>
                    <Col width={180}><Field name="nwcodsup" label={{ enabled: false }}><Input size="small" /></Field></Col>
                    <Col width={180}><Field name="nwlotesup" label={{ enabled: false }}><Input size="small" /></Field></Col>
                    <Col width={430}><Field name="nwdessup" label={{ enabled: false }}><Input size="small" /></Field></Col>
                </Row>
                <Row style={{ alignItems: "center" }} gutterWidth={10} wrap="nowrap">
                    <Col width={20} style={{ fontWeight: 700 }}><ImArrowDown /></Col>
                    <Col width={70}><Field name="nwinf" label={{ enabled: false }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="m" /></Field></Col>
                    <Col width={180}><Field name="nwcodinf" label={{ enabled: false }}><Input size="small" /></Field></Col>
                    <Col width={180}><Field name="nwloteinf" label={{ enabled: false }}><Input size="small" /></Field></Col>
                    <Col width={430}><Field name="nwdesinf" label={{ enabled: false }}><Input size="small" /></Field></Col>
                </Row>

                <Row><Col><HorizontalRule title="Artigos" /></Col></Row>
                <Row>
                    <Col>
                        <Table
                            rowStyle={`cursor:pointer;font-size:12px;`}
                            loadOnInit={false}
                            columns={[
                                { key: 'cod', name: 'Artigo', frozen: true, width: 150, formatter: p => <div style={{ fontWeight: 700 }}>{p.row.cod}</div> },
                                { key: 'estado', name: 'Estado', width: 90, formatter: p => <EstadoBobines align="center" id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                { key: 'largura', name: 'Larguras (mm)', width: 90, formatter: p => <Largura id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                { key: 'core', name: 'Cores', width: 90, formatter: p => <Core id={p.row.id} nome={form.getFieldValue("nome")} artigos={[p.row]} /> },
                                { key: 'des', name: 'Designação', formatter: p => <div style={{ fontWeight: 700 }}>{p.row.des}</div> }
                            ]}
                            dataAPI={dataAPIArtigos}
                            toolbar={false}
                            search={false}
                            moreFilters={false}
                            rowSelection={false}
                            primaryKeys={["id", "estado", "lar"]}
                            editable={false}
                            rowHeight={28}
                        />
                    </Col>
                </Row>
            </FormContainer>
        </YScroll>
    )

}