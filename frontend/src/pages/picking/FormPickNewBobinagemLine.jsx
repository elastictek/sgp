import React, { useEffect, useState, useCallback, useRef, useContext, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, DoubleRightOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
import { dayjsValue } from 'utils/index';
import { ContentAgg, TitleAuditAgg } from "./AggChoose";
import { useForm } from 'antd/es/form/Form';
const FormCortesOrdem = React.lazy(() => import('../ordensfabrico/FormCortesOrdem'));

//const title = "";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadEventosWithoutBobinagem = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/eventos/sql/`, filter: {}, sort: [], parameters: { method: "GetEventosWithoutBobinagem" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}
export const loadAgg = async ({ t_stamp }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/eventos/sql/`, filter: { t_stamp }, sort: [], parameters: { method: "GetAuditCurrentSettingsRange" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

const steps = [
    {
        title: 'Eventos'
    }, {
        title: 'Ordens'
    }, {
        title: 'Bobinagem'
    }, {
        title: 'Validar'
    }
];

const ListItemBg = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    background:#f5f5f5;
    border:solid 1px #f0f0f0;
    margin:5px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

const ListItem = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

const TitleEvento = ({ item }) => {
    return (<Row style={{ fontWeight: 400 }} nogutter>
        <Col xs="content">
            <Row wrap='nowrap' style={{}} nogutter>
                <Col width={200} style={{ textAlign: "center" }}>Data do Evento (Registo)</Col>
                <Col width={300} style={{ textAlign: "center" }}>Evento Máquina (Intervalo)</Col>
            </Row>
            <Row wrap='nowrap' style={{ alignItems: "center" }} nogutter>
                <Col width={200} style={{ fontWeight: 900, fontSize: "16px", textAlign: "center" }}>{dayjsValue(item.t_stamp).format(DATETIME_FORMAT)}</Col>
                <Col width={300} style={{ textAlign: "center" }}>[ <span style={{ fontWeight: 900 }}>{dayjsValue(item.inicio_ts).format(DATETIME_FORMAT)}, {dayjsValue(item.fim_ts).format(DATETIME_FORMAT)}</span> ]</Col>
            </Row>
        </Col>
        <Col xs="content">
            <Row wrap='nowrap' style={{}} nogutter>
                <Col width={100} style={{ textAlign: "center" }}>Diâm.</Col>
                <Col width={80} style={{ textAlign: "center" }}>Peso</Col>
                <Col width={80} style={{ textAlign: "center" }}>Comp.</Col>
                <Col width={100} style={{ textAlign: "center" }}>Nw Inf.</Col>
                <Col width={100} style={{ textAlign: "center" }}>Nw Sup.</Col>
            </Row>
            <Row wrap='nowrap' style={{ alignItems: "center" }} nogutter>
                <Col width={100} style={{ textAlign: "center" }}><span style={{ fontWeight: 900 }}>{item.diametro}</span> mm</Col>
                <Col width={80} style={{ textAlign: "center" }}><span style={{ fontWeight: 900 }}>{item.peso.toFixed(0)}</span> kg</Col>
                <Col width={80} style={{ textAlign: "center" }}><span style={{ fontWeight: 900 }}>{item.metros}</span> m</Col>
                <Col width={100} style={{ textAlign: "center" }}><span style={{ fontWeight: 900 }}>{item.nw_inf}</span> m</Col>
                <Col width={100} style={{ textAlign: "center" }}><span style={{ fontWeight: 900 }}>{item.nw_sup}</span> m</Col>
            </Row>
        </Col>
    </Row>
    );
}

const ContentEvento = ({ item }) => {
    return (
        <div>
            {/* <div style={{ fontWeight: 900, fontSize: "14px", color: "#000" }}>{item.cliente_nome}</div>
            <div><span>{item.item_cod}</span><span style={{ fontWeight: 700, marginLeft: "10px" }}>{item.artigo_des}</span></div> */}
        </div>
    );
}

const EventosList = ({ openNotification, onSelect, ...props }) => {
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};

    const [items, setItems] = useState();

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadEventosWithoutBobinagem({}, signal);
        setItems(_items);
        submitting.end();
    }

    return (<YScroll>

        <List
            size="small"
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => (
                <ListItemBg onClick={() => onSelect(item)}>
                    <List.Item.Meta
                        // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        //     <OFabricoStatus data={item} cellProps={{}} />
                        // </div>}
                        title={<TitleEvento item={item} />}
                        description={<ContentEvento item={item} />}
                    />
                </ListItemBg>
            )}
        />

    </YScroll>);
}

const AggList = ({ openNotification, onSelect, next, evento, ...props }) => {
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const [items, setItems] = useState();

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadAgg({ t_stamp: dayjsValue(evento.t_stamp).format(DATETIME_FORMAT) }, signal);
        if (!_items) {
            setItems(null);
            next();
        } else {
            const groupData = _items.reduce((grouped, item) => {
                const { acs_id, ...rest } = item;
                if (!grouped[acs_id]) {
                    grouped[acs_id] = [];
                }
                grouped[acs_id].push(rest);
                return grouped;
            }, {});
            const _groupArray = Object.entries(groupData).map(([acs_id, items]) => ({ acs_id, items }));
            setItems(_groupArray);
        }
        submitting.end();
    }

    return (<YScroll>

        {items && <List
            size="small"
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => (
                <>
                    <ListItem onClick={() => onSelect(item)} /*  onClick={() => onClick(item, index, loadData, allowInit)} {...actions && { actions: actions(item, index, loadData, allowInit) }} */ >
                        <List.Item.Meta
                            // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            //     <OFabricoStatus data={item} cellProps={{}} />
                            // </div>}
                            title={<TitleAuditAgg item={item} />}
                            description={
                                <>
                                    <ContentAgg item={item} />
                                    <Suspense fallback={<></>}><FormCortesOrdem height="77px" parameters={{ cortesordem_id: item.items[0].cortesordem_id }} forInput={false} /></Suspense>
                                </>
                            }
                        />
                    </ListItem>
                </>)}
        />}

    </YScroll>);
}

const FormBobinagem = ({ submitting, form }) => {
    return (
        <FormContainer id="LAY-FB" fluid loading={submitting.state} wrapForm={true} form={form} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
            <Row style={{}} gutterWidth={10}>
                <Col width={110}><Field name="comp" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
                <Col width={110}><Field name="peso" label={{ enabled: true, text: "Peso" }}><InputNumber style={{ textAlign: "right" }} addonAfter="kg" /></Field></Col>
                <Col width={110}><Field name="diam" label={{ enabled: true, text: "Diâmetro" }}><InputNumber style={{ textAlign: "right" }} addonAfter="mm" /></Field></Col>
            </Row>
            <Row style={{}} gutterWidth={10}><Col><HorizontalRule title="Nonwoven Superior" hr={false} /></Col></Row>
            <Row style={{}} gutterWidth={10}>
                <Col width={110}><Field name="nwsup" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
            </Row>
            <Row style={{}} gutterWidth={10}><Col><HorizontalRule title="Nonwoven Inferior" hr={false} /></Col></Row>
            <Row style={{}} gutterWidth={10}>
                <Col width={110}><Field name="nwinf" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
            </Row>
        </FormContainer>
    );
}


export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const [form] = useForm();
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });
    const [title, setTitle] = useState("Nova Bobinagem");

    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: null,
        evento: null,
        agg: null,
        bobinagem: null
    });
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
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

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {
            const _acs_id = state.agg ? state.agg.acs_id : null;
            response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, parameters: { method: "NewBobinagem", ...{ ig_id: state.evento.id, acs_id: _acs_id } } });
            if (response && response?.data?.status !== "error") {
                updateState(draft => {
                    draft.agg = null;
                    draft.evento = null;
                    draft.step = 3;
                    draft.bobinagem = response.data.bobinagem;
                });
            } else {
                openNotification("error", 'top', "Notificação", response?.data?.title, null);
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
    }

    const next = (item) => {
        if (state.step == 0) {
            form.setFieldsValue({ comp: item.metros, peso: item.peso, diam: item.diametro, nwinf: item.nw_inf, nwsup: item.nw_sup });
        }
        updateState(draft => {
            if (state.step === 0) {
                draft.evento = item;
            }
            if (state.step === 1) {
                draft.agg = item;
            }
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        if (state.bobinagem) {
            return;
        }
        if (value == 1 && !state.agg) {
            return;
        }
        prev(value);

    }

    const onSelectEvento = (item) => {
        next(item);
    }
    const onSelectAgg = (item) => {
        next(item);
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
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container>
                <Row>
                    <Col>
                        <Row nogutter>

                            <Col>
                                <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} /* style={{ flexDirection: "row" }} */ />
                            </Col>
                            <Col xs="content">
                                <Space>
                                    {(state.step == 2 && state.evento && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                    >Submeter</Button>}
                                </Space>
                            </Col>
                        </Row>
                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    {(state.step == 2 && state.agg) &&
                                        <><Row style={{ marginBottom: "10px", paddingLeft: "20px" }}>
                                            <Col style={{ lineHeight: 1.8 }}>
                                                <TitleAuditAgg item={state.agg} />
                                                <ContentAgg item={state.agg} />
                                            </Col>
                                        </Row>
                                            <Row><Col><HorizontalRule /></Col></Row>
                                        </>
                                    }
                                    <Row>
                                        {state.step == 0 && <Col><EventosList openNotification={openNotification} onSelect={onSelectEvento} /></Col>}
                                        {(state.step == 1 && state.evento) && <Col>
                                            <div style={{ textAlign: "right", marginBottom: "5px" }}><Button onClick={() => next()} type="primary" icon={<DoubleRightOutlined />}>Ignorar</Button></div>
                                            <AggList openNotification={openNotification} onSelect={onSelectAgg} evento={state.evento} next={next} />
                                        </Col>}
                                        {state.step == 2 && <Col><FormBobinagem openNotification={openNotification} form={form} submitting={submitting} /></Col>}
                                        {(state.step == 3 && state.bobinagem) && <Col>
                                            <Col style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <div style={{ fontSize: "22px", fontWeight: 900, marginBottom: "10px" }}>{state.bobinagem.nome}</div>
                                                <Button onClick={() => {
                                                    navigate("/app/bobinagens/validatebobinagem", { state: { bobinagem_id: state.bobinagem.id } });
                                                }}>Validar Bobinagem</Button>
                                            </Col>
                                        </Col>}

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