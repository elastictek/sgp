import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, getFilterRangeValues, getFilterValue, isValue } from "utils";
import { API_URL, ROOT_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { includeObjectKeys, excludeObjectKeys } from "utils/object";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker } from "antd";
const { Title, Text } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, ReadOutlined, LockOutlined, DeleteFilled, PlusCircleOutlined, WarningOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField, SelectDebounceField, CheckboxField } from 'components/FormFields';
import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons";
import ToolbarTitle from 'components/ToolbarTitleV3';
import { TbCircles } from "react-icons/tb";
import BobinesPopup from './commons/BobinesPopup';
import { usePermission } from "utils/usePermission";
import YScroll from 'components/YScroll';
import dayjs from 'dayjs';
import loadInit, { fixRangeDates,newWindow } from "utils/loadInitV3";

const FormBobinagemValidar = React.lazy(() => import('./FormValidar'));
const Bobinagem = React.lazy(() => import('./Bobinagem'));


const title = "Bobinagens";


const focus = (el, h,) => { el?.focus(); };

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaDelete = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaCreate = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'><Field name="fbobinagem" label={{ enabled: true, text: "Nº Bobinagem", pos: "top", padding: "0px" }}>
            <Input size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="fdata" label={{ enabled: true, text: "Data Bobinagem", pos: "top", padding: "0px" }}>
            <RangeDateField size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="ftime" label={{ enabled: true, text: "Início/Fim", pos: "top", padding: "0px" }}>
            <RangeTimeField size='small' format={TIME_FORMAT} allowClear />
        </Field></Col>
    </>
    );
}


const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fbobinagem: { label: "Nº Bobinagem", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Bobinagem", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    //Defeitos
    {
        freldefeitos: { label: " ", field: TipoRelation, span: 4 },
        fdefeitos: { label: 'Defeitos', field: { type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS }, span: 20 }
    },
    //Estados
    { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS } } },
    { fofabrico: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } }
];


const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
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


const TitleForm = ({ level, auth, hasEntries, onSave, loading, data, onChange, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        right={
            <Col xs="content">
                <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} onValuesChange={onChange} fluid>
                    <Col style={{ alignItems: "center" }}>
                        <Row gutterWidth={2} justify='end'>
                            <Col xs="content">
                                <Field name="typelist" label={{ enabled: false }}>
                                    <SelectField size="small" keyField="value" textField="label" data={
                                        [{ value: "A", label: "Estado Bobines" },
                                        { value: "B", label: "Consumo Bobinagem" },
                                        { value: "C", label: "Ordens de Fabrico" }]} />
                                </Field>
                            </Col>
                            <Col xs="content">
                                <Field name="type" label={{ enabled: false }}>
                                    <SelectField size="small" keyField="value" textField="label" data={
                                        [{ value: "1", label: "Bobinagens da Ordem de Fabrico" },
                                        { value: "-1", label: "Todas as Bobinagens" }]} />
                                </Field>
                            </Col>
                            <Col xs="content">
                                <Field name="valid" label={{ enabled: false }}>
                                    <SelectField style={{ width: "100px" }} size="small" keyField="value" textField="label" data={
                                        [{ value: "0", label: "Por validar" },
                                        { value: "1", label: "Validadas" },
                                        { value: "-1", label: " " }
                                        ]} /></Field>
                            </Col>
                        </Row>
                    </Col>
                </FormContainer>
            </Col>
        }
    />);
}


