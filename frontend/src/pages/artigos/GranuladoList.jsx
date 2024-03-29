import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, JUSTIFICATION_OUT } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { MovGranuladoColumn } from "../picking/commons";
import {DateTimeEditor,InputNumberEditor,ModalObsEditor,SelectDebounceEditor} from 'components/tableEditors';



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
        qty_lote: Joi.number().label("Quantidade do Lote").required(),
        t_stamp: Joi.any().label("Data de Entrada").required()
    }, options).unknown(true);
}
const title = "Ganulado Movimentos";
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
    { fdatain: { label: "Data Entrada", field: { type: "rangedate", size: 'small' } } },
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
        let { errors, warnings, value, ...status } = getStatus(v);
        if ((values.qty_reminder !== null || values.qty_reminder > 0) && !values.obs) {
            errors = 1;
            status.fieldStatus.obs = { status: "error", messages: [{ message: "A justicação da saída de Matéria Prima é obrigatória!" }] };
        }
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });

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
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="obs" label={{ enabled: true, text: "Justificação de Saída" }}>
                        <SelectField size="small" keyField="value" textField="value" data={JUSTIFICATION_OUT} />
                    </Field>
                    </Col>
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
                    Modal.success({ title: "Movimento fechado com sucesso!" });
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
    const dataAPI = useDataAPI({ id: "lst-granuladolist", payload: { url: `${API_URL}/granuladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.type) {
                case "in": return <InContent loadParentData={modalParameters.loadData} />;
                case "out": return <OutContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
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
            return (col === "qty_reminder" && row?.type_mov === 1) ? false : true;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.closed === 0) {
            return (col === "qty_reminder" && row?.type_mov === 1) ? undefined : classes.edit;
        }
    }
    const formatterClass = (row, col) => {
        if (col === "type_mov" && row.closed === 1) {
            return classes.closed;
        }
        if (col === "diff" && row.diff !== 0) {
            let percent = (100 * row.diff) / row.avgdiff;
            if (percent >= 125) {
                return classes.diffAbove;
            }
            if (percent <= 75) {
                return classes.diffBellow;
            }
        }
    }
    const onLoteChange = (p, v) => {
        const r = { ...p.row, valid: p.row["vcr_num"] !== v.row["VCRNUM_0"] ? 0 : null, vcr_num: v.row["VCRNUM_0"], n_lote: v.row["LOT_0"], qty_lote: v.row["QTYPCU_0"] };
        if (!("vcr_num_original" in p.row)) {
            r["vcr_num_original"] = p.row["vcr_num"];
        }
        if (p.row.qty_lote === p.row.qty_reminder) {
            r["qty_reminder"] = v.row["QTYPCU_0"];
        }
        p.onRowChange(r, true);
    }
    const onQtyLoteChange = (p, v) => {
        const r = { ...p.row, valid: p.row["qty_lote"] !== v ? 0 : null, qty_lote: v };
        if (p.row.qty_lote <= p.row.qty_reminder || p.row.type_mov == 1) {
            r["qty_reminder"] = v;
        }
        p.onRowChange(r, true);
    }
    const onQtyReminderChange = (p, v) => {
        const r = { ...p.row, valid: p.row["qty_reminder"] !== v ? 0 : null, qty_reminder: v };
        if (p.row.qty_lote <= v || p.row.type_mov == 1) {
            r["qty_reminder"] = p.row.qty_lote;
        }
        p.onRowChange(r, true);
    }

    const columns = [
        //{ key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={() => onPrint(p.row)} /> },
        { key: 'type_mov', width: 90, name: 'Movimento', frozen: true, cellClass: r => formatterClass(r, 'type_mov'), formatter: p => <MovGranuladoColumn value={p.row.type_mov} /> },
        { key: "group_id", sortable: false, name: "Cuba", frozen: true, minWidth: 55, width: 55, formatter: p => <Cuba value={p.row.group_id} /> },
        { key: 'dosers', width: 90, name: 'Doseadores', frozen: true, formatter: p => p.row.dosers },
        { key: 'artigo_cod', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.artigo_cod },
        { key: 't_stamp', width: 140, name: 'Data Mov.', editable: editable, cellClass: r => editableClass(r, 't_stamp'), editor: p => <DateTimeEditor p={p} field="t_stamp" />, editorOptions: { editOnClick: true }, formatter: p => dayjs(p.row.t_stamp).format(DATETIME_FORMAT) },
        { key: 'artigo_des', width: 280, name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        { key: 'n_lote', width: 310, name: 'Lote', editable: (r) => editable(r, 'n_lote'), cellClass: r => editableClass(r, 'n_lote'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onLoteChange(p, v)} fetchOptions={(v) => loadMovimentosLookup(p, v)} optionsRender={optionsRender} p={p} field="n_lote" />, editorOptions: { editOnClick: true }, formatter: p => <b>{p.row.n_lote}</b> },
        { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, editable: (r) => editable(r, 'qty_lote'), cellClass: r => editableClass(r, 'qty_lote'), editor: p => <InputNumberEditor onChange={onQtyLoteChange} p={p} field="qty_lote" min={0} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} kg</div> },
        { key: 'qty_reminder', width: 110, name: 'Qtd. Restante', editable: (r) => editable(r, 'qty_reminder'), cellClass: r => editableClass(r, 'qty_reminder'), editor: p => <InputNumberEditor onChange={onQtyReminderChange} p={p} field="qty_reminder" min={0} max={p.row.qty_lote} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div>{parseFloat(p.row.qty_reminder).toFixed(2)} kg</div> },
        { key: "in_t", width: 140, name: 'Data Entrada', formatter: p => dayjs(p.row.in_t).format(DATETIME_FORMAT) },
        { key: "out_t", width: 140, name: 'Data Saída', formatter: p => p.row.diff !== 0 && dayjs(p.row.out_t).format(DATETIME_FORMAT) },
        { key: "diff", width: 140, name: 'Duração', cellClass: r => formatterClass(r, 'diff'), formatter: p => p.row.diff !== 0 && secondstoDay(p.row.diff) },
        { key: "avgdiff", width: 140, name: 'Duração Média', formatter: p => secondstoDay(p.row.avgdiff) },
        { key: "stddiff", width: 140, name: 'Desvio Padrão', formatter: p => secondstoDay(p.row.stddiff) },
        { key: 'vcr_num', name: 'Movimento', width: 200, formatter: p => p.row.vcr_num },
        { key: 'ofs', width: 280, name: 'Ordem Fabrico', formatter: p => <OfsColumn value={p.row.ofs && JSON.parse(p.row.ofs)} /> },
        { key: 'obs', width: 100, name: 'Observações', editable: true, cellClass: r => editableClass(r, 'obs'), editor(p) { return <ModalObsEditor forInput={editable(p.row, 'obs')} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> }, editorOptions: { editOnClick: true, commitOnOutsideClick: false }, formatter:p=>p.row.obs },
        //editor(p) { return <ModalObsEditor forInput={false} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdata', 'fdatain', 'fdataout'], initFilters);
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

    const onAction = (item, row) => {
        switch (item.key) {
            case "delete": Modal.confirm({
                title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, content: <ul>
                    {row.type_mov === 1 && <li>Serão eliminados os movimentos de entrada e saída!</li>}
                    <li style={{ fontWeight: 700 }}>Atenção!! Se tiver alterações por guardar, ao efetuar esta operação perderá todas as alterações.</li>
                </ul>, onOk: async () => {
                    submitting.trigger();
                    try {
                        let response = await fetchPost({ url: `${API_URL}/deletegranulado/`, filter: { vcr_num: row.vcr_num, type_mov: row.type_mov }, parameters: {} });
                        if (response.data.status !== "error") {
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
            case "out":
                setModalParameters({ type: item.key, title: "Saída de lote em linha", loadData: () => dataAPI.fetchPost(), record: row, height: 300 });
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
        const rows = dataAPI.getData().rows.filter(v => v?.valid === 0).map(({ n_lote, vcr_num, t_stamp, qty_lote, qty_reminder, vcr_num_original, type_mov, obs }) =>
            ({ n_lote, vcr_num, t_stamp: dayjs.isDayjs(t_stamp) ? t_stamp.format(DATETIME_FORMAT) : dayjs(t_stamp).format(DATETIME_FORMAT), qty_lote, qty_reminder, vcr_num_original, type_mov, obs })
        );
        submitting.trigger();
        try {
            let response = await fetchPost({ url: `${API_URL}/updategranulado/`, parameters: { type: "datagrid", rows } });
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
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space>
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<CheckCircleOutlined />} onClick={onClose}>Fechar Movimentos</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<PlusCircleOutlined />} onClick={onAdd}>Nova Entrada</Button>}
                    {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
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