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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";


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
        produto_cod: Joi.string().label("Designação do Produto").required(),
        artigo_formu: Joi.string().label("Fórmula").required(),
        artigo_nw1: Joi.string().label("Nonwoven 1").required(),
        typeofabrico: Joi.number().integer().min(0).max(2).label("Tipo Ordem de Fabrico").required(),
        artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
        artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
        artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
        artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
        artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required()
    }, options).unknown(true);
}

const loadClienteExists = async (cliente_cod) => {
    const { data: { exists } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { limit: 1 }, filter: { cliente_cod }, parameters: { method: "ClienteExists" } });
    return exists;
}

export default ({ parameters, extraRef, closeSelf, loadParentData, ...props }) => {
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
    const [clienteExists, setClienteExists] = useState(false);
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        console.log("vou validar")
        props?.setTitle({ title: `Validar Ordem de Fabrico ${parameters?.ofabrico}` });
        console.log(parameters)
        const _exists = !parameters?.cliente_cod ? true : await loadClienteExists(parameters?.cliente_cod);
        setClienteExists(_exists);

        if (!parameters?.produto_id && parameters?.ofabrico) {
            let artigo = {
                artigo_thickness: THICKNESS,
                produto_cod: parameters?.item_nome?.substring(0, parameters?.item_nome.lastIndexOf(' L')),
                artigo_gtin: null,
                artigo_core: null,
                artigo_formu: null,
                artigo_nw1: null,
                artigo_nw2: null,
                artigo_width: null,
                artigo_diam: null,
                artigo_gram: null
            };
            const designacao = parameters?.item_nome?.split(' ').reverse();
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
            form.setFieldsValue({ ...artigo });
        }
        submitting.end();
    }

    const onFinish = async (type = 'validar') => {
        const values = form.getFieldsValue(true);
        submitting.trigger();
        try {
            if (type === 'ignorar' && parameters?.ofabrico) {
                //ignorar
                let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: { method: "Ignorar", ofabrico_cod: parameters?.ofabrico } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeSelf();
                } else {
                    Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.title });
                }
            } else {

                const vals = {
                    values: {
                        artigo_diam: parameters?.item_diam, artigo_thickness: parameters?.item_thickness,
                        artigo_core: parameters?.item_core, artigo_width: parameters?.item_width,
                        qty_item: parameters?.qty_item, ...values
                    }, iorder: parameters?.iorder, prf: parameters?.prf, ofabrico_cod: parameters?.ofabrico, ofabrico_id: parameters?.ofabrico_id, artigo_cod: parameters?.item,
                    artigo_nome:parameters?.item_nome,
                    cliente_cod: parameters?.cliente_cod, cliente_nome: parameters?.cliente_nome, produto_id: parameters?.produto_id, artigo_id: parameters?.item_id,
                    start_date: dayjs(parameters?.start_date).format(DATETIME_FORMAT), end_date: dayjs(parameters?.start_date).format(DATETIME_FORMAT),
                    main_gtin: GTIN, method: "Validar"
                };
                console.log("###############################################")
                console.log("valss",vals)

                if (!parameters?.produto_id && parameters?.ofabrico) {
                    const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
                    let { errors, warnings, value, ...status } = getStatus(v);
                    if (!clienteExists && !values?.cliente_abv) {
                        errors++;
                        status.fieldStatus.cliente_abv = { status: "error", messages: [{ message: "A sigla do cliente é obrigatória! A sigla não está definida." }] };
                    }
                    setFieldStatus({ ...status.fieldStatus });
                    setFormStatus({ ...status.formStatus });

                    if (errors === 0) {

                        let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: vals });
                        if (response.data.status !== "error") {
                            loadParentData();
                            closeSelf();
                        } else {
                            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.title });
                            status.formStatus.error.push({ message: response.data.title });
                            setFormStatus({ ...status.formStatus });
                        }
                    }
                } else {
                    const v = schema({ keys: ["typeofabrico"] }).validate(values, { abortEarly: false, messages: validateMessages, context: {} });
                    let { errors, warnings, value, ...status } = getStatus(v);
                    if (!clienteExists && !values?.cliente_abv) {
                        errors++;
                        status.fieldStatus.cliente_abv = { status: "error", messages: [{ message: "A sigla do cliente é obrigatória! A sigla não está definida." }] };
                    }
                    setFieldStatus({ ...status.fieldStatus });
                    setFormStatus({ ...status.formStatus });
                    if (errors === 0) {
                        //validar com artigo/produto já existente
                        console.log(values, '   ', parameters)
                        let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: vals });
                        if (response.data.status !== "error") {
                            loadParentData();
                            closeSelf();
                        } else {
                            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.title });
                            status.formStatus.error.push({ message: response.data.title });
                            setFormStatus({ ...status.formStatus });
                        }
                    }
                }


            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        }

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
        //}
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
            <FormContainer id="LAY-VAL" fluid forInput={permission.isOk({ item:"changeStatus", action: "validar" })} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                {parameters?.produto_id && <><Row>
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
                            <Field name="typeofabrico" label={{ enabled: true, text: "Tipo de Ordem de Fabrico" }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: 0, label: "Linha" },
                                    { value: 1, label: "Retrabalho" },
                                    { value: 2, label: "Reembalamento" }]} />
                            </Field>
                        </Col>
                        {!clienteExists &&
                            <Col width={100}>
                                <Field name="cliente_abv" label={{ enabled: true, text: "Cliente Sigla" }}><Input maxLength={3} size="small" /></Field>
                            </Col>
                        }
                    </Row></>}
                {!parameters?.produto_id && <>
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
                            <Field name="typeofabrico" label={{ enabled: true, text: "Tipo de Ordem de Fabrico" }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: 0, label: "Linha" },
                                    { value: 1, label: "Retrabalho" },
                                    { value: 2, label: "Reembalamento" }]} />
                            </Field>
                        </Col>
                        {!clienteExists &&
                            <Col width={100}>
                                <Field name="cliente_abv" label={{ enabled: true, text: "Cliente Sigla" }}><Input maxLength={3} size="small" /></Field>
                            </Col>
                        }
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col width={650}><Field name="produto_cod" label={{ enabled: true, text: "Produto" }}><Input placeholder="Designação do Produto" size="small" /></Field></Col>
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
                    {permission.isOk({ item:"changeStatus", action: "validar" }) && <Space>
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