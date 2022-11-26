import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, DOSERS } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { includeObjectKeys,excludeObjectKeys } from "utils/object";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowUp, ImArrowDown, ImArrowRight, ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { MovNwColumn, PosColumn, QueueNwColumn } from "../picking/commons";


const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaOut = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaOutDate = (options = {}) => {
    return getSchema({
        t_stamp_out: Joi.any().label("Data de Saída").required()
    }, options).unknown(true);
}
const schemaIn = (options = {}) => {
    return getSchema({
        artigo_cod: Joi.any().label("Artigo").required(),
        n_lote: Joi.any().label("Lote").required(),
        type: Joi.any().label("Posição").required(),
        qty_lote: Joi.number().label("Quantidade do Lote").required(),
        t_stamp: Joi.any().label("Data de Entrada").required()
    }, options).unknown(true);
}
const schemaQueue = (options = {}) => { return getSchema({}, options).unknown(true); }

const title = "Nonwovens Movimentos";
const TitleForm = ({ data, onChange, record, level, form }) => {
    // const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }}>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}
const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="ftype_mov" label={{ enabled: true, text: "Mov.", pos: "top", padding: "0px" }}>
                <Select size='small' options={[{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }]} allowClear style={{ width: "100px" }} />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdataout" label={{ enabled: true, text: "Data Saída", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
    </>
    );
}
const useStyles = createUseStyles({
    diffAbove: {
        backgroundColor: "#ffa39e"
    },
    diffBellow: {
        backgroundColor: "#fffb8f"
    },
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    },
    closed: {
        background: "#d9f7be"
    },
    edit: {
        position: "relative",
        '&:before': {
            /* we need this to create the pseudo-element */
            content: "''",
            display: "block",
            /* position the triangle in the top right corner */
            position: "absolute",
            zIndex: "0",
            top: "0",
            right: "0",
            /* create the triangle */
            width: "0",
            height: "0",
            border: ".3em solid transparent",
            borderTopColor: "#66afe9",
            borderRightColor: "#66afe9"

        }
    }
});
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fvcr: { label: "Cód. Movimento", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Movimento", field: { type: "rangedate", size: 'small' } } },
    { fdataout: { label: "Data Saída", field: { type: "rangedate", size: 'small' } } },
    { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];
const OfsColumn = ({ value }) => {
    return (<div>
        {value && value.map(v => <Tag style={{ fontWeight: 600, fontSize: "10px" }} key={`${v}`}>{v}</Tag>)}
    </div>);
}
const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        ...(modeEdit && props.row?.closed === 0 && props.row?.rowvalid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
        ...(modeEdit && props.row?.closed === 0 && props.row?.rowvalid !== 0 && props.row?.status == 1) ? [{ label: <span style={{}}>Saída de linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
        (modeEdit && props.row?.closed === 0 && props.row?.rowvalid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar movimento de entrada</span>, key: 'deletein', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> },
        (modeEdit && props.row?.closed === 0 && props.row?.rowvalid !== 0 && props.row.status == 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar movimento de saída</span>, key: 'deleteout', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}
const loadMovimentosLookup = async (p, value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/stocklistbuffer/`, pagination: { limit: 15 }, filter: { floc: 'BUFFER', fitm: p.row.artigo_cod, flote: `%${value.replaceAll(' ', '%%')}%` }, parameters: { lookup: true } });
    console.log(rows)
    return rows;
}
const loadMateriasPrimasLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, pagination: { limit: 15 }, filter: { fmulti_artigo: `%${value.replaceAll(' ', '%%')}%` }, parameters: { type: 'nonwovens' } });
    return rows;
}
const InputNumberEditor = ({ field, p, onChange, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} onChange={onChange ? (v) => onChange(p, v, field) : (e) => p.onRowChange({ ...p.row, rowvalid: p.row[field] !== e ? 0 : null, [field]: e }, true)} ref={focus} {...props} />
}
const DateTimeEditor = ({ field, p, onChange, ...props }) => {
    return <DatePicker showTime size="small" format={DATETIME_FORMAT} value={moment(p.row[field])} ref={focus} onChange={onChange ? v => onChange(p, v) : (e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props}><Input /></DatePicker>
}
const SelectDebounceEditor = ({ field, keyField, textField, p, ...props }) => {
    return (<SelectDebounceField
        autoFocus
        value={{ value: p.row[field], label: p.row[field] }}
        size="small"
        style={{ width: "100%", padding: "3px" }}
        keyField={keyField ? keyField : field}
        textField={textField ? textField : field}
        showSearch
        showArrow
        ref={focus}
        {...props}
    />)
}
const optionsRender = d => ({
    label: <div>
        <div><span><b>{d["LOT_0"]}</b></span> <span style={{ color: "#096dd9" }}>{moment(d["CREDATTIM_0"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{d["QTYPCU_0"]} m<sup>2</sup></b>]</span></div>
        <div><span>{d["ITMREF_0"]}</span> <span>{d["ITMDES1_0"]}</span></div>
    </div>, value: d["VCRNUM_0"], key: `${d["LOT_0"]}#${d["VCRNUM_0"]}`, row: d
});
const OutContent = ({ record, parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        console.log(record)
        form.setFieldsValue({ ...record, t_stamp: moment(), qty_reminder: null });
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus(v);
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/updatenw/`, filter: { ...values, vcr_num: record.vcr_num, t_stamp: moment.isMoment(values?.t_stamp) ? values?.t_stamp.format(DATETIME_FORMAT) : moment(values?.t_stamp).format(DATETIME_FORMAT) }, parameters: { type: "out", status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: "Saída de Lote da linha efetuada!" })
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

    const onValuesChange = (changedValues, values) => { }

    return (
        <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOut} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
                    <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
                    <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="m2" /></Field></Col>
                    <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="m2" min={0} max={record?.qty_reminder} /></Field></Col>
                    <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}
const InContent = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    const [movimento, setMovimento] = useState(0);

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaIn().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);

        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let vals = {
                    lote_id: movimento.ROWID,
                    qty_lote: values.qty_lote,
                    artigo_des: movimento.ITMDES1_0,
                    artigo_cod: movimento.ITMREF_0,
                    type: values.type,
                    t_stamp: moment(values.t_stamp).format(DATETIME_FORMAT),
                    n_lote: movimento.LOT_0,
                    status: 1,
                    largura: movimento.TSICOD_3,
                    comp: (values.qty_lote / movimento.TSICOD_3) * 1000,
                    vcr_num: movimento.VCRNUM_0,
                    queue: values.queue,
                    obs: "",
                }
                let response = await fetchPost({ url: `${API_URL}/savenwitems/`, filter: {}, parameters: { type: "in", data: vals } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Entrada em linha efetuada!` })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };

        }
        // const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        // const { errors, warnings, value, ...status } = getStatus(v);
        // if (errors === 0) {
        //     try {
        //         let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...values, id: record.id, t_stamp: moment.isMoment(values?.t_stamp) ? values?.t_stamp.format(DATETIME_FORMAT) : moment(values?.t_stamp).format(DATETIME_FORMAT) }, parameters: { type: "out", status: 0 } });
        //         if (response.data.status !== "error") {
        //             loadParentData();
        //             closeParent();
        //             Modal.success({ title: "Saída de Lote da linha efetuada!" })
        //         } else {
        //             status.formStatus.error.push({ message: response.data.title });
        //             setFormStatus({ ...status.formStatus });
        //         }
        //     } catch (e) {
        //         Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        //     };
        // }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        if ("artigo_cod" in changedValues) {
            form.setFieldsValue({ "n_lote": null });
            form.setFieldsValue({ "qty_lote": null });
        }
        if ("n_lote" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("n_lote", null);
        }
    }

    const onSelectLote = (a, b) => {
        form.setFieldValue("qty_lote", b.row.QTYPCU_0);
        setMovimento(b.row);
    }

    return (
        <Form form={form} name={`f-in`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ queue: 0 }}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-IN" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaIn} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}>
                        <SelectDebounceField
                            size="small"
                            style={{ width: "100%" }}
                            keyField="ITMREF_0"
                            textField="ITMDES1_0"
                            showSearch
                            showArrow
                            fetchOptions={loadMateriasPrimasLookup}
                        />
                    </Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={!form.getFieldValue("artigo_cod") ? false : true} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}>
                        <SelectDebounceField
                            optionsRender={optionsRender}
                            size="small"
                            style={{ width: "100%" }}
                            keyField="LOT_0"
                            textField="LOT_0"
                            showSearch
                            showArrow
                            onSelect={onSelectLote}
                            fetchOptions={(v) => loadMovimentosLookup({ row: { artigo_cod: form.getFieldValue("artigo_cod").key } }, v)}
                        />
                    </Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter={<span>m<sup>2</sup></span>} /></Field></Col>
                    <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Entrada" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="type" label={{ enabled: true, text: "Posição" }}><Select size='small' options={[{ value: 0, label: "Inferior" }, { value: 1, label: "Superior" }]} style={{ width: "160px" }} /></Field></Col>
                    <Col><Field wrapFormItem={true} name="queue" label={{ enabled: true, text: "Fila" }}><Select size='small' options={[{ value: 0, label: "Último" }, { value: 1, label: "Em Uso" }, { value: 2, label: "Em Espera" }, { value: 3, label: "Em Preparação" }]} style={{ width: "160px" }} /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}
