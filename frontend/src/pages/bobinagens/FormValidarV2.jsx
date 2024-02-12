import React, { useEffect, useState, useCallback, useRef, useContext, Suspense } from 'react';
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
import { API_URL, BOBINE_ESTADOS } from "config";
import { useDataAPI } from "utils/useDataAPIV4";
import { json, includeObjectKeys, excludeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Divider, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List, Radio } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import { EstadoTableEditor, InputNumberTableEditor } from 'components/TableEditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Bool, DateTime, QueueNwColumn, EstadoBobine } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, SwitchField, Chooser } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { MdOutlineOutput, MdOutlineInput } from 'react-icons/md';
import { useImmer } from "use-immer";
import { dayjsValue } from 'utils/index';
import { Item } from 'components/formLayout';
import FormPrint from "../commons/FormPrint";
import BobinesDefeitosList, { schemaFinal, validationGroups } from '../bobines/BobinesDefeitosList';
import { checkBobinesDefeitos, postProcess } from '../bobines/commons';
import FormCortesOrdem from '../ordensfabrico/FormCortesOrdem';


//const title = "Validar Bobinagem";
const TitleForm = ({ level, auth, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title} save={false}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadNonwovensInLine = async ({ }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { queue: "in:1" }, sort: [], parameters: { method: "GetNonwovensInLine" }, signal });
    if (rows && rows.length > 0) {
        return rows;
    }
    return null;
}

const loadBobinagemLookup = async (bobinagem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, pagination: {}, filter: { fid: `==${bobinagem_id}` }, parameters: { method: "BobinagemLookup" } });
    return rows;
}

const loadCortes = async ({ data, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "GetCortes" }, filter: { ...data }, sort: [], signal });
    if (rows && rows.length > 0) {
        return { cortes: json(rows[0].cortes), cortesordem: json(rows[0].cortesordem) };
    }
    return rows;
}

const steps = [
    {
        title: 'Dados Bobinagem'
    },
    {
        title: 'Largura Real e Validar'
    },
    {
        title: 'Imprimir'
    }
];

const ListItem = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

