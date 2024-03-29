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
import { useDataAPI } from "utils/useDataAPIV3";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json } from "utils/object";
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined,FileExcelTwoTone, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, BOBINE_ESTADOS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, Chooser } from 'components/FormFields';

import { BadgeNumber } from 'components/TableColumns';

import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Status } from './commons';
import { TbCircles } from "react-icons/tb";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { Core, EstadoBobines, Largura } from "./commons";
import Palete from './Palete';
//import FormCreatePalete from './FormCreatePalete';
import { MediaContext,AppContext } from "app";
import OF from '../commons/OF';
import { DestinoPaleteEditor } from 'components/tableEditors';
import {changeOf} from './Palete';
import BobinesPopup from '../bobinagens/commons/BobinesPopup';


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
        qty_lote: Joi.number().label("Quantidade do Lote").required(),
        t_stamp: Joi.any().label("Data de Entrada").required()
    }, options).unknown(true);
}
// const title = "Paletes";
// const TitleForm = ({ data, onChange, record, level, form }) => {
//     // const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
//     return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
//         <Col>
//             <Row style={{ marginBottom: "5px" }}>
//                 <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
//                 {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
//             </Row>

//         </Col>
//     </>
//     }
//     />);
// }


const title = "Paletes";
const TitleForm = ({ level, auth, hasEntries, onSave, loading }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

// const TitleForm = ({ data, onChange, level, auth, form }) => {
//     return (<ToolbarTitle id={auth?.user} description={title} title={<>
//         <Col>
//             <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
//                 <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
//                 {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
//             </Row>

//         </Col>
//     </>
//     }
//     />);
// }


const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col width={70}>
            <Field name="fnbobinesreal" label={{ enabled: true, text: "Nº Bobines", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        {/*         <Col width={70}>
            <Field name="flargura" label={{ enabled: true, text: "Largura", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col> */}
        <Col width={150}>
            <Field name="festados" label={{ enabled: true, text: "Estados", pos: "top", padding: "0px" }}>
                <SelectMultiField size="small" keyField='value' textField='value' data={BOBINE_ESTADOS} />
            </Field>
        </Col>
        {/*         <Col xs='content'>
            <Field name="fbobine" label={{ enabled: true, text: "Bobine(s)", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col> */}
    </>
    );
}

const useStyles = createUseStyles({
    hasObs: {
        backgroundColor: "#fffb8f"
    },
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
    error: {
        background: "rgb(255, 17, 0) !important"
    },
    warning: {
        background: "#ffec3d !important"
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
    { flote: { label: "Lote Palete", field: { type: 'input', size: 'small' } } },
    { fnbobinesreal: { label: "Nº Bobines", field: { type: 'input', size: 'small' }, span: 8 }, flargura: { label: "Largura", field: { type: 'input', size: 'small' }, span: 8 }, fdisabled: { label: 'Ativo', field: { type: 'select', size: 'small', options: [{ value: null, label: " " }, { value: 0, label: "Sim" }, { value: 1, label: "Não" }] }, span: 8 } },
    { fbobine: { label: "Bobine(s)", field: { type: 'input', size: 'small' }, span: 14 }, festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS }, span: 10 } },
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    {
        farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 4 },
        fcomp: { label: "Comp. Total", field: { type: 'input', size: 'small' }, span: 5 },
        fdiam_min: { label: "Diâm. (Min)", field: { type: 'input', size: 'small' }, span: 5 },
        fdiam_max: { label: "Diâm. (Max)", field: { type: 'input', size: 'small' }, span: 5 },
        fdiam_avg: { label: "Diâm. (Médio)", field: { type: 'input', size: 'small' }, span: 5 }
    },
    {
        fnbobines_sem_destino: { label: "sem Destino", field: { type: 'input', size: 'small' }, span: 6 },
        fnbobines_emendas: { label: "emendas", field: { type: 'input', size: 'small' }, span: 6 }
    },
    {
        fnok: { label: 'Palete estado', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Ok" }, { value: 1, label: "Not Ok" }] }, span: 8 },
        fnok_estados: { label: 'Palete Bobines Estado', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Ok" }, { value: '>=1', label: "Not Ok" }] }, span: 8 }
    },


    { fpeso_bruto: { label: "Peso Bruto", field: { type: 'input', size: 'small' }, span: 12 }, fpeso_liquido: { label: "Peso Líquido", field: { type: 'input', size: 'small' }, span: 12 } },
    { fof: { label: "Ordem Fabrico", field: { type: 'input', size: 'small' } } },
    { fprf: { label: "PRF", field: { type: 'input', size: 'small' }, span: 12 }, forder: { label: "Encomenda", field: { type: 'input', size: 'small' }, span: 12 } },
    {
        fdispatched: { label: 'Expedido', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }] }, span: 6 },
        fcarga: { label: 'Carga', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }] }, span: 6 },
        feec: { label: 'EEC', field: { type: 'input', size: 'small' }, span: 4 },
        fano: { label: "Ano Exp.", field: { type: 'input', size: 'small' }, span: 4 },
        fmes: { label: "Mês Exp.", field: { type: 'input', size: 'small' }, span: 4 }
    },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' }, span: 12 }, fcarganome: { label: "Carga Designação", field: { type: 'input', size: 'small' }, span: 12 } },
    { fsdh: { label: "Expedição", field: { type: 'input', size: 'small' }, span: 12 }, fclienteexp: { label: "Expedição Cliente", field: { type: 'input', size: 'small' }, span: 12 } },
    { fartigoexp: { label: "Artigo Expedição", field: { type: 'input', size: 'small' }, span: 8 }, fmatricula: { label: "Matrícula", field: { type: 'input', size: 'small' }, span: 8 }, fmatricula_reboque: { label: "Mat.Reboque", field: { type: 'input', size: 'small' }, span: 8 } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } },
    { fdestino_lar: { label: "Destino Largura", field: { type: 'input', size: 'small' }, span: 8 }, fdestino_estado: { label: "Destino Estado", field: { type: 'input', size: 'small' }, span: 8 }, fdestino_reg: { label: " Destino Regranular", field: { type: 'input', size: 'small' }, span: 8 } },
    { fdestinoold: { label: "Destino (Legacy)", field: { type: 'input', size: 'small' } } },
    { ftiponw: { label: "Nonwoven Artigo", field: { type: 'input', size: 'small' }, span: 12 }, flotenw: { label: "Lote Nonwoven", field: { type: 'input', size: 'small' }, span: 12 } },
    { fartigo_mp: { label: "Artigo Granulado (MP)", field: { type: 'input', size: 'small' }, span: 12 }, flote_mp: { label: "Lote Granulado (MP)", field: { type: 'input', size: 'small' }, span: 12 } },



    // { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    // { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];
