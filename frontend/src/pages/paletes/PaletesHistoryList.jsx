import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs, { isDayjs } from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, DOSERS } from "config";
import { useDataAPI } from "utils/useDataAPI";
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
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import { json } from "utils/object";
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Status } from './commons';
import { TbCircles } from "react-icons/tb";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { Core, EstadoBobines, Largura } from "./commons";
import Palete from './Palete';
import { MediaContext } from "../App";
import { tree } from 'd3';


const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Paletes";

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>

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
const moreFiltersSchema = ({ form }) => [];
const OfsColumn = ({ value }) => {
    return (<div>
        {value && value.map(v => <Tag style={{ fontWeight: 600, fontSize: "10px" }} key={`${v}`}>{v}</Tag>)}
    </div>);
}
const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
        ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0 && props.row?.type_mov == 1) ? [{ label: <span style={{}}>Saída de Linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
        (modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar Registo</span>, key: 'delete', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}
const loadMovimentosLookup = async (p, value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/stocklistbuffer/`, pagination: { limit: 15 }, filter: { floc: 'BUFFER', fitm: p.row.artigo_cod, flote: `%${value.replaceAll(' ', '%%')}%` }, parameters: { lookup: true } });
    return rows;
}
const loadMateriasPrimasLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, pagination: { limit: 15 }, filter: { fmulti_artigo: `%${value.replaceAll(' ', '%%')}%` }, parameters: {} });
    return rows;
}
const InputNumberEditor = ({ field, p, onChange, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} ref={focus} onChange={onChange ? v => onChange(p, v) : (e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props} />
}
const DateTimeEditor = ({ field, p, onChange, ...props }) => {
    return <DatePicker showTime size="small" format={DATETIME_FORMAT} value={dayjs(p.row[field])} ref={focus} onChange={onChange ? v => onChange(p, v) : (e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props}><Input /></DatePicker>
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
        <div><span><b>{d["LOT_0"]}</b></span> <span style={{ color: "#096dd9" }}>{dayjs(d["CREDATTIM_0"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{d["QTYPCU_0"]} kg</b>]</span></div>
        <div><span>{d["ITMREF_0"]}</span> <span>{d["ITMDES1_0"]}</span></div>
    </div>, value: d["VCRNUM_0"], key: d["VCRNUM_0"], row: d
});
const OutContent = ({ record, parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        console.log(record)
        form.setFieldsValue({ ...record, t_stamp: dayjs(), qty_reminder: null });
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
                let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...values, id: record.id, t_stamp: dayjs.isDayjs(values?.t_stamp) ? values?.t_stamp.format(DATETIME_FORMAT) : dayjs(values?.t_stamp).format(DATETIME_FORMAT) }, parameters: { type: "out", status: 0 } });
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
                    <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
                    <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={record?.qty_reminder} /></Field></Col>
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
    const [saidaMP, setSaidaMP] = useState(0);
    const [movimento, setMovimento] = useState(0);
    const artigo_cod = Form.useWatch('artigo_cod', form);

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
        const v = schemaIn().validate(values, { abortEarly: false, messages: validateMessages, context: { saida_mp: saidaMP } });
        let { errors, warnings, value, ...status } = getStatus(v);
        if (saidaMP === 1 && errors === 0 && !values.t_stamp_out) {
            values.t_stamp_out = dayjs();
        }
        if (saidaMP === 1 && errors === 0 && !values.qty_reminder) {
            values.qty_reminder = 0;
        }
        if (values.t_stamp_out <= values.t_stamp) {
            errors = 1;
            status.fieldStatus.t_stamp_out = { status: "error", messages: [{ message: "A data de saída tem de ser maior que a data de entrada." }] };
        }
        if (values.qty_lote < values.qty_reminder) {
            errors = 1;
            status.fieldStatus.qty_reminder = { status: "error", messages: [{ message: "A quantidade restante tem de ser menor ou igual à quantidade do lote." }] };
        }

        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let vals = {
                    lote_id: movimento.ROWID,
                    qty_lote: values.qty_lote,
                    artigo_des: movimento.ITMDES1_0,
                    artigo_cod: movimento.ITMREF_0,
                    type_mov: 1,
                    group_id: values?.cuba?.key,
                    t_stamp: dayjs(values.t_stamp).format(DATETIME_FORMAT),
                    ...(saidaMP === 1) && { t_stamp_out: dayjs(values.t_stamp_out).format(DATETIME_FORMAT) },
                    n_lote: movimento.LOT_0,
                    status: -1,
                    vcr_num: movimento.VCRNUM_0,
                    qty_reminder: values.qty_reminder,
                    obs: "",
                    saida_mp: saidaMP
                }
                let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...vals }, parameters: { type: "in", status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Entrada${saidaMP === 1 && '/Saída'} em linha efetuada!` })
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
        //         let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...values, id: record.id, t_stamp: dayjs.isDayjs(values?.t_stamp) ? values?.t_stamp.format(DATETIME_FORMAT) : dayjs(values?.t_stamp).format(DATETIME_FORMAT) }, parameters: { type: "out", status: 0 } });
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
        if ("saida_mp" in changedValues) {
            setSaidaMP(changedValues.saida_mp);
        }
    }

    const onSelectLote = (row) => {
        form.setFieldValue("qty_lote", row.QTYPCU_0);
        setMovimento(row);
    }

    return (
        <Form form={form} name={`f-in`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-IN" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaIn} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}>
                        <Selector
                            size="small"
                            title="Artigos - Granulado"
                            params={{ payload: { url: `${API_URL}/materiasprimaslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                            keyField={["ITMREF_0"]}
                            textField="ITMREF_0"
                            detailText={r => r?.ITMDES1_0}
                            columns={[
                                { key: 'ITMREF_0', name: 'Código', width: 160 },
                                { key: 'ITMDES1_0', name: 'Designação' }
                            ]}
                            filters={{ fmulti_artigo: { type: "any", width: 150, text: "Artigo" } }}
                            moreFilters={{}}
                        />
                    </Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={artigo_cod?.ITMREF_0 ? true : false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}>
                        <Selector
                            size="small"
                            title="Lotes"
                            popupWidth={800}
                            onSelect={onSelectLote}
                            params={{ payload: { url: `${API_URL}/stocklistbuffer/`, pagination: { limit: 15 }, filter: { floc: 'BUFFER', fitm: artigo_cod?.ITMREF_0 }, parameters: { lookup: true }, sort: [] } }}
                            keyField={["LOT_0"]}
                            textField="LOT_0"
                            detailText={r => <div><span><b>{r["VCRNUM_0"]}</b></span> <span style={{ color: "#096dd9" }}>{dayjs(r["CREDATTIM_0"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{r["QTYPCU_0"]} kg</b>]</span></div>}
                            columns={[
                                { key: 'LOT_0', name: 'Lote', width: 150 },
                                { key: 'CREDATTIM_0', name: 'Data', formatter: p => dayjs(p.row["CREDATTIM_0"]).format(DATETIME_FORMAT) },
                                { key: 'VCRNUM_0', name: 'Movimento', width: 180 },
                                { key: 'QTYPCU_0', name: 'Qtd.', width: 100, formatter: p => <span>[Qtd: <b>{p.row["QTYPCU_0"]} kg</b>]</span> }
                            ]}
                            filters={{ flote: { type: "any", width: 120, text: "Lote" } }}
                            moreFilters={{}}
                        />
                    </Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
                    <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Entrada" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                    <Col><Field wrapFormItem={true} name="cuba" label={{ enabled: true, text: "Cuba" }}>
                        <Selector
                            size="small"
                            toolbar={false}
                            title="Cubas"
                            popupWidth={130}
                            params={{ payload: { data: { rows: FORMULACAO_CUBAS }, pagination: { limit: 20 } } }}
                            keyField={["key"]}
                            textField="value"
                            columns={[
                                { key: 'value', name: 'Cuba', formatter: p => <Cuba value={p.row.key} /> }
                            ]}
                        />
                    </Field></Col>
                </Row>
                <Row gutterWidth={2} style={{ fontWeight: 700, marginTop: "10px", marginBottom: "1px", /* borderBottom: "solid 1px #bfbfbf", */ background: "#f0f0f0", padding: "1px" }}>
                    <Col xs="content"><Field wrapFormItem={true} name="saida_mp" label={{ enabled: false, text: "Saída do Lote", pos: "right" }}><CheckboxField /></Field></Col>
                    <Col xs="content" style={{ alignSelf: "center" }}>Saída do Lote</Col>
                </Row>
                {saidaMP === 1 &&
                    <Row style={{}} gutterWidth={10}>
                        <Col><Field wrapFormItem={true} name="t_stamp_out" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                        <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={form.getFieldValue("qty_lote")} /></Field></Col>
                    </Row>
                }
                {/* <Row style={{}} gutterWidth={10}>
                <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
                <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
            </Row>
            <Row style={{}} gutterWidth={10}>
                <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
                <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
            </Row>
            <Row style={{}} gutterWidth={10}>
                <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
                <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={record?.qty_reminder} /></Field></Col>
                <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Saída" }}><DatePicker format={DATETIME_FORMAT} size="small" /></Field></Col>
            </Row> */}
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
const CloseContent = ({ record, parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        console.log(record)

        form.setFieldsValue({ ...record, in_t: dayjs(record.in_t), out_t: dayjs(record.out_t) });
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
                let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { vcr_num: record.vcr_num }, parameters: { type: "close", status: 0 } });
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
                let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { t_stamp_out: dayjs(values.t_stamp_out).format(DATE_FORMAT) }, parameters: { type: "close", status: 0 } });
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



const OF = ({ id, ofid, of_des }) => {
    return (
        <>{ofid ? <Tag style={{ fontWeight: 600 }}>{ofid}</Tag> : of_des}</>
    );
}


const NumColumn = ({value,unit=''})=>{
    return(
        <>{value && <div style={{ textAlign: "right" }}>{value} {unit}</div>}</>
    );
}


export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({permissions:props?.permissions});
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "PaletesHistoryList" };
    const defaultSort = [{column:"-audit_id",direction:"DESC"}];
    const dataAPI = useDataAPI({ id: "lst-hpaletes", payload: { url: `${API_URL}/paletes/paletessql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                //case "bobineslist": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal type={modalParameters?.type} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['audit_id'];

    const columns = [
        { key: 'audit_timestamp', width: 130, name: 'Data', formatter: p => dayjs(p.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'nbobines_real', name: 'Bobines', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{String(p.row.nbobines_real ? p.row.nbobines_real : p.row.num_bobines_act).padStart(2, '0')}/{String(p.row.num_bobines).padStart(2, '0')}</div> },
        { key: 'estado', name: 'Estado', width: 90, formatter: p => <EstadoBobines id={p.row.id} nome={p.row.nome} artigos={json(p.row.artigo)} /> },
        { key: 'largura', name: 'Larguras (mm)', width: 90, formatter: p => <Largura id={p.row.id} nome={p.row.nome} artigos={json(p.row.artigo)} /> },
        { key: 'core', name: 'Cores', width: 90, formatter: p => <Core id={p.row.id} nome={p.row.nome} artigos={json(p.row.artigo)} /> },
        { key: 'area_real', name: 'Área', width: 90, formatter: p => <NumColumn value={p.row.area_real ? p.row.area_real : p.row.area} unit={<>m&sup2;</>}/>},
        { key: 'comp_real', name: 'Comp.', width: 90, formatter: p =>  <NumColumn value={p.row.comp_real ? p.row.comp_real : p.row.comp_total} unit={<>m</>}/>},
        { key: 'peso_bruto', name: 'Peso B.', width: 90, formatter: p => <NumColumn value={p.row.peso_bruto} unit={<>kg</>}/>},
        { key: 'peso_liquido', name: 'Peso .L', width: 90, formatter: p => <NumColumn value={p.row.peso_liquido} unit={<>kg</>}/>},
        { key: 'diam_min', name: 'Diam. Min.', width: 90, formatter: p => <NumColumn value={p.row.diam_min} unit={<>mm</>}/>},
        { key: 'diam_max', name: 'Diam. Máx.', width: 90, formatter: p => <NumColumn value={p.row.diam_max} unit={<>mm</>}/>},
        { key: 'diam_avg', name: 'Diam. Médio.', width: 90, formatter: p => <NumColumn value={p.row.diam_avg} unit={<>mm</>}/>},
        { key: 'destino', name: 'Destino', width: 200, formatter: p => p.row.destino },
        { key: 'cliente_nome', name: 'Cliente', width: 200, formatter: p => p.row.cliente_nome },
        { key: 'ofid', name: 'Ordem Fabrico', width: 130, formatter: p => <OF id={p.row.id} ofid={p.row.ofid} of_des={p.row.ordem_original} /> },
        { key: 'ofid_original', name: 'Ordem F. Origem', width: 130, formatter: p => <OF id={p.row.id} ofid={p.row.ofid_original} /> },
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates([], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            const palete_id = props?.parameters?.palete_id;
            dataAPI.addFilters({ ...filterValues, ...(palete_id && { palete_id }) }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters(defaultParameters, true, true);
            dataAPI.fetchPost({ signal });
        }
        submitting.end();
    }

    // useEffect(()=>{

    //     console.log("DATA->>>>",dataAPI.getData());

    // },[dataAPI.hasData()]);

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
                    fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
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

    return (
        <>
            <Table
                loading={submitting.state}
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
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}