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
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll, dayjsValue } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
import { NonwovensLotes } from "components/EditorsV3";

//const title = "Nova Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, save }) => {
    return (<ToolbarTitle save={save} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadBobinagem = async ({ id, checkBobinesInPalete }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, filter: { fid: id }, sort: [], parameters: { method: "BobinagemLookup", checkBobinesInPalete }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}


const schema = (options = {}) => {
    return getSchema({
        diam: Joi.number().positive().label("Diâmetro").required(),
        comp: Joi.number().positive().label("Comprimento").required(),
        largura_bruta: Joi.number().positive().label("Largura Bruta").required(),
        nwinf: Joi.number().positive().label("Comprimento Nonwoven Inferior").required(),
        nwsup: Joi.number().positive().label("Comprimento Nonwoven Superior").required(),
        lote_nwinf: Joi.object().label("Lote de Nonwoven Inferior").required(),
        lote_nwsup: Joi.object().label("Lote de Nonwoven Superior").required()
    }, options).unknown(true);
}

const steps = [
    {
        title: 'Ordens'
    }, {
        title: 'Esquema'
    }, {
        title: 'Bobines'
    }, {
        title: 'Pesar'
    }, {
        title: 'Palete'
    },
];

const useStyles = createUseStyles({});

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });
    const [title, setTitle] = useState("Corrigir Bobinagem");

    const [formDirty, setFormDirty] = useState(false);
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();




    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: null,
        pos: null
    });
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "errors": return <Errors parameters={modalParameters.parameters} />;
                case "print": return <FormPrint {...modalParameters.parameters} printer={modalParameters.parameters?.printers && modalParameters.parameters?.printers[0]?.value} />;
            }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickError = (idx) => {
        setModalParameters({ content: "errors", type: "drawer", push: false, width: "90%", title: `Bobine ${state.report[idx].nome}`, parameters: { item: state.report[idx] } });
        showModal();
    }
    // const onPrint = () => {
    //     if (state.step == 4 && state.palete) {
    //         setModalParameters({
    //             width: "500px",
    //             height: "200px",
    //             content: "print", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiqueta</div>,
    //             parameters: {
    //                 url: `${API_URL}/print/sql/`, printers: [...printersList?.ARMAZEM, ...printersList?.PRODUCAO],
    //                 onComplete: onDownloadComplete,
    //                 parameters: {
    //                     method: "PrintPaleteEtiqueta",
    //                     id: state.palete_id,
    //                     palete_nome: state.palete.nome,
    //                     name: "ETIQUETAS-PALETE",
    //                     path: "ETIQUETAS/PALETE"
    //                 }
    //             }
    //         });
    //         showModal();
    //     }
    // };
    // const onDownloadComplete = async (response) => {
    //     const blob = new Blob([response.data], { type: 'application/pdf' });
    //     const pdfUrl = URL.createObjectURL(blob);
    //     window.open(pdfUrl, '_blank');
    //     //downloadFile(response.data,"etiqueta_nw.pdf");
    // }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    // useEffect(() => {
    //     if (state.step === 2 && state.bobinesOk === 1) {
    //         next();
    //     }
    //     if (state.step === 3 && state.paleteOk === 1) {
    //         next();
    //     }
    // }, [state.bobinesOk, state.paleteOk]);

    // useEffect(() => {
    //     if (state.action == "redo") {
    //         setTitle(`Refazer Palete ${state.palete_nome}`)
    //     } else if (state.action == "weigh") {
    //         setTitle(`Pesar Palete ${state.palete_nome}`)
    //     } else if (state.action == "delete") {
    //         setTitle(`Apagar Palete ${state.palete_nome}`)
    //     } else {
    //         setTitle(`Nova Palete`)
    //         if (state.step > 1) {
    //             prev(0);
    //         }
    //     }
    // }, [state.palete_id]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, location?.state, null);
        inputParameters.current = { ...paramsIn };
        // window.history.replaceState({}, document.title, window.location.pathname);
        const _bobinagem = await loadBobinagem({ id: inputParameters.current?.bobinagem_id, checkBobinesInPalete: true });
        const _bm = (_bobinagem && _bobinagem.length > 0) ? _bobinagem[0] : null;
        form.setFieldsValue((_bm) ? {
            ..._bobinagem[0],
            lote_nwinf: { n_lote: _bobinagem[0].lotenwinf, vcr_num: _bobinagem[0].vcr_num_inf, tiponw: _bobinagem[0].tiponwinf },
            lote_nwsup: { n_lote: _bobinagem[0].lotenwsup, vcr_num: _bobinagem[0].vcr_num_sup, tiponw: _bobinagem[0].tiponwsup }
        } : null);
        if (_bm) {
            setTitle(`Corrigir Bobinagem ${_bm.nome}`);
        }
        updateState(draft => {
            draft.step = 0;
            draft.maxStep = 0;
            draft.pos = (_bm) ? _bobinagem[0] : null;
        });
        submitting.end();
    }

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {
            const _values = form.getFieldsValue(true);
            const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
            let { errors, warnings, value, ...status } = getStatus(v);
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            if (errors === 0) {
                response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, parameters: { method: "FixBobinagem", values: { ..._values } } });
                if (response && response?.data?.status !== "error") {
                    openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
                    navigate("/app/picking/fixbobinagem");
                } else {
                    openNotification("error", 'top', "Notificação", response?.data?.title, null);
                }
            }
        } catch (e) {
            openNotification("error", 'top', "Notificação", <YScroll>{e.message}</YScroll>, null);
            //Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
    }
    const next = (item) => {
        updateState(draft => {
            if (state.step === 0) {
                draft.pos = item;
            }
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        prev(value);
    }

    const onValuesChange = (changedValues, values) => {
        setFormDirty(true);
        if ("lote_nwinf" in changedValues) {
            const _v = changedValues["lote_nwinf"];
            form.setFieldValue("lote_nwinf", { n_lote: _v.n_lote, vcr_num: _v.vcr_num, tiponw: _v.artigo_des });
        }
        if ("lote_nwsup" in changedValues) {
            const _v = changedValues["lote_nwsup"];
            form.setFieldValue("lote_nwsup", { n_lote: _v.n_lote, vcr_num: _v.vcr_num, tiponw: _v.artigo_des });
        }
    }


    return (
        <>
            <TitleForm save={false} auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container>
                <Row>
                    <Col>
                        <Row nogutter>
                            <Col></Col>
                            <Col xs="content">
                                <Space>
                                    <Button disabled={!(state.step == 0 && formDirty && !submitting.state)} onClick={onSave} type="primary">Submeter</Button>
                                </Space>
                            </Col>
                        </Row>
                        {true && <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row>
                                        {(state.step == 0) && <Col>

                                            <FormContainer id="LAY-FB" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onSave} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                                                <Row style={{}} gutterWidth={10}>
                                                    <Col width={110}><Field name="comp" forInput={state.pos?.nbobines_in_paletes === 0} label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
                                                    <Col width={110}><Field name="largura_bruta" forInput={state.pos?.nbobines_in_paletes === 0} label={{ enabled: true, text: "Largura Bruta" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
                                                    <Col width={110}><Field name="diam" forInput={state.pos?.nbobines_in_paletes === 0} label={{ enabled: true, text: "Diâmetro" }}><InputNumber style={{ textAlign: "right" }} addonAfter="mm" /></Field></Col>
                                                </Row>
                                                <Row style={{}} gutterWidth={10}><Col><HorizontalRule title="Nonwoven Superior" hr={false} /></Col></Row>
                                                <Row style={{}} gutterWidth={10}>
                                                    <Col width={110}><Field name="nwsup" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
                                                    <Col width={310}><Field name="lote_nwsup" label={{ enabled: true, text: "Lote" }}>
                                                        <NonwovensLotes
                                                            filters={{ type: 1, queue: 1, t_stamp: `<${dayjsValue(state.pos.timestamp).format(DATETIME_FORMAT)}`, custom_t_stamp_out: dayjsValue(state.pos.timestamp).format(DATETIME_FORMAT) }}
                                                            detailText={(v) => <span style={{ fontWeight: 700 }}>{v?.tiponw}</span>}
                                                        />
                                                    </Field></Col>
                                                </Row>
                                                <Row style={{}} gutterWidth={10}><Col><HorizontalRule title="Nonwoven Inferior" hr={false} /></Col></Row>
                                                <Row style={{}} gutterWidth={10}>
                                                    <Col width={110}><Field name="nwinf" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} addonAfter="m" /></Field></Col>
                                                    <Col width={310}><Field name="lote_nwinf" label={{ enabled: true, text: "Lote" }}>
                                                        <NonwovensLotes
                                                            filters={{ type: 0, queue: 1, t_stamp: `<${dayjsValue(state.pos.timestamp).format(DATETIME_FORMAT)}`, custom_t_stamp_out: dayjsValue(state.pos.timestamp).format(DATETIME_FORMAT) }}
                                                            detailText={(v) => <span style={{ fontWeight: 700 }}>{v?.tiponw}</span>}
                                                        />
                                                    </Field></Col>
                                                </Row>
                                            </FormContainer>
                                        </Col>}
                                        {(state.pos?.nbobines_in_palete > 0) && <Col>No</Col>}
                                        {(!state.pos && !submitting.state) && <Col><Alert message={<div>A bobinagem <span style={{ fontWeight: 700 }}>{inputParameters.current.bobinagem_nome}</span> não existe</div>} type="warning" /></Col>}
                                    </Row>
                                </Container>
                            </Col>
                        </Row>}
                    </Col >
                </Row >
            </Container >
        </>
    )

}