// const OfsColumn = ({ value }) => {
//     return (<div>
//         {value && value.map(v => <Tag style={{ fontWeight: 600, fontSize: "10px" }} key={`${v}`}>{v}</Tag>)}
//     </div>);
// }
const ActionContent = ({ dataAPI, hide, onClick, modeEdit, permission, ...props }) => {
    const items = () => [
        ...(!props?.row?.carga_id && !props?.row?.SDHNUM_0 && permission.isOk({ action: "changeOrdem" })) ? [{ label: <span style={{}}>Alterar ordem de Fabrico</span>, key: 'changeof', icon: <EditOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : []
    ];
    return (<Menu items={items()} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const loadBobinesLookup = async ({palete_id,sort}) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, pagination: {}, sort, filter: { fpaleteid: `==${palete_id}` }, parameters: { method: "BobinesLookup" } });
    return rows;
}

// const loadMovimentosLookup = async (p, value) => {
//     const { data: { rows } } = await fetchPost({ url: `${API_URL}/stocklistbuffer/`, pagination: { limit: 15 }, filter: { floc: 'BUFFER', fitm: p.row.artigo_cod, flote: `%${value.replaceAll(' ', '%%')}%` }, parameters: { lookup: true } });
//     return rows;
// }
// const loadMateriasPrimasLookup = async (value) => {
//     const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, pagination: { limit: 15 }, filter: { fmulti_artigo: `%${value.replaceAll(' ', '%%')}%` }, parameters: {} });
//     return rows;
// }
// const InputNumberEditor = ({ field, p, onChange, ...props }) => {
//     return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} ref={focus} onChange={onChange ? v => onChange(p, v) : (e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props} />
// }
// const DateTimeEditor = ({ field, p, onChange, ...props }) => {
//     return <DatePicker showTime size="small" format={DATETIME_FORMAT} value={dayjs(p.row[field])} ref={focus} onChange={onChange ? v => onChange(p, v) : (e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props}><Input /></DatePicker>
// }
// const SelectDebounceEditor = ({ field, keyField, textField, p, ...props }) => {
//     return (<SelectDebounceField
//         autoFocus
//         value={{ value: p.row[field], label: p.row[field] }}
//         size="small"
//         style={{ width: "100%", padding: "3px" }}
//         keyField={keyField ? keyField : field}
//         textField={textField ? textField : field}
//         showSearch
//         showArrow
//         ref={focus}
//         {...props}
//     />)
// }
// const optionsRender = d => ({
//     label: <div>
//         <div><span><b>{d["LOT_0"]}</b></span> <span style={{ color: "#096dd9" }}>{dayjs(d["CREDATTIM_0"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{d["QTYPCU_0"]} kg</b>]</span></div>
//         <div><span>{d["ITMREF_0"]}</span> <span>{d["ITMDES1_0"]}</span></div>
//     </div>, value: d["VCRNUM_0"], key: d["VCRNUM_0"], row: d
// });
// const OutContent = ({ record, parentRef, closeParent, loadParentData }) => {
//     const [form] = Form.useForm();
//     const [fieldStatus, setFieldStatus] = useState({});
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
//     const submitting = useSubmitting(true);

//     const loadData = async ({ signal } = {}) => {
//         console.log(record)
//         form.setFieldsValue({ ...record, t_stamp: dayjs(), qty_reminder: null });
//         submitting.end();
//     };
//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal });
//         return (() => controller.abort());
//     }, []);

//     const onFinish = async (values) => {
//         submitting.trigger();
//         const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
//         const { errors, warnings, value, ...status } = getStatus(v);
//         if (errors === 0) {
//             try {
//                 let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...values, id: record.id, t_stamp: dayjs.isDayjs(values?.t_stamp) ? values?.t_stamp.format(DATETIME_FORMAT) : dayjs(values?.t_stamp).format(DATETIME_FORMAT) }, parameters: { type: "out", status: 0 } });
//                 if (response.data.status !== "error") {
//                     loadParentData();
//                     closeParent();
//                     Modal.success({ title: "Saída de Lote da linha efetuada!" })
//                 } else {
//                     status.formStatus.error.push({ message: response.data.title });
//                     setFormStatus({ ...status.formStatus });
//                 }
//             } catch (e) {
//                 Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//             };
//         }
//         submitting.end();
//     }

//     const onValuesChange = (changedValues, values) => { }

//     return (
//         <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
//             <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
//             <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOut} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
//                     <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
//                     <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
//                     <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={record?.qty_reminder} /></Field></Col>
//                     <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
//                 </Row>
//             </FormContainer>
//             {parentRef && <Portal elId={parentRef.current}>
//                 <Space>
//                     <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
//                     <Button onClick={closeParent}>Cancelar</Button>
//                 </Space>
//             </Portal>
//             }
//         </Form>
//     );
// }
// const InContent = ({ parentRef, closeParent, loadParentData }) => {
//     const [form] = Form.useForm();
//     const [fieldStatus, setFieldStatus] = useState({});
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
//     const submitting = useSubmitting(true);
//     const [saidaMP, setSaidaMP] = useState(0);
//     const [movimento, setMovimento] = useState(0);
//     const artigo_cod = Form.useWatch('artigo_cod', form);

//     const loadData = async ({ signal } = {}) => {
//         submitting.end();
//     };
//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal });
//         return (() => controller.abort());
//     }, []);

//     const onFinish = async (values) => {
//         submitting.trigger();
//         const v = schemaIn().validate(values, { abortEarly: false, messages: validateMessages, context: { saida_mp: saidaMP } });
//         let { errors, warnings, value, ...status } = getStatus(v);
//         if (saidaMP === 1 && errors === 0 && !values.t_stamp_out) {
//             values.t_stamp_out = dayjs();
//         }
//         if (saidaMP === 1 && errors === 0 && !values.qty_reminder) {
//             values.qty_reminder = 0;
//         }
//         if (values.t_stamp_out <= values.t_stamp) {
//             errors = 1;
//             status.fieldStatus.t_stamp_out = { status: "error", messages: [{ message: "A data de saída tem de ser maior que a data de entrada." }] };
//         }
//         if (values.qty_lote < values.qty_reminder) {
//             errors = 1;
//             status.fieldStatus.qty_reminder = { status: "error", messages: [{ message: "A quantidade restante tem de ser menor ou igual à quantidade do lote." }] };
//         }

//         setFieldStatus({ ...status.fieldStatus });
//         setFormStatus({ ...status.formStatus });
//         if (errors === 0) {
//             try {
//                 let vals = {
//                     lote_id: movimento.ROWID,
//                     qty_lote: values.qty_lote,
//                     artigo_des: movimento.ITMDES1_0,
//                     artigo_cod: movimento.ITMREF_0,
//                     type_mov: 1,
//                     group_id: values?.cuba?.key,
//                     t_stamp: dayjs(values.t_stamp).format(DATETIME_FORMAT),
//                     ...(saidaMP === 1) && { t_stamp_out: dayjs(values.t_stamp_out).format(DATETIME_FORMAT) },
//                     n_lote: movimento.LOT_0,
//                     status: -1,
//                     vcr_num: movimento.VCRNUM_0,
//                     qty_reminder: values.qty_reminder,
//                     obs: "",
//                     saida_mp: saidaMP
//                 }
//                 let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...vals }, parameters: { type: "in", status: 0 } });
//                 if (response.data.status !== "error") {
//                     loadParentData();
//                     closeParent();
//                     Modal.success({ title: `Entrada${saidaMP === 1 && '/Saída'} em linha efetuada!` })
//                 } else {
//                     status.formStatus.error.push({ message: response.data.title });
//                     setFormStatus({ ...status.formStatus });
//                 }
//             } catch (e) {
//                 Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//             };

//         }
//         // const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
//         // const { errors, warnings, value, ...status } = getStatus(v);
//         // if (errors === 0) {
//         //     try {
//         //         let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...values, id: record.id, t_stamp: dayjs.isDayjs(values?.t_stamp) ? values?.t_stamp.format(DATETIME_FORMAT) : dayjs(values?.t_stamp).format(DATETIME_FORMAT) }, parameters: { type: "out", status: 0 } });
//         //         if (response.data.status !== "error") {
//         //             loadParentData();
//         //             closeParent();
//         //             Modal.success({ title: "Saída de Lote da linha efetuada!" })
//         //         } else {
//         //             status.formStatus.error.push({ message: response.data.title });
//         //             setFormStatus({ ...status.formStatus });
//         //         }
//         //     } catch (e) {
//         //         Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//         //     };
//         // }
//         submitting.end();
//     }

//     const onValuesChange = (changedValues, values) => {
//         if ("artigo_cod" in changedValues) {
//             form.setFieldsValue({ "n_lote": null });
//             form.setFieldsValue({ "qty_lote": null });
//         }
//         if ("n_lote" in changedValues) {
//             //console.log(changedValues)
//             //form.setFieldsValue("n_lote", null);
//         }
//         if ("saida_mp" in changedValues) {
//             setSaidaMP(changedValues.saida_mp);
//         }
//     }

//     const onSelectLote = (row) => {
//         form.setFieldValue("qty_lote", row.QTYPCU_0);
//         setMovimento(row);
//     }

//     return (
//         <Form form={form} name={`f-in`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
//             <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
//             <FormContainer id="LAY-IN" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaIn} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}>
//                         <Selector
//                             size="small"
//                             title="Artigos - Granulado"
//                             params={{ payload: { url: `${API_URL}/materiasprimaslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
//                             keyField={["ITMREF_0"]}
//                             textField="ITMREF_0"
//                             detailText={r => r?.ITMDES1_0}
//                             columns={[
//                                 { key: 'ITMREF_0', name: 'Código', width: 160 },
//                                 { key: 'ITMDES1_0', name: 'Designação' }
//                             ]}
//                             filters={{ fmulti_artigo: { type: "any", width: 150, text: "Artigo" } }}
//                             moreFilters={{}}
//                         />
//                     </Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={artigo_cod?.ITMREF_0 ? true : false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}>
//                         <Selector
//                             size="small"
//                             title="Lotes"
//                             popupWidth={800}
//                             onSelect={onSelectLote}
//                             params={{ payload: { url: `${API_URL}/stocklistbuffer/`, pagination: { limit: 15 }, filter: { floc: 'BUFFER', fitm: artigo_cod?.ITMREF_0 }, parameters: { lookup: true }, sort: [] } }}
//                             keyField={["LOT_0"]}
//                             textField="LOT_0"
//                             detailText={r => <div><span><b>{r["VCRNUM_0"]}</b></span> <span style={{ color: "#096dd9" }}>{dayjs(r["CREDATTIM_0"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{r["QTYPCU_0"]} kg</b>]</span></div>}
//                             columns={[
//                                 { key: 'LOT_0', name: 'Lote', width: 150 },
//                                 { key: 'CREDATTIM_0', name: 'Data', formatter: p => dayjs(p.row["CREDATTIM_0"]).format(DATETIME_FORMAT) },
//                                 { key: 'VCRNUM_0', name: 'Movimento', width: 180 },
//                                 { key: 'QTYPCU_0', name: 'Qtd.', width: 100, formatter: p => <span>[Qtd: <b>{p.row["QTYPCU_0"]} kg</b>]</span> }
//                             ]}
//                             filters={{ flote: { type: "any", width: 120, text: "Lote" } }}
//                             moreFilters={{}}
//                         />
//                     </Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
//                     <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Entrada" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
//                     <Col><Field wrapFormItem={true} name="cuba" label={{ enabled: true, text: "Cuba" }}>
//                         <Selector
//                             size="small"
//                             toolbar={false}
//                             title="Cubas"
//                             popupWidth={130}
//                             params={{ payload: { data: { rows: FORMULACAO_CUBAS }, pagination: { limit: 20 } } }}
//                             keyField={["key"]}
//                             textField="value"
//                             columns={[
//                                 { key: 'value', name: 'Cuba', formatter: p => <Cuba value={p.row.key} /> }
//                             ]}
//                         />
//                     </Field></Col>
//                 </Row>
//                 <Row gutterWidth={2} style={{ fontWeight: 700, marginTop: "10px", marginBottom: "1px", /* borderBottom: "solid 1px #bfbfbf", */ background: "#f0f0f0", padding: "1px" }}>
//                     <Col xs="content"><Field wrapFormItem={true} name="saida_mp" label={{ enabled: false, text: "Saída do Lote", pos: "right" }}><CheckboxField /></Field></Col>
//                     <Col xs="content" style={{ alignSelf: "center" }}>Saída do Lote</Col>
//                 </Row>
//                 {saidaMP === 1 &&
//                     <Row style={{}} gutterWidth={10}>
//                         <Col><Field wrapFormItem={true} name="t_stamp_out" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
//                         <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={form.getFieldValue("qty_lote")} /></Field></Col>
//                     </Row>
//                 }
//                 {/* <Row style={{}} gutterWidth={10}>
//                 <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
//                 <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
//             </Row>
//             <Row style={{}} gutterWidth={10}>
//                 <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
//                 <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
//             </Row>
//             <Row style={{}} gutterWidth={10}>
//                 <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
//                 <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={record?.qty_reminder} /></Field></Col>
//                 <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Saída" }}><DatePicker format={DATETIME_FORMAT} size="small" /></Field></Col>
//             </Row> */}
//             </FormContainer>
//             {parentRef && <Portal elId={parentRef.current}>
//                 <Space>
//                     <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
//                     <Button onClick={closeParent}>Cancelar</Button>
//                 </Space>
//             </Portal>
//             }
//         </Form>
//     );
// }
// const CloseContent = ({ record, parentRef, closeParent, loadParentData }) => {
//     const [form] = Form.useForm();
//     const [fieldStatus, setFieldStatus] = useState({});
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
//     const submitting = useSubmitting(true);

//     const loadData = async ({ signal } = {}) => {
//         console.log(record)

//         form.setFieldsValue({ ...record, in_t: dayjs(record.in_t), out_t: dayjs(record.out_t) });
//         submitting.end();
//     };
//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal });
//         return (() => controller.abort());
//     }, []);

//     const onFinish = async (values) => {
//         submitting.trigger();
//         const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
//         const { errors, warnings, value, ...status } = getStatus(v);
//         if (errors === 0) {
//             try {
//                 let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { vcr_num: record.vcr_num }, parameters: { type: "close", status: 0 } });
//                 if (response.data.status !== "error") {
//                     loadParentData();
//                     closeParent();
//                     Modal.success({ title: "Movimento fechado com sucesso!" })
//                 } else {
//                     status.formStatus.error.push({ message: response.data.title });
//                     setFormStatus({ ...status.formStatus });
//                 }
//             } catch (e) {
//                 Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//             };
//         }
//         submitting.end();
//     }

//     const onValuesChange = (changedValues, values) => { }

//     return (
//         <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
//             <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
//             <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOut} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
//                     <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
//                     <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
//                     <Col><Field forInput={false} wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={record?.qty_reminder} /></Field></Col>
//                 </Row>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={false} wrapFormItem={true} name="in_t" label={{ enabled: true, text: "Data Entrada" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
//                     <Col><Field forInput={false} wrapFormItem={true} name="out_t" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
//                 </Row>

//             </FormContainer>
//             {parentRef && <Portal elId={parentRef.current}>
//                 <Space>
//                     <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
//                     <Button onClick={closeParent}>Cancelar</Button>
//                 </Space>
//             </Portal>
//             }
//         </Form>
//     );
// }

// const CloseDateContent = ({ parentRef, closeParent, loadParentData }) => {
//     const [form] = Form.useForm();
//     const [fieldStatus, setFieldStatus] = useState({});
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
//     const submitting = useSubmitting(true);

//     const loadData = async ({ signal } = {}) => {
//         submitting.end();
//     };
//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal });
//         return (() => controller.abort());
//     }, []);

//     const onFinish = async (values) => {
//         submitting.trigger();
//         const v = schemaOutDate().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
//         const { errors, warnings, value, ...status } = getStatus(v);
//         if (errors === 0) {
//             try {
//                 let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { t_stamp_out: dayjs(values.t_stamp_out).format(DATE_FORMAT) }, parameters: { type: "close", status: 0 } });
//                 if (response.data.status !== "error") {
//                     loadParentData();
//                     closeParent();
//                     Modal.success({ title: "Movimento(s) fechado(s) com sucesso!" })
//                 } else {
//                     status.formStatus.error.push({ message: response.data.title });
//                     setFormStatus({ ...status.formStatus });
//                 }
//             } catch (e) {
//                 Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//             };
//         }
//         submitting.end();
//     }

//     const onValuesChange = (changedValues, values) => { }

//     return (
//         <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
//             <Alert style={{ marginBottom: "2px" }} message={<b>Aviso</b>} description="Ao fechar os movimentos pela data de saída, serão também processados os consumos nessa data!" type="warning" />
//             <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
//             <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOutDate} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
//                 <Row style={{}} gutterWidth={10}>
//                     <Col><Field forInput={true} wrapFormItem={true} name="t_stamp_out" label={{ enabled: true, text: "Data de Saída" }}><DatePicker format={DATE_FORMAT} size="small" /></Field></Col>
//                 </Row>

//             </FormContainer>
//             {parentRef && <Portal elId={parentRef.current}>
//                 <Space>
//                     <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
//                     <Button onClick={closeParent}>Cancelar</Button>
//                 </Space>
//             </Portal>
//             }
//         </Form>
//     );
// }


// export const ModalViewer = ({ p, title, width = "90%", type = "drawer", push = false, height, footer = "ref", yScroll = true, children }) => {
//     const [visible, setVisible] = useState(true);

//     const onCancel = () => {
//         p.onClose();
//         setVisible(false);
//     };

//     return (
//         <ResponsiveModal title={title} type={type} push={push} onCancel={onCancel} width={width} height={height} footer={footer} yScroll={yScroll}>
//             {children}
//         </ResponsiveModal>
//     );
// };


const modoExpedicao = (v) => {
    switch (v) {
        case "1": return "CONTAINER";
        case "3": return "TRUCK";
        case "4": return "AIR";
        default: return "";
    }
}

export default ({ setFormTitle, noid = false, ...props }) => {
    const media = useContext(MediaContext);
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ name: "paletes" });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "PaletesList" };
    const defaultSort = [{ column: "timestamp", direction: "DESC" }];
    const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid===false) && { id: "lst-paletes" }), payload: { url: `${API_URL}/paletes/paletessql/`, primaryKey:"id", parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "changeof": return <Chooser parameters={modalParameters.parameters} />
                case "bobines": return <BobinesPopup record={{ ...modalParameters }} />
                //case "createpalete": return <FormCreatePalete loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['id'];
    const editable = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !row?.carga_id && !row?.SDHNUM_0) {
            return (col === "destino") ? true : false;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (col === "destino" && row.destinos_has_obs > 0) {
            return classes.hasObs;
        }
    }

    const onBobinesPopup = async (row) => {
        const _bobines = await loadBobinesLookup({palete_id:row.id,sort:[{column:"mb.posicao_palete",direction:"ASC"},{column:"mb.nome",direction:"ASC"}]});
        setModalParameters({ content: 'bobines',type: "drawer", title: <div>Palete <span style={{ fontWeight: 900 }}>{row.nome}</span></div>, bobines:_bobines });
        showModal();
        //setModalParameters({ content: 'bobines',type: "drawer", title: <div>Palete <span style={{ fontWeight: 900 }}>{row.nome}</span></div>, bobines: JSON.parse(row.bobines) });
        //showModal();
    }

    // const formatterClass = (row, col) => {
    //     if (col === "type_mov" && row.closed === 1) {
    //         return classes.closed;
    //     }
    //     if (col === "diff" && row.diff !== 0) {
    //         let percent = (100 * row.diff) / row.avgdiff;
    //         if (percent >= 125) {
    //             return classes.diffAbove;
    //         }
    //         if (percent <= 75) {
    //             return classes.diffBellow;
    //         }
    //     }
    // }
    // const onLoteChange = (p, v) => {
    //     const r = { ...p.row, valid: p.row["vcr_num"] !== v.row["VCRNUM_0"] ? 0 : null, vcr_num: v.row["VCRNUM_0"], n_lote: v.row["LOT_0"], qty_lote: v.row["QTYPCU_0"] };
    //     if (!("vcr_num_original" in p.row)) {
    //         r["vcr_num_original"] = p.row["vcr_num"];
    //     }
    //     if (p.row.qty_lote === p.row.qty_reminder) {
    //         r["qty_reminder"] = v.row["QTYPCU_0"];
    //     }
    //     p.onRowChange(r, true);
    // }
    // const onQtyLoteChange = (p, v) => {
    //     const r = { ...p.row, valid: p.row["qty_lote"] !== v ? 0 : null, qty_lote: v };
    //     if (p.row.qty_lote <= p.row.qty_reminder || p.row.type_mov == 1) {
    //         r["qty_reminder"] = v;
    //     }
    //     p.onRowChange(r, true);
    // }
    // const onQtyReminderChange = (p, v) => {
    //     const r = { ...p.row, valid: p.row["qty_reminder"] !== v ? 0 : null, qty_reminder: v };
    //     if (p.row.qty_lote <= v || p.row.type_mov == 1) {
    //         r["qty_reminder"] = p.row.qty_lote;
    //     }
    //     p.onRowChange(r, true);
    // }

    const columns = [
        { key: 'nome', name: 'Lote', frozen: true, width: 130, formatter: p => <Button size="small" type="link" onClick={() => onClickDetails("all", p.row)}>{p.row.nome}</Button> },
        {
            key: 'baction', name: '', minWidth: 45, maxWidth: 45, frozen: true, formatter: p => <Button icon={<TbCircles />} size="small" onClick={() => onBobinesPopup(p.row)} />,
        },
        { key: 'timestamp', width: 130, name: 'Data', formatter: p => dayjs(p.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'nbobines_real', name: 'Bobines', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{String(p.row.nbobines_real).padStart(2, '0')}/{String(p.row.num_bobines).padStart(2, '0')}</div> },
        { key: 'nbobines_emendas', name: 'C/Emendas', reportFormat: '0', width: 60, formatter: p => p.row.nbobines_emendas },
        { key: 'nbobines_sem_destino', name: 'S/Destino', reportFormat: '0', width: 60, formatter: p => <BadgeNumber value={p.row.nbobines_sem_destino} cellProps={{}} /> },
        { key: 'estado', name: 'Estado', width: 90, formatter: p => <EstadoBobines id={p.row.id} nome={p.row.nome} artigos={json(p.row.artigo)} /> },
        { key: 'largura', name: 'Larguras (mm)', width: 90, formatter: p => <Largura id={p.row.id} nome={p.row.nome} artigos={json(p.row.artigo)} /> },
        { key: 'core', name: 'Cores', width: 90, formatter: p => <Core id={p.row.id} nome={p.row.nome} artigos={json(p.row.artigo)} /> },
        { key: 'area_real', name: 'Área', reportFormat: '0.0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area_real} m&sup2;</div> },
        { key: 'comp_real', name: 'Comp.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_real} m</div> },
        { key: 'peso_bruto', name: 'Peso B.', reportFormat: '0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso_bruto} kg</div> },
        { key: 'peso_liquido', name: 'Peso .L', reportFormat: '0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso_liquido} kg</div> },
        { key: 'diam_min', name: 'Diam. Min.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam_min} mm</div> },
        { key: 'diam_max', name: 'Diam. Máx.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam_max} mm</div> },
        { key: 'diam_avg', name: 'Diam. Médio.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam_avg} mm</div> },
        {
            key: 'destino', name: 'Destino', width: 200,
            editor: p => <DestinoPaleteEditor forInput={false} p={p} />,
            cellClass: r => editableClass(r, 'destino'),
            editable: true,
            editorOptions: { editOnClick: true },
            formatter: p => p.row.destino
        },
        { key: 'cliente_nome', name: 'Cliente', width: 200, formatter: p => p.row.cliente_nome },
        { key: 'ofid', name: 'Ordem Fabrico', width: 140, formatter: p => <OF id={p.row.id} ofid={p.row.ofid} of_des={p.row.ordem_original} /> },
        { key: 'prf', name: 'PRF', width: 130, formatter: p => p.row.prf },
        { key: 'iorder', name: 'Encomenda', width: 130, formatter: p => p.row.iorder },
        { key: 'data_encomenda', width: 130, name: 'Data Encomenda', formatter: p => p.row.data_encomenda && dayjs(p.row.data_encomenda).format(DATETIME_FORMAT) },
        { key: 'item', name: 'Cod. Artigo', width: 130, formatter: p => p.row.item },
        { key: 'ofid_original', name: 'Ordem F. Origem', width: 140, formatter: p => <OF id={p.row.id} ofid={p.row.ofid_original} /> },
        { key: 'stock_loc', name: 'Loc.', width: 30, formatter: p => p.row.stock_loc },
        { key: 'stock_qtypcu', name: 'Qtd. Stock', reportFormat: '0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.stock_qtypcu} {p.row.stock_qtypcu && <>m&sup2;</>}</div> },
        { key: 'VCRNUMORI_0', name: 'Doc.', width: 130, formatter: p => p.row.VCRNUMORI_0 },
        { key: 'SDHNUM_0', name: 'Expedição', width: 130, formatter: p => p.row.SDHNUM_0 },
        { key: 'BPCNAM_0', name: 'Expedição Cliente', width: 200, formatter: p => p.row.BPCNAM_0 },
        { key: 'EECICT_0', name: 'EEC', width: 60, formatter: p => p.row.EECICT_0 },
        { key: 'modo_exp', name: 'Modo Expedição', reportFormat: '0', width: 90, formatter: p => modoExpedicao(p.row.modo_exp) },
        { key: 'matricula', name: 'Matrícula', width: 60, formatter: p => p.row.matricula },
        { key: 'matricula_reboque', name: 'Matrícula Reboque', width: 60, formatter: p => p.row.matricula_reboque },
        { key: 'mes', name: 'Mês', reportFormat: '0', width: 60, formatter: p => p.row.mes },
        { key: 'ano', name: 'Ano', reportFormat: '0', width: 60, formatter: p => p.row.ano },



        //{ key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={() => onPrint(p.row)} /> },
        // { key: 'type_mov', width: 90, name: 'Movimento', frozen: true, cellClass: r => formatterClass(r, 'type_mov'), formatter: p => <MovGranuladoColumn value={p.row.type_mov} /> },
        // { key: "group_id", sortable: false, name: "Cuba", frozen: true, minWidth: 55, width: 55, formatter: p => <Cuba value={p.row.group_id} /> },
        // { key: 'dosers', width: 90, name: 'Doseadores', frozen: true, formatter: p => p.row.dosers },
        // { key: 'artigo_cod', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.artigo_cod },
        // { key: 't_stamp', width: 140, name: 'Data Mov.', editable: editable, cellClass: r => editableClass(r, 't_stamp'), editor: p => <DateTimeEditor p={p} field="t_stamp" />, editorOptions: { editOnClick: true }, formatter: p => dayjs(p.row.t_stamp).format(DATETIME_FORMAT) },
        // { key: 'artigo_des', width: 280, name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        // { key: 'n_lote', width: 310, name: 'Lote', editable: (r) => editable(r, 'n_lote'), cellClass: r => editableClass(r, 'n_lote'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onLoteChange(p, v)} fetchOptions={(v) => loadMovimentosLookup(p, v)} optionsRender={optionsRender} p={p} field="n_lote" />, editorOptions: { editOnClick: true }, formatter: p => <b>{p.row.n_lote}</b> },
        // { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, editable: (r) => editable(r, 'qty_lote'), cellClass: r => editableClass(r, 'qty_lote'), editor: p => <InputNumberEditor onChange={onQtyLoteChange} p={p} field="qty_lote" min={0} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} kg</div> },
        // { key: 'qty_reminder', width: 110, name: 'Qtd. Restante', editable: (r) => editable(r, 'qty_reminder'), cellClass: r => editableClass(r, 'qty_reminder'), editor: p => <InputNumberEditor onChange={onQtyReminderChange} p={p} field="qty_reminder" min={0} max={p.row.qty_lote} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div>{parseFloat(p.row.qty_reminder).toFixed(2)} kg</div> },
        // { key: "in_t", width: 140, name: 'Data Entrada', formatter: p => dayjs(p.row.in_t).format(DATETIME_FORMAT) },
        // { key: "out_t", width: 140, name: 'Data Saída', formatter: p => p.row.diff !== 0 && dayjs(p.row.out_t).format(DATETIME_FORMAT) },
        // { key: "diff", width: 140, name: 'Duração', cellClass: r => formatterClass(r, 'diff'), formatter: p => p.row.diff !== 0 && secondstoDay(p.row.diff) },
        // { key: "avgdiff", width: 140, name: 'Duração Média', formatter: p => secondstoDay(p.row.avgdiff) },
        // { key: "stddiff", width: 140, name: 'Desvio Padrão', formatter: p => secondstoDay(p.row.stddiff) },
        // { key: 'vcr_num', name: 'Movimento', width: 200, formatter: p => p.row.vcr_num },
        // { key: 'ofs', width: 280, name: 'Ordem Fabrico', formatter: p => <OfsColumn value={p.row.ofs && JSON.parse(p.row.ofs)} /> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters?.filter, {}, null);
            let { filterValues, filter = {}, fieldValues } = fixRangeDates(['fdata'], {...initFilters,...filter});
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters(defaultParameters, true, true);
            dataAPI.fetchPost({ signal });
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
                    // fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fsdh: getFilterValue(vals?.fsdh, 'any'),
                    fcliente: getFilterValue(vals?.fcliente, 'any'),
                    fclienteexp: getFilterValue(vals?.fclienteexp, 'any'),
                    fartigoexp: getFilterValue(vals?.fartigoexp, 'any'),
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flotenw: getFilterValue(vals?.flotenw, 'any'),
                    ftiponw: getFilterValue(vals?.ftiponw, 'any'),
                    fcarganome: getFilterValue(vals?.fcarganome, 'any'),
                    fdestinoold: getFilterValue(vals?.fdestinoold, 'any'),
                    fbobine: getFilterValue(vals?.fbobine, 'any'),
                    fmatricula: getFilterValue(vals?.fmatricula, 'any'),
                    fmatricula_reboque: getFilterValue(vals?.fmatricula_reboque, 'any'),
                    fprf: getFilterValue(vals?.fprf, 'any'),
                    forder: getFilterValue(vals?.forder, 'any'),
                    fdestino: getFilterValue(vals?.fdestino, 'any'),
                    fof: getFilterValue(vals?.fof, 'any'),
                    fartigo_mp: getFilterValue(vals?.fartigo_mp, 'any'),
                    flote_mp: getFilterValue(vals?.flote_mp, 'any'),
                    fdispatched: (!vals?.fdispatched || vals?.fdispatched === 'ALL') ? null : vals.fdispatched,
                    fcarga: (!vals?.fcarga || vals?.fcarga === 'ALL') ? null : vals.fcarga,
                    // fvcr: getFilterValue(vals?.fvcr, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    // fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
                    // fdataout: getFilterRangeValues(vals["fdataout"]?.formatted),
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters(defaultParameters);
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
            case "changeof":
                changeOf({setModalParameters,showModal,openNotification,item,row});
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
        setModeEdit({ datagrid: (modeEdit.datagrid) ? false : true });
    }
    const onSave = async (action) => {
        const rows = dataAPI.getData().rows.filter(v => v?.valid === 0).map(({ n_lote, vcr_num, t_stamp, qty_lote, qty_reminder, vcr_num_original, type_mov }) =>
            ({ n_lote, vcr_num, t_stamp: dayjs.isDayjs(t_stamp) ? t_stamp.format(DATETIME_FORMAT) : dayjs(t_stamp).format(DATETIME_FORMAT), qty_lote, qty_reminder, vcr_num_original, type_mov })
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

    const onClickDetails = (type, row) => {
        navigate("/app/paletes/formpalete", { replace: true, state: { palete: row, palete_id: row.id, palete_nome: row.nome, tstamp: Date.now(), dataAPI: { offset: dataAPI.getRowOffset(row), ...dataAPI.getPayload() } } });
        //setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: () => dataAPI.fetchPost(), parameters: { palete: row, palete_id: row.id, palete_nome: row.nome } });
        //showModal();
    }

    const rowClassName = (data) => {
        if (data?.valid == 0) {
            return classes.notValid;
        }
        if (data?.nok_estados > 0) {
            return classes.error;
        }
        if (data?.nok > 0) {
            return classes.warning;
        }
    }

    // const onCreatePalete = () => {
    //     setModalParameters({ content: "createpalete", type: "drawer", title: "Criar Palete (Selecionar Ordem de Fabrico)", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: () => dataAPI.fetchPost(), parameters: {} });
    //     showModal();
    // }

    return (
        <>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getAllFilter()} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} permission={permission} />}
                frozenActionColumn={true}
                reportTitle={title}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                height="80vh"
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                rowClass={rowClassName}
                reportItems={[
                    { label: 'Paletes (Detalhado)', key: 'PaletesDetailed_01', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "xlsx" } },
                ]}
                leftToolbar={<Space>
                    {/* <Permissions permissions={permission} action="createPalete"><Button disabled={submitting.state} onClick={onCreatePalete}>Criar Palete</Button></Permissions> */}
                    {/* <Permissions permissions={permission} action="editList">
                        {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                        {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                        {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    </Permissions> */}

                    {/* {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<CheckCircleOutlined />} onClick={onClose}>Fechar Movimentos</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<PlusCircleOutlined />} onClick={onAdd}>Nova Entrada</Button>}
                    {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>} */}
                </Space>}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 500, mask: true }
                }}
            />
        </>
    );
}