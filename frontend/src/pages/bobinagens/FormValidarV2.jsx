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
import { API_URL, BOBINE_ESTADOS } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
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
import BobinesDefeitosList from '../bobines/BobinesDefeitosList';
import { checkBobinesDefeitos, postProcess } from '../bobines/commons';


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
const loadBobinesLookup = async (bobinagem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, pagination: {}, filter: { fbobinagemid: `==${bobinagem_id}` }, parameters: { method: "BobinesLookup" } });
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


export default ({ extraRef, closeSelf, loadParentData, noid, ...props }) => {
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
    const [gridRef, setGridRef] = useState(null);

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
        id: null
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
        const _bm = (_bobinagem && _bobinagem.length > 0 && _bobinagem[0].valid == 0) ? _bobinagem[0] : null;
        form.setFieldsValue((_bm) ? {
            ..._bobinagem[0],
            lote_nwinf: { n_lote: _bobinagem[0].lotenwinf, vcr_num: _bobinagem[0].vcr_num_inf, tiponw: _bobinagem[0].tiponwinf },
            lote_nwsup: { n_lote: _bobinagem[0].lotenwsup, vcr_num: _bobinagem[0].vcr_num_sup, tiponw: _bobinagem[0].tiponwsup }
        } : null);
        let _bobines = [];
        if (_bm) {
            setTitle(`Validar Bobinagem ${_bm.nome}`);
            _bobines = (await loadBobinesLookup(inputParameters.current.bobinagem_id)).map(v => {
                return {
                    ...v,
                    inicio: _bm.inico, fim: _bm.fim, duracao: _bm.duracao,
                    data: _bm.data,
                    tiponwinf: _bm.tiponwinf, tiponwsup: _bm.tiponwsup,
                    rowvalid: 0
                }
            });
            postProcess(_bobines);
        }

        updateState(draft => {
            draft.loaded = true;
            draft.step = 0;
            draft.maxStep = 0;
            draft.bobinagem = (_bm) ? _bm : null;
            draft.hasBobines = (_bobines) ? true : false;
            draft.valid = (_bm && _bobines) ? true : false;
            draft.nome = (_bm) ? _bm.nome : null;
            draft.id = inputParameters.current.bobinagem_id;
        });
        if (_bm && _bobines) {
            dataAPI.setData({ rows: _bobines, total: _bobines?.length });
            form.setFieldsValue({
                comp: _bm.comp,
                vcr_num_inf: null,
                vcr_num_sup: null,
                troca_nw: _bobines[0].troca_nw,
                estado: _bobines[0].estado,
                comp_emenda: 0,
                data: _bobines[0].data,
                inicio: _bobines[0].inicio,
                fim: _bobines[0].fim,
                core: _bobines[0].core
            });
        }
        submitting.end();
    }

    const onEstadoChoose = () => {
        setModalParameters({
            content: "estado", responsive: true, type: "drawer", width: 600, title: "Estados", push: false, loadData: () => { }, parameters: {
                multipleSelection: false,
                settings: false,
                toolbar: false,
                toolbarFilters: false,
                data: BOBINE_ESTADOS.filter(v => ["BA", "LAB", "IND", "DM"].includes(v.value)),
                payload: { payload: { url: ``, primaryKey: "value", parameters: { ...defaultParameters }, pagination: { enabled: false, limit: 50 }, filter: {}, sort: [] } },
                columns: [
                    { name: "value", header: 'Estado', flex: 1, render: ({ cellProps, data }) => <EstadoBobine estado={data?.value} /> }
                ],
                onSelect: (({ rowProps, closeSelf }) => {
                    setDirty(true);
                    form.setFieldValue("estado", rowProps?.data?.value);
                    closeSelf();
                })

            },

        });
        showModal();
    }

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

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {
            const _rows = dataAPI.getData().rows;
            const v = checkBobinesDefeitos(_rows, true);
            const status = dataAPI.validateRows(rowSchema, {}, { context: { num: state.nome.split('-')[1] } }, _rows); //Validate all rows
            status.formStatus = { ...v.status };
            if (v.status?.error && v.status?.error.length > 0) {
                status.errors = status.errors + v.status?.error.length;
            }
            const msg = dataAPI.getMessages(status);
            if (status.errors > 0) {
                openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
            } else {
                response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, parameters: { method: "Validar", rows: _rows, lar_bruta: form.getFieldValue("lar_bruta") } });
                if (response?.data && response?.data?.status !== "error") {
                    openNotification(response?.data?.status, 'top', "Notificação", response.data.title);
                    next();
                } else {
                    openNotification("error", 'top', "Notificação", response.data.title, null);
                }
            }
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
                if (dataAPI.getData().rows[0].largura_bobinagem > _values.lar_bruta || _values.lar_bruta > (dataAPI.getData().rows[0].largura_bobinagem + 200)) {
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
            const _rows = [...dataAPI.getData().rows];
            for (const [idx, item] of _rows.entries()) {
                _rows[idx] = {
                    ..._rows[idx], estado: _values.estado, lar_bruta: _values.lar_bruta, comp_emenda: _values.comp_emenda, troca_nw: _values.troca_nw,
                    lotenwinf: state.nwinf.n_lote, lotenwsup: state.nwsup.n_lote,
                    vcr_num_inf: state.nwinf.vcr_num, vcr_num_sup: state.nwsup.vcr_num
                };
            }
            dataAPI.setRows(_rows);
        }
        setDirty(false);
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
            updateState(draft => {
                draft.nwsup = item;
            });
        }
        if (item && pos == 0) {
            setDirty(true);
            form.setFieldValue("vcr_num_inf", item.vcr_num);
            updateState(draft => {
                draft.nwinf = item;
            });
        }
    }

    const onValuesChange = (changedValues, values) => {
        setDirty(true);
        console.log(changedValues)
        // if ("lote_nwinf" in changedValues) {
        //     const _v = changedValues["lote_nwinf"];
        //     form.setFieldValue("lote_nwinf", { n_lote: _v.n_lote, vcr_num: _v.vcr_num, tiponw: _v.artigo_des });
        // }
        // if ("lote_nwsup" in changedValues) {
        //     const _v = changedValues["lote_nwsup"];
        //     form.setFieldValue("lote_nwsup", { n_lote: _v.n_lote, vcr_num: _v.vcr_num, tiponw: _v.artigo_des });
        // }
    }

    const larguraRealEditable = () => {
        if (state.nome) {
            return state.nome.split('-')[1] % 10 === 0 || form.getFieldValue("estado") == "BA";
        }
        return false;

    }

    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }

    const columnEditable = (v, { data, name }) => {


        if (["l_real"].includes(name)) {
            if (larguraRealEditable()) {
                return true;
            }
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (["l_real"].includes(name)) {
            if (larguraRealEditable()) {
                return tableCls.edit;
            }
        }
    };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        const index = dataAPI.getIndex(data);
        if (index >= 0) {
            let _rows = [];
            _rows = dataAPI.updateValues(index, columnId, { [columnId]: value, rowvalid: 0 });
            dataAPI.validateRows(rowSchema, {}, { context: { num: _rows[0].nome.split('-')[1] } }, _rows);
            if (rowIndex < _rows.length) {
                gridRef.current.setActiveCell([rowIndex + 1, rest.columnIndex]);
            }
        }
    }
    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const onCellAction = (data, column, key) => {
        if (key === "Enter" || key === "DoubleClick") {
            //if (column.name === "obs") {
            //    setModalParameters({ content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: { value: data[column.name] } });
            //    showModal();
            // }
        }
    }

    const columns = [
        ...(true) ? [{ name: "nome", header: "Bobine", minWidth: 130, flex: 1, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: 700 }} cellProps={cellProps}>{data?.nome}</LeftAlign> }] : [],
        ...(true) ? [{
            name: "estado", header: "Estado", defaultWidth: 70, userSelect: true, defaultlocked: false, headerAlign: "center", align: "center",
            render: ({ data, cellProps }) => <EstadoBobine id={data.id} nome={data.nome} estado={data.estado} largura={data.lar} cellProps={cellProps} />,
            // editable: columnEditable,
            // cellProps: { className: columnClass },
            // renderEditor: (props) => <EstadoTableEditor filter={(v => v?.value === "DM" || v?.value === "IND" || v?.value === "BA" || v?.value === "LAB")} {...props} />
        }] : [],
        // ...(true) ? [{ name: 'troca_nw', header: 'Troca NW', editable: columnEditable, renderEditor: (props) => <BooleanTableEditor {...props} />, render: ({ data, cellProps }) => <Bool cellProps={cellProps} value={data?.troca_nw} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{
            name: 'l_real', header: 'Largura Real', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center",
            editable: columnEditable,
            cellProps: { className: columnClass },
            render: ({ data, cellProps }) => <RightAlign cellProps={cellProps} unit="mm">{data?.l_real}</RightAlign>,
            renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0 }} {...props} />,
            visible: larguraRealEditable()
        }] : [],
        // ...(true) ? [{
        //     name: 'comp_emenda', header: 'Comp. Emenda', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center",
        //     editable: columnEditable,
        //     cellProps: { className: columnClass },
        //     render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp_emenda, 0)}</RightAlign>,
        //     renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0 }} {...props} />
        // }] : [],
        // ...(true) ? [{ name: 'vcr_num_inf', header: 'Nonwoven Inf.', defaultWidth: 150, flex: 1, editable: columnEditable, renderEditor: (props) => <NwQueueTableEditor dataAPI={dataAPI} {...props} filters={{ type: 0, queue: 1, status: 1 }} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <NwColumn style={{ fontSize: "10px" }} data={{ data, artigo_des: data?.tiponwinf, n_lote: data?.lotenwinf }} cellProps={cellProps} />, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        // ...(true) ? [{ name: 'vcr_num_sup', header: 'Nonwoven Sup.', defaultWidth: 150, flex: 1, editable: columnEditable, renderEditor: (props) => <NwQueueTableEditor dataAPI={dataAPI} {...props} filters={{ type: 1, queue: 1, status: 1 }} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <NwColumn style={{ fontSize: "10px" }} data={{ data, artigo_des: data?.tiponwsup, n_lote: data?.lotenwsup }} cellProps={cellProps} />, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'lar', header: 'Largura', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.lar, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'area', header: 'Área', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m&sup2;">{getFloat(data?.area, 0)}</RightAlign> }] : [],
    ];

    const onPrint = () => {
        setModalParameters({ content: "print", type: "modal", width: 500, height: 280, title: `Etiquetas Bobines - Bobinagem ${state.nome} `, parameters: { bobinagem: { id: state.id } } });
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
                        <YScroll>
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
                                                    <Col style={{ alignSelf: "end" }} width={60}><EstadoBobine style={{ width: "35px", height: "35px" }} onClick={onEstadoChoose} estado={form.getFieldValue("estado")} /></Col>
                                                    <Col width={180}><Field name="lar_bruta" label={{ enabled: true, text: `Largura bruta [${dataAPI.getData().rows[0].largura_bobinagem}mm]`, pos: "top" }}><InputNumber style={{ textAlign: "right", width: "150px" }} addonAfter={<b>mm</b>} /></Field></Col>
                                                    <Col width={180}><Field name="comp_emenda" label={{ enabled: true, text: "Comprimento Emenda" }}><InputNumber disabled={troca_nw == 0} style={{ textAlign: "right", width: "150px" }} min={0} addonAfter={<b>m</b>} /></Field></Col>
                                                    <Col width={200}><Field name="troca_nw" label={{ enabled: true, text: "Troca de Nonwoven" }}><SwitchField /></Field></Col>
                                                </Row>
                                            </FormContainer>
                                        </Col>
                                    </Row>
                                    <Row nogutter>
                                        <NonwovensList onSelect={onSelectNonwovens} state={state} loadLists={loadLists} setDirty={setDirty} openNotification={openNotification} next={next} setListSup={setListSup} listSup={listSup} setListInf={setListInf} listInf={listInf} />
                                    </Row>
                                </>}
                                {state.step == 1 && <Row nogutter/*  style={{ justifyContent: "center" }} */>
                                    <Col /*  xs="content" */>
                                        <Spin spinning={submitting.state}>
                                            <BobinesDefeitosList validate={true} dataAPI={dataAPI} parameters={{ bobinagem: state.bobinagem }} defaultSort={[{ column: 'nome', direction: 'ASC' }]} />
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
                                    </Col>
                                </Col>}


                                {((!state.bobinagem || !state.hasBobines) && state.loaded) && <>
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
                        </YScroll>
                    </Col >
                </Row >
            </Container >
        </ConfigProvider >
    )

}