// const TitleForm = ({ data, onChange, form, auth }) => {
//     const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
//     return (<ToolbarTitle id={auth?.user} description={title} title={<>
//         <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col>
//         <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col>
//     </>} right={
//         <Col xs="content">
//             <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} onValuesChange={onChange} fluid>
//                 <Col style={{ alignItems: "center" }}>
//                     <Row gutterWidth={2} justify='end'>
//                         <Col xs="content">
//                             <Field name="typelist" label={{ enabled: false }}>
//                                 <SelectField size="small" keyField="value" textField="label" data={
//                                     [{ value: "A", label: "Estado Bobines" },
//                                     { value: "B", label: "Consumo Bobinagem" },
//                                     { value: "C", label: "Ordens de Fabrico" }]} />
//                             </Field>
//                         </Col>
//                         <Col xs="content">
//                             <Field name="type" label={{ enabled: false }}>
//                                 <SelectField size="small" keyField="value" textField="label" data={
//                                     [{ value: "1", label: "Bobinagens da Ordem de Fabrico" },
//                                     { value: "-1", label: "Todas as Bobinagens" }]} />
//                             </Field>
//                         </Col>
//                         <Col xs="content">
//                             <Field name="valid" label={{ enabled: false }}>
//                                 <SelectField style={{ width: "100px" }} size="small" keyField="value" textField="label" data={
//                                     [{ value: "0", label: "Por validar" },
//                                     { value: "1", label: "Validadas" },
//                                     { value: "-1", label: " " }
//                                     ]} /></Field>
//                         </Col>
//                     </Row>
//                 </Col>
//             </FormContainer>
//         </Col>
//     } />);
// }