const DeleteContent = ({ record, parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        //const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus({});

        //setFieldStatus({ ...status.fieldStatus });
        //setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/deletenw/`, filter: { type_mov: 0, vcr_num: record.vcr_num }, parameters: { data: values } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Movimento de saída apagado com sucesso!` })
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
    }

    return (
        <Form form={form} name={`f-del`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ queue: 1 }}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-DEL" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaIn} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="queue" label={{ enabled: true, text: "Posição na Fila" }}><Select size='small' options={[{ value: 0, label: "Último" }, { value: 1, label: "Em Uso" }, { value: 2, label: "Em Espera" }, { value: 3, label: "Em Preparação" }]} style={{ width: "160px" }} /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Apagar Movimento</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}


const CloseContent = ({ record, parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        console.log(record)

        form.setFieldsValue({ ...record, in_t: moment(record.in_t), out_t: moment(record.out_t) });
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus(v);
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/updatenw/`, filter: { vcr_num: record.vcr_num }, parameters: { type: "close", status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: "Movimento fechado com sucesso!" })
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

    const onValuesChange = (changedValues, values) => { }

    return (
        <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOut} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
                    <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
                    <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
                    <Col><Field forInput={false} wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={record?.qty_reminder} /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={false} wrapFormItem={true} name="in_t" label={{ enabled: true, text: "Data Entrada" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                    <Col><Field forInput={false} wrapFormItem={true} name="out_t" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                </Row>

            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}
const CloseDateContent = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaOutDate().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus(v);
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/updatenw/`, filter: { t_stamp_out: moment(values.t_stamp_out).format(DATE_FORMAT) }, parameters: { type: "close", status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: "Movimento(s) fechado(s) com sucesso!" })
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

    const onValuesChange = (changedValues, values) => { }

    return (
        <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <Alert style={{ marginBottom: "2px" }} message={<b>Aviso</b>} description="Ao fechar os movimentos pela data de saída, serão também processados os consumos nessa data!" type="warning" />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOutDate} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={true} wrapFormItem={true} name="t_stamp_out" label={{ enabled: true, text: "Data de Saída" }}><DatePicker format={DATE_FORMAT} size="small" /></Field></Col>
                </Row>

            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const ModalQueueEditor = ({ p, onChange, ...props }) => {
    const classes = useStyles();
    const [visible, setVisible] = useState(true);
    const [value, setvalue] = useState();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(false);

    useEffect(() => {
        //form.setFieldsValue({ items: p.row[column] });
    }, []);

    const onFinish = (e) => {
        /* if (!forInput || valid !== 1) {
            p.onClose();
            setVisible(false);
            return;
        }
        submitting.trigger();
        const values = form.getFieldsValue(true);
        if (e.type === "click" || (e.type === "keydown" && e.key === 'Enter')) {
            const v = schemaRange().label("items").required().messages({ "any.required": "É obrigatório definir pelo menos um intervalo de valores!" }).validate(values?.items, { abortEarly: false, messages: validateMessages });
            const { errors, warnings, value, ...status } = getStatus(v);
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            if (errors === 0) {
                p.onRowChange({ ...p.row, [column]: value.map(({ min, max, unit, type }) => ({ min, max, unit, type })) }, true);
                p.onClose(true);
                setVisible(false);
            }
        }
        submitting.end(); */
    }

    const onValuesChange = () => { };
    const onCancel = () => {
        p.onClose();
        setVisible(false);
    };

    const getQueueName = (v, t) => {
        if (t === 1 && v === 1) {
            return "Em espera";
        }
        if (t === 1 && v >= 2) {
            return "Em Preparação";
        }
        if (t === 0 && v === 2) {
            return "Em Uso";
        }
        return "Em Espera";
    }

    return (
        <Modal title={<div>Fila de Espera <span style={{ fontWeight: 900 }}>{p.row.n_lote}</span></div>} open={visible} destroyOnClose onCancel={onCancel} width="350px" okButtonProps={{ style: { display: 'none' } }}>
            <Form form={form} name={`f-queue`} onValuesChange={onValuesChange} initialValues={{}}>
                <AlertsContainer /* id="el-external" */ mask /* fieldStatus={fieldStatus} */ formStatus={formStatus} portal={false} />
                <FormContainer id="FRM-QUEUE" fluid forInput={true} loading={submitting.state} wrapForm={false} style={{ marginTop: "5px", padding: "0px" }} schema={schemaQueue} wrapFormItem={false}>
                    <Row style={{ marginTop: '10px', alignItems: "center" }} wrap="nowrap" gutterWidth={2}>
                        <Col>
                            <Button onClick={() => onChange(p.row, 1)} block icon={<ImArrowUp size={10} style={{ marginRight: '5px' }} />}>{getQueueName(p.row.queue, 1)}</Button>
                        </Col>
                        <Col xs="content"><QueueNwColumn value={p.row.queue} status={p.row.status} style={{ height: "28px", lineHeight: "2em" }} /></Col>
                        <Col>
                            {p.row.queue !== 1 && <Button onClick={() => onChange(p.row, 0)} block icon={<ImArrowDown size={10} style={{ marginRight: '5px' }} />}>{getQueueName(p.row.queue, 0)}</Button>}
                        </Col>
                    </Row>
                </FormContainer>
            </Form>

        </Modal>
    );
}

export default ({ setFormTitle, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ allowed: { producao: 300, planeamento: 300 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = [{ column: "t_stamp", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: "lst-nwlist", payload: { url: `${API_URL}/nwlist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.type) {
                case "in": return <InContent loadParentData={modalParameters.loadData} />;
                case "out": return <OutContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "deleteout": return <DeleteContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "close": return <CloseContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "closedate": return <CloseDateContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['id'];
    const editable = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.closed === 0) {
            if (col === "queue" && row?.status === 1) {
                return true;
            }
            if (col === "qty_out" && row?.status === 0 && row?.closed === 0) {
                return true;
            }
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.closed === 0) {
            if (col === "queue" && row?.status === 1) {
                return classes.edit;
            }
            if (col === "qty_out" && row?.status === 0 && row?.closed === 0) {
                return classes.edit;
            }
        }
    }
    const formatterClass = (row, col) => {
        if (col === "status" && row.closed === 1) {
            return classes.closed;
        }
    }

    const onQueueChange = async (r, t) => {
        try {
            let response = await fetchPost({ url: `${API_URL}/updatenw/`, filter: { id: r.id }, parameters: { type: "queue", mov: t } });
            if (response.data.status !== "error") {
                Modal.success({ title: `Fila alterada com sucesso!` })
                dataAPI.fetchPost();
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    }


    const onChange = (p, v, field, key) => {
        const _value = (key===null || key===undefined) ? v : v.row[key];
        const r = { ...p.row, values_changed: Array.isArray(p.row?.values_changed) ? p.row?.values_changed : [] };
        r[field] = _value;
        if (!(`${field}_original` in p.row)) {
            r[`${field}_original`] = p.row[field];
        }
        if (r[`${field}_original`] != _value) {
            if (r["values_changed"].indexOf(field) === -1) { r["values_changed"].push(field); }
        } else {
            r["values_changed"] = r["values_changed"].filter(el => el != field);
        }
        if (r["values_changed"].length === 0) {
            r["rowvalid"] = 1;
        }else{
            r["rowvalid"] = 0;
        }
        p.onRowChange(r, true);
    }

    const columns = [
        //{ key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={() => onPrint(p.row)} /> },
        { key: 'status', width: 90, name: 'Movimento', frozen: true, cellClass: r => formatterClass(r, 'status'), formatter: p => <MovNwColumn value={p.row.status} /> },
        { key: 'artigo_cod', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.artigo_cod },
        { key: 't_stamp', width: 140, name: 'Data Entrada', formatter: p => moment(p.row.t_stamp).format(DATETIME_FORMAT) },
        { key: 't_stamp_out', width: 140, name: 'Data Saída', formatter: p => (p.row?.t_stamp_out && p.row.status == 0) && moment(p.row.t_stamp_out).format(DATETIME_FORMAT) },
        { key: 'artigo_des', width: 280, name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        { key: 'n_lote', width: 310, name: 'Lote', formatter: p => <b>{p.row.n_lote}</b> },
        { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} m<sup>2</sup></div> },
        { key: 'qty_out', width: 110, name: 'Qtd. Restante', editable: (r) => editable(r, 'qty_out'), cellClass: r => editableClass(r, 'qty_out'), editor: p => <InputNumberEditor onChange={onChange} p={p} field="qty_out" min={0} max={p.row.qty_lote} addonAfter="m2" />, editorOptions: { editOnClick: true },  formatter: p => p.row?.qty_out && <div>{parseFloat(p.row.qty_out).toFixed(2)} m<sup>2</sup></div> },
        { key: 'type', width: 90, name: 'Posição', formatter: p => <PosColumn value={p.row.type} /> },
        { key: 'largura', name: 'Largura', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura} mm</div> },
        { key: 'comp', name: 'Comp.', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.comp).toFixed(2)} m</div> },
        { key: 'queue', width: 110, maxWidth: 110, name: 'Fila', editable: (r) => editable(r, 'queue'), cellClass: r => editableClass(r, 'queue'), editor: p => <ModalQueueEditor p={p} column="rugas_pos" onChange={onQueueChange} />, editorOptions: { editOnClick: true }, formatter: p => <QueueNwColumn value={p.row.queue} status={p.row.status} /> },
        //{ key: 'qty_reminder', width: 110, name: 'Qtd. Restante', editable: (r) => editable(r, 'qty_reminder'), cellClass: r => editableClass(r, 'qty_reminder'), editor: p => <InputNumberEditor onChange={onQtyReminderChange} p={p} field="qty_reminder" min={0} max={p.row.qty_lote} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div>{parseFloat(p.row.qty_reminder).toFixed(2)} kg</div> },
        //{ key: "in_t", width: 140, name: 'Data Entrada', formatter: p => moment(p.row.in_t).format(DATETIME_FORMAT) },
        //{ key: "out_t", width: 140, name: 'Data Saída', formatter: p => p.row.diff !== 0 && moment(p.row.out_t).format(DATETIME_FORMAT) },
        //{ key: "diff", width: 140, name: 'Duração', cellClass: r => formatterClass(r, 'diff'), formatter: p => p.row.diff !== 0 && secondstoDay(p.row.diff) },
        //{ key: "avgdiff", width: 140, name: 'Duração Média', formatter: p => secondstoDay(p.row.avgdiff)},
        //{ key: "stddiff", width: 140, name: 'Desvio Padrão', formatter: p => secondstoDay(p.row.stddiff)},
        { key: 'vcr_num', name: 'Movimento', width: 200, formatter: p => p.row.vcr_num },
        { key: 'ofs', width: 280, name: 'Ordem Fabrico', formatter: p => <OfsColumn value={p.row.ofs && JSON.parse(p.row.ofs)} /> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdata', 'fdataout'], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({}, true, true);
            dataAPI.fetchPost({ signal });
            setAllowEdit({ datagrid: permission.allow() });
            setModeEdit({ datagrid: false });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fvcr: getFilterValue(vals?.fvcr, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    fdataout: getFilterRangeValues(vals["fdataout"]?.formatted),
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters({});
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onAction = (item, row) => {
        switch (item.key) {
            case "deletein": Modal.confirm({
                title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, content: <ul><li>Serão eliminados os movimentos de entrada e saída!</li></ul>, onOk: async () => {
                    submitting.trigger();
                    try {
                        let response = await fetchPost({ url: `${API_URL}/deletenw/`, filter: { vcr_num: row.vcr_num, type_mov: 1 }, parameters: {} });
                        if (response.data.status !== "error") {
                            Modal.success({ title: `Movimento(s) apagado(s) com sucesso!` })
                            dataAPI.fetchPost();
                        } else {
                            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
                        }
                    } catch (e) {
                        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    } finally {
                        submitting.end();
                    };
                }
            });
                break;
            case "deleteout":
                setModalParameters({ type: item.key, width: 300, height: 150, title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, loadData: () => dataAPI.fetchPost(), record: row });
                showModal();
                break;
            case "out":
                setModalParameters({ type: item.key, title: "Saída de lote em linha", loadData: () => dataAPI.fetchPost(), record: row });
                showModal();
                break;
            case "close":
                setModalParameters({ type: item.key, title: "Fechar movimento", loadData: () => dataAPI.fetchPost(), record: row, height: 300 });
                showModal();
                break;
        }
    }
    const changeMode = () => {
        if (allowEdit.datagrid) {
            setModeEdit({ datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }
    const onSave = async (action) => {
        let rows = dataAPI.getData().rows.filter(v => v?.rowvalid === 0).map((values) =>includeObjectKeys(values,['id','qty_out','qty_lote','closed','status','n_lote','vcr_num']));
        rows = rows.map(obj => ({...obj, timestamp: moment(obj.timestamp).format(DATETIME_FORMAT)}));
        submitting.trigger();
        try {
            let response = await fetchPost({ url: `${API_URL}/updatenw/`, parameters: { rows, type: "datagrid"  } });
            if (response.data.status == "multi") {
                Modal.info({
                    title: "Estado das atualizações",
                    content: <YScroll style={{ maxHeight: "270px" }}>
                        {response.data.success.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#f6ffed", border: "solid 1px #b7eb8f" }}>
                            {response.data.success.map(v => <li>{v}</li>)}
                        </ul>
                        }
                        {response.data.errors.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
                            {response.data.errors.map(v => <li>{v}</li>)}
                        </ul>
                        }
                    </YScroll>
                })
                if (response.data.success.length > 0) {
                    dataAPI.fetchPost();
                }
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
        // const rows = dataAPI.getData().rows.filter(v => v?.rowvalid === 0).map(({ n_lote, vcr_num, t_stamp, qty_lote, qty_reminder, vcr_num_original, type_mov }) =>
        //     ({ n_lote, vcr_num, t_stamp: moment.isMoment(t_stamp) ? t_stamp.format(DATETIME_FORMAT) : moment(t_stamp).format(DATETIME_FORMAT), qty_lote, qty_reminder, vcr_num_original, type_mov })
        // );
        // submitting.trigger();
        // try {
        //     let response = await fetchPost({ url: `${API_URL}/updatenw/`, parameters: { type: "datagrid", rows } });
        //     if (response.data.status == "multi") {
        //         Modal.info({
        //             title: "Estado das atualizações",
        //             content: <YScroll style={{ maxHeight: "270px" }}>
        //                 {response.data.success.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#f6ffed", border: "solid 1px #b7eb8f" }}>
        //                     {response.data.success.map(v => <li>{v}</li>)}
        //                 </ul>
        //                 }
        //                 {response.data.errors.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
        //                     {response.data.errors.map(v => <li>{v}</li>)}
        //                 </ul>
        //                 }
        //             </YScroll>
        //         })
        //         if (response.data.success.length > 0) {
        //             dataAPI.fetchPost();
        //         }
        //     } else {
        //         Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
        //     }
        // } catch (e) {
        //     Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        // } finally {
        //     submitting.end();
        // };
    }
    const onAdd = () => {
        setModalParameters({ height: 380, type: "in", title: "Entrada de lote em linha", loadData: () => dataAPI.fetchPost() });
        showModal();
    }
    const onClose = () => {
        setModalParameters({ height: 220, width: 450, type: "closedate", title: "Fechar Movimentos por data de saída", loadData: () => dataAPI.fetchPost() });
        showModal();
    }

    return (
        <>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn={true}
                reportTitle={title}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                rowClass={(row) => (row?.rowvalid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space>
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<CheckCircleOutlined />} onClick={onClose}>Fechar Movimentos</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<PlusCircleOutlined />} onClick={onAdd}>Nova Entrada</Button>}
                    {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.rowvalid === 0).length > 0) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                </Space>}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}