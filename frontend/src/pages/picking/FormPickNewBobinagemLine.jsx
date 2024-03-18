import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
import { parseFilter, useDataAPI } from "utils/useDataAPIV4";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
import { DoubleRightOutlined, ExclamationOutlined, WarningOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { useImmer } from "use-immer";
import { dayjsValue } from 'utils/index';
import { useForm } from 'antd/es/form/Form';
import TableGridSelect from 'components/TableV4/TableGridSelect';
import Page, { Field, Container as FormContainer,HorizontalRule } from 'components/FormFields/FormsV2';
import { ActionButton, AuditCsOperation, ClienteArtigo, Cortes, CortesOrdem, Encomenda, FromTo, OrdemFabricoStatus, Value } from 'components/TableV4/TableColumnsV4';
import { refreshDataSource } from 'components/TableV4/TableV4';
import { json } from 'utils/object';

//const title = "";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
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

const EventosList = ({ onSelect, noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], permission, style, isRowSelectable, gridRef, ...props }) => {
    const submitting = useSubmitting(true);
    const location = useLocation();
    const navigate = useNavigate();
    const _gridRef = gridRef || useRef(); //not required
    const defaultParameters = { method: "GetEventosWithoutBobinagem" };
    const baseFilters = _baseFilters ? _baseFilters : {
        ...parseFilter("ib.ignore", `==0`, { type: "number" })
    };
    const dataAPI = useDataAPI({ /* fnPostProcess: (dt) => postProcess(dt, null), */ payload: { url: `${API_URL}/eventos/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, limit: 1000 }, baseFilter: baseFilters } });

    const cellParams = useCallback((params = {}) => {
        return { cellRendererParams: { ...params } };
    }, []);

    const onIgnore = async (v) => {
        submitting.trigger();
        const result = await dataAPI.safePost(`${API_URL}/eventos/sql/`, "IgnoreEvent", { filter: { id: v?.data?.id } });
        result.onSuccess(async (p) => { refreshDataSource(_gridRef.current.api); });
        result.onFail((p) => { });
        submitting.end();
        return result.success;
    }

    const columnDefs = useMemo(() => ({
        cols: [
            { field: 't_stamp', headerName: 'Data do Evento', minWidth: 160, ...cellParams(), cellRenderer: (params) => <Value datetime bold style={{ fontSize: "14px" }} params={params} /> },
            { field: 'fromto', headerName: 'Evento Máquina', width: 280, ...cellParams(), cellRenderer: (params) => <FromTo separator=" - " field={{ from: "inicio_ts", to: "fim_ts" }} datetime params={params} /> },
            { field: 'diametro', headerName: 'Diâmetro', width: 160, ...cellParams(), cellRenderer: (params) => <Value unit="mm" params={params} /> },
            { field: 'peso', headerName: 'Peso', width: 160, ...cellParams(), cellRenderer: (params) => <Value fixed={2} unit="kg" params={params} /> },
            { field: 'metros', headerName: 'Comprimento', width: 160, ...cellParams(), cellRenderer: (params) => <Value unit="m" params={params} /> },
            { field: 'nw_inf', headerName: 'Nw Inf.', width: 160, ...cellParams(), cellRenderer: (params) => <Value unit="m" params={params} /> },
            { field: 'nw_sup', headerName: 'Nw Sup.', width: 160, ...cellParams(), cellRenderer: (params) => <Value unit="m" params={params} /> },
            { field: 'action', headerName: '', flex: 1, width: 100, ...cellParams(), cellRenderer: (params) => <ActionButton buttonProps={{ danger: true }} icon={<WarningOutlined />} text={<b>Ignorar</b>} onClick={() => onIgnore(params)} params={params} /> },

        ], timestamp: new Date()
    }), []);

    const filters = useMemo(() => ({ toolbar: [], more: [/* "@columns"*/], no: [...Object.keys(baseFilters)] }), []);

    const onSelectionChanged = (rows) => {
        if (typeof onSelect === "function") {
            onSelect(rows);
        }
    }
    const _isRowSelectable = (params) => {
        if (typeof isRowSelectable === "function") {
            return isRowSelectable(params);
        }
        return true;
    }

    return (
        <Page.Ready ready={permission?.isReady}>
            <TableGridSelect
                loading={submitting.state}
                domLayout={'autoHeight'}
                style={{ height: "auto", ...style }}
                gridRef={_gridRef}
                ignoreRowSelectionOnCells={["action"]}
                columnDefs={columnDefs}
                filters={filters}
                defaultSort={defaultSort}
                defaultColDefs={{ sortable: false }}
                defaultParameters={defaultParameters}
                dataAPI={dataAPI}
                onSelectionChanged={onSelectionChanged}
                isRowSelectable={_isRowSelectable}
                showTopToolbar={false}
                {...props}
            />
        </Page.Ready>
    );
}

const postProcess = async (dt) => {
    for (let [i, v] of dt.rows.entries()) {
        dt.rows[i]["ofs"] = json(dt.rows[i]["ofs"], []);
        dt.rows[i]["largura_json"] = json(json(dt.rows[i]["cortes"], {})?.largura_json, {});
        dt.rows[i]["largura_ordem"] = json(json(dt.rows[i]["cortesordem"], {})?.largura_ordem, []);
        dt.rows[i]["largura_util"] = dt.rows[i]["largura_ordem"].reduce((acc, curr) => parseInt(acc) + parseInt(curr), 0);
    }
    return dt;
};
const AggList = ({ onSelect, evento, noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], permission, style, isRowSelectable, gridRef, ...props }) => {
    const submitting = useSubmitting(true);
    const location = useLocation();
    const navigate = useNavigate();
    const _gridRef = gridRef || useRef(); //not required
    const defaultParameters = { method: "GetAuditCurrentSettingsRange" };
    const baseFilters = _baseFilters ? _baseFilters : {
        ...parseFilter("t_stamp", `${dayjsValue(evento.t_stamp).format(DATETIME_FORMAT)}`, { options: { assign: false, vmask: "(acs.`timestamp` between DATE_SUB({v}, interval 5 hour) and DATE_SUB({v}, interval -5 hour))" } })
    };
    const dataAPI = useDataAPI({ fnPostProcess: (dt) => postProcess(dt, null), payload: { url: `${API_URL}/eventos/sql/`, primaryKey: "acs_id", parameters: defaultParameters, pagination: { enabled: false, limit: 1000 }, baseFilter: baseFilters } });

    const cellParams = useCallback((params = {}) => {
        return { cellRendererParams: { ...params } };
    }, []);

    const columnDefs = useMemo(() => ({
        cols: [
            { field: 'timestamp', headerName: 'Data', width: 130, ...cellParams(), cellRenderer: (params) => <Value bold datetime outerStyle={{}} params={params} /> },
            { field: 'agg_cod', headerName: 'Agg', wrapText: true, autoHeight: true, width: 120, ...cellParams(), cellRenderer: (params) => <Value params={params} /> },
            { field: 'status', headerName: 'Estado', wrapText: true, autoHeight: true, width: 130, ...cellParams(), cellRenderer: (params) => <OrdemFabricoStatus field={{ status: "ofabrico_status", aggCod: null }} params={params} /> },
            { field: 'type_op', headerName: 'Evento', width: 140, ...cellParams(), cellRenderer: (params) => <AuditCsOperation outerStyle={{}} params={params} /> },
            { colId: "largura_util", field: 'largura_util', headerName: 'Lar. útil', ...cellParams(), width: 75, cellRenderer: (params) => <Value outerStyle={{}} params={params} /> },
            { colId: "largura_json", field: 'largura_json', headerName: 'Larguras', sortable: true, ...cellParams(), width: 220, cellRenderer: (params) => <Cortes outerStyle={{}} params={params} /> },
            {
                colId: "largura_ordem", wrapText: true, autoHeight: true, field: 'largura_ordem', headerName: 'Esquema', sortable: false, ...cellParams(), width: 250, flex: 1, cellRenderer: (params) => <div>
                    <CortesOrdem style={{ display: "flex", height: "100%", alignItems: "center" }} params={params} />
                    <div style={{ display: "flex" }}>
                        {params?.data?.ofs && params?.data?.ofs.map((v, i) => {
                            return (<Row key={`of-${params?.rowIndex}-${v?.of_id}`} style={{ margin: "4px" }}>
                                <Col xs="content">
                                    <Row><Col>
                                        <ClienteArtigo field={{ clienteCod: null, clienteNome: "cliente_nome", artigoCod: "artigo_cod", artigoDes: "artigo_des" }} params={{ ...params, data: v }} />
                                    </Col></Row>
                                    <Row><Col>
                                        <Encomenda field={{ ofCod: "of_cod", orderCod: "order_cod", prfCod: "prf_cod" }} params={{ ...params, data: v }} />
                                    </Col></Row>
                                </Col>
                            </Row>)
                        })}
                    </div>
                </div>
            }
        ], timestamp: new Date()
    }), []);

    const filters = useMemo(() => ({ toolbar: [], more: [/* "@columns"*/], no: [...Object.keys(baseFilters)] }), []);

    const onSelectionChanged = (rows) => {
        if (typeof onSelect === "function") {
            onSelect(rows);
        }
    }
    const _isRowSelectable = (params) => {
        if (typeof isRowSelectable === "function") {
            return isRowSelectable(params);
        }
        return true;
    }

    return (
        <Page.Ready ready={permission?.isReady}>
            <TableGridSelect
                loading={submitting.state}
                domLayout={'autoHeight'}
                style={{ height: "auto", ...style }}
                gridRef={_gridRef}
                ignoreRowSelectionOnCells={["action"]}
                columnDefs={columnDefs}
                filters={filters}
                defaultColDefs={{ sortable: false }}
                defaultSort={defaultSort}
                defaultParameters={defaultParameters}
                dataAPI={dataAPI}
                onSelectionChanged={onSelectionChanged}
                isRowSelectable={_isRowSelectable}
                showTopToolbar={false}
                {...props}
            />
        </Page.Ready>
    );

}

const Header = ({ data }) => {
    return (<Row style={{ display: "flex" }}>
        <Col xs="content">
            <div>
                <OrdemFabricoStatus field={{ status: "ofabrico_status", aggCod: "agg_cod" }} params={{ data }} />
            </div>
            <div>
                <Value value={data?.timestamp} datetime bold style={{ fontSize: "14px" }} params={{}} />
            </div>
        </Col>
        <Col>
            {data?.ofs && data?.ofs.map((v, i) => {
                return (<Row key={`ofh-${v?.of_id}`} style={{ margin: "4px" }}>
                    <Col xs="content">
                        <Row><Col>
                            <ClienteArtigo field={{ clienteCod: null, clienteNome: "cliente_nome", artigoCod: "artigo_cod", artigoDes: "artigo_des" }} params={{ data: v }} />
                        </Col></Row>
                        <Row><Col>
                            <Encomenda field={{ ofCod: "of_cod", orderCod: "order_cod", prfCod: "prf_cod" }} params={{ data: v }} />
                        </Col></Row>
                    </Col>
                </Row>)
            })}
        </Col>
    </Row>)
}

const FormBobinagem = ({ submitting, form }) => {
    return (
        <FormContainer fluid loading={submitting.state} wrapForm={true} form={form} wrapFormItem={true} forInput={false}>
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
        if (!state.evento && value>0){
            prev(0);
            return;
        }
        if ((value == 1 && !state.agg)) {
            return;
        }
        prev(value);

    }

    const onSelectEvento = (item) => {
        if (Array.isArray(item)) {
            next(item[0]);
        } else {
            next(item);
        }
    }
    const onSelectAgg = (item) => {
        if (Array.isArray(item)) {
            next(item[0]);
        } else {
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
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container fluid>
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
                                                <Header data={state.agg} />
                                                {/* <TitleAuditAgg item={state.agg} />
                                                <ContentAgg item={state.agg} /> */}
                                            </Col>
                                        </Row>
                                            <Row><Col><HorizontalRule /></Col></Row>
                                        </>
                                    }
                                    <Row>
                                        {state.step == 0 && <Col><EventosList permission={permission} onSelect={onSelectEvento} /></Col>}
                                        {(state.step == 1 && state.evento) && <Col>
                                            <div style={{ textAlign: "right", marginBottom: "5px" }}><Button onClick={() => next()} type="primary" icon={<DoubleRightOutlined />}>Ignorar</Button></div>
                                            {/* <AggList openNotification={openNotification} onSelect={onSelectAgg} evento={state.evento} next={next} /> */}
                                            <AggList evento={state.evento} permission={permission} onSelect={onSelectAgg} />
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