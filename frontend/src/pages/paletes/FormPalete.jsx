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
import { json } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import { Context } from './Palete';
import { Core, EstadoBobines, Largura } from "./commons";
import { LeftToolbar, RightToolbar } from "./Palete";

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const loadPaleteLookup = async (palete_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, pagination: { limit: 1 }, filter: { palete_id: `==${palete_id}` }, parameters: { method: "PaletesLookup" } });
    return rows;
}

const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, parameters, misc, permission, loadParentData }) => {
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
            <RightToolbar permission={permission} parameters={parameters} misc={misc} loadParentData={loadParentData} />
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const permission = usePermission({name: "paletes", permissions: props?.permissions });
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
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, [props?.parameters?.tstamp, location?.state?.tstamp]);

    const loadData = async ({ signal } = {}) => {
        /*if (!permission.allow()) {
            Modal.error({ content: "Não tem permissões!" });
            return;
        } */
        
        setFormDirty(false);
        //if (init) {
        const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
        inputParameters.current = { ...paramsIn };
        //}
        const formValues = await loadPaleteLookup(paramsIn?.palete?.id);
        form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], timestamp: dayjs(formValues[0].timestamp), IPTDAT_0: dayjs(formValues[0].IPTDAT_0) } : {});
        if (formValues.length > 0 && formValues[0]?.artigo) {
            dataAPIArtigos.setRows(json(formValues[0].artigo));
        }
        submitting.end();




        /*let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true, false);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, false);
        dataAPI.fetchPost({
            signal, rowFn: async (dt) => {
                submitting.end();
                return dt;
            }
        });*/
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
            <ToolbarTable {...props} loadParentData={loadData} permission={permission} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-FP" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field name="nome" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
                    <Col width={160}><Field name="timestamp" label={{ enabled: true, text: "Data" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                    <Col width={110}><Field name="comp_real" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="m" /></Field></Col>
                    <Col width={110}><Field name="area_real" label={{ enabled: true, text: "Área" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={<span>m&sup2;</span>} /></Field></Col>
                    <Col width={110}><Field name="nbobines_real" label={{ enabled: true, text: "Nº Bobines" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={`/${form.getFieldValue("num_bobines")}`} /></Field></Col>
                    <Col width={100}><Field name="peso_palete" label={{ enabled: true, text: "Peso Palete" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="kg" /></Field></Col>
                    <Col width={110}><Field name="peso_bruto" label={{ enabled: true, text: "Peso Bruto" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="kg" /></Field></Col>
                    <Col width={110}><Field name="peso_liquido" label={{ enabled: true, text: "Peso Líquido" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="kg" /></Field></Col>
                </Row>
                {form.getFieldValue("cliente_id") && <><Row><Col><HorizontalRule title="Cliente" /></Col></Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={400}><Field name="cliente_nome" label={{ enabled: true, text: "Cliente" }}><Input size="small" /></Field></Col>
                        <Col width={120}><Field name="cliente_diamref" label={{ enabled: true, text: "Diâm. Referência" }}><InputNumber style={{ width: "80px", textAlign: "right" }} size="small" addonAfter="mm" /></Field></Col>
                        <Col width={120}><Field name="cliente_liminf" label={{ enabled: true, text: "Diâmetro Lim. Inf." }}><InputNumber style={{ width: "80px", textAlign: "right" }} size="small" addonAfter="mm" /></Field></Col>
                        <Col width={120}><Field name="cliente_limsup" label={{ enabled: true, text: "Diâmetro Lim. Sup." }}><InputNumber style={{ width: "80px", textAlign: "right" }} size="small" addonAfter="mm" /></Field></Col>
                    </Row>
                </>}


                <Row style={{}} gutterWidth={10}>
                    <Col><Field name="destino" label={{ enabled: true, text: "Destino" }}><Input style={{ width: "570px" }} size="small" /></Field></Col>
                </Row>


                {(form.getFieldValue("ofid") || form.getFieldValue("op")) && <>
                    <Row><Col><HorizontalRule title="Ordem de Fabrico" /></Col></Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col style={{ display: "flex" }}>
                            {form.getFieldValue("ofid") && <Field name="ofid" label={{ enabled: false, text: "Ordem Fabrico" }}><Input style={{ width: "120px", marginRight: "10px" }} size="small" /></Field>}
                            <Field name="op" label={{ enabled: false, text: "" }}><Input size="small" /></Field>
                        </Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}><Col><Label text="Ordem Fabrico Original" /></Col></Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col style={{ display: "flex" }}>
                            {form.getFieldValue("ofid_original") && <Field name="ofid_original" label={{ enabled: false, text: "Ordem Fabrico" }}><Input style={{ width: "120px", marginRight: "10px" }} size="small" /></Field>}
                            <Field name="op_original" label={{ enabled: false, text: "Ordem Fabrico Original" }}><Input size="small" /></Field>
                        </Col>
                    </Row></>}

                {(form.getFieldValue("carga") || form.getFieldValue("SDHNUM_0")) && <><Row><Col><HorizontalRule title="Expedição" /></Col></Row>
                    <Row style={{}} gutterWidth={10}>
                        {form.getFieldValue("carga") && <Col width={250}><Field name="carga" label={{ enabled: true, text: "Carga" }}><Input size="small" /></Field></Col>}
                        {form.getFieldValue("SDHNUM_0") && <><Col width={150}><Field name="SDHNUM_0" label={{ enabled: true, text: "Expedição" }}><Input size="small" /></Field></Col>
                            <Col width={160}><Field name="IPTDAT_0" label={{ enabled: true, text: "Data Expedição" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                            <Col width={250}><Field name="BPCNAM_0" label={{ enabled: true, text: "Expedição Cliente" }}><Input size="small" /></Field></Col>
                            <Col width={40}><Field name="EECICT_0" label={{ enabled: true, text: "EEC" }}><Input size="small" /></Field></Col></>
                        }
                    </Row></>}
                <Row><Col><HorizontalRule title="Artigos" /></Col></Row>
                <Row>
                    <Col>
                        <Table
                            /*                             onRowClick={onRowClick} */
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