const IFrame = ({ src }) => {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>` }} />;
}

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        //...(modeEdit && props.row?.valid === 0 && props.row?.rowvalid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
        //...(modeEdit && props.row?.closed === 0 && props.row?.rowvalid !== 0 && props.row?.status == 1) ? [{ label: <span style={{}}>Saída de linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
        //(modeEdit && props.row?.closed === 0 && props.row?.rowvalid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar movimento de entrada</span>, key: 'deletein', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> },
        (modeEdit && props.row?.valid === 1 && props.row?.rowvalid !== 0) && { label: <span style={{ fontWeight: 700 }}>Apagar Bobinagem</span>, key: 'delete', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const InputNumberEditor = ({ field, p, onChange, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} onChange={onChange ? (v) => onChange(p, v, field) : (e) => p.onRowChange({ ...p.row, rowvalid: p.row[field] !== e ? 0 : null, [field]: e }, true)} ref={focus} {...props} />
}

const loadNwLotesLookup = async (p, value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/nwlistlookup/`, pagination: { limit: 15 }, filter: { closed: 0, t_stamp: `<=${dayjs(p.row.timestamp).format(DATETIME_FORMAT)}`, type: p.row.type, n_lote: getFilterValue(value, 'any') }, sort: [{ column: 't_stamp', direction: 'DESC' }], parameters: { lookup: true } });
    return rows;
}
const optionsRender = d => ({
    label: <div>
        <div><span><b>{d["n_lote"]}</b></span> <span style={{ color: "#096dd9" }}>{dayjs(d["t_stamp"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{d["qty_lote"]} m<sup>2</sup></b>]</span></div>
        <div><span>{d["artigo_cod"]}</span> <span>{d["artigo_des"]}</span></div>
    </div>, value: d["id"], key: d["id"], row: d
});
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
        const v = schemaDelete().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus({});
        //setFieldStatus({ ...status.fieldStatus });
        //setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/deletebobinagem/`, filter: {}, parameters: { ig_bobinagem: values?.ig_bobinagem, id: record?.id } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Bobinagem eliminada com sucesso!` })
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
        <Form form={form} name={`f-del`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-DEL" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaDelete} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs="content"><Field forInput={true} wrapFormItem={true} name="ig_bobinagem" label={{ enabled: true, text: "Remover Dados de Máquina?", style: { paddingTop: "5px", paddingBottom: "0px", paddingLeft: "0px" } }}><CheckboxField /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Apagar Bobinagem</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const ActionCreate = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        { label: <span style={{ fontWeight: 700 }}>Criar Bobinagem</span>, key: 'create', icon: <PlusCircleOutlined style={{ fontSize: "16px", color: "green" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}
const CreateContent = ({ parentRef, closeParent, loadParentData }) => {
    const dataAPI = useDataAPI({ id: "missedLLL", payload: { url: `${API_URL}/missedlineloglist/`, parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    const primaryKeys = ['id'];
    const columns = [
        { key: 'inicio_ts', name: 'Início', width: 130, frozen: true, formatter: props => dayjs(props.row.inicio_ts).format(DATETIME_FORMAT) },
        { key: 'fim_ts', name: 'Fim', width: 130, frozen: true, formatter: props => dayjs(props.row.fim_ts).format(DATETIME_FORMAT) },
        { key: 'diametro', name: 'Diâmetro', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diametro} mm</div> },
        { key: 'metros', name: 'Comprimento', width: 110, formatter: p => <div style={{ textAlign: "right" }}>{p.row.metros} m</div> },
        { key: 'nw_inf', name: 'NW Inferior', formatter: p => <div style={{ textAlign: "right" }}>{p.row.nw_inf} m</div> },
        { key: 'nw_sup', name: 'NW Superior', formatter: p => <div style={{ textAlign: "right" }}>{p.row.nw_sup} m</div> }
    ];

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (v, r) => {
        Modal.confirm({
            title: <div>Criar Bobinagem</div>, content: <ul><li style={{ fontWeight: 700 }}>Tem a certeza que deseja criar a bobinagem com data de <b>{dayjs(r.t_stamp).format(DATETIME_FORMAT)}</b>?</li></ul>,
            onOk: async () => {
                submitting.trigger();
                try {
                    let response = await fetchPost({ url: `${API_URL}/createbobinagem/`, filter: {}, parameters: { ig_bobinagem: r?.id } });
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
    }

    const onValuesChange = (changedValues, values) => {
    }

    return (
        <Form form={form} name={`f-del`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-DEL" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaCreate} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} nogutter>
                    <Col>
                        <YScroll>
                            <Table
                                actionColumn={<ActionCreate dataAPI={dataAPI} onClick={onFinish} />}
                                frozenActionColumn
                                loadOnInit={true}
                                columns={columns}
                                dataAPI={dataAPI}
                                toolbar={false}
                                search={false}
                                moreFilters={false}
                                rowSelection={false}
                                primaryKeys={primaryKeys}
                                editable={false}
                            />
                        </YScroll>
                    </Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const schemaCreateEvent = (options = {}) => {
    return getSchema({
        "comprimento": Joi.number().positive().label("Comprimento").required(),
        "diametro": Joi.number().positive().label("Diâmetro").required(),
        "peso": Joi.number().positive().label("Peso").required(),
        "nw_inf": Joi.number().positive().label("Metros Nw. Inferior").required(),
        "nw_sup": Joi.number().positive().label("Metros Nw. Superior").required()
    }, options).unknown(true);
}

const schemaDate = Joi.object({
    "t_stamp_init": Joi.date().required(),
    "t_stamp_end": Joi.date().required()
        .greater(Joi.ref('t_stamp_init')).message('A data de fim tem de ser superior à data de início')
});
const CreateEvent = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);


    const loadData = async ({ signal } = {}) => {
        let response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, filter: {}, parameters: { method: "LastIgBobinagemReelingExchangeLookup" } });
        if (response?.data?.rows[0]?.fim_ts) {
            form.setFieldsValue({ t_stamp_init: dayjs(response?.data?.rows[0]?.fim_ts) });
        }
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async () => {
        const values = form.getFieldsValue(true);
        const v = schemaCreateEvent().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const date_init = values?.t_stamp_init?.format(DATETIME_FORMAT);
        const date_end = values?.t_stamp_end?.format(DATETIME_FORMAT);
        const result = schemaDate.validate({ t_stamp_init: date_init, t_stamp_end: date_end }, { abortEarly: false });
        let vDate = getStatus(result);
        let { errors, warnings, value, ...status } = getStatus(v);
        if (dayjs(values?.t_stamp_end?.format(DATETIME_FORMAT)) > dayjs()) {
            status.fieldStatus.t_stamp_end = { status: "error", messages: [{ message: "A data de fim não pode ser maior que a data atual." }] };
            errors++;
        }

        setFieldStatus({ ...status.fieldStatus, ...vDate?.fieldStatus });
        setFormStatus({ ...status.formStatus, ...vDate?.formStatus });
        if (errors === 0 && vDate?.errors === 0) {
            Modal.confirm({
                title: <div>Criar evento Troca de Bobinagem</div>, content: <ul><li style={{ fontWeight: 700 }}>Deseja criar o evento de troca de bobinagem? <br />Data início: <b>{date_init}</b><br />Data fim: <b>{date_end}</b>?</li></ul>,
                onOk: async () => {
                    submitting.trigger();
                    try {
                        let response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, filter: {}, parameters: { method: "NewManualEvent", values: { ...values, date_init, date_end } } });
                        if (response.data.status !== "error") {
                            closeParent();
                            Modal.success({ title: "Troca de Bobinagem criada com sucesso!" });
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
        }
    }

    const onValuesChange = (changedValues, values) => {
    }

    return (
        <Form form={form} name={`f-evt`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ t_stamp_end: dayjs(dayjs().format(DATETIME_FORMAT)) }}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-EVT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaCreateEvent} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field wrapFormItem={true} name="comprimento" label={{ enabled: true, text: "Comprimento Bobinagem" }}><InputNumber min={1} size="small" addonAfter="m" /></Field></Col>
                    <Col width={150}><Field wrapFormItem={true} name="diametro" label={{ enabled: true, text: "Diâmetro" }}><InputNumber min={1} size="small" addonAfter="mm" /></Field></Col>
                    <Col width={150}><Field wrapFormItem={true} name="peso" label={{ enabled: true, text: "Peso" }}><InputNumber min={1} size="small" addonAfter="kg" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field wrapFormItem={true} name="nw_inf" label={{ enabled: true, text: "Nw Inf." }}><InputNumber min={1} size="small" addonAfter="m" /></Field></Col>
                    <Col width={150}><Field wrapFormItem={true} name="nw_sup" label={{ enabled: true, text: "Nw Sup." }}><InputNumber min={1} size="small" addonAfter="m" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field wrapFormItem={true} name="t_stamp_init" label={{ enabled: true, text: "Data Início" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                    <Col width={150}><Field wrapFormItem={true} name="t_stamp_end" label={{ enabled: true, text: "Data Fim" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button onClick={onFinish}>Executar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

export default ({ noid = false, setFormTitle, ...props }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();


    const permission = usePermission({ allowed: { producao: 200 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });


    /* const permission = usePermission({ allowed: { producao: 200 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
 */
    const [formFilter] = Form.useForm();
    const submitting = useSubmitting(true);
    const dataAPI = useDataAPI({ ...(!noid && { id: "bobinagensL1list" }), payload: { url: `${API_URL}/bobinagens/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [] } });
    const defaultParameters = { typelist: "A", method: "BobinagensList" };
    const defaultFilters = { type: "-1", valid: "-1" };
    const defaultSort = [{ column: 'nome', direction: 'DESC' }];
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
    // const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
    //     <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideModal} width={5000} height={5000}><IFrame src={modalParameters.src} /></ResponsiveModal>
    // ), [modalParameters]);
    // const [showBobinesModal, hideBobinesModal] = useModal(({ in: open, onExited }) => (
    //     <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideBobinesModal} width={320} height={500}><BobinesPopup record={{ ...modalParameters }} /></ResponsiveModal>
    // ), [modalParameters]);

    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "bobines": return <BobinesPopup record={{ ...modalParameters }} />
                case "details": return <IFrame src={modalParameters.src} />;
                case "delete": return <DeleteContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "create": return <CreateContent loadParentData={modalParameters.loadData} />;
                case "createevent": return <CreateEvent loadParentData={modalParameters.loadData} />;


                case "validar": return <FormBobinagemValidar /* tab={modalParameters.tab} setTab={modalParameters.setLastTab} */ loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "bobinagem": return <Bobinagem /* tab={modalParameters.tab} setTab={modalParameters.setLastTab} */ loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal lazy={modalParameters?.lazy} type={modalParameters?.type} title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    /*const editable = (row) => {
        return (modeEdit.datagrid && allowEdit.datagrid && row?.valid === 1);
    }
    const editableClass = (row) => {
        return (modeEdit.datagrid && row?.valid === 1) && classes.edit;
    }*/


    const editable = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.valid === 1) {
            if (dayjs().diff(row.timestamp, 'days') > 3) {
                return false;
            }
            return true;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.valid === 1) {
            return (dayjs().diff(row.timestamp, 'days') < 3) ? classes.edit : undefined;
        }
    }
    const formatterClass = (row, col) => {
        /* if (col === "type_mov" && row.closed === 1) {
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
        } */
    }
    const onChange = (p, v, field, key) => {
        const _value = (key === null || key === undefined) ? v : v.row[key];
        const r = { ...p.row, values_changed: Array.isArray(p.row?.values_changed) ? p.row?.values_changed : [] };
        r[field] = _value;
        if (field === 'lotenwinf') {
            r["tiponwinf"] = v.row["artigo_des"];
        }
        if (field === 'lotenwsup') {
            r["tiponwsup"] = v.row["artigo_des"];
        }
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
        } else {
            r["rowvalid"] = 0;
        }
        p.onRowChange(r, true);
    }

    const columns = [
        { key: 'nome', name: 'Bobinagem', width: 115, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobinagemClick(p.row)}>{p.row.nome}</Button> },
        { key: 'baction', name: '', minWidth: 45, maxWidth: 45, frozen: true, formatter: p => <Button icon={<TbCircles />} size="small" onClick={() => onBobinesPopup(p.row)} /> },
        { key: 'inico', name: 'Início', width: 90 },
        { key: 'fim', name: 'Fim', width: 90 },
        { key: 'core', name: 'Core', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core}''</div> },
        { key: 'comp', name: 'Comprimento', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> },
        { key: 'comp_par', name: 'Comp. Emenda', width: 100, editable: editable, cellClass: editableClass, editor: p => <InputNumberEditor p={p} field="comp_par" min={0} max={p.row.comp} addonAfter="m" onChange={onChange} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_par} m</div> },
        { key: 'diam', name: 'Diâmetro', width: 100, editable: (r) => editable(r, 'diam'), cellClass: r => editableClass(r, 'diam'), editor: p => <InputNumberEditor p={p} field="diam" min={0} max={1500} addonAfter="mm" onChange={onChange} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> },
        { key: 'largura', name: 'Largura', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura} mm</div> },
        { key: 'area', name: 'Área', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
        { key: 'largura_bruta', name: 'Largura Bruta', width: 100, editable: editable, cellClass: editableClass, editor: p => <InputNumberEditor p={p} field="largura_bruta" min={p.row.largura} addonAfter="mm" onChange={onChange} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura_bruta} mm</div> },
        ...formFilter.getFieldValue('typelist') === "A" ? [{ key: 'bobines', minWidth: 750, width: 750, name: <ColumnBobines n={28} />, sortable: false, formatter: p => <Bobines onClick={onBobineClick} b={JSON.parse(p.row.bobines)} bm={p.row}/*  setShow={setShowValidar} */ /> }] : [],
        { key: 'duracao', name: 'Duração', width: 90 },
        { key: 'comp_cli', name: 'Comp. Cliente', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_cli} m</div> },
        { key: 'nwinf', name: 'Nw Inf.', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwinf} m</div> },
        { key: 'nwsup', name: 'Nw Sup.', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwsup} m</div> },
        ...formFilter.getFieldValue('typelist') === "B" ? [
            { key: 'A1', name: 'A1 kg', width: 55, sortable: false },
            { key: 'A2', name: 'A2 kg', width: 55, sortable: false },
            { key: 'A3', name: 'A3 kg', width: 55, sortable: false },
            { key: 'A4', name: 'A4 kg', width: 55, sortable: false },
            { key: 'A5', name: 'A5 kg', width: 55, sortable: false },
            { key: 'A6', name: 'A6 kg', width: 55, sortable: false },
            { key: 'B1', name: 'B1 kg', width: 55, sortable: false },
            { key: 'B2', name: 'B2 kg', width: 55, sortable: false },
            { key: 'B3', name: 'B3 kg', width: 55, sortable: false },
            { key: 'B4', name: 'B4 kg', width: 55, sortable: false },
            { key: 'B5', name: 'B5 kg', width: 55, sortable: false },
            { key: 'B6', name: 'B6 kg', width: 55, sortable: false },
            { key: 'C1', name: 'C1 kg', width: 55, sortable: false },
            { key: 'C2', name: 'C2 kg', width: 55, sortable: false },
            { key: 'C3', name: 'C3 kg', width: 55, sortable: false },
            { key: 'C4', name: 'C4 kg', width: 55, sortable: false },
            { key: 'C5', name: 'C5 kg', width: 55, sortable: false },
            { key: 'C6', name: 'C6 kg', width: 55, sortable: false }
        ] : [],
        ...formFilter.getFieldValue('typelist') === "C" ? [
            { key: 'ofs', name: 'Ordens de Fabrico', width: 480, sortable: false, formatter: (p) => <Ofs /* rowIdx={i} */ r={p.row} /* setShow={setShowValidar} */ /> }
        ] : [],
        ...[{ key: 'tiponwinf', name: 'Tipo NW Inferior', width: 300, sortable: true },
        { key: 'tiponwsup', name: 'Tipo NW Superior', width: 300, sortable: true },
        { key: 'lotenwinf', name: 'Lote NW Inferior', width: 150, sortable: true, editable: (r) => editable(r, 'lotenwinf'), cellClass: r => editableClass(r, 'lotenwinf'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onChange(p, v, 'lotenwinf', 'n_lote')} fetchOptions={(v) => loadNwLotesLookup(p, v)} optionsRender={optionsRender} p={p} field="lotenwinf" />, editorOptions: { editOnClick: true } },
        { key: 'lotenwsup', name: 'Lote NW Superior', width: 150, sortable: true, editable: (r) => editable(r, 'lotenwsup'), cellClass: r => editableClass(r, 'lotenwsup'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onChange(p, v, 'lotenwsup', 'n_lote')} fetchOptions={(v) => loadNwLotesLookup(p, v)} optionsRender={optionsRender} p={p} field="lotenwsup" />, editorOptions: { editOnClick: true } }]
    ];


    const onBobinesPopup = (row) => {
        setModalParameters({ content: 'bobines',type: "drawer", title: <div>Bobinagem <span style={{ fontWeight: 900 }}>{row.nome}</span></div>, bobines: JSON.parse(row.bobines) });
        showModal();
    }

    const onBobineClick = (v) => {
        newWindow(`${ROOT_URL}/producao/bobine/details/${v.id}/`, {}, `bobine-${v.nome}`);
        //setModalParameters({ content: "details", width: 5000, height: 5000, src: `/producao/bobine/details/${v.id}/`, title: `Detalhes da Bobine` });
        //showModal();
    }

    const onBobinagemClick = (row) => {
        if (row?.valid == 0) {
            navigate("/app/bobinagens/formbobinagemvalidar", { replace: true, state: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now() } });

            //setModalParameters({ content: "validar", /* tab: lastTab, setLastTab, */lazy: true, type: "drawer", push: false, width: "90%", title: "Validar Bobinagem", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome } });
            //showModal();
        } else {
            console.log("SORT->",dataAPI.getSort())
            console.log("CURRENTRECORD->",row)
            console.log(dataAPI.getSort().map(v=>row[v.column]));
            
            navigate("/app/bobinagens/formbobinagem", { replace: true, state: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now(),stepNavigation:{sort:dataAPI.getSort(),values:dataAPI.getSort().map(v=>row[v.column])} } });
            //setModalParameters({ content: "bobinagem", /* tab: lastBobinagemTab, setLastTab: setLastBobinagemTab, */ lazy: true, type: "drawer", push: false, width: "90%", /* title: "Bobinagem", */ /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome } });
            //showModal();
        }

        // if (row?.valid === 0) {
        //     //    setModalParameters({ src:`/producao/bobinagem/${row.id}/`,title:`Bobinagem ${row.nome}`  });
        //     //    showModal();
        //     navigate("/app/bobinagens/formbobinagemvalidar", { state: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now() } });
        // }
        // else {
        //     navigate("/app/bobines/validarlist", { state: { bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now() } });
        // }
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ init: true, signal: controller.signal });
        return (() => controller.abort());

    }, [location?.state?.typelist, location?.state?.type, location?.state?.valid]);
    const loadData = ({ init = false, signal }) => {
        if (init) {
            const { typelist, ...initFilters } = loadInit({ ...defaultFilters, ...defaultParameters }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters?.filter, location?.state, null);
            let { filterValues, fieldValues } = fixRangeDates(null, initFilters);
            formFilter.setFieldsValue({ typelist, ...fieldValues });
            dataAPI.addFilters(filterValues, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({ ...defaultParameters, typelist }, true, false);
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
                // const { typelist, ...vals } = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const { typelist, ...vals } = dataAPI.removeEmpty({ ...defaultFilters, ...values });
                const _values = {
                    ...vals,
                    fbobinagem: getFilterValue(vals?.fbobinagem, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    ftime: getFilterRangeValues(vals["ftime"]?.formatted),
                    fduracao: getFilterValue(vals?.fduracao, '=='),
                    fofabrico: getFilterValue(vals?.fofabrico, 'any'),
                    fcliente: getFilterValue(vals?.fcliente, 'any'),
                    fdestino: getFilterValue(vals?.fdestino, 'any'),
                };
                dataAPI.addFilters(dataAPI.removeEmpty(_values));
                dataAPI.addParameters({ ...defaultParameters, typelist })
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        if ("typelist" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...dataAPI.getAllFilter(), typelist: changedValues.typelist, tstamp: Date.now() }, replace: true });
        } else if ("type" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...dataAPI.getAllFilter(), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } else if ("valid" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...dataAPI.getAllFilter(), valid: changedValues.valid, tstamp: Date.now() }, replace: true });
        }
    };
    const onAction = (item, row) => {
        switch (item.key) {
            case "delete":
                setModalParameters({ content: item.key, width: 300, height: 100, title: <div>Apagar Bobinagem <b>{row.nome}</b></div>, loadData: () => dataAPI.fetchPost(), record: row });
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
        let rows = dataAPI.getData().rows.filter(v => v?.rowvalid === 0).map((values) => includeObjectKeys(values, ['id', 'timestamp', 'nome', 'comp_par', 'comp', 'largura', 'diam', 'largura_bruta', 'lotenwinf', 'lotenwsup', 'tiponwinf', 'tiponwsup', '%_original', 'values_changed']));
        rows = rows.map(obj => ({ ...obj, timestamp: dayjs(obj.timestamp).format(DATETIME_FORMAT) }));
        submitting.trigger();
        try {
            let response = await fetchPost({ url: `${API_URL}/updatebobinagem/`, parameters: { rows } });
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

    const onCreate = async () => {
        setModalParameters({ content: "create", width: 800, height: 400, title: <div>Criar Bobinagem</div>, loadData: () => dataAPI.fetchPost() });
        showModal();
    }
    const onCreateEvent = async () => {
        setModalParameters({ content: "createevent", width: 800, height: 400, title: <div>Criar Evento Troca de Bobinagem!!</div>, loadData: () => dataAPI.fetchPost() });
        showModal();
    }

    return (
        <>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getAllFilter()} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            {/* <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} /> */}
            <Table
                loading={submitting.state}
                reportTitle="Bobinagens"
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn={true}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={true}
                rowHeight={formFilter.getFieldValue('typelist') === "C" ? 44 : 28}
                rowClass={(row) => ((row?.rowvalid === 0 || row?.valid == 0) ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<Space>
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onCreate}>Criar Bobinagem</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<WarningOutlined style={{ color: "orange" }} />} onClick={onCreateEvent}>Criar Troca de Bobinagem!!</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                </Space>}
                //content={<PickHolder/>}
                //paginationPos='top'
                toolbarFilters={{
                    form: formFilter, schema, wrapFormItem: true,
                    onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}