const NonwovensList = ({ loadLists, openNotification, next, listInf, listSup, setListInf, setListSup, setDirty, state, onSelect, ...props }) => {
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        await loadLists({ signal, init });
    }

    return (
        <>
            <Col md={12} lg={6}>
                <YScroll>
                    {listInf &&
                        <List
                            style={{ marginRight: "5px" }}
                            header={<span style={{ fontWeight: 900, fontSize: "14px" }}>Nonwovens Inferiores</span>}
                            size="small"
                            itemLayout="horizontal"
                            dataSource={listInf}
                            renderItem={(item, index) => (
                                <ListItem onClick={() => onSelect(item, 0)} style={{}}>
                                    <List.Item.Meta
                                        style={{ border: "solid 1px #d9d9d9", padding: "5px", borderRadius: "3px", ...(state.nwinf && state.nwinf.id == item.id) && { background: "#1890FF", color: "#fff" } }}
                                        title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                                        description={<div style={{ display: "flex" }}><QueueNwColumn style={{ fontSize: "9px", width: "110px" }} value={item.queue} status={item.status} /><span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                                    />
                                </ListItem>
                            )}
                        />}
                </YScroll>
            </Col>
            <Col md={12} lg={6}>
                <YScroll>
                    {listSup &&
                        <List
                            style={{ marginRight: "5px" }}
                            header={<span style={{ fontWeight: 900, fontSize: "14px" }}>Nonwovens Superiores</span>}
                            size="small"
                            itemLayout="horizontal"
                            dataSource={listSup}
                            renderItem={(item, index) => (
                                <ListItem onClick={() => onSelect(item, 1)} style={{}}>
                                    <List.Item.Meta
                                        style={{ border: "solid 1px #d9d9d9", padding: "5px", borderRadius: "3px", ...(state.nwsup && state.nwsup.id == item.id) && { background: "#1890FF", color: "#fff" } }}
                                        title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                                        description={<div style={{ display: "flex" }}><QueueNwColumn style={{ fontSize: "9px", width: "110px" }} value={item.queue} status={item.status} /><span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                                    />
                                </ListItem>
                            )}
                        />}
                </YScroll>
            </Col>
        </>
    );
}

const schema = (options = {}, required = false) => {
    return getSchema({
        lar_bruta: Joi.number().positive().label("Largura Bruta").required(),
        comp: Joi.number().label("Comprimento"),
        troca_nw: Joi.number().label("Troca de Nonwoven"),
        estado: Joi.string().required().label("Estado"),
        vcr_num_inf: Joi.string().required().label("O Nonwoven inferior é obrigatório preencher."),
        vcr_num_sup: Joi.string().required().label("O Nonwoven superior é obrigatório preencher."),
        // comp_emenda: Joi.when(Joi.ref('troca_nw'), {
        //     is: Joi.number().valid(1),
        //     then: Joi.number().min(1).max(Joi.ref('comp')).required()
        //         .messages({
        //             'number.base': 'O comprimento da emenda tem de ser preenchido.',
        //             'number.empty': 'O comprimento da emenda  tem de ser preenchido.',
        //             'number.min': 'O comprimento da emenda tem de ser maior que zero',
        //             'number.max': 'O comprimento da emenda tem de ser menor que o comprimento',
        //             'any.required': 'O comprimento da emenda tem de ser preenchido.'
        //         }),
        //     otherwise: Joi.optional()
        // })
        // l_real: Joi.when(Joi.ref('estado'), {
        //     is: Joi.string().valid('BA'),
        //     then: Joi.number().min(Joi.ref('lar', { adjust: val => val - 10 })).max(Joi.ref('lar', { adjust: val => val + 10 })).required()
        //         .messages({
        //             'number.base': 'A largura real tem de ser um número válido',
        //             'number.empty': 'A largura real não pode ser vazia',
        //             'number.min': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
        //             'number.max': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
        //             'any.required': 'A largura real é obrigatória quando o estado é "BA"'
        //         })
        //     //,otherwise: Joi.optional()
        // }).concat(
        //     Joi.when(Joi.ref('$num'), {
        //         is: Joi.number().multiple(10),
        //         then: Joi.number().min(Joi.ref('lar', { adjust: val => val - 10 })).max(Joi.ref('lar', { adjust: val => val + 10 })).required()
        //             .messages({
        //                 'number.base': 'A largura real tem de ser preenchida.',
        //                 'number.empty': 'A largura real tem de ser preenchida.',
        //                 'number.min': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
        //                 'number.max': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
        //                 'any.required': 'A largura real tem de ser preenchida.'
        //             }),
        //         otherwise: Joi.optional()
        //     })
        // )
    }, options).unknown(true);
}

const rowSchema = (options = {}, required = false) => {
    return getSchema({
        comp: Joi.number().label("Comprimento"),
        troca_nw: Joi.number().label("Troca de Nonwoven"),
        lar: Joi.number().required().label("Largura"),
        estado: Joi.string().required().label("Estado"),
        l_real: Joi.when(Joi.ref('estado'), {
            is: Joi.string().valid('BA'),
            then: Joi.number().min(Joi.ref('lar', { adjust: val => val - 10 })).max(Joi.ref('lar', { adjust: val => val + 10 })).required()
                .messages({
                    'number.base': 'A largura real tem de ser um número válido',
                    'number.empty': 'A largura real não pode ser vazia',
                    'number.min': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                    'number.max': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                    'any.required': 'A largura real é obrigatória quando o estado é "BA"'
                })
            //,otherwise: Joi.optional()
        }).concat(
            Joi.when(Joi.ref('$num'), {
                is: Joi.number().multiple(10),
                then: Joi.number().min(Joi.ref('lar', { adjust: val => val - 10 })).max(Joi.ref('lar', { adjust: val => val + 10 })).required()
                    .messages({
                        'number.base': 'A largura real tem de ser preenchida.',
                        'number.empty': 'A largura real tem de ser preenchida.',
                        'number.min': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                        'number.max': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                        'any.required': 'A largura real tem de ser preenchida.'
                    }),
                otherwise: Joi.optional()
            })
        )
    }, options).unknown(true);
}


export default ({ extraRef, closeSelf, noid, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const tableCls = useTableStyles();
    const dataAPI = useDataAPI({ ...(!noid && { id: props?.id }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { primaryKey: "id" } });
    const permission = usePermission({ name: "bobinagens", item: "validar" });
    const [listInf, setListInf] = useState(null);
    const [listSup, setListSup] = useState(null);
    const [title, setTitle] = useState("Validar Bobinagem");
    const [dirty, setDirty] = useState(false);
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const troca_nw = Form.useWatch('troca_nw', form);
    const childData = useRef({ values: { tstamp: null } });


    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "estado": return <Chooser parameters={modalParameters.parameters} />;
                case "print": return <FormPrint v={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const [state, updateState] = useImmer({
        loaded: false,
        action: null,
        maxStep: null,
        step: 0,
        nwinf: null,
        nwsup: null,
        bobinagem: null,
        hasBobines: false,
        valid: false,
        nome: null,
        id: null,
        cortesordem_id: null
    });

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, location?.state, null);
        inputParameters.current = { ...paramsIn };
        //window.history.replaceState({}, document.title, window.location.pathname);
        const _bobinagem = await loadBobinagemLookup(inputParameters.current?.bobinagem_id);
        const _bm = (_bobinagem && _bobinagem.length > 0 && _bobinagem[0].valid == 0 ) ? _bobinagem[0] : null;
        let _cortes;
        if (_bm) {
            _cortes = await loadCortes({ data: { audit_cs_id: _bm?.audit_current_settings_id } });
        }
        form.setFieldsValue((_bm) ? {
            ..._bobinagem[0],
            lote_nwinf: { n_lote: _bobinagem[0].lotenwinf, vcr_num: _bobinagem[0].vcr_num_inf, tiponw: _bobinagem[0].tiponwinf },
            lote_nwsup: { n_lote: _bobinagem[0].lotenwsup, vcr_num: _bobinagem[0].vcr_num_sup, tiponw: _bobinagem[0].tiponwsup }
        } : null);
        updateState(draft => {
            draft.loaded = true;
            draft.step = 0;
            draft.maxStep = 0;
            draft.bobinagem = (_bm) ? _bm : null;
            draft.hasBobines = false; //(_bobines) ? true : false;
            draft.valid = false; //(_bm && _bobines) ? true : false;
            draft.nome = (_bm) ? _bm.nome : null;
            draft.id = inputParameters.current.bobinagem_id;
            draft.cortesordem_id = _cortes?.cortesordem?.id;
        });
        if (_bm) {
            form.setFieldsValue({
                comp: _bm.comp,
                vcr_num_inf: null,
                vcr_num_sup: null
            });
        }
        submitting.end();
    }

    // const onEstadoChoose = () => {
    //     setModalParameters({
    //         content: "estado", responsive: true, type: "drawer", width: 600, title: "Estados", push: false, loadData: () => { }, parameters: {
    //             multipleSelection: false,
    //             settings: false,
    //             toolbar: false,
    //             toolbarFilters: false,
    //             data: BOBINE_ESTADOS.filter(v => ["BA", "LAB", "IND", "DM"].includes(v.value)),
    //             payload: { payload: { url: ``, primaryKey: "value", parameters: { ...defaultParameters }, pagination: { enabled: false, limit: 50 }, filter: {}, sort: [] } },
    //             columns: [
    //                 { name: "value", header: 'Estado', flex: 1, render: ({ cellProps, data }) => <EstadoBobine estado={data?.value} /> }
    //             ],
    //             onSelect: (({ rowProps, closeSelf }) => {
    //                 setDirty(true);
    //                 form.setFieldValue("estado", rowProps?.data?.value);
    //                 changedValues.current = { ...changedValues.current, estado: rowProps?.data?.value, tstamp: new Date() };
    //                 closeSelf();
    //             })

    //         },

    //     });
    //     showModal();
    // }

    const loadLists = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadNonwovensInLine({}, signal);
        setListInf(_items.filter(v => v.type == 0));
        setListSup(_items.filter(v => v.type == 1));
        submitting.end();
    }

    const setChildData = (rows) => {
        if (Array.isArray(rows)) {
            childData.current = { values: childData.current?.values, rows, total: rows.length };
            updateState(draft => {
                draft.hasBobines = true;
                draft.valid = true;
            });
            form.setFieldsValue({
                largura_bobinagem: rows[0].largura_bobinagem,
                troca_nw: rows[0].troca_nw,
                // estado: rows[0].estado,
                comp_emenda: 0,
                data: rows[0].data,
                inicio: rows[0].inicio,
                fim: rows[0].fim,
                core: rows[0].core
            });
        }
    }

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {
            const rv = await dataAPI.validateRows(childData.current.rows, schemaFinal, "id", {
                passthrough: false, validationGroups: validationGroups(dataAPI)
            });
            rv.onValidationFail((p) => { openNotification("error", "top", "Notificação", p.alerts.error, 5, { width: "500px" }); });
            await rv.onValidationSuccess(async (p) => {
                console.log("success", { method: "Validar", rows: childData.current.rows, lar_bruta: form.getFieldValue("lar_bruta") })
                response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, parameters: { method: "Validar", rows: childData.current.rows, lar_bruta: form.getFieldValue("lar_bruta") } });
                if (response?.data && response?.data?.status !== "error") {
                    openNotification(response?.data?.status, 'top', "Notificação", response.data.title);
                    next();
                } else {
                    openNotification("error", 'top', "Notificação", response.data.title, null);
                }
            });
        } catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        };
        submitting.end();
    }

    const next = (item) => {
        if (state.step == 0) {
            const _values = form.getFieldsValue(true);
            const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
            let { errors, warnings, value, ...status } = getStatus(v);
            if (errors === 0) {
                if (_values?.troca_nw == 1) {
                    if (_values.comp_emenda <= 0) {
                        errors++;
                        status.fieldStatus.comp_emenda = { status: "error", messages: [{ message: "O comprimento de emenda tem de ser maior que zero!" }] };
                    } else if (_values.comp_emenda > _values?.comp) {
                        errors++;
                        status.fieldStatus.comp_emenda = { status: "error", messages: [{ message: "O comprimento da emenda tem de ser menor que o comprimento!" }] };
                    }
                }
                if (form.getFieldValue("largura_bobinagem") > _values.lar_bruta || _values.lar_bruta > (form.getFieldValue("largura_bobinagem") + 200)) {
                    errors = 1;
                    status.fieldStatus.lar_bruta = { status: "error", messages: [{ message: "A largura bruta não está dentro dos valores permitidos (valor não inferior à largura da bobinagem)!" }] };
                }
            }
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            if (errors > 0) {
                updateState(draft => {
                    if (draft.step == 0) {
                        draft.valid = false;
                    }
                });
                return;
            }
        }
        setDirty(false);
        childData.current.values = { ...childData.current.values, tstamp: new Date() };
        updateState(draft => {
            if (draft.step == 0) {
                draft.valid = true;
            }
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        setDirty(false);
        updateState(draft => {
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        if (state.step == 2) {
            return;
        }
        if (!state.valid || dirty) {
            return;
        }
        prev(value);
    }

    const onSelectNonwovens = (item, pos) => {
        if (item && pos == 1) {
            setDirty(true);
            form.setFieldValue("vcr_num_sup", item.vcr_num);
            childData.current.values = { ...childData.current.values, lotenwsup: item.n_lote, vcr_num_sup: item.vcr_num };
            updateState(draft => {
                draft.nwsup = item;
            });
        }
        if (item && pos == 0) {
            setDirty(true);
            form.setFieldValue("vcr_num_inf", item.vcr_num);
            childData.current.values = { ...childData.current.values, lotenwinf: item.n_lote, vcr_num_inf: item.vcr_num };
            updateState(draft => {
                draft.nwinf = item;
            });
        }
    }

    const onValuesChange = (changedValues, values) => {
        setDirty(true);
        childData.current.values = { ...childData.current.values, ...changedValues };
    }

    const onPrint = () => {
        setModalParameters({ content: "print", type: "modal", width: 500, height: 280, title: `Etiquetas Bobines - Bobinagem ${state.nome} `, parameters: { copias: 2, bobinagem: { id: state.id } } });
        showModal();
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Segmented: {
                        itemSelectedBg: "#1890ff"
                    },
                },
            }}
        >
            {!props?.setFormTitle && <TitleForm auth={permission.auth} level={location?.state?.level} onSave={onSave} loading={submitting.state} title={title} />}
            <Container fluid={state.step == 1 ? true : false}>
                <Row style={{ marginBottom: "5px" }}>
                    <Col>
                        <AlertsContainer mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} style={{ flexDirection: "row" }} />
                    </Col>
                    <Col xs="content">
                        <Space>
                            {(state.step == 0 && dirty && !submitting.state) && <Button
                                onClick={() => next()}
                                type="primary"
                            >Seguinte</Button>}
                            {(state.step == 1 && !submitting.state) && <Button
                                onClick={() => onSave()}
                                type="primary"
                            >Validar</Button>}
                        </Space>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                            {(state.step == 0 && state.bobinagem && state.hasBobines && state.loaded) && <>
                                <Row>
                                    <Col>
                                        <FormContainer id="LAY-VB" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onSave} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                                            <Row style={{}} gutterWidth={10}>
                                                <Col width={100}><Field forInput={false} name="data" label={{ enabled: true, text: "Data", pos: "top" }}><Input /></Field></Col>
                                                <Col width={100}><Field forInput={false} name="inicio" label={{ enabled: true, text: "Hora Início" }}><Input /></Field></Col>
                                                <Col width={100}><Field forInput={false} name="fim" label={{ enabled: true, text: "Hora Fim" }}><Input /></Field></Col>
                                                <Col width={50}><Field forInput={false} name="core" label={{ enabled: true, text: "Core" }}><InputNumber style={{ textAlign: "right" }} addonAfter={<b>''</b>} /></Field></Col>
                                                <Col width={100}><Field forInput={false} name="comp" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter={<b>m</b>} /></Field></Col>
                                                <Col width={120}><Field forInput={false} name="diam" label={{ enabled: true, text: "Diâmetro" }}><InputNumber size="small" style={{ textAlign: "right" }} addonAfter={<b>mm</b>} /></Field></Col>
                                            </Row>
                                            <Row style={{ height: "15px" }}><Col></Col></Row>
                                            <Row style={{}} gutterWidth={10}>
                                                {/* <Col style={{ alignSelf: "end" }} width={60}><EstadoBobine style={{ width: "35px", height: "35px" }} onClick={onEstadoChoose} estado={form.getFieldValue("estado")} /></Col> */}
                                                <Col width={180}><Field name="lar_bruta" label={{ enabled: true, text: `Largura bruta [${form.getFieldValue("largura_bobinagem")}mm]`, pos: "top" }}><InputNumber style={{ textAlign: "right", width: "150px" }} addonAfter={<b>mm</b>} /></Field></Col>
                                                <Col width={180}><Field name="comp_emenda" label={{ enabled: true, text: "Comprimento Emenda" }}><InputNumber disabled={troca_nw == 0} style={{ textAlign: "right", width: "150px" }} min={0} addonAfter={<b>m</b>} /></Field></Col>
                                                <Col width={200}><Field name="troca_nw" label={{ enabled: true, text: "Troca de Nonwoven" }}><SwitchField /></Field></Col>
                                            </Row>
                                        </FormContainer>
                                    </Col>
                                </Row>
                                <Row nogutter>
                                    <NonwovensList onSelect={onSelectNonwovens} state={state} loadLists={loadLists} setDirty={setDirty} openNotification={openNotification} next={next} setListSup={setListSup} listSup={listSup} setListInf={setListInf} listInf={listInf} />
                                </Row>
                                <Row>
                                    <Col>
                                        {state?.cortesordem_id && <Suspense fallback={<></>}><FormCortesOrdem parameters={{ cortesordem_id: state.cortesordem_id }} forInput={false} height="177px" /></Suspense>}
                                    </Col>
                                </Row>
                            </>}
                            {state?.bobinagem && <Row nogutter/*  style={{ justifyContent: "center" }} */>
                                <Col hidden={!(state.step == 1)} /*  xs="content" */>
                                    <Spin spinning={submitting.state}>
                                        <BobinesDefeitosList noid={true} validate={true} setDataToParent={setChildData} parameters={{
                                            bobinagem: state.bobinagem,
                                            validateValues: excludeObjectKeys(childData.current.values, ["tstamp"]),
                                            validateTstamp: childData.current.values?.tstamp,
                                            tstamp: new Date()
                                        }} />
                                    </Spin>
                                    {/* <Table
                                            gridRef={gridRef}
                                            handle={setGridRef}
                                            //dirty={formDirty}
                                            dirty={true}
                                            loading={submitting.state}
                                            offsetHeight="180px"
                                            style={{ width: "490px" }}
                                            {...true && { rowHeight: 30 }}
                                            idProperty={dataAPI.getPrimaryKey()}
                                            local={true}
                                            onRefresh={loadData}
                                            rowClassName={rowClassName}
                                            sortable={false}
                                            //cellNavigation={false}
                                            editStartEvent={"click"}
                                            reorderColumns={false}
                                            showColumnMenuTool={false}
                                            //onCellAction={onCellAction}
                                            editable={{
                                                markRows: false,
                                                showCancelButton: false,
                                                showSaveButton: false,

                                                enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                                                add: false,
                                                //onAdd: onAdd, onAddSave: onAddSave,
                                                onSave: () => onSave("update"), onCancel: onEditCancel,
                                                modeKey: "datagrid", setMode: () => { }, mode: { datagrid: { edit: true, add: false } }, onEditComplete,
                                                saveText: "Validar"
                                            }}
                                            columns={columns}
                                            dataAPI={dataAPI}
                                            moreFilters={false}
                                            leftToolbar={false}
                                            // startToolbar={
                                            //     <Space style={{ marginRight: "50px" }}>
                                            //         <Field name="lar_bruta" label={{ enabled: true, text: <div style={{ fontSize: "10px", lineHeight: 1.2 }}><div>Largura bruta</div><div>[{inputParameters.current.largura_bobinagem}mm]</div></div>, pos: "left", width: "80px" }}><InputNumber style={{ textAlign: "right", width: "150px" }} addonAfter="mm" /></Field>
                                            //     </Space>}
                                            toolbar={false}
                                            toolbarFilters={false}
                                        /> */}
                                </Col>
                            </Row>}
                            {(state.step == 2 && state.bobinagem) && <Col>
                                <Col style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ fontSize: "22px", fontWeight: 900, marginBottom: "10px" }}>{state.bobinagem.nome}</div>
                                    <Button icon={<PrinterOutlined />} onClick={onPrint} title="Imprimir Etiquetas">Imprimir Etiquetas</Button>
                                    <div style={{ marginTop: "10px" }}>
                                        {state?.cortesordem_id && <Suspense fallback={<></>}><FormCortesOrdem parameters={{ cortesordem_id: state.cortesordem_id }} forInput={false} height="177px" /></Suspense>}
                                    </div>
                                </Col>
                            </Col>}


                            {((!state.bobinagem) && state.loaded) && <>
                                <Row>
                                    <Col>
                                        <Alert style={{ width: "100%", textAlign: "left" }}
                                            message={<>Bobinagem <span style={{ fontWeight: 700 }}>{state.nome}</span></>}
                                            description={<ul style={{ fontWeight: 900, fontSize: "14px" }}>
                                                <li>A bobinagem não existe ou já se encontra validada.</li>
                                            </ul>}
                                            type="warning"
                                            showIcon
                                        />
                                    </Col>
                                </Row>
                            </>}
                        </Container>
                    </Col >
                </Row >
            </Container >
        </ConfigProvider >
    )

}