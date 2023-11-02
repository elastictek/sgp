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
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
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
import SvgSchema from "../paletes/paletizacao/SvgSchemaV2";

//const title = "Nova Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

// export const loadQuantity = async ({ value, artigo_cod }, signal) => {
//     const { data: { row } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { value, artigo_cod }, sort: [], parameters: { method: "GetGranuladoLoteQuantityV2" }, signal });
//     if (row && Object.keys(row).length > 0) {
//         return row;
//     }
//     return null;
// }

export const loadOrdensFabricoOpen = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { was_in_production: 1, id }, sort: [], parameters: { method: "OrdensFabricoOpen" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}
export const loadOrdensFabrico = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id }, sort: [], parameters: { method: "OrdensFabricoGet" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

export const loadBobines = async ({ palete_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, filter: { fpaleteid: palete_id }, sort: [{ column: "mb.posicao_palete", direction: "ASC" }], parameters: { method: "BobinesLookup" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
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

const ListItem = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

const TitleOF = ({ item }) => {
    return (<div><span style={{ fontSize: "14px" }}>{item.ofid}</span><OFabricoStatus data={item} cellProps={{}} /></div>);
}

const ContentOF = ({ item }) => {
    return (
        <div>
            <div style={{ fontWeight: 900, fontSize: "14px", color: "#000" }}>{item.cliente_nome}</div>
            <div><span>{item.item_cod}</span><span style={{ marginLeft: "10px" }}>{item.artigo_des?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")}</span></div>
        </div>
    );
}

const OrdensFabricoList = ({ openNotification, next, ...props }) => {
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
        const _items = await loadOrdensFabricoOpen({}, signal);
        setItems(_items);
        submitting.end();
    }

    return (<YScroll>

        <List
            size="small"
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => (
                <ListItem onClick={() => next(item)}>
                    <List.Item.Meta
                        // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        //     <OFabricoStatus data={item} cellProps={{}} />
                        // </div>}
                        title={<TitleOF item={item} />}
                        description={<ContentOF item={item} />}
                    />
                </ListItem>
            )}
        />

    </YScroll>);
}


const SelectPalete = ({ openNotification, next, data, onSelect, ...props }) => {
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

    }

    return (
        <YScroll>

            <SvgSchema reverse={true} data={json(json(data?.esquema).paletizacao)} onClick={onSelect} />

        </YScroll>);
}

const ListColumns = styled.div`
    column-count: ${(props) => props.columns};
    column-gap: 20px;
    @media (max-width: 800px) {
        column-count: 2;
      }
    @media (max-width: 700px) {
        column-count: 1;
      }
`;

const PickBobines = ({ state, updateState, next, cancel, disabled, noStatus, onClickError }) => {
    const inputRef = useRef();

    useEffect(() => {
        if (!disabled) {
            const timeout = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus({ cursor: 'all' });
                }
            }, 500);
            // /**TOREMOVE */
            // updateState(draft => {
            //     draft.picked = 7;
            //     draft.bobines = [{ lote: "20230720-10-14" }, { lote: "20230720-10-13" }, { lote: "20230720-10-12" }, { lote: "20230720-10-11" }, { lote: "20230720-10-10" }, { lote: "20230720-10-07" }, { lote: "20230720-10-06" }];
            //     draft.bobinesOk = 0;
            // });
            return (() => { clearTimeout(timeout); });
        }
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        //console.log("RRRRRRRRRRRRRR", json(json(data?.esquema).paletizacao));
    }

    const onInputOk = (v, idx, keyPressed) => {
        if (keyPressed) {

            if (keyPressed === 'Enter') {
                const inputs = document.querySelectorAll('[tabindex]');
                const nextInput = Array.from(inputs).find((el) => el.tabIndex === idx + 2);
                if (nextInput) {
                    nextInput.focus();
                }
            }

        }
        const _r = produce(state?.bobines, (draftArray) => {
            draftArray[idx].lote = v;
        });
        const pattern = /^\d{8}-\d{2,}-\d{2,}$/;
        const t1 = pattern.test(state.bobines[idx].lote);
        const t2 = pattern.test(v);
        const _picked = ((!t1 && !t2) || (t1 && t2)) ? state.picked : (t1 && !t2) ? state.picked - 1 : state.picked + 1;
        updateState(draft => {
            draft.picked = _picked;
            draft.bobines = _r;
            draft.bobinesOk = 0;
        });
    }

    return (
        <YScroll height="65vh" {...noStatus && { width: "300px" }}>
            <ListColumns columns={3}>
            <List
                size="small"
                itemLayout="horizontal"
                dataSource={state.bobines}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<div style={{ width: "30px" }}>{index + 1}</div>}
                            description={
                                <div style={{ display: "flex" }}>
                                    <div><Input disabled={disabled} {...index === 0 && { ref: inputRef }} tabIndex={index + 1} size='small' value={item.lote} onChange={(e) => onInputOk(e.target.value, index)} onKeyDown={(e) => onInputOk(e.target.value, index, e.key)} /></div>
                                    {(state.report && !noStatus) && <>
                                        <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", ...(state.report[index].isok == 0 && { cursor: "pointer" }), backgroundColor: state.report[index].isok == 1 ? "green" : "#ff4d4f" }} onClick={() => state.report[index].isok == 0 && onClickError(index)}></div>
                                    </>}
                                </div>}
                        />
                    </List.Item>
                )}
            />
            </ListColumns>
        </YScroll>);
}

