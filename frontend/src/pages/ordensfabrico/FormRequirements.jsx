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
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores } from 'components/EditorsV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';


const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

/* const loadBobinagensLookup = async (bobinagem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, pagination: { limit: 1 }, filter: { bobinagem_id: `==${bobinagem_id}` }, parameters: { method: "BobinagensLookup" } });
    return rows;
} */

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

export default ({ operationsRef, ...props }) => {
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
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        // const formValues = await loadBobinagensLookup(inputParameters.current.bobinagem_id);
        // const v = formValues.length > 0 ? json(formValues[0].artigo)[0] : {};
        // const _ofs = formValues.length > 0 ? json(formValues[0].ofs) : [];

        console.log("loadddddd",inputParameters.current)

        const _amostragem = pickAll(["sentido_enrolamento", "amostragem", "observacoes"], inputParameters.current);
        _amostragem["sentido_enrolamento"] = ENROLAMENTO_OPTIONS.find(v => v.value == _amostragem?.sentido_enrolamento);
        const _tipoEmenda = pickAll(["maximo", "tipo_emenda", "emendas_rolo", "paletes_contentor"], json(inputParameters.current.emendas));
        _tipoEmenda["tipo_emenda"] = TIPOEMENDA_OPTIONS.find(v => v.key == _tipoEmenda?.tipo_emenda);
        const _artigo = pickAll([
            "of_cod", "artigo_cod", "artigo_des", "artigo_produto", "cliente_nome", "order_cod", "prf_cod", "qty_encomenda",
            "artigo_core", "artigo_gsm", "artigo_gtin", "artigo_lar", "artigo_thickness", "artigo_tipo"
        ], inputParameters.current.of);
        //_artigo["core_cod"] = pickAll([{ core_cod: "ITMREF_0" }, { core_des: "ITMDES1_0" }], inputParameters.current?.rows[0]?.of)
        form.setFieldsValue({
            ..._artigo,
            ...pickAll([
                "start_prev_date", "end_prev_date", "inicio", "fim"
            ], inputParameters.current),
            ..._amostragem,
            ..._tipoEmenda,
            ...pickAll([
                 "n_paletes"
            ], inputParameters.current)
        });
        // if (formValues.length > 0 && formValues[0]?.artigo) {
        //     dataAPIArtigos.setRows(json(formValues[0].artigo));
        // }
        submitting.end();
    }

    const onFinish = async (values) => {
        // submitting.trigger();
        // const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        // let { errors, warnings, value, ...status } = getStatus(v);
        // /* if (values.XXXX < values.YYYY) {
        //     errors = 1;
        //     status.fieldStatus.ZZZZZ = { status: "error", messages: [{ message: "Error description." }] };
        // } */
        // setFieldStatus({ ...status.fieldStatus });
        // setFormStatus({ ...status.formStatus });
        // if (errors === 0) {
        //     try {
        //         let vals = {

        //         }
        //         let response = await fetchPost({ url: `${API_URL}/api_to_call/`, filter: { ...vals }, parameters: {} });
        //         if (response.data.status !== "error") {
        //             loadParentData();
        //             closeParent();
        //             Modal.success({ title: `Sucesso...` })
        //         } else {
        //             status.formStatus.error.push({ message: response.data.title });
        //             setFormStatus({ ...status.formStatus });
        //         }
        //     } catch (e) {
        //         Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        //     };

        // }
        // submitting.end();
    }



    const forInput = (action, item = "edit") => {
        return (props?.editParameters?.editKey === "information" && permission.isOk({ item, action }));
    }


    return (
        <YScroll>
            <ToolbarTable {...props} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OFR" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={props?.onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row><Col><HorizontalRule marginTop='0px' title="Artigo"/></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={160}><Field name="of_cod" label={{ enabled: true, text: "Ordem Fabrico" }}><Input size='small' /></Field></Col>
                    <Col width={180}><Field name="artigo_cod" label={{ enabled: true, text: "Artigo Cód." }}><Input size='small' /></Field></Col>
                    <Col xs="content"><Field name="artigo_des" label={{ enabled: true, text: "Artigo Des." }}><Input size='small' /></Field></Col>
                    <Col width={350}><Field name="artigo_produto" label={{ enabled: true, text: "Produto" }}><Input size='small' /></Field></Col>
                </Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={120}><Field name="artigo_tipo" label={{ enabled: true, text: "Tipo" }}><Input size='small' /></Field></Col>
                    <Col width={180}><Field name="artigo_gtin" label={{ enabled: true, text: "Gtin" }}><Input size='small' /></Field></Col>
                    <Col width={120}><Field name="artigo_gsm" label={{ enabled: true, text: "Gramagem" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>gsm</b>} /></Field></Col>
                    <Col width={120}><Field name="artigo_lar" label={{ enabled: true, text: "Largura" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>mm</b>} /></Field></Col>
                    <Col width={120}><Field name="artigo_thickness" label={{ enabled: true, text: "Espessura" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>µ</b>} /></Field></Col>
                    <Col width={120}><Field name="artigo_core" label={{ enabled: true, text: "Core" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>''</b>} /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Encomenda" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={160}><Field name="order_cod" label={{ enabled: true, text: "Encomenda" }}><Input size='small' /></Field></Col>
                    <Col width={160}><Field name="prf_cod" label={{ enabled: true, text: "Prf" }}><Input size='small' /></Field></Col>
                    <Col width={120}><Field name="qty_encomenda" label={{ enabled: true, text: "Qtd." }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>m<sup>2</sup></b>} /></Field></Col>
                    <Col xs="content"><Field name="cliente_nome" label={{ enabled: true, text: "Cliente" }}><Input size='small' /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Planificação"/></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={170}><Field name="start_prev_date" label={{ enabled: true, text: "Início Previsto" }}><DatePicker size='small' style={{}} showTime={false} format={DATETIME_FORMAT} /></Field></Col>
                    <Col width={170}><Field name="end_prev_date" label={{ enabled: true, text: "Fim Previsto" }}><DatePicker size='small' style={{}} showTime={false} format={DATETIME_FORMAT} /></Field></Col>
                    <Col width={120}><Field name="num_paletes" forInput={forInput("planificacao")} label={{ enabled: true, text: "N° Paletes" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} min={0} /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Emendas"/></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={180}><Field name="tipo_emenda" forInput={forInput("emendas")} label={{ enabled: true, text: "Tipo emenda" }}><SelectField size="small" keyField="key" textField="value" data={TIPOEMENDA_OPTIONS} /></Field></Col>
                    <Col width={120}><Field name="maximo" forInput={forInput("emendas")} label={{ enabled: true, text: "Máximo" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} addonAfter={<b>%</b>} min={0} /></Field></Col>
                    <Col width={120}><Field name="emendas_rolo" forInput={forInput("emendas")} label={{ enabled: true, text: "Emendas/Rolo" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }}  min={0}  /></Field></Col>
                    <Col width={120}><Field name="paletes_contentor" forInput={forInput("emendas")} label={{ enabled: true, text: "Paletes/Contentor" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} min={0} /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Amostragem" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={180}><Field name="sentido_enrolamento" forInput={forInput("amostragem")} label={{ enabled: true, text: "Sentido enrolamento" }}><SelectField size="small" keyField="value" textField="label" data={ENROLAMENTO_OPTIONS} /></Field></Col>
                    <Col width={120}><Field name="amostragem" forInput={forInput("amostragem")} label={{ enabled: true, text: "Amostragem" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} min={0}/></Field></Col>
                </Row>
                <Row gutterWidth={10} style={{}}>
                    <Col xs={12} md={6}><Field name="obs" forInput={forInput("amostragem")} label={{ enabled: true, text: "Observações" }}><TextArea autoSize={{ minRows: 1, maxRows: 16 }} style={{ width: "100%" }} /></Field></Col>
                </Row>

                {(operationsRef && props?.activeTab=='1') && <Portal elId={operationsRef.current}>
                    <Edit permissions={permission} item="edit" action="information" editable={[props?.editParameters?.isEditable(true)]} {...props?.editParameters} resetData={loadData} />
                </Portal>
                }

            </FormContainer>
        </YScroll>
    )

}