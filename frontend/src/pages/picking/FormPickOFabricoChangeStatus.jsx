import React, { useEffect, useState, useCallback, useRef, useContext, lazy, Suspense } from 'react';
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
import { API_URL, PALETES_WEIGH } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, CaretRightOutlined, PrinterOutlined, CaretDownOutlined, WarningFilled, CloseCircleFilled, CheckCircleFilled, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, FormPrint, printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";
import { FaStop, FaPlay, FaPause } from 'react-icons/fa';
import AggChoose from './AggChoose';
const FormFormulacao = lazy(() => import('../formulacao/FormFormulacao'));
const FormPickGranuladoOut = lazy(() => import('./FormPickGranuladoOut'));
const FormPickNonwovensOut = lazy(() => import('./FormPickNonwovensOut'));
const FormPickNonwovensIn = lazy(() => import('./FormPickNonwovensIn'));
const FormCortes = lazy(() => import('./FormCortes'));


//const title = "";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<ToolbarTitle id={auth?.user} description={`${title}/${subTitle}`} details={<span style={{ fontSize: "16px", marginLeft: "135px" }}>{subTitle}</span>}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadOrdensFabrico = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id }, sort: [], parameters: { method: "OrdensFabricoInProduction" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

const checkInitProduction = async ({ cs_id }, signal) => {
    const { data: { data } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, sort: [], parameters: { method: "CheckInitProduction", cs_id }, signal });
    if (data) {
        return data;
    }
    return [];
}