const Errors = ({ parameters }) => {
    return (<Container fluid>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o artigo não corresponde ao da ordem de fabrico">Artigo</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.artigo_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o produto não corresponde ao da ordem de fabrico">Produto</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.produto_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a bobine não existe, foi reciclada ou o comprimento é igual a zero">Bobine</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.bobine_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o core não corresponde ao da ordem de fabrico">Core</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.core_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o diametro da bobine não está dentro dos limites establecidos pelo cliente">Diâmetro</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.diam_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: existirem bobines duplicadas">Duplicada</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.duplicate == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o número de emendas excede o definido na ordem de fabrico">Emendas</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.emendas_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o estado da bobine for diferente de GOOD">Estado</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.estado_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a bobine foi produzida à mais de 3 meses">Expirada</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.expired_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a largura não corresponde à da ordem de fabrico">Largura</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.largura_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
        <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a bobine se encontra numa palete final" trigger={["click", "hover"]}>Palete</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.palete_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
    </Container>);
}

const schemaW = (options = {}) => {
    return getSchema({
        pesobruto: Joi.number().positive().label("Peso Bruto").required(),
        pesopalete: Joi.number().positive().label("Peso da Palete").required()
    }, options).unknown(true);
}



const weighOptions = () => {
    return PALETES_WEIGH.map(v => {
        return {
            label: (
                <div style={{/*  padding: 4  */ }}>
                    <div>{v.value}</div>
                </div>
            ),
            value: v.key
        };
    });
}

