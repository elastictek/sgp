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
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, ENROLAMENTO_OPTIONS } from 'config';
import useWebSocket from 'react-use-websocket';
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { dayjsValue } from 'utils/index';
//import { MediaContext } from "../App";
//import { Context } from './Palete';
// import { Core, EstadoBobines, Largura } from "./commons";
// import { LeftToolbar, RightToolbar } from "./Palete";

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const loadPaleteLookup = async (palete_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, pagination: { limit: 1 }, filter: { palete_id: `==${palete_id}` }, parameters: { method: "PaletesLookup" } });
    return rows;
}

// const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, parameters, misc, permission }) => {
//     const navigate = useNavigate();

//     const onChange = (v, field) => {


//     }
//     const leftContent = (<>
//         {/* <Space>
//             {modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={()=>changeMode('formPalete')} />}
//             {!modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<EditOutlined />} onClick={()=>changeMode('formPalete')}>Editar</Button>}
//         </Space> */}
//         <LeftToolbar permission={permission} />
//     </>);

//     const rightContent = (
//         <Space>
//             <RightToolbar permission={permission} parameters={parameters} misc={misc} />
//         </Space>
//     );
//     return (
//         <Toolbar left={leftContent} right={rightContent} />
//     );
// }

export default ({ operationsRef, index, updateState, operations, ...props }) => {
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
    const permission = usePermission({ name: "ordemfabrico", permissions: props?.permissions });
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const tipo_emenda = Form.useWatch('tipo_emenda', form);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, [props?.parameters?.tstamp, location?.state?.tstamp]);

    const loadData = async ({ signal } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
        inputParameters.current = { ...paramsIn };
        console.log("########################", inputParameters)
        const _amostragem = pickAll(["sentido_enrolamento", "amostragem", "observacoes", "item_certificacoes"], inputParameters.current.ordem);
        _amostragem["sentido_enrolamento"] = ENROLAMENTO_OPTIONS.find(v => v.value == _amostragem?.sentido_enrolamento);
        const _tipoEmenda = pickAll(["maximo", "tipo_emenda", "emendas_rolo", "paletes_contentor"], json(inputParameters.current.ordem.emendas));
        _tipoEmenda["tipo_emenda"] = TIPOEMENDA_OPTIONS.find(v => v.key == _tipoEmenda?.tipo_emenda).key;
        const _artigo = pickAll([
            "of_cod", "artigo_cod", "artigo_des", "artigo_produto", "cliente_nome", "order_cod", "prf_cod", "qty_encomenda",
            "artigo_core", "artigo_gsm", "artigo_gtin", "artigo_lar", "artigo_thickness", "artigo_tipo","n_paletes_total"
        ], inputParameters.current.ordem.of);
        //_artigo["core_cod"] = pickAll([{ core_cod: "ITMREF_0" }, { core_des: "ITMDES1_0" }], inputParameters.current?.rows[0]?.of)
        inputParameters.current.initValues={
            ..._artigo,
            ...pickAll(["start_prev_date", "end_prev_date", "inicio", "fim"], inputParameters.current.ordem, (k, n, v) => dayjsValue(v)),
            ..._amostragem,
            ..._tipoEmenda,
            ...pickAll(["n_paletes"], inputParameters.current.ordem)
        };
        form.setFieldsValue(inputParameters.current.initValues);
        
        submitting.end();
    }

    useEffect(() => {
        if (formDirty && !operations.dirtyForms.includes(index)) {
            form.resetFields();
            form.setFieldsValue({...inputParameters.current.initValues});
        }
    }, [formDirty, operations.dirtyForms])

    const onFinish = async (values) => {
        submitting.trigger();
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        if (updateState) {
            updateState(draft => {
                if (!draft.operations.dirtyForms.includes(index)) {
                    draft.operations.dirtyForms.push(index);
                }
            });
        }
        setFormDirty(true);
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }

    const onSave = () => {
        // temp_id  - temp_ofabrico id
        // agg_id   - temp_ofabricoagg id
        // cs_id    - current_settings id
        // ordem_id - planeamento_producao id
        console.log("saving---->", { ...pickAll(["cs_id", "agg_id", "ordem_id", "temp_id"], inputParameters.current)})
    }

    const forInput = (action, item = "edit") => {
        return (operations.edit && permission.isOk({ item, action }));
    }

    return (
        <YScroll>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-F01" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row><Col><HorizontalRule marginTop='0px' title="Artigo" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={160}><Field name="of_cod" label={{ enabled: true, text: "Ordem Fabrico" }}><Input /></Field></Col>
                    <Col width={180}><Field name="artigo_cod" label={{ enabled: true, text: "Artigo Cód." }}><Input /></Field></Col>
                    <Col xs="content"><Field name="artigo_des" label={{ enabled: true, text: "Artigo Des." }}><Input /></Field></Col>
                    <Col width={350}><Field name="artigo_produto" label={{ enabled: true, text: "Produto" }}><Input /></Field></Col>
                    <Col width={350}><Field forInput={forInput("information")} name="item_certificacoes" label={{ enabled: true, text: "Certificações" }}><Input /></Field></Col>
                </Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={120}><Field name="artigo_tipo" label={{ enabled: true, text: "Tipo" }}><Input /></Field></Col>
                    <Col width={180}><Field name="artigo_gtin" label={{ enabled: true, text: "Gtin" }}><Input /></Field></Col>
                    <Col width={120}><Field name="artigo_gsm" label={{ enabled: true, text: "Gramagem" }}><InputNumber style={{ width: "100%", textAlign: "right" }} addonAfter={<b>gsm</b>} /></Field></Col>
                    <Col width={120}><Field name="artigo_lar" label={{ enabled: true, text: "Largura" }}><InputNumber style={{ width: "100%", textAlign: "right" }} addonAfter={<b>mm</b>} /></Field></Col>
                    <Col width={120}><Field name="artigo_thickness" label={{ enabled: true, text: "Espessura" }}><InputNumber style={{ width: "100%", textAlign: "right" }} addonAfter={<b>µ</b>} /></Field></Col>
                    <Col width={120}><Field name="artigo_core" label={{ enabled: true, text: "Core" }}><InputNumber style={{ width: "100%", textAlign: "right" }} addonAfter={<b>''</b>} /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Encomenda" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={160}><Field name="order_cod" label={{ enabled: true, text: "Encomenda" }}><Input /></Field></Col>
                    <Col width={160}><Field name="prf_cod" label={{ enabled: true, text: "Prf" }}><Input /></Field></Col>
                    <Col width={120}><Field name="qty_encomenda" label={{ enabled: true, text: "Qtd." }}><InputNumber style={{ width: "100%", textAlign: "right" }} addonAfter={<b>m<sup>2</sup></b>} /></Field></Col>
                    <Col xs="content"><Field name="cliente_nome" label={{ enabled: true, text: "Cliente" }}><Input /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Planificação" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={180}><Field name="start_prev_date" forInput={forInput("planificacao")} label={{ enabled: true, text: "Início Previsto" }}><DatePicker style={{}} showTime={false} format={DATETIME_FORMAT} /></Field></Col>
                    <Col width={180}><Field name="end_prev_date" forInput={forInput("planificacao")} label={{ enabled: true, text: "Fim Previsto" }}><DatePicker style={{}} showTime={false} format={DATETIME_FORMAT} /></Field></Col>
                    <Col width={120}><Field name="n_paletes_total" forInput={forInput("planificacao")} label={{ enabled: true, text: "N° Paletes" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Emendas" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={200}><Field name="tipo_emenda" forInput={forInput("emendas")} label={{ enabled: true, text: "Tipo emenda" }}><SelectField keyField="key" textField="value" data={TIPOEMENDA_OPTIONS} /></Field></Col>
                    <Col width={120}><Field name="maximo" forInput={tipo_emenda !== null && forInput("emendas")} label={{ enabled: true, text: "Máximo" }}><InputNumber style={{ width: "100%", textAlign: "right" }} addonAfter={<b>%</b>} min={0} /></Field></Col>
                    <Col width={120}><Field name="emendas_rolo" forInput={tipo_emenda !== null && forInput("emendas")} label={{ enabled: true, text: "Emendas/Rolo" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} /></Field></Col>
                    <Col width={120}><Field name="paletes_contentor" forInput={tipo_emenda !== null && forInput("emendas")} label={{ enabled: true, text: "Paletes/Contentor" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} /></Field></Col>
                </Row>
                <Row><Col><HorizontalRule title="Amostragem" /></Col></Row>
                <Row gutterWidth={10} style={{}}>
                    <Col width={180}><Field name="sentido_enrolamento" forInput={forInput("amostragem")} label={{ enabled: true, text: "Sentido enrolamento" }}><SelectField keyField="value" textField="label" data={ENROLAMENTO_OPTIONS} /></Field></Col>
                    <Col width={120}><Field name="amostragem" forInput={forInput("amostragem")} label={{ enabled: true, text: "Amostragem" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} /></Field></Col>
                </Row>
                <Row gutterWidth={10} style={{}}>
                    <Col xs={12} md={6}><Field name="obs" forInput={forInput("amostragem")} label={{ enabled: true, text: "Observações" }}><TextArea autoSize={{ minRows: 1, maxRows: 16 }} style={{ width: "100%" }} /></Field></Col>
                </Row>
            </FormContainer>

            {(operationsRef && operations.edit) && <Portal elId={operationsRef.current}>
            {operations.dirtyForms.includes(index) && <Button onClick={onSave} type="primary">Guardar</Button> } 
            </Portal>
            }
        </YScroll>
    )

}