const steps = [
    {
        title: 'Ordens'
    }, {
        title: 'Formulação'
    }, {
        title: 'Doseadores'
    }, {
        title: 'Saída de Granulado'
    }, {
        title: 'Saída Nonwovens'
    }, {
        title: 'Entrada Nonwovens'
    }, {
        title: 'Cortes'
    }, {
        title: 'Confirmar'
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

// const OrdensFabricoList = ({ openNotification, next, onChangeStatus, ...props }) => {
//     const inputParameters = useRef({});
//     const submitting = useSubmitting(true);
//     const defaultFilters = {};
//     const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
//     const defaultParameters = {};

//     const [items, setItems] = useState();
//     const [allowInit, setAllowInit] = useState(true);

//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal, init: true });
//         return (() => controller.abort());
//     }, []);



//     const loadData = async ({ signal, init = false } = {}) => {
//         submitting.trigger();
//         if (init) {
//             const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
//             inputParameters.current = { ...paramsIn };
//         }
//         const _items = await loadOrdensFabrico({}, signal);
//         console.log(_items)
//         const groupData = _items.reduce((grouped, item) => {
//             const { agg_cod, ...rest } = item;
//             if (!grouped[agg_cod]) {
//                 grouped[agg_cod] = [];
//             }
//             grouped[agg_cod].push(rest);
//             return grouped;
//         }, {});
//         const _groupArray = Object.entries(groupData).map(([agg_cod, items]) => ({ agg_cod, items }));
//         console.log(_groupArray);
//         setAllowInit(_items.filter(v => v.ofabrico_status === 3).length >= 1 ? false : true);
//         setItems(_groupArray);

//         submitting.end();
//     }

//     const onChange = async (item, status) => {
//         const ret = await onChangeStatus(item, status);
//         if (ret) {
//             loadData({ init: true });
//         }
//     }

//     return (<YScroll>

//         <List
//             size="small"
//             itemLayout="horizontal"
//             dataSource={items}
//             renderItem={(item, index) => (
//                 <List.Item
//                     actions={[
//                         ...([1, 2].includes(item.items[0].ofabrico_status) && allowInit) ? [<Button type="primary" onClick={() => onChange(item.items[0], 3)} icon={<FaPlay size={12} />}>Iniciar Produção</Button>] : [],
//                         ...[3].includes(item.items[0].ofabrico_status) ? [<Button style={{ background: "orange" }} onClick={() => onChange(item.items[0], 1)} icon={<FaPause size={12} />}>Suspender Produção</Button>] : [],
//                         ...[3].includes(item.items[0].ofabrico_status) ? [<Button type='primary' onClick={() => onChange(item.items[0], 9)} danger icon={<FaStop size={12} />}>Finalizar Produção</Button>] : []
//                     ]}
//                     /* onClick={() => next(item)} */>
//                     <List.Item.Meta
//                         // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
//                         //     <OFabricoStatus data={item} cellProps={{}} />
//                         // </div>}
//                         title={<div>{item.agg_cod}<OFabricoStatus data={item.items[0]} cellProps={{}} /></div>}
//                         description={
//                             <>
//                                 {item.items.map(v => {
//                                     return (
//                                         <div key={v.ofid}>
//                                             <div style={{ fontWeight: 900, fontSize: "14px", color: "#000" }}>{v.ofid}</div>
//                                             <div style={{ fontSize: "14px", color: "#000" }}>{v.cliente_nome}</div>
//                                             <div><span>{v.item_cod}</span><span style={{ fontWeight: 700, marginLeft: "10px" }}>{v.artigo_des}</span></div>
//                                         </div>
//                                     );
//                                 })}
//                             </>
//                         }
//                     />
//                 </List.Item>
//             )}
//         />

//     </YScroll>);
// }

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });
    const [title, setTitle] = useState("Ordens de Fabrico");
    const [subTitle, setSubTitle] = useState("Gerir Estados");

    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });

    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: null,
        pos: null,
        value: null,
        report: null,
        errors: 1,
        warnings: 0
    });
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                // case "errors": return <Errors parameters={modalParameters.parameters} />;
                // case "print": return <FormPrint {...modalParameters.parameters} printer={modalParameters.parameters?.printers && modalParameters.parameters?.printers[0]?.value} />;
            }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    useEffect(() => {
        setTitle(`Ordens de Fabrico`);
        setSubTitle(`Gerir Estados`);
    }, []);

    useEffect(() => {
        if (state.step == 7) {
            (async () => {
                const _rep = await checkInitProduction({ cs_id: state.pos.cs_id });
                let errors = 0;
                let warnings = 0;
                for (const v of _rep) {
                    switch (v.type_data) {
                        case "cortes":
                            errors = errors + (v.chck_cortes == 0 ? 0 : 1);
                            break;
                        case "formulacao":
                            errors = errors + (v.chck_dosers == 0 ? 0 : 1);
                            errors = errors + (v.chck_cubas == 0 ? 0 : 1);
                            errors = errors + (v.chck_arranques / v.n == 100 ? 0 : 1);
                            break;
                        case "granulado":
                            warnings = warnings + (v.arranque !== null ? 0 : 1);
                            warnings = warnings + (v.n_lote !== null ? 0 : 1);
                            break;
                    }
                }
                updateState(draft => {
                    draft.errors = errors;
                    draft.warnings = warnings;
                    draft.report = _rep;
                });
            })();
        } else if (state.report !== null) {
            updateState(draft => {
                draft.report = null;
                draft.errors = 1;
                draft.warnings = 0;
            });
        }
    }, [state.step]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        inputParameters.current = { ...location?.state };
        window.history.replaceState({}, document.title, window.location.pathname);


        updateState(draft => {
            draft.step = 0;
            draft.maxStep = 0;
        });

        submitting.end();
    }

    const onChangeStatus = async (item, status) => {
        submitting.trigger();
        let response = null;
        let ret = false;
        try {
            const response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "ChangeStatus", status }, filter: { cs_id: item.cs_id } });
            if (response && response?.data?.status !== "error") {
                ret = true;
            } else {
                switch (status) {
                    case 1: openNotification(response?.data?.status, 'top', "Notificação", "Erro ao Suspender a Ordem de fabrico!", null); break;
                    case 3: openNotification(response?.data?.status, 'top', "Notificação", "Erro ao Iniciar a Ordem de fabrico! Verificar se os Cortes e/ou Formulação estão devidamente definidos.", null); break;
                    case 9: openNotification(response?.data?.status, 'top', "Notificação", "Erro ao Finalizar a produção!", null); break;
                }
                ret = false;
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            ret = false;
        };
        submitting.end();
        return ret;
    }

    const next = (item) => {
        updateState(draft => {
            if (state.step === 0) {
                draft.pos = item;
            }
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            if (v == 0) {
                draft.report = null;
                draft.errors = 1;
                draft.warnings = 0;
            }
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        if (value>0 && !state.pos){
            return;
        }
        if ((value > 0 && value === state.step + 1) || value < state.step) {
            prev(value);
        }
    }


    const onChange = async (item, status, load, initok = false) => {
        if (status !== 3) {
            setSubTitle(`Gerir Estados`);
            const ret = await onChangeStatus(item, status);
            if (ret) {
                load({ init: true });
            }
        } else if (status == 3 && initok) {
            const ret = await onChangeStatus(item, status);
            if (ret) {
                load({ init: true });
                prev(0);
            }
        }
        else {
            setSubTitle(`A Iniciar Produção...`);
            next(item);
        }
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
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} subTitle={subTitle} />
            <Container>
                <Row>
                    <Col>
                        <Row nogutter>
                            {!["delete"].includes(state.action) ?
                                <Col>
                                    <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} /* style={{ flexDirection: "row" }} */ />
                                </Col> :
                                <Col></Col>
                            }
                            <Col xs="content">
                                <Space>
                                    {(state.step > 0 && state.step !== 7 && !submitting.state) && <Button icon={<CaretRightOutlined />} onClick={() => next()} type="primary">Seguinte</Button>}
                                </Space>
                            </Col>
                        </Row>

                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row>
                                        {state.step == 0 && <Col><AggChoose openNotification={openNotification} actionsContent={(item, index, load, allowInit) =>
                                            [
                                                ...([1, 2].includes(item.items[0].ofabrico_status) && allowInit) ? [<Button key={`B1-${index}`} type="primary" onClick={() => onChange(item.items[0], 3, load)} icon={<FaPlay size={12} />}>Iniciar Produção</Button>] : [],
                                                ...[3].includes(item.items[0].ofabrico_status) ? [<Button key={`B2-${index}`} style={{ background: "orange" }} onClick={() => onChange(item.items[0], 1, load)} icon={<FaPause size={12} />}>Suspender Produção</Button>] : [],
                                                ...[3].includes(item.items[0].ofabrico_status) ? [<Button key={`B3-${index}`} type='primary' onClick={() => onChange(item.items[0], 9, load)} danger icon={<FaStop size={12} />}>Finalizar Produção</Button>] : []
                                            ]
                                        } /* onChangeStatus={onChangeStatus} */ /></Col>}
                                        {state.step == 1 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <FormFormulacao noHeader={true} setFormTitle={true} parameters={{ cs_id: state.pos.cs_id, type: "formulacao_formulation_change" }} />
                                            </YScroll>
                                        </Col>}
                                        {state.step == 2 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <Suspense fallback={<Spin />}><FormFormulacao noHeader={true} setFormTitle={true} parameters={{ cs_id: state.pos.cs_id, type: "formulacao_dosers_change" }} /></Suspense>
                                            </YScroll>
                                        </Col>}
                                        {state.step == 3 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <Suspense fallback={<Spin />}><FormPickGranuladoOut showHistory={false} parameters={{ cs_id: state.pos.cs_id }} /></Suspense>
                                            </YScroll>
                                        </Col>}
                                        {state.step == 4 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <Suspense fallback={<Spin />}><FormPickNonwovensOut showHistory={false} /></Suspense>
                                            </YScroll>
                                        </Col>}
                                        {state.step == 5 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <Suspense fallback={<Spin />}><FormPickNonwovensIn showHistory={false} /></Suspense>
                                            </YScroll>
                                        </Col>}
                                        {state.step == 6 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <Suspense fallback={<Spin />}><FormCortes noHeader={true} setFormTitle={true} parameters={{ agg_of_id: state.pos.agg_id, cs_id: state.pos.cs_id, type: "cortes" }} /></Suspense>
                                            </YScroll>
                                        </Col>}
                                        {state.step == 7 && <Col style={{ textAlign: "center" }}>
                                            <YScroll maxHeight={"80vh"}>

                                                {state.report &&
                                                    <List
                                                        size="small"
                                                        itemLayout="horizontal"
                                                        dataSource={state.report}
                                                        renderItem={(item, index) => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    avatar={
                                                                        <div style={{ width: "180px", textAlign: "center" }}>
                                                                            {(item.type_data == "cortes") && <div>
                                                                                <div style={{ fontWeight: 700, fontSize: "14px" }}>Cortes</div>
                                                                                {(item.chck_cortes > 0) && <CloseCircleFilled style={{ color: "red", fontSize: "18px" }} />}
                                                                                {(item.chck_cortes == 0) && <CheckCircleFilled style={{ color: "green", fontSize: "18px" }} />}
                                                                            </div>}
                                                                            {(item.type_data == "formulacao") && <div>
                                                                                <div style={{ fontWeight: 700, fontSize: "14px" }}>Formulação</div>
                                                                                {(item.chck_cubas > 0 || item.chck_dosers > 0 || (item.chck_arranques / item.n) !== 100) && <CloseCircleFilled style={{ color: "red", fontSize: "18px" }} />}
                                                                                {(item.chck_cubas == 0 || item.chck_dosers == 0 || (item.chck_arranques / item.n) == 100) && <CheckCircleFilled style={{ color: "green", fontSize: "18px" }} />}
                                                                            </div>}
                                                                            {(item.type_data == "granulado") && <div>
                                                                                <div style={{ fontWeight: 700, fontSize: "14px" }}>Granulado</div>
                                                                                {(item.arranque == null || item.n_lote == null) && <WarningFilled style={{ color: "orange", fontSize: "18px" }} />}
                                                                                {(item.arranque !== null && item.n_lote !== null) && <CheckCircleFilled style={{ color: "green", fontSize: "18px" }} />}
                                                                            </div>}
                                                                            {(item.type_data == "nonwovens") && <div><div style={{ fontWeight: 700, fontSize: "14px" }}>Nonwovens</div></div>}
                                                                        </div>
                                                                    }
                                                                    title={
                                                                        <>
                                                                            {item.type_data == "granulado" && <>
                                                                                {/* <div style={{ textAlign: "left" }}>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div> */}
                                                                            </>}
                                                                            {item.type_data == "cortes" && <></>}
                                                                            {item.type_data == "formulacao" && <></>}
                                                                        </>
                                                                    }
                                                                    description={
                                                                        <>

                                                                            {item.type_data == "nonwovens" && <></>}
                                                                            {item.type_data == "granulado" &&
                                                                                <>
                                                                                    <div style={{ display: "Flex" }}>
                                                                                        <>
                                                                                            {(item.arranque == null) && <Alert banner style={{ width: "100%", textAlign: "left" }}
                                                                                                message={
                                                                                                    <>
                                                                                                        <div style={{ textAlign: "left" }}>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>
                                                                                                        <div style={{ display: "flex" }}>
                                                                                                            <div style={{ width: "70px", maxWidth: "80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                                                <Cuba style={{ fontSize: "12px"/* , lineHeight: 1.2 */ }} value={item.cuba} />
                                                                                                                <div style={{ fontWeight: 700 }}>{item?.dosers}</div>
                                                                                                            </div>
                                                                                                            <div style={{ textAlign: "left" }}>{item?.arranque ? <span>{item.arranque}%</span> : <span></span>}<span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>
                                                                                                        </div>
                                                                                                    </>
                                                                                                }
                                                                                                description={<ul style={{ fontWeight: 900, fontSize: "14px" }}>
                                                                                                    <li>O artigo não faz parte da formulação.</li>
                                                                                                    <li>A cuba/doseador(es), para este artigo, não estão corretamente atribuídos.</li>
                                                                                                </ul>}
                                                                                                type="warning"
                                                                                                showIcon
                                                                                            />}
                                                                                            {(item.n_lote == null) &&

                                                                                                <Alert banner style={{ width: "100%", textAlign: "left" }}
                                                                                                    message={
                                                                                                        <>
                                                                                                            <div style={{ textAlign: "left" }}>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>
                                                                                                            <div style={{ display: "flex" }}>
                                                                                                                <div style={{ width: "70px", maxWidth: "80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                                                    <Cuba style={{ fontSize: "12px"/* , lineHeight: 1.2 */ }} value={item.cuba} />
                                                                                                                    <div style={{ fontWeight: 700 }}>{item?.dosers}</div>
                                                                                                                </div>
                                                                                                                <div style={{ textAlign: "left" }}>{item?.arranque ? <span>{item.arranque}%</span> : <span></span>}<span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>
                                                                                                            </div>
                                                                                                        </>
                                                                                                    }
                                                                                                    description={
                                                                                                        <ul style={{ fontWeight: 900, fontSize: "14px" }}>
                                                                                                            <li>O artigo faz parte da formulação e não se encontra em linha.</li>
                                                                                                            <li>A cuba/doseador(es), para este artigo, não estão corretamente atribuídos.</li>
                                                                                                        </ul>
                                                                                                    }
                                                                                                    type="warning"
                                                                                                    showIcon
                                                                                                />}
                                                                                        </>
                                                                                    </div>
                                                                                </>
                                                                            }
                                                                            {item.type_data == "cortes" && <></>}
                                                                            {item.type_data == "formulacao" && <div>
                                                                                <div style={{ display: "flex" }}>
                                                                                    <div style={{ width: "150px", textAlign: "center" }}>Cubas definidas</div>
                                                                                    <div style={{ width: "150px", textAlign: "center" }}>Doseadores definidos</div>
                                                                                    <div style={{ width: "150px", textAlign: "center" }}>Percentagens</div>
                                                                                </div>
                                                                                <div style={{ display: "flex" }}>
                                                                                    <div style={{ width: "150px", textAlign: "center" }}>
                                                                                        {item.chck_cubas > 0 && <CloseCircleFilled style={{ color: "red", fontSize: "18px" }} />}
                                                                                        {item.chck_cubas == 0 && <CheckCircleFilled style={{ color: "green", fontSize: "18px" }} />}
                                                                                    </div>
                                                                                    <div style={{ width: "150px", textAlign: "center" }}>
                                                                                        {item.chck_dosers > 0 && <CloseCircleFilled style={{ color: "red", fontSize: "18px" }} />}
                                                                                        {item.chck_dosers == 0 && <CheckCircleFilled style={{ color: "green", fontSize: "18px" }} />}
                                                                                    </div>
                                                                                    <div style={{ width: "150px", textAlign: "center" }}>
                                                                                        {(item.chck_arranques / item.n) !== 100 && <CloseCircleFilled style={{ color: "red", fontSize: "18px" }} />}
                                                                                        {(item.chck_arranques / item.n) == 100 && <CheckCircleFilled style={{ color: "green", fontSize: "18px" }} />}
                                                                                    </div>
                                                                                </div>


                                                                            </div>}
                                                                        </>
                                                                    }
                                                                />
                                                            </List.Item>
                                                        )}
                                                    />}
                                            </YScroll>
                                            {(state.errors === 0 && !submitting.state) && <Button icon={<FaPlay size={12} />} onClick={() => onChange(state.pos, 3, loadData, true)} type="primary">Iniciar Produção</Button>}
                                        </Col>}
                                        {/*{(state.step == 2 ) && <Col>
                                            <Col style={{}}>
                                                <PickBobines state={state} updateState={updateState} next={next} cancel={_cancelPalete} onClickError={onClickError} />
                                            </Col>
                                        </Col>}
                                        {state.step == 3 && <Col>
                                            <Col style={{}}>
                                                <FormContainer id="fmw" schema={schemaW} loading={submitting.state} wrapForm={true} form={form_W} fieldStatus={fieldW_Status} setFieldStatus={setFieldW_Status} wrapFormItem={true} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                                                    <WeighPalete state={state} updateState={updateState} next={next} cancel={_cancelPalete} form={form_W} fieldStatus={fieldW_Status} />
                                                    <PickBobines disabled state={state} updateState={updateState} next={next} cancel={_cancelPalete} />
                                                </FormContainer>
                                            </Col>
                                        </Col>}
                                        {(state.step == 4 && state.palete) && <Col>
                                            <Col style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <div style={{ fontSize: "22px", fontWeight: 900 }}>{state.palete.nome}</div>
                                                <Button onClick={onPrint} icon={<PrinterOutlined />}>Imprimir Etiqueta</Button>
                                                <PickBobines disabled noStatus state={state} updateState={updateState} next={next} cancel={_cancelPalete} />
                                            </Col>
                                        </Col>} */}
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Col >
                </Row >
            </Container >
        </ConfigProvider>
    )

}