const WeighPalete = ({ state, updateState, next, cancel, form, fieldStatus }) => {
    const options = weighOptions();

    const onPesoPaleteSelect = (v) => {
        form.setFieldValue("pesopalete", v);
    }

    return (
        <Row nogutter>
            <Hidden xs sm md><Col xs={4}></Col></Hidden>
            <Col style={{ /* display: "flex", justifyContent: "center" */ }}>
                <Row nogutter style={{ /* borderBottom: "solid 1px #d9d9d9" */ }}>
                    <Col></Col>
                    <Col xs="content"><Field forInput={true} wrapFormItem={true} name="pesobruto" label={{ enabled: true, text: "Peso bruto" }}><InputNumber style={{ width: "100px" }} addonAfter="kg" /></Field></Col>
                    <Col width={5}></Col>
                    <Col xs="content">
                        <div style={{ fontWeight: 700, marginBottom: "2px" }}>Peso palete</div>
                        <Segmented
                            defaultChecked={false}
                            defaultValue={null}
                            value={form.getFieldValue("pesopalete")}
                            onChange={onPesoPaleteSelect}
                            options={options}
                            style={{ ...fieldStatus?.pesopalete?.status === "error" && { border: "solid 1px red" } }}
                        />
                        {/* <Field forInput={true} wrapFormItem={true} name="pesopalete" label={{ enabled: true, text: "Peso palete" }}><SelectField keyField="key" textField="value" data={PALETES_WEIGH} /></Field> */}
                    </Col>
                    <Col></Col>
                </Row>
            </Col>
            <Hidden xs sm md><Col xs={4}></Col></Hidden>
        </Row>
    );
}

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });
    const [title, setTitle] = useState("Nova Palete");

    const [form_W] = Form.useForm();
    const [fieldW_Status, setFieldW_Status] = useState({});
    const [formW_Status, setFormW_Status] = useState({ error: [], warning: [], info: [], success: [] });

    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: null,
        pos: null,
        value: null,
        bobines: null,
        lvl: 0,
        nbobines: 0,
        picked: 0,
        report: null,
        bobinesOk: 0,
        palete: null,
        paleteOk: 0,
        palete_id: null,
        palete_nome: null,
        palete_num_bobines: 0,
        deleted: 0
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
    const onPrint = () => {
        if (state.step == 4 && state.palete) {
            setModalParameters({
                width: "500px",
                height: "200px",
                content: "print", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiqueta</div>,
                parameters: {
                    url: `${API_URL}/print/sql/`, printers: [...printersList?.ARMAZEM, ...printersList?.PRODUCAO],
                    onComplete: onDownloadComplete,
                    parameters: {
                        method: "PrintPaleteEtiqueta",
                        id: state.palete_id,
                        palete_nome: state.palete.nome,
                        name: "ETIQUETAS-PALETE",
                        path: "ETIQUETAS/PALETE"
                    }
                }
            });
            showModal();
        }
    };
    const onDownloadComplete = async (response, download) => {
        if (download == "download") {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
        }
        //downloadFile(response.data,"etiqueta_nw.pdf");
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    useEffect(() => {
        if (state.step === 2 && state.bobinesOk === 1) {
            next();
        }
        if (state.step === 3 && state.paleteOk === 1) {
            next();
        }
    }, [state.bobinesOk, state.paleteOk]);

    useEffect(() => {
        if (state.action == "redo") {
            setTitle(`Refazer Palete ${state.palete_nome}`)
        } else if (state.action == "weigh") {
            setTitle(`Pesar Palete ${state.palete_nome}`)
        } else if (state.action == "delete") {
            setTitle(`Apagar Palete ${state.palete_nome}`)
        } else {
            setTitle(`Nova Palete`)
            if (state.step > 1) {
                prev(0);
            }
        }
    }, [state.palete_id]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        inputParameters.current = { ...location?.state };
        window.history.replaceState({}, document.title, window.location.pathname);
        // //To remove
        // inputParameters.current = {
        //     // "action": "delete",
        //     // "palete_id": 68696,
        //     // "palete_nome": "P5062-2023",
        //     // "ordem_id": 1632,
        //     // "num_bobines": 7,
        //     // "lvl": 2
        // };
        if (["weigh", "redo", "delete"].includes(inputParameters.current?.action)) {
            const _action = inputParameters.current?.action;
            const _items = inputParameters.current?.ordem_id ? await loadOrdensFabrico({ id: inputParameters.current?.ordem_id }, signal) : [{ esquema: null }];
            if (_items[0].esquema == null) {
                if (!["delete"].includes(inputParameters.current?.action)) {
                    newWindow(`${ROOT_URL}/producao/palete/${inputParameters.current?.palete_id}/`, {}, `palete-${inputParameters.current?.palete_id}`);
                    window.history.back();
                    return;
                }
            }
            let _step = null;
            let _bobines = null;
            switch (_action) {
                case "delete":
                    _bobines = (await loadBobines({ palete_id: inputParameters.current?.palete_id })).map(v => ({ lote: v.nome }));
                    break;
                case "weigh":
                    _step = !inputParameters.current.lvl ? 1 : 3;
                    _bobines = (await loadBobines({ palete_id: inputParameters.current?.palete_id })).map(v => ({ lote: v.nome }));
                    break;
                default:
                    _step = 1;
                    break;
            }
            updateState(draft => {
                draft.bobines = ["weigh", "delete"].includes(_action) ? _bobines : null;
                draft.nbobines = ["weigh", "delete"].includes(_action) ? _bobines.length : 0;
                draft.picked = ["weigh", "delete"].includes(_action) ? _bobines.length : 0;
                draft.action = inputParameters.current?.action;
                draft.pos = _items[0];
                draft.step = _step;
                draft.maxStep = _step;
                draft.lvl = inputParameters.current?.lvl;
                draft.palete_id = inputParameters.current.palete_id
                draft.palete_nome = inputParameters.current.palete_nome
                draft.palete_num_bobines = inputParameters.current.num_bobines
            });
        } else {
            updateState(draft => {
                draft.step = 0;
                draft.maxStep = 0;
            });
        }
        submitting.end();
    }

    const onBobinesCheck = async () => {
        submitting.trigger();
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "CheckBobinesPaleteLine", ...{ action: state.action, checkonly: 1, id: state.pos.id, nbobines: state.nbobines, lvl: state.lvl, bobines: state.bobines.map(item => item.lote), palete_id: state.palete_id } } });
            if (response && response?.data?.status !== "error") {
                if (response.data?.data) {
                    updateState(draft => {
                        draft.report = response.data.data;
                        draft.bobinesOk = draft.report[0].isok;
                    })
                } else {
                    openNotification(response?.data?.status, 'top', "Notificação", "Erro ao verifcar bobines picadas na palete! Não foram retornados registos.", null);
                }
            } else {
                openNotification("error", 'top', "Notificação", response?.data?.title, null);
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
    }

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {
            const _values = form_W.getFieldsValue(true);
            const v = schemaW().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
            let { errors, warnings, value, ...status } = getStatus(v);
            setFieldW_Status({ ...status.fieldStatus });
            setFormW_Status({ ...status.formStatus });
            if (errors === 0) {
                response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "CreatePaleteLine", ...{ action: state.action, checkonly: 0, id: state.pos.id, nbobines: state.nbobines, lvl: state.lvl, ..._values, bobines: state.bobines.map(item => item.lote), palete_id: state.palete_id } } });
                if (response && response?.data?.status !== "error") {
                    if (response.data?.data) {
                        updateState(draft => {
                            draft.report = response.data.data;
                            draft.palete = response.data.palete;
                            draft.paleteOk = 1;
                            draft.bobinesOk = draft.report[0].isok;
                        });
                    } else {
                        openNotification(response?.data?.status, 'top', "Notificação", "Erro ao verifcar bobines picadas na palete! Não foram retornados registos.", null);
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

    const onDelete = async () => {
        submitting.trigger();
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "DeletePalete", ...{ palete_id: state.palete_id } } });
            if (response && response?.data?.status !== "error") {
                if (response.data?.data) {
                    updateState(draft => {
                        draft.deleted = 1;
                    });
                } else {
                    openNotification(response?.data?.status, 'top', "Notificação", "Erro ao apagar a palete! Não foram retornados registos.", null);
                }
            } else {
                openNotification("error", 'top', "Notificação", response?.data?.title, null);
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
    }

    const next = (item) => {
        updateState(draft => {
            if (state.step === 0) {
                draft.pos = item;
            }
            if (draft.action === "weigh" && state.step === 1) {
                // draft.pos = item;
                draft.step = 3;
            } else {
                draft.step = state.step + 1;
            }
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        if ((v === 0 && state.palete_id && state.deleted == 0)) {
            return;
        }
        if (state.maxStep === 4 && v !== 0) {
            return;
        }
        if (v > state.maxStep) {
            return;
        }
        updateState(draft => {
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        if (state.action == "weigh" && value < 3) {
            prev(3);
        } else if (value === 0 && state.palete_id) {
            prev(1);
        } else {
            prev(value);
        }
    }

    const onSelectSchema = (paletes, index) => {
        const nbobines = paletes.filter(x => x.item_id == 2).reduce((acc, cur) => acc + cur.item_numbobines, 0);
        console.log("onschema", state)
        if (state.palete_id && state.palete_num_bobines != nbobines) {
            openNotification("error", 'top', "Notificação", "O número de bobines selecionadas não corresponde ao número de bobines da palete a refazer!", null)
            return;
        }
        if (state.nbobines > 0 && state.nbobines != nbobines && state.lvl !== index) {
            Modal.confirm({
                title: "Atenção!",
                content: "Tem a criação de uma palete em curso. Ao confirmar, os dados relativos à palete atual serão perdidos. Tem a certeza que deseja continuar?", onOk: () => { _newPalete(nbobines, index); next(); }
            });
        } else {
            _newPalete(nbobines, index);
            next();
        }
    }

    const onSelectOrdem = (item) => {
        if (state.nbobines > 0 && state.pos.id !== item.id) {
            Modal.confirm({
                title: "Atenção!",
                content: "Tem a criação de uma palete em curso. Ao confirmar, os dados relativos à palete atual serão perdidos. Tem a certeza que deseja continuar?", onOk: () => { _cancelPalete(); next(item); }
            });
        } else {
            next(item);
        }
    }

    const _newPalete = (nbobines, index) => {
        updateState(draft => {
            draft.lvl = index;
            if (state.action !== "weigh") {
                draft.nbobines = nbobines;
                draft.picked = 0;
                draft.bobines = Array(nbobines).fill({ lote: null });
                draft.report = null;
                draft.pesobruto = null;
                draft.pesopalete = null;
                draft.report = null;
                draft.bobinesOk = 0;
                draft.maxStep = 0;
                draft.palete = null;
                draft.paleteOk = 0;
                draft.deleted = 0;
            }
        });
    }

    const _cancelPalete = () => {
        updateState(draft => {
            draft.action = null;
            draft.nbobines = 0;
            draft.picked = 0;
            draft.lvl = 0;
            draft.bobines = null;
            draft.report = null;
            draft.pesobruto = null;
            draft.pesopalete = null;
            draft.report = null;
            draft.bobinesOk = 0;
            draft.maxStep = 0;
            draft.palete = null;
            draft.paleteOk = 0;
            draft.palete_id = null;
            draft.palete_nome = null;
            draft.palete_num_bobines = 0;
            draft.deleted = 0;
        });
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
                            {!["delete"].includes(state.action) ?
                                <Col>
                                    <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} /* style={{ flexDirection: "row" }} */ />
                                </Col> :
                                <Col></Col>
                            }
                            <Col xs="content">
                                <Space>
                                    {(state.step == 2 && state.picked === state.nbobines && !submitting.state) && <Button
                                        onClick={onBobinesCheck}
                                        type="default"
                                    >Validar</Button>}
                                    {(state.step == 3 && state.bobinesOk === 1 && !state.action && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                        icon={<CheckOutlined />}
                                    >Criar</Button>}
                                    {(state.step == 3 && state.bobinesOk === 1 && state.action == "redo" && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                        icon={<CheckOutlined />}
                                    >Refazer</Button>}
                                    {(state.step == 3 && state.action == "weigh" && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                        icon={<CheckOutlined />}
                                    >Pesar</Button>}
                                    {((state.step == 4 && state.palete && !submitting.state) || (state.action == "delete" && state.deleted == 1 && !submitting.state)) && <Button
                                        onClick={() => { _cancelPalete(); if (!state.palete_id || state.deleted == 1) { prev(0); } }}
                                        type="primary"
                                    >Nova Palete</Button>}
                                    {(state.action == "delete" && state.deleted == 0 && !submitting.state) && <Button
                                        onClick={onDelete}
                                        type="primary"
                                    >Apagar Palete</Button>}
                                </Space>
                            </Col>
                        </Row>
                        {["delete"].includes(state.action) && <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    {state.deleted == 1 && <Row><Col style={{ fontSize: "18px", textAlign: "center" }}>A palete <span style={{ fontWeight: 900 }}>{state.palete_nome}</span> foi apagada com sucesso!</Col></Row>}
                                    <Row style={{ justifyContent: "center" }}>
                                        <PickBobines disabled noStatus state={state} updateState={updateState} next={next} cancel={_cancelPalete} />
                                    </Row>
                                </Container>
                            </Col>
                        </Row>}
                        {!["delete"].includes(state.action) && <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    {(state.step > 0 && state.pos) &&
                                        <Row>
                                            <Col style={{ lineHeight: 1.8 }}>
                                                <TitleOF item={state.pos} />
                                                <ContentOF item={state.pos} />
                                            </Col>
                                        </Row>
                                    }
                                    <Row>
                                        {state.step == 0 && <Col><OrdensFabricoList openNotification={openNotification} next={onSelectOrdem} /></Col>}
                                        {state.step == 1 && <Col>
                                            <SelectPalete openNotification={openNotification} next={next} data={state.pos} onSelect={onSelectSchema} />
                                        </Col>}
                                        {(state.step == 2 /* && state.bobinesOk === 0 */) && <Col>
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
                                        </Col>}
                                    </Row>
                                </Container>
                            </Col>
                        </Row>}
                    </Col >
                </Row >
            </Container >
        </ConfigProvider>
    )

}