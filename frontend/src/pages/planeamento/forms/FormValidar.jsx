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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS,THICKNESS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../../App";


const TitleForm = ({ ofabrico }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div><ExclamationCircleOutlined style={{ color: "#faad14" }} /></div>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 800 }}>Validar Ordem de Fabrico</div>
                <div style={{ color: "#1890ff" }}>{ofabrico}</div>
            </div>
        </div>
    );
}

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const loadPaleteLookup = async (palete_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, pagination: { limit: 1 }, filter: { palete_id: `==${palete_id}` }, parameters: { method: "PaletesLookup" } });
    return rows;
}

export default ({ parameters, extraRef, closeSelf, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        props?.setTitle({ title: `Validar Ordem de Fabrico ${parameters?.ofabrico}` });
        console.log(parameters)


        //if (!parameters?.produto_id && !parameters?.ofabrico) {
            let artigo = { 
                artigo_thickness: THICKNESS, 
                produto_cod: parameters?.item_nome.substring(0, parameters?.item_nome.lastIndexOf(' L')), 
                artigo_gtin: null, 
                artigo_core: null, 
                artigo_formu: null, 
                artigo_nw1: null, 
                artigo_nw2: null, 
                artigo_width: null, 
                artigo_diam: null, 
                artigo_gram: null };
            const designacao = parameters?.item_nome.split(' ').reverse();
            for (let v of designacao) {
                if (v.includes("''") || v.includes("'")) {
                    artigo["artigo_core"] = v.replaceAll("'", "");
                    continue;
                }
                if (v.toUpperCase().startsWith('H')) {
                    artigo["artigo_formu"] = v.toUpperCase();
                    continue;
                }
                if (v.toUpperCase().startsWith('ELA-')) {
                    artigo["artigo_nw1"] = v.toUpperCase();
                    continue;
                }
                if (v.toLowerCase().startsWith('l')) {
                    artigo["artigo_width"] = v.toLowerCase().replaceAll("l", "");
                    continue;
                }
                if (v.toLowerCase().startsWith('d')) {
                    artigo["artigo_diam"] = v.toLowerCase().replaceAll("d", "");
                    continue;
                }
                if (v.toLowerCase().startsWith('g') || (!isNaN(v) && Number.isInteger(parseFloat(v)))) {
                    artigo["artigo_gram"] = v.toLowerCase().replaceAll("g", "");
                    continue;
                }
            }
            setFormStatus({});
            form.setFieldsValue({ ...artigo });
        //}




        console.log("xxxxx", permission.isOk({ item: "validar" }))
        // const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, { ...props?.parameters }, location?.state, [...Object.keys({ ...location?.state }), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys({ ...props?.parameters })]);
        // const formValues = await loadPaleteLookup(initFilters.palete_id);
        // console.log("loaddddddPALETEEEEELISTdddddddddd",formValues)
        // form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], timestamp: moment(formValues[0].timestamp), IPTDAT_0: moment(formValues[0].IPTDAT_0) } : {});
        // if (formValues.length > 0 && formValues[0]?.artigo) {
        //     dataAPIArtigos.setRows(formValues[0].artigo);
        // }
        submitting.end();
    }

    const onFinish = async (type = 'validar') => {
        const values = form.getFieldsValue(true);
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
            // try {
            //     let vals = {

            //     }
            //     let response = await fetchPost({ url: `${API_URL}/api_to_call/`, filter: { ...vals }, parameters: {} });
            //     if (response.data.status !== "error") {
            //         loadParentData();
            //         closeParent();
            //         Modal.success({ title: `Sucesso...` })
            //     } else {
            //         status.formStatus.error.push({ message: response.data.title });
            //         setFormStatus({ ...status.formStatus });
            //     }
            // } catch (e) {
            //     Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            // };
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

            <FormContainer id="LAY-VAL" fluid forInput={permission.isOk({ item: "validar" })} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                {!parameters?.produto_id && <><Row>
                    <Col>
                        <ul>
                            <li>Produto <b>{parameters?.produto_cod}</b></li>
                            <li>Artigo <b>{parameters?.item}</b></li>
                            <li>Des.Artigo <b>{parameters?.item_nome}</b></li>
                            {parameters?.iorder && <li>Encomenda <b>{parameters?.iorder}</b></li>}
                            {parameters?.iorder && <li>Cliente <b>{parameters?.cliente_nome}</b></li>}
                        </ul>
                    </Col>
                </Row>
                    <Row>
                        <Col width={200}>
                            <Field name="typeof" label={{ enabled: true, text: "Tipo de Ordem de Fabrico" }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: 0, label: "Linha" },
                                    { value: 1, label: "Retrabalho" },
                                    { value: 2, label: "Reembalamento" }]} />
                            </Field>
                        </Col>
                    </Row></>}
                {parameters?.produto_id && <>
                    <Row>
                        <Col>
                            <ul>
                                <li> Artigo <b>{parameters?.item}</b></li>
                                <li>Des.Artigo <b>{parameters?.item_nome}</b></li>
                                {parameters?.iorder && <li>Encomenda <b>{parameters?.iorder}</b></li>}
                                {parameters?.iorder && <li>Cliente <b>{parameters?.cliente_nome}</b></li>}
                            </ul>
                            <div>Para Validar a Ordem de Fabrico tem de Confirmar/Preencher os seguintes dados:</div>
                            <VerticalSpace />
                        </Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={200}>
                            <Field name="typeof" label={{ enabled: true, text: "Tipo de Ordem de Fabrico" }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: 0, label: "Linha" },
                                    { value: 1, label: "Retrabalho" },
                                    { value: 2, label: "Reembalamento" }]} />
                            </Field>
                        </Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={650}><Field name="produto_cod" label={{ enabled: true, text:"Produto" }}><Input placeholder="Designação do Produto" size="small" /></Field></Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={200}><Field required={false} label={{ text: <Tooltip title="O código Gtin se deixado em branco será calculado automáticamente" color="blue"><div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px" }}>Gtin<InfoCircleOutlined style={{ color: "#096dd9" }} /></div></Tooltip> }} name="artigo_gtin"><Input size="small" /></Field></Col>
                        <Col width={150}><Field required={true} label={{ text: "Fórmula" }} name="artigo_formu"><Input size="small" /></Field></Col>
                        <Col width={150}><Field required={true} label={{ text: "Nw1" }} name="artigo_nw1"><Input size="small" /></Field></Col>
                        <Col width={150}><Field required={false} label={{ text: "Nw2" }} name="artigo_nw2"><Input size="small" /></Field></Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={120}><Field required={true} label={{ text: "Largura" }} name="artigo_width"><InputNumber size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field></Col>
                        <Col width={120}><Field required={true} label={{ text: "Diâmetro" }} name="artigo_diam"><InputNumber size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field></Col>
                        <Col width={120}><Field required={true} label={{ text: "Core" }} name="artigo_core"><InputNumber size="small" addonAfter={<b>''</b>} maxLength={1} /></Field></Col>
                        <Col width={120}><Field required={true} label={{ text: "Gramagem" }} name="artigo_gram"><InputNumber size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field></Col>
                        <Col width={120}><Field required={true}
                            label={{
                                text: <Tooltip title="A espessura é usada como valor de referência, na conversão de metros&#xB2; -> metros lineares." color="blue">
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px" }}>Espessura<InfoCircleOutlined style={{ color: "#096dd9" }} /></div>
                                </Tooltip>
                            }}
                            name="artigo_thickness">
                            <InputNumber size="small" addonAfter={<b>&#x00B5;</b>} maxLength={4} />
                        </Field></Col>
                    </Row>
                </>}
                {extraRef && <Portal elId={extraRef.current}>
                    {permission.isOk({ item: "validar" }) && <Space>
                        <Button disabled={submitting.state} danger type="primary" onClick={() => onFinish('ignorar')}>Ignorar</Button>
                        <Button disabled={submitting.state} onClick={closeSelf}>Cancelar</Button>
                        <Button disabled={submitting.state} type="primary" onClick={onFinish}>Validar</Button>
                    </Space>}
                </Portal>
                }
            </FormContainer>
        </YScroll>
    )

}