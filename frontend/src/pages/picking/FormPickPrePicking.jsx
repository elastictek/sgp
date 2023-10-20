import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, BOBINE_ESTADOS } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys, excludeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List, Checkbox } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF, ArrayColumn } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, CONTENTORES_OPTIONS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";
import SvgSchema from "../paletes/paletizacao/SvgSchemaV2";
import OpenOrdersChoose from './OpenOrdersChoose';

const title = "Pré-Picking";
const TitleForm = ({ level, auth, hasEntries, onSave, loading }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

const schema = (options = {}) => {
    return getSchema({
        artigos: Joi.array().items(Joi.number().integer()).min(1).label("Artigos").required(),
        transporte: Joi.string().label("Transporte").required(),
        paletes: Joi.number().positive().label("Nº de Paletes").required()
    }, options).unknown(true);
}

export const loadCargas = async ({ eef, prf }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/cargas/sql/`, filter: { feef: eef, fprf: prf }, sort: [{ column: "num_carga", direction: "ASC" }], parameters: { method: "CargasLookup" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            {/* <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col> */}
            {/*<Col xs="content">
                <Field name="fyear" shouldUpdate label={{ enabled: true, text: "Ano", pos: "top", padding: "0px" }}>
                    <DatePicker size="small" picker="year" format={"YYYY"} />
                </Field>
            </Col>
            <Col xs="content">
                <Field name="fquarter" label={{ enabled: true, text: "Quarter", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }]} allowClear style={{ width: "60px" }} />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns }),
    // <Col xs="content">
    //     <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
    //         <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
    //     </Field>
    // </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];

const encomendaOptions = (details, artigos) => {
    return details.map((data, i) => {
        return {
            label: (
                <div style={{ padding: "4px", background: "#f0f0f0", borderRadius: "5px" }}>
                    <div style={{ color: artigos.includes(i) ? "#000" : "#000", background: artigos.includes(i) ? "#1890ff" : "#f0f0f0", borderRadius: "5px", padding: "4px" }}>
                        {data?.n_paletes_total && <div><b>{data?.n_paletes_total}</b> <span>Paletes</span> {data?.qtd && <span><b>{data.qtd}</b> m2</span>}</div>}
                        {!data?.n_paletes_total && <div><span>Qtd.</span> {data?.qtd && <span><b>{data.qtd}</b> m2</span>}</div>}
                        <div style={{ fontWeight: 700 }}>{data?.artigo_cod}</div>
                        <div style={{}}>{data?.artigo_des}</div>
                    </div>
                </div>
            ),
            value: i
        };
    });
}

const transporteOptions = () => {
    return CONTENTORES_OPTIONS.map((data, i) => {
        return {
            label: (
                <div>{data.label}</div>
            ),
            value: data.value
        };
    });
}

const FormNewPrePickingList = ({ state, updateState, next, cancel, form, fieldStatus }) => {
    const [paletes, setPaletes] = useState();
    const eOptions = encomendaOptions(state.encomenda.details, state.artigos);
    const tOptions = transporteOptions();

    const onChange = (v) => {
        updateState(draft => {
            draft.artigos = v;
        });
        form.setFieldValue("artigos", v);
    }

    const onTransporteChange = (v) => {
        form.setFieldValue("transporte", v);
    }

    return (
        <>
            <Row>
                <Col></Col>
                <Col xs="content">
                    <Row style={{ marginBottom: "10px" }}>
                        <Col style={{ ...fieldStatus?.artigos?.status === "error" && { border: "solid 1px red" } }}>
                            {/* <div style={{ fontWeight: 700, marginBottom: "2px" }}>Artigos</div> */}
                            <Checkbox.Group
                                options={eOptions}
                                onChange={onChange}
                            />
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "10px" }}>
                        <Col style={{ paddingLeft: "40px" }}>
                            <div style={{ fontWeight: 700, marginBottom: "2px" }}>Transporte</div>
                            <Segmented
                                defaultChecked={false}
                                defaultValue={null}
                                value={form.getFieldValue("transporte")}
                                onChange={onTransporteChange}
                                options={tOptions}
                                style={{ ...fieldStatus?.transporte?.status === "error" && { border: "solid 1px red" } }}
                            />
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "10px" }}>
                        <Col style={{ paddingLeft: "40px" }} xs="content"><Field forInput={true} wrapFormItem={true} name="paletes" label={{ enabled: true, text: "Número Paletes" }}><InputNumber style={{ width: "100px" }} min={1} max={100} /></Field></Col>
                    </Row>
                </Col>
                <Col></Col>
            </Row>
        </>
    );
}


const steps = [
    {
        title: 'Encomendas'
    }, {
        title: 'Nova Lista'
    }, {
        title: 'Listas'
    }, {
        title: 'Adicionar Paletes'
    }
];


export default ({ extraRef, closeSelf, loadParentData, noid = true, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "picking" });
    const dataAPICargas = useDataAPI({ payload: { primaryKey: "id", parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });


    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });

    const [load, setLoad] = useState(false);

    const [state, updateState] = useImmer({
        maxStep: null,
        step: 0,
        encomenda: null,
        artigos: [],
        transporte: null
    });

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
            if (inputParameters.current?.id) {
                onSelectionChange({ data: inputParameters.current });
            } else {
                setLoad(true);
            }
        }
        submitting.end();
    }

    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onSelectionChange = async (v) => {
        if (state.step === 0) {
            const cargas = await _loadCargas(v);
            next(v.data, cargas);
        }
        //navigate("/app/picking/prepicking", { state: { ...v.data } });
    }

    const _loadCargas = async (v) => {
        const cargas = await loadCargas({ eef: v ? v.data.eef : state.encomenda.eef, prf: v ? v.data.prf : state.encomenda.prf });
        if (cargas) {
            dataAPICargas.setData({ rows: cargas, total: cargas.length });
        }
        return cargas;
    }

    const next = async (item, cargas) => {
        updateState(draft => {
            if (item && state.step === 0) {
                draft.encomenda = item;
                draft.step = ((cargas && cargas.length > 0) ? 2 : 1);
            } else {
                draft.step = 2;
                if (cargas){
                    dataAPICargas.setData({ rows: cargas, total: cargas.length });
                }
            }
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = async (v = null) => {
        if (v === 0) {
            dataAPICargas.clearData();
            form.resetFields();
            clearState();
        } else if (v === 2) {
            await _loadCargas();
        }
        updateState(draft => {
            if (v === 0) {
                draft.encomenda = null;
            }
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const clearState = () => {
        updateState(draft => {
            draft.artigos = [];
            draft.encomenda = null;
            draft.maxStep = null;
            draft.step = 0;
            draft.transporte = null;
        });
    }

    const onStepChange = (value) => {
        if (value > 1 && dataAPICargas.getLength() === 0) {
            return;
        }
        prev(value);
    }

    const onSaveList = async () => {
        submitting.trigger();
        let response = null;
        try {
            const _values = form.getFieldsValue(true);
            const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
            let { errors, warnings, value, ...status } = getStatus(v);
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            console.log("aaa", status.fieldStatus, _values)
            console.log(state);
            if (errors === 0) {
                const dt = {
                    cliente: state.encomenda.cliente,
                    cliente_abr: state.encomenda.cliente_abr,
                    prf: state.encomenda.prf,
                    eef: state.encomenda.eef,
                    estado: 'P', //PRE-PICKING
                    sqm: 0,
                    metros: 0,
                    num_paletes: _values.paletes,
                    num_paletes_actual: 0,
                    artigos: _values.artigos.map(i => state.encomenda.details[i].artigo_cod).filter((value, index, self) => self.indexOf(value) === index),
                    tipo: _values.transporte
                }
                response = await fetchPost({ url: `${API_URL}/cargas/sql/`, parameters: { method: "CreateCarga", values: dt } });
                if (response && response?.data?.status !== "error") {
                    if (response.data?.data) {
                        next(null,response.data?.data);
                        // updateState(draft => {
                        //     draft.report = response.data.data;
                        //     draft.palete = response.data.palete;
                        //     draft.paleteOk = 1;
                        //     draft.bobinesOk = draft.report[0].isok;
                        // });
                    } else {
                        openNotification(response?.data?.status, 'top', "Notificação", "Erro ao registar o Pré-Picking!", null);
                    }
                } else {
                    openNotification("error", 'top', "Notificação", response?.data?.title, null);
                }
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
    }

    const columns = [
        ...(true) ? [{ name: 'prf', header: 'Prf', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: true, defaultWidth: 140, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.prf}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'eef', header: 'Encomenda', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.eef}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'num_carga', header: 'Num.', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center", render: ({ data, cellProps }) => <RightAlign style={{ fontWeight: "700" }}>{data?.num_carga}</RightAlign> }] : [],
        ...(true) ? [{ name: 'timestamp', header: 'Data', filter: { show: false, alias: "data", type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.timestamp} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'tipo', header: 'Tipo', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.tipo}</LeftAlign> }] : [],
        ...(true) ? [{ name: "npaletes", header: "Paletes", filter: { show: false, type: "number", alias: "num_paletes_actual", field: { style: { width: "70px" } } }, defaultWidth: 100, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{String(data.npaletes).padStart(2, '0')}/{String(data.num_paletes).padStart(2, '0')}</LeftAlign> }] : [],
        ...(true) ? [{ name: "perc_nbobines_emendas", header: "%Emendas", filter: { show: false, type: "number" }, defaultWidth: 100, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <RightAlign style={{}} unit="%">{data.perc_nbobines_emendas}</RightAlign> }] : [],
        ...(true) ? [{ name: "area_real", header: "Área", filter: { show: false, type: "number" }, defaultWidth: 100, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <RightAlign style={{}} unit="m2">{data.area_real}</RightAlign> }] : [],
        ...(true) ? [{ name: 'cliente', header: 'Cliente', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: false, minWidth: 180, flex: 1, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.cliente}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'artigos', header: 'Artigos', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: false, minWidth: 180, flex: 1, headerAlign: "center", render: ({ data, cellProps }) => <ArrayColumn style={{margin:"0px 5px"}} cellProps={cellProps} value={json(data.artigos)} distinct /> }] : []
    ];

    return (
        <>
            {(load && !state.encomenda) && <OpenOrdersChoose
                title={title}
                onFilterChange={onFilterChange} onSelect={onSelectionChange}
                defaultSort={[{ column: `t.data_create`, direction: "DESC" }]}
                defaultFilters={{}}
            />
            }
            {state.encomenda &&
                <ConfigProvider
                    theme={{
                        components: {
                            Segmented: {
                                itemSelectedBg: "#1890ff"
                            }
                        },
                    }}
                >
                    <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
                    <Container>
                        <Row>
                            <Col>
                                <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} /* style={{ flexDirection: "row" }} */ />
                            </Col>
                            <Col></Col>
                            <Col xs="content">
                                {(state.step == 1 && !submitting.state) && <Button
                                    onClick={onSaveList}
                                    type="primary"
                                    icon={<CheckOutlined />}
                                >Registar</Button>}
                            </Col>
                        </Row>
                        {state.step === 1 && <Row>
                            <Col style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                <FormContainer fluid id="fmpp" schema={schema} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} wrapFormItem={true} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                                    <FormNewPrePickingList fieldStatus={fieldStatus} updateState={updateState} state={state} form={form} />
                                </FormContainer>
                            </Col>
                        </Row>}
                        {state.step === 2 && <Row>
                            <Col>
                                <Table
                                    cellNavigation={false}
                                    offsetHeight={"250px"}
                                    dirty={false}
                                    loading={submitting.state}
                                    idProperty={dataAPICargas.getPrimaryKey()}
                                    local={true}
                                    settings={false}
                                    sortable={false}
                                    reorderColumns={false}
                                    showColumnMenuTool={false}
                                    loadOnInit={false}
                                    pagination={false}
                                    defaultLimit={20}
                                    columns={columns}
                                    dataAPI={dataAPICargas}
                                    moreFilters={false}
                                    toolbar={false}
                                />
                            </Col>
                        </Row>}
                    </Container>
                </ConfigProvider>
            }
        </